import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsing with 50mb limit for room photo base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local asset images so static references always resolve cleanly
const assetsPath = path.resolve(__dirname, 'src', 'assets', 'images');
if (fs.existsSync(assetsPath)) {
  app.use('/src/assets/images', express.static(assetsPath));
  app.use('/assets/images', express.static(assetsPath));
}

// ---------------------------------------------------------------------------
// Database Management (Persistent in data/db.json)
// ---------------------------------------------------------------------------
const DB_PATH = path.resolve(__dirname, 'data', 'db.json');

export interface IkeaProduct {
  id: string;
  name: string;
  swedishMeaning: string;
  category: string;
  desc: string;
  dimensions: string;
  materials: string;
  priceINR: number;
  styles: string[];
  imageUrl: string;
  query: string;
  spatialBenefit: string;
}

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'm' | 'ft';
  furnitureNotes?: string;
}

export interface DatabaseSchema {
  products: IkeaProduct[];
  categories: string[];
  budgetOptions: {
    min: number;
    max: number;
    default: number;
    presets: number[];
  };
  roomPresets: any[];
  siteContent: {
    heroHeadline: string;
    heroSubtitle: string;
    ga4MeasurementId: string;
    announcement: string;
  };
  savedMakeovers: any[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read db.json, falling back to defaults:', err);
  }

  // Fallback initial schema
  return {
    products: [],
    categories: ['Seating', 'Storage', 'Tables', 'Lighting', 'Rugs & Textiles', 'Decor'],
    budgetOptions: { min: 15000, max: 250000, default: 45000, presets: [35000, 65000, 110000, 180000] },
    roomPresets: [],
    siteContent: {
      heroHeadline: 'Transform your room into a Nordic sanctuary.',
      heroSubtitle: 'Upload any room photo to receive multimodal architectural critique, generative Scandinavian makeover concepts, and curated IKEA India furniture kits precisely tailored to your Indian Rupee budget.',
      ga4MeasurementId: process.env.VITE_GA4_MEASUREMENT_ID || 'G-PSJZMCEZY1',
      announcement: 'Authentic IKEA India INR catalog · Gemini 3.8 Flash Spatial Vision',
    },
    savedMakeovers: [],
  };
}

function saveDatabase(data: DatabaseSchema): boolean {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write to db.json:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Authentication & Security Middleware for /admin
// ---------------------------------------------------------------------------
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'roomready2025';
const ACTIVE_SESSIONS = new Map<string, { username: string; expiresAt: number }>();

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid authentication token. Please log in as admin.',
    });
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const session = ACTIVE_SESSIONS.get(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Session does not exist or has expired. Please log in again.',
    });
  }

  if (Date.now() > session.expiresAt) {
    ACTIVE_SESSIONS.delete(token);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Session expired. Please log in again.',
    });
  }

  // Extend session by 24h
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  (req as any).adminUser = session.username;
  next();
}

// Admin Auth Routes
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required.' });
  }

  // Validate server-side against secure password
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    ACTIVE_SESSIONS.set(token, { username: username || 'admin', expiresAt });

    return res.json({
      success: true,
      token,
      user: { username: username || 'admin', role: 'admin' },
      message: 'Authentication successful. Admin access granted.',
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid admin credentials. Access denied.',
  });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace(/^Bearer\s+/, '').trim();
    ACTIVE_SESSIONS.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  return res.json({
    authenticated: true,
    user: { username: (req as any).adminUser || 'admin', role: 'admin' },
  });
});

// ---------------------------------------------------------------------------
// Admin CRUD Routes
// ---------------------------------------------------------------------------

// 1. IKEA Products CRUD
app.get('/api/admin/products', requireAdminAuth, (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({ products: db.products });
});

app.post('/api/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const { name, swedishMeaning, category, desc, dimensions, materials, priceINR, styles, imageUrl, query, spatialBenefit } = req.body;

  // Validation
  if (!name || !category || priceINR === undefined || !dimensions) {
    return res.status(400).json({ success: false, error: 'Name, category, dimensions, and price are required.' });
  }

  const id = req.body.id
    ? req.body.id.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    : `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

  // Check unique ID
  if (db.products.some((p) => p.id === id)) {
    return res.status(400).json({ success: false, error: `Product with ID '${id}' already exists.` });
  }

  const newProduct: IkeaProduct = {
    id,
    name: name.trim(),
    swedishMeaning: swedishMeaning ? swedishMeaning.trim() : 'Nordic Classic',
    category: category.trim(),
    desc: desc ? desc.trim() : '',
    dimensions: dimensions.trim(),
    materials: materials ? materials.trim() : 'Nordic wood, Steel',
    priceINR: Number(priceINR),
    styles: Array.isArray(styles) && styles.length > 0 ? styles : ['Modern Scandinavian'],
    imageUrl: imageUrl ? imageUrl.trim() : '',
    query: query ? query.trim() : encodeURIComponent(name),
    spatialBenefit: spatialBenefit ? spatialBenefit.trim() : 'Optimizes room flow and functionality.',
  };

  db.products.push(newProduct);
  saveDatabase(db);

  return res.status(201).json({ success: true, product: newProduct, message: `Product ${newProduct.name} created.` });
});

app.put('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const { id } = req.params;
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  const existing = db.products[index];
  const { name, swedishMeaning, category, desc, dimensions, materials, priceINR, styles, imageUrl, query, spatialBenefit } = req.body;

  db.products[index] = {
    ...existing,
    name: name !== undefined && name.trim() ? name.trim() : existing.name,
    swedishMeaning: swedishMeaning !== undefined ? swedishMeaning.trim() : existing.swedishMeaning,
    category: category !== undefined && category.trim() ? category.trim() : existing.category,
    desc: desc !== undefined ? desc.trim() : existing.desc,
    dimensions: dimensions !== undefined ? dimensions.trim() : existing.dimensions,
    materials: materials !== undefined ? materials.trim() : existing.materials,
    priceINR: priceINR !== undefined ? Number(priceINR) : existing.priceINR,
    styles: Array.isArray(styles) ? styles : existing.styles,
    imageUrl: imageUrl !== undefined ? imageUrl.trim() : existing.imageUrl,
    query: query !== undefined ? query.trim() : existing.query,
    spatialBenefit: spatialBenefit !== undefined ? spatialBenefit.trim() : existing.spatialBenefit,
  };

  saveDatabase(db);
  return res.json({ success: true, product: db.products[index], message: `Product ${db.products[index].name} updated.` });
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const { id } = req.params;
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);

  if (db.products.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  saveDatabase(db);
  return res.json({ success: true, message: `Product '${id}' deleted successfully.` });
});

// 2. Categories CRUD
app.get('/api/admin/categories', requireAdminAuth, (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({ categories: db.categories });
});

app.post('/api/admin/categories', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const rawName = req.body.name || req.body.category;
  if (!rawName || !rawName.trim()) {
    return res.status(400).json({ success: false, error: 'Category name is required.' });
  }
  const categoryName = rawName.trim();
  if (db.categories.includes(categoryName)) {
    return res.status(400).json({ success: false, error: 'Category already exists.' });
  }
  db.categories.push(categoryName);
  saveDatabase(db);
  return res.status(201).json({ success: true, categories: db.categories });
});

app.delete('/api/admin/categories/:name', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const name = decodeURIComponent(req.params.name);
  db.categories = db.categories.filter((c) => c !== name);
  saveDatabase(db);
  return res.json({ success: true, categories: db.categories });
});

// 3. Budget Options CRUD
app.get('/api/admin/budget-options', requireAdminAuth, (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({ budgetOptions: db.budgetOptions });
});

app.put('/api/admin/budget-options', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const { min, max, default: def, presets } = req.body;

  if (min !== undefined && max !== undefined && min >= max) {
    return res.status(400).json({ success: false, error: 'Minimum budget must be less than maximum budget.' });
  }

  db.budgetOptions = {
    min: Number(min ?? db.budgetOptions.min),
    max: Number(max ?? db.budgetOptions.max),
    default: Number(def ?? db.budgetOptions.default),
    presets: Array.isArray(presets) ? presets.map(Number) : db.budgetOptions.presets,
  };

  saveDatabase(db);
  return res.json({ success: true, budgetOptions: db.budgetOptions, message: 'Budget settings updated.' });
});

// 4. Room Presets CRUD
app.get('/api/admin/presets', requireAdminAuth, (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({ presets: db.roomPresets });
});

app.post('/api/admin/presets', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const { title, subtitle, roomType, style, palette, budget, dimensions, beforeImage, afterImage, analysis } = req.body;

  if (!title || !roomType) {
    return res.status(400).json({ success: false, error: 'Title and room type are required.' });
  }

  const id = req.body.id || `preset-${Date.now()}`;
  const newPreset = {
    id,
    title,
    subtitle: subtitle || '',
    roomType,
    style: style || 'Modern Scandinavian',
    palette: palette || 'Birch & Sage',
    budget: Number(budget || 45000),
    dimensions: dimensions || { length: 4.0, width: 3.5, height: 2.7, unit: 'm' },
    beforeImage: beforeImage || '',
    afterImage: afterImage || '',
    analysis: analysis || {},
  };

  db.roomPresets.push(newPreset);
  saveDatabase(db);
  return res.status(201).json({ success: true, preset: newPreset });
});

app.delete('/api/admin/presets/:id', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const { id } = req.params;
  db.roomPresets = db.roomPresets.filter((p) => p.id !== id);
  saveDatabase(db);
  return res.json({ success: true, message: 'Preset deleted.' });
});

// 5. Site Content & Settings
app.get('/api/admin/content', requireAdminAuth, (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({ content: db.siteContent });
});

app.put('/api/admin/content', requireAdminAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const { heroHeadline, heroSubtitle, ga4MeasurementId, announcement } = req.body;

  db.siteContent = {
    ...db.siteContent,
    heroHeadline: heroHeadline !== undefined ? heroHeadline : db.siteContent.heroHeadline,
    heroSubtitle: heroSubtitle !== undefined ? heroSubtitle : db.siteContent.heroSubtitle,
    ga4MeasurementId: ga4MeasurementId !== undefined ? ga4MeasurementId.trim() : db.siteContent.ga4MeasurementId,
    announcement: announcement !== undefined ? announcement : db.siteContent.announcement,
  };

  saveDatabase(db);
  return res.json({ success: true, content: db.siteContent, message: 'Site configuration updated.' });
});

// ---------------------------------------------------------------------------
// Saved Makeovers CRUD (User Makeover History)
// ---------------------------------------------------------------------------
app.get('/api/makeovers', (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({ makeovers: db.savedMakeovers || [] });
});

app.post('/api/makeovers', (req: Request, res: Response) => {
  const db = loadDatabase();
  const { title, roomType, style, palette, budget, dimensions, beforeImage, afterImage, analysis, selectedProductIds, totalCost } = req.body;

  if (!beforeImage) {
    return res.status(400).json({ success: false, error: 'Makeover requires a before room image.' });
  }

  const newMakeover = {
    id: `makeover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title ? title.trim() : `${style} ${roomType}`,
    createdAt: new Date().toISOString(),
    roomType: roomType || 'Living Room',
    style: style || 'Modern Scandinavian',
    palette: palette || 'Birch & Sage',
    budget: Number(budget || 45000),
    dimensions: dimensions || { length: 4.0, width: 3.5, height: 2.7, unit: 'm' },
    beforeImage,
    afterImage: afterImage || beforeImage,
    analysis: analysis || {},
    selectedProductIds: selectedProductIds || [],
    totalCost: Number(totalCost || 0),
  };

  db.savedMakeovers = db.savedMakeovers || [];
  db.savedMakeovers.unshift(newMakeover);
  // Keep last 30 makeovers
  if (db.savedMakeovers.length > 30) {
    db.savedMakeovers = db.savedMakeovers.slice(0, 30);
  }

  saveDatabase(db);
  return res.status(201).json({ success: true, makeover: newMakeover });
});

app.delete('/api/makeovers/:id', (req: Request, res: Response) => {
  const db = loadDatabase();
  const { id } = req.params;
  db.savedMakeovers = (db.savedMakeovers || []).filter((m) => m.id !== id);
  saveDatabase(db);
  return res.json({ success: true, message: 'Saved makeover removed.' });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Public Catalog Endpoint
// ---------------------------------------------------------------------------
app.get('/api/catalog', (_req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({
    products: db.products,
    categories: db.categories,
    budgetOptions: db.budgetOptions,
    roomPresets: db.roomPresets,
    siteContent: db.siteContent,
  });
});

// Standalone HTML Download endpoint
app.get('/api/download-standalone', (_req: Request, res: Response) => {
  const exportPath = path.resolve(__dirname, 'export', 'index.html');
  const distPath = path.resolve(__dirname, 'dist', 'index.html');
  const targetPath = fs.existsSync(exportPath) ? exportPath : fs.existsSync(distPath) ? distPath : null;

  if (targetPath) {
    res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(targetPath);
  } else {
    return res.status(404).send('Standalone index.html not yet built. Please build using npm run build.');
  }
});

app.get('/download', (_req: Request, res: Response) => {
  res.redirect('/api/download-standalone');
});

// ---------------------------------------------------------------------------
// Gemini AI Initialization & Helper Functions
// ---------------------------------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function extractImagePart(imageBase64: string): { inlineData: { mimeType: string; data: string } } | null {
  if (!imageBase64 || typeof imageBase64 !== 'string') return null;

  if (imageBase64.startsWith('data:')) {
    const match = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      return {
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      };
    }
  } else if (imageBase64.startsWith('/')) {
    const relativePath = imageBase64.startsWith('/') ? imageBase64.slice(1) : imageBase64;
    const fullPath = path.resolve(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
      const buf = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return {
        inlineData: {
          mimeType: mime,
          data: buf.toString('base64'),
        },
      };
    }
  } else if (!imageBase64.startsWith('http')) {
    return {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Multimodal Room Analysis with Gemini 3.8 Flash (Incorporating Dimensions)
// ---------------------------------------------------------------------------
app.post('/api/analyse-room', async (req: Request, res: Response) => {
  try {
    const { imageBase64, roomType, style, palette, budgetINR, customNotes, dimensions } = req.body;
    const formattedBudget = Number(budgetINR || 45000).toLocaleString('en-IN');
    const imagePart = imageBase64 ? extractImagePart(imageBase64) : null;

    // Dimension formatting
    const dimText = dimensions
      ? `Room Dimensions: Length ${dimensions.length} ${dimensions.unit}, Width ${dimensions.width} ${dimensions.unit}, Height ${dimensions.height} ${dimensions.unit}. Floor Area: ${(Number(dimensions.length) * Number(dimensions.width)).toFixed(1)} ${dimensions.unit === 'm' ? 'm²' : 'sq.ft'}. ${dimensions.furnitureNotes ? `Existing Furniture Notes: ${dimensions.furnitureNotes}` : ''}`
      : 'Room Dimensions: Standard Indian apartment room (~140-190 sq.ft, 2.7m ceiling).';

    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackAnalysis(roomType, style, palette, Number(budgetINR || 45000), dimensions);
      return res.json({
        ...fallback,
        source: 'demo',
        notice: 'Gemini API key is not configured in environment. Displaying curated Scandinavian spatial analysis grounded in room dimensions.',
      });
    }

    const systemPrompt = `You are an elite Scandinavian interior architect and IKEA interior designer.
Carefully examine the attached room photograph and dimensional constraints:
- Room Type: ${roomType || 'Living Room'}
- Desired Style: ${style || 'Modern Scandinavian'}
- Selected Color Palette: ${palette || 'Birch & Sage'}
- Target Budget: ₹${formattedBudget} INR
- ${dimText}
- Additional User Notes: ${customNotes || 'None'}

Evaluate the structural and physical details visible in this specific photo:
- Look at the actual windows, natural light direction, shadow areas, and wall finishes.
- Account for the dimensions (${dimensions ? `${dimensions.length}x${dimensions.width} ${dimensions.unit}` : 'standard compact'}) to compute circulation corridors (minimum 80 cm required).
- Identify real visible clutter, disorganized cords, or under-utilized vertical spaces up to ceiling height.
- Detail how to harmonize the existing flooring and walls with blonde birch/ash wood, linen textiles, and the selected ${palette} palette.
- Break down an optimal allocation for the ₹${formattedBudget} INR budget with authentic IKEA furniture recommendations.

Respond with valid JSON matching this schema:
{
  "spatialLayout": "2-3 sentences evaluating the layout, floor paths, clearances, and focal points observed in this specific photo matching the dimensions.",
  "naturalLight": "2-3 sentences assessing windows, daylight diffusion, shadows, and recommended 2700K Nordic illumination layers for this room.",
  "storageDeclutter": "2-3 sentences analyzing clutter in this photo and recommending modular vertical storage and organization solutions.",
  "paletteMaterials": "2-3 sentences detailing how to combine wood grains, linen textiles, and selected ${palette} accents to harmonize with the room shown in this photo.",
  "budgetStrategy": "2-3 sentences breaking down how to optimize the ₹${formattedBudget} INR budget across essential pieces for this space.",
  "recommendedProductIds": ["poang-armchair", "billy-bookcase", "lisabo-table"],
  "designSummary": "A concise, evocative design vision for transforming the room shown in this photo into a peaceful Scandinavian sanctuary."
}
Only output pure JSON.`;

    const parts: any[] = [];
    if (imagePart) {
      parts.push(imagePart);
    }
    parts.push({ text: systemPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({
      spatialLayout: parsed.spatialLayout,
      naturalLight: parsed.naturalLight,
      storageDeclutter: parsed.storageDeclutter,
      paletteMaterials: parsed.paletteMaterials,
      budgetStrategy: parsed.budgetStrategy,
      recommendedProductIds: parsed.recommendedProductIds || ['poang-armchair', 'billy-bookcase', 'lisabo-table'],
      designSummary: parsed.designSummary || 'Curated Scandinavian transformation prioritizing light, uncluttered floor flow, and tactile warmth.',
      source: 'gemini',
      notice: imagePart
        ? 'Live multimodal vision analysis of your uploaded room photo synthesized with Google Gemini 3.8 Flash.'
        : 'Architectural analysis synthesized with Google Gemini 3.8 Flash.',
    });

  } catch (error: any) {
    console.error('Error analyzing room with Gemini:', error);
    const { roomType, style, palette, budgetINR, dimensions } = req.body;
    const fallback = generateFallbackAnalysis(roomType, style, palette, Number(budgetINR || 45000), dimensions);
    return res.json({
      ...fallback,
      source: 'demo',
      notice: 'API temporarily unavailable. Loaded architectural benchmark analysis.',
    });
  }
});

// ---------------------------------------------------------------------------
// Generate Room Makeover with Image Editing & Dimension Grounding
// ---------------------------------------------------------------------------
app.post('/api/generate-makeover', async (req: Request, res: Response) => {
  try {
    const { imageBase64, roomType, style, palette, dimensions } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'No room photo provided. Please upload or select a room photo first.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is not configured in the environment. An active Gemini API key is required to generate custom AI room makeovers.',
        code: 'MISSING_API_KEY',
        canRetry: false,
      });
    }

    const imagePart = extractImagePart(imageBase64);
    if (!imagePart) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Please upload a valid JPG, PNG, or WEBP room photograph.',
        canRetry: true,
      });
    }

    const selectedStyle = style || 'Modern Scandinavian';
    const selectedRoom = roomType || 'Living Room';
    const selectedPalette = palette || 'Birch & Sage';

    const dimPrompt = dimensions
      ? `EXACT DIMENSIONAL SCALE: Length ${dimensions.length} ${dimensions.unit}, Width ${dimensions.width} ${dimensions.unit}, Height ${dimensions.height} ${dimensions.unit}. Ensure furniture sizing and walking clearances match these exact proportions.`
      : 'Maintain realistic architectural scale for standard residential dimensions.';

    const promptText = `You are a world-class architectural interior designer.
CRITICAL TASK: Edit and redesign this uploaded photograph of a ${selectedRoom}.
PRESERVATION INVARIANTS:
1. You must PRESERVE the exact room geometry, wall positions, floor lines, ceiling, windows, window frames, doors, doorway locations, perspective, and camera viewpoint of this room photo.
2. Do not shift the walls, move windows, or warp the room boundaries.
3. ${dimPrompt}
TRANSFORMATION INSTRUCTIONS:
4. Redesign the furniture, textiles, lighting fixtures, and decorative elements to transform this room into a ${selectedStyle} interior inspired by IKEA design.
5. Replace existing cluttered or mismatched furniture with clean, minimalist Scandinavian furniture (blonde birch or ash wood surfaces, warm 2700K ambient illumination, natural linen textiles, and sleek modular shelving).
6. Apply a ${selectedPalette} color palette.
7. Return the photorealistic redesigned room from the identical camera angle.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          imagePart,
          { text: promptText },
        ],
      },
    });

    let generatedImageUrl: string | null = null;
    let descriptionText = '';

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        descriptionText += part.text;
      }
    }

    if (generatedImageUrl) {
      return res.json({
        success: true,
        imageUrl: generatedImageUrl,
        label: `AI Room Makeover (${selectedStyle})`,
        disclaimer: `Visual concept render: AI concepts are artistic visual representations and not guaranteed to be dimensionally exact. Structural walls and window placement preserved from your uploaded room photo.`,
        isAiGenerated: true,
        description: descriptionText,
      });
    } else {
      return res.status(502).json({
        success: false,
        error: 'The image generation model returned a description without an edited image part.',
        canRetry: true,
        details: descriptionText,
      });
    }

  } catch (error: any) {
    console.error('Makeover generation error:', error);
    const status = error.status || 500;
    const isQuota = status === 429 || (error.message && error.message.includes('Quota exceeded'));
    
    let userMessage = error.message || 'Image editing service currently unavailable.';
    if (isQuota) {
      userMessage = 'Gemini image-editing quota exhausted (429: RESOURCE_EXHAUSTED). The gemini-3.1-flash-lite-image model requires an active paid Gemini API key with image generation quota.';
    } else if (status === 403) {
      userMessage = 'Access denied (403). The Gemini image-editing model requires paid tier access in Google AI Studio.';
    }

    return res.status(status).json({
      success: false,
      error: userMessage,
      code: isQuota ? 'QUOTA_EXHAUSTED' : 'GENERATION_ERROR',
      canRetry: !isQuota,
      details: error.message,
    });
  }
});

function generateFallbackAnalysis(
  roomType: string = 'Bedroom',
  style: string = 'Modern Scandinavian',
  palette: string = 'Birch & Sage',
  budget: number = 45000,
  dimensions?: RoomDimensions
) {
  const dimInfo = dimensions
    ? `For your ${dimensions.length}m × ${dimensions.width}m ${roomType.toLowerCase()} (${(dimensions.length * dimensions.width).toFixed(1)} m²), preserving an 80 cm walking corridor between door and seating/bed is paramount.`
    : `In this ${roomType.toLowerCase()}, preserving an unobstructed 80 cm walking corridor between entrance and seating/sleeping zone is vital.`;

  return {
    spatialLayout: `${dimInfo} Relocate heavy block furniture to perimeter walls to open the central floor field and expand sightlines toward natural light sources.`,
    naturalLight: `Diffuse natural light can be maximized by replacing heavy opaque drapes with sheer linen curtains. Introduce 2700K warm layered lamps (one floor task lamp and one ambient corner fixture) to prevent harsh overhead glare.`,
    storageDeclutter: `Elevate storage using vertical wall-mounted shelving systems like IKEA BILLY or modular IVAR. Conceal cords and chargers inside closed storage caddies to dramatically lower everyday visual tension.`,
    paletteMaterials: `The selected '${style}' aesthetic pairs effortlessly with the '${palette}' scheme. Anchor the foundation with blonde birch or light ash veneer, grounding the room with unbleached natural jute textiles.`,
    budgetStrategy: `With your target budget of ₹${budget.toLocaleString('en-IN')}, allocate 50% to high-touch ergonomic seating/bedding, 30% to durable modular storage, and 20% to layered lighting and tactile rugs.`,
    recommendedProductIds: ['poang-armchair', 'billy-bookcase', 'lisabo-table', 'lohals-rug'],
    designSummary: `A tranquil Scandinavian transformation that turns functional limitations into calming, airy order using timeless Nordic materials and honest craftsmanship.`
  };
}

// ---------------------------------------------------------------------------
// Server Startup (Dev Vite vs Production)
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RoomReady server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
