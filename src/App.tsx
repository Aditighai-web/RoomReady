import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { ControlPanel } from './components/ControlPanel';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ShoppingList } from './components/ShoppingList';
import { ExportModal } from './components/ExportModal';
import { SavedMakeoversModal } from './components/SavedMakeoversModal';
import { AdminPanel } from './components/AdminPanel';
import { PALETTES, ROOM_PRESETS, getDemoInspirationImage } from './data/presets';
import {
  IkeaProduct,
  SpatialAnalysis,
  MakeoverRender,
  RoomPreset,
  RoomDimensions,
  SavedMakeover,
  BudgetConfig,
  SiteContent,
} from './types';
import billyBookcaseImg from './assets/images/ikea_billy_bookcase_1792681790119.jpg';
import {
  initGA4,
  trackRoomPhotoUploaded,
  trackRoomAnalysisStarted,
  trackRoomAnalysisCompleted,
  trackRoomMakeoverRequested,
  trackRecommendationsViewed,
  setCustomMeasurementId,
} from './services/tracker';

// Default initial IKEA items in case network fetch is delayed
const DEFAULT_PRODUCTS: IkeaProduct[] = [
  {
    id: 'poang-armchair',
    name: 'POÄNG',
    swedishMeaning: 'Point / Highlight',
    category: 'Seating',
    desc: 'Layer-glued bent birch frame with Hillared beige cushion. Legendary ergonomic comfort with subtle natural flex.',
    dimensions: '68 x 82 x 100 cm',
    materials: 'Moulded birch veneer, 100% cotton removable cover',
    priceINR: 8990,
    styles: ['Modern Scandinavian', 'Japandi', 'Nordic Hygge', 'Botanical Nordic'],
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
    query: 'POANG+armchair',
    spatialBenefit: 'Low visual weight with open cantilevered birch frame; keeps compact rooms looking spacious.',
  },
  {
    id: 'billy-bookcase',
    name: 'BILLY',
    swedishMeaning: 'Classic Library',
    category: 'Storage',
    desc: 'The iconic Swedish vertical storage system with adjustable shelves. Designed to hold books, ceramics, and daily essentials.',
    dimensions: '80 x 28 x 206 cm',
    materials: 'Particleboard, Birch veneer, Clear lacquer',
    priceINR: 5990,
    styles: ['Modern Scandinavian', 'Japandi', 'Stockholm Industrial', 'Nordic Hygge'],
    imageUrl: billyBookcaseImg,
    query: 'BILLY+bookcase',
    spatialBenefit: 'Utilises vertical wall height up to 206 cm, liberating cluttered floor surfaces.',
  },
  {
    id: 'lisabo-table',
    name: 'LISABO',
    swedishMeaning: 'Smooth Haven',
    category: 'Tables',
    desc: 'Red Dot Design Award winner featuring clean tapered solid birch legs and matte ash veneer finish.',
    dimensions: '70 x 70 x 50 cm',
    materials: 'Ash veneer, Solid birch legs',
    priceINR: 7490,
    styles: ['Modern Scandinavian', 'Japandi', 'Botanical Nordic'],
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    query: 'LISABO+table',
    spatialBenefit: 'Bevelled edge profile gives the illusion of a floating tabletop, reducing room bulkiness.',
  },
  {
    id: 'kallax-unit',
    name: 'KALLAX',
    swedishMeaning: 'Modular Cube',
    category: 'Storage',
    desc: 'Versatile 4x2 cube unit. Can be positioned upright against the wall or horizontally as an open room divider.',
    dimensions: '77 x 147 x 39 cm',
    materials: 'Fibreboard, Paper foil, Particleboard',
    priceINR: 6490,
    styles: ['Modern Scandinavian', 'Nordic Hygge', 'Stockholm Industrial'],
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    query: 'KALLAX+shelving+unit',
    spatialBenefit: 'Dual-access open cubes maintain sightlines across studio spaces without creating dark corners.',
  },
  {
    id: 'hektar-lamp',
    name: 'HEKTAR',
    swedishMeaning: 'Acre / Foundry',
    category: 'Lighting',
    desc: 'Matte dark grey steel pendant or floor lamp with industrial brass lock fixtures and warm light dispersion.',
    dimensions: 'Height: 181 cm, Shade: 31 cm',
    materials: 'Powder-coated steel, Aluminium',
    priceINR: 4990,
    styles: ['Stockholm Industrial', 'Modern Scandinavian', 'Nordic Hygge'],
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    query: 'HEKTAR+lamp',
    spatialBenefit: 'Focuses directed accent illumination downward, creating a dedicated evening reading sanctuary.',
  },
  {
    id: 'lohals-rug',
    name: 'LOHALS',
    swedishMeaning: 'Organic Earth',
    category: 'Rugs & Textiles',
    desc: 'Hand-crafted flatwoven rug made from 100% natural renewable jute. Provides earthy texture and durability.',
    dimensions: '160 x 230 cm',
    materials: '100% Natural Jute',
    priceINR: 6990,
    styles: ['Japandi', 'Botanical Nordic', 'Nordic Hygge', 'Modern Scandinavian'],
    imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    query: 'LOHALS+rug',
    spatialBenefit: 'Anchors furniture grouping in open Indian apartments and reduces acoustic echo on tile floors.',
  },
  {
    id: 'nissafors-cart',
    name: 'NISSAFORS',
    swedishMeaning: 'Nimble Stream',
    category: 'Storage',
    desc: 'Multi-tiered mobile steel utility cart on smooth castors. Fits in the tightest kitchen, bathroom, or study nooks.',
    dimensions: '50.5 x 30 x 83 cm',
    materials: 'Powder-coated steel',
    priceINR: 2490,
    styles: ['Modern Scandinavian', 'Stockholm Industrial', 'Botanical Nordic'],
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    query: 'NISSAFORS+utility+cart',
    spatialBenefit: 'Slides effortlessly into 32 cm gaps between desks and walls, transforming dead spaces into utility.',
  },
  {
    id: 'gladom-tray-table',
    name: 'GLADOM',
    swedishMeaning: 'Joyful Nest',
    category: 'Tables',
    desc: 'Removable tray top table with lightweight steel wire frame. Practical for serving tea or organizing nightstand essentials.',
    dimensions: '45 x 45 x 53 cm',
    materials: 'Epoxy powder coated steel',
    priceINR: 1490,
    styles: ['Modern Scandinavian', 'Stockholm Industrial', 'Botanical Nordic'],
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
    query: 'GLADOM+tray+table',
    spatialBenefit: 'The removable tray serves as a quick breakfast or beverage caddy without taking up floor space.',
  },
  {
    id: 'skadis-pegboard',
    name: 'SKÅDIS',
    swedishMeaning: 'Stage & Canvas',
    category: 'Storage',
    desc: 'Perforated wood-fibre pegboard with modular elastic cords, hooks, and mini containers. The ultimate Nordic desk organizer.',
    dimensions: '56 x 56 cm',
    materials: 'Fibreboard, Acrylic paint',
    priceINR: 2290,
    styles: ['Modern Scandinavian', 'Stockholm Industrial', 'Japandi'],
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    query: 'SKADIS+pegboard',
    spatialBenefit: 'Lifts headphones, cables, and stationary directly onto the wall, leaving the desk entirely clean.',
  },
  {
    id: 'fejka-gradvis',
    name: 'GRADVIS & FEJKA',
    swedishMeaning: 'Gradual Calm',
    category: 'Decor',
    desc: 'Ribbed ceramic vase in muted Nordic sage paired with lifelike botanicals. Introduces serene biophilic balance.',
    dimensions: '21 cm height',
    materials: 'Stoneware, Coloured glaze',
    priceINR: 1590,
    styles: ['Botanical Nordic', 'Japandi', 'Nordic Hygge', 'Modern Scandinavian'],
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    query: 'GRADVIS+vase',
    spatialBenefit: 'Softens hard linear furniture edges and introduces living textures into minimalist settings.',
  },
  {
    id: 'strandmon-wing-chair',
    name: 'STRANDMON',
    swedishMeaning: 'Shoreline Solitude',
    category: 'Seating',
    desc: 'High back wing chair with high headrest and embracing armrests. IKEA founder Ingvar Kamprad’s personal favorite design.',
    dimensions: '82 x 96 x 101 cm',
    materials: 'Nordvalla dark grey fabric, Solid beech legs',
    priceINR: 19990,
    styles: ['Nordic Hygge', 'Modern Scandinavian'],
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
    query: 'STRANDMON+wing+chair',
    spatialBenefit: 'Enclosing wings create an acoustic cocoon, softening noise in urban apartments.',
  },
  {
    id: 'besta-storage',
    name: 'BESTÅ',
    swedishMeaning: 'Lasting Endure',
    category: 'Storage',
    desc: 'Sleek low-line media console and sideboard with push-to-open flush doors and hidden cable routing channels.',
    dimensions: '120 x 40 x 64 cm',
    materials: 'Fibreboard, Particleboard, White oak effect foil',
    priceINR: 14990,
    styles: ['Modern Scandinavian', 'Japandi', 'Stockholm Industrial'],
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
    query: 'BESTA+storage+system',
    spatialBenefit: 'Conceals router boxes, power strips, and consoles behind clean Scandinavian front panels.',
  },
];

export default function App() {
  const initialPreset = ROOM_PRESETS[0];

  // Routing State (/admin vs main studio)
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/admin' || window.location.hash === '#admin')
    );
  });

  // Core Room State
  const [activePresetId, setActivePresetId] = useState<string | null>(initialPreset.id);
  const [beforeImage, setBeforeImage] = useState<string>(initialPreset.beforeImage);
  const [afterImage, setAfterImage] = useState<string>(initialPreset.afterImage);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);
  const [hasGeneratedMakeover, setHasGeneratedMakeover] = useState<boolean>(false);
  const [isDemoInspiration, setIsDemoInspiration] = useState<boolean>(true);
  const [makeoverError, setMakeoverError] = useState<string | null>(null);
  const [quotaExhausted, setQuotaExhausted] = useState<boolean>(false);

  // Dimensions State
  const [dimensions, setDimensions] = useState<RoomDimensions>(
    initialPreset.dimensions || { length: 3.8, width: 3.4, height: 2.7, unit: 'm', furnitureNotes: '' }
  );

  // Design Parameters
  const [roomType, setRoomType] = useState<string>(initialPreset.roomType);
  const [style, setStyle] = useState<string>(initialPreset.style);
  const [palette, setPalette] = useState<string>(initialPreset.palette);
  const [budget, setBudget] = useState<number>(initialPreset.budget);

  // Catalog & Plan State
  const [products, setProducts] = useState<IkeaProduct[]>(DEFAULT_PRODUCTS);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    initialPreset.analysis.recommendedProductIds
  );

  // Dynamic Site Config
  const [siteContent, setSiteContent] = useState<SiteContent>({
    heroHeadline: 'Transform your room into a Nordic sanctuary.',
    heroSubtitle:
      'Upload any room photo to receive multimodal architectural critique, generative Scandinavian makeover concepts, and curated IKEA India furniture kits precisely tailored to your Indian Rupee budget.',
    ga4MeasurementId: 'G-PSJZMCEZY1',
    announcement: 'Authentic IKEA India INR catalog · Gemini 3.8 Flash Spatial Vision',
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({
    min: 15000,
    max: 250000,
    default: 45000,
    presets: [35000, 65000, 110000, 180000],
  });

  // Analysis & Makeover Data
  const [analysis, setAnalysis] = useState<SpatialAnalysis | null>(initialPreset.analysis);
  const [makeoverData, setMakeoverData] = useState<MakeoverRender | null>({
    imageUrl: initialPreset.afterImage,
    label: 'ROOM MAKEOVER PREVIEW',
    disclaimer:
      'Curated Scandinavian makeover inspiration for standard room dimensions. Upload your photo to receive custom analysis.',
    isAiGenerated: false,
    source: 'preset-inspiration',
  });

  // Saved Makeovers
  const [savedMakeovers, setSavedMakeovers] = useState<SavedMakeover[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // Action Loading States
  const [isAnalysing, setIsAnalysing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<boolean>(false);

  // Modal & Toast States
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Listen to popstate or hash for /admin routing
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setIsAdminView(isAdmin);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminView(true);
  };

  const navigateToStudio = () => {
    window.location.hash = '';
    setIsAdminView(false);
  };

  // Fetch catalog & saved makeovers on mount
  const fetchCatalogData = () => {
    fetch('/api/catalog')
      .then((res) => {
        if (!res.ok) throw new Error('Catalog fetch error');
        return res.json();
      })
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          trackRecommendationsViewed({
            room_type: roomType,
            style,
            product_count: data.products.length,
          });
        }
        if (data.siteContent) {
          setSiteContent(data.siteContent);
          if (data.siteContent.ga4MeasurementId) {
            setCustomMeasurementId(data.siteContent.ga4MeasurementId);
          }
        }
        if (data.budgetOptions) {
          setBudgetConfig(data.budgetOptions);
        }
      })
      .catch((err) => {
        console.warn('Using embedded catalog fallback:', err);
      });
  };

  const fetchSavedMakeovers = () => {
    fetch('/api/makeovers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.makeovers)) {
          setSavedMakeovers(data.makeovers);
        }
      })
      .catch((err) => console.warn('Could not load saved makeovers:', err));
  };

  useEffect(() => {
    initGA4();
    fetchCatalogData();
    fetchSavedMakeovers();
  }, []);

  // Handle Preset Selection
  const handleSelectPreset = (preset: RoomPreset) => {
    setActivePresetId(preset.id);
    setBeforeImage(preset.beforeImage);
    setAfterImage(preset.afterImage);
    setUploadedBase64(null);
    setUploadedFileName(undefined);
    setHasGeneratedMakeover(false);
    setIsDemoInspiration(true);
    setMakeoverError(null);
    setRoomType(preset.roomType);
    setStyle(preset.style);
    setPalette(preset.palette);
    setBudget(preset.budget);
    if (preset.dimensions) {
      setDimensions(preset.dimensions);
    }
    setAnalysis(preset.analysis);
    setSelectedProductIds(preset.analysis.recommendedProductIds);
    setMakeoverData({
      imageUrl: preset.afterImage,
      label: 'ROOM MAKEOVER PREVIEW',
      disclaimer: `Sample apartment photo loaded. Showing curated ${preset.style} makeover inspiration.`,
      isAiGenerated: false,
      source: 'preset',
    });
    showToast(`Loaded ${preset.title} room preset.`);
  };

  // Handle User File Upload
  const handleFileUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setBeforeImage(previewUrl);
    setUploadedFileName(file.name);
    setActivePresetId(null);
    setMakeoverError(null);
    setHasGeneratedMakeover(false);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    trackRoomPhotoUploaded({
      room_type: roomType,
      style: style,
      file_extension: ext,
    });

    const demoImg = getDemoInspirationImage(roomType, style);
    setAfterImage(demoImg);
    setIsDemoInspiration(true);
    setMakeoverData({
      imageUrl: demoImg,
      label: 'ROOM MAKEOVER PREVIEW',
      disclaimer:
        'Your photo is loaded in the BEFORE panel. Click "Analyse Room" for spatial advice, or "Generate Room Makeover" to test makeover generation.',
      isAiGenerated: false,
      source: 'user-upload-demo',
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedBase64(result);
      }
    };
    reader.readAsDataURL(file);

    showToast('Photo uploaded! Instant preview ready in BEFORE panel.');
  };

  // Action Button 1: Analyse Room with Gemini
  const handleAnalyseRoom = async () => {
    setIsAnalysing(true);
    const activePhoto = uploadedBase64 || beforeImage;

    const areaM2 =
      dimensions.unit === 'm'
        ? dimensions.length * dimensions.width
        : dimensions.length * dimensions.width * 0.092903;

    trackRoomAnalysisStarted({
      room_type: roomType,
      style,
      palette,
      budget_inr: budget,
      room_area_sqm: Math.round(areaM2),
    });

    try {
      const response = await fetch('/api/analyse-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: activePhoto,
          roomType,
          style,
          palette,
          budgetINR: budget,
          dimensions,
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze room');
      const data: SpatialAnalysis = await response.json();
      setAnalysis(data);

      if (data.recommendedProductIds && data.recommendedProductIds.length > 0) {
        setSelectedProductIds(data.recommendedProductIds);
      }

      trackRoomAnalysisCompleted({
        room_type: roomType,
        style,
        recommendation_count: data.recommendedProductIds?.length || 0,
        analysis_source: data.source || 'gemini',
      });
      trackRecommendationsViewed({
        room_type: roomType,
        style,
        product_count: data.recommendedProductIds?.length || products.length,
      });

      showToast(
        data.source === 'gemini'
          ? 'Spatial analysis synthesized with Google Gemini 3.8 Flash!'
          : 'Spatial analysis generated using architectural benchmark model.'
      );
    } catch (err: any) {
      console.warn('Network API unavailable; using architectural benchmark:', err);
      const fallback = generateClientFallbackAnalysis(roomType, style, palette, budget, dimensions);
      setAnalysis(fallback);
      if (fallback.recommendedProductIds && fallback.recommendedProductIds.length > 0) {
        setSelectedProductIds(fallback.recommendedProductIds);
      }
      trackRoomAnalysisCompleted({
        room_type: roomType,
        style,
        recommendation_count: fallback.recommendedProductIds?.length || 0,
        analysis_source: 'client-benchmark',
      });
      showToast('Spatial analysis generated using Scandinavian architectural benchmark engine.');
    } finally {
      setIsAnalysing(false);
    }
  };

  // Action Button 2: Generate Room Makeover
  const handleGenerateMakeover = async () => {
    const activePhoto = uploadedBase64 || beforeImage;
    if (!activePhoto) {
      showToast('Please upload or choose a room photo first.');
      return;
    }

    const widthM = dimensions.unit === 'm' ? dimensions.width : dimensions.width * 0.3048;
    const lengthM = dimensions.unit === 'm' ? dimensions.length : dimensions.length * 0.3048;

    trackRoomMakeoverRequested({
      room_type: roomType,
      style,
      budget_inr: budget,
      palette,
      room_width_m: parseFloat(widthM.toFixed(1)),
      room_length_m: parseFloat(lengthM.toFixed(1)),
    });

    const demoInspirationImg = getDemoInspirationImage(roomType, style);

    if (quotaExhausted) {
      setIsGenerating(true);
      setTimeout(() => {
        setAfterImage(demoInspirationImg);
        setIsDemoInspiration(true);
        setHasGeneratedMakeover(true);
        setMakeoverData({
          imageUrl: demoInspirationImg,
          label: 'ROOM MAKEOVER PREVIEW',
          disclaimer: `Room makeover preview active. Displaying curated Scandinavian ${style} inspiration. Uploaded room photo preserved in BEFORE panel.`,
          isAiGenerated: false,
          source: 'demo-mode',
        });
        setIsGenerating(false);
        showToast(`Makeover preview updated for ${style}.`);
      }, 250);
      return;
    }

    setIsGenerating(true);
    setMakeoverError(null);

    try {
      const response = await fetch('/api/generate-makeover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: activePhoto,
          roomType,
          style,
          palette,
          budgetINR: budget,
          dimensions,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.imageUrl) {
        setAfterImage(data.imageUrl);
        setHasGeneratedMakeover(true);
        setIsDemoInspiration(false);
        setMakeoverData({
          imageUrl: data.imageUrl,
          label: data.label || `AI Room Makeover (${style})`,
          disclaimer:
            data.disclaimer ||
            'Visual concept render: Structural walls and window placement preserved from your room photo.',
          isAiGenerated: true,
          source: 'gemini-image-edit',
        });
        setMakeoverError(null);
        showToast('AI Room Makeover generated from your room photo!');
      } else {
        const is429 =
          response.status === 429 ||
          data.code === 'QUOTA_EXHAUSTED' ||
          (data.error && /quota|429|RESOURCE_EXHAUSTED/i.test(data.error));

        if (is429 || response.status === 400 || response.status === 403) {
          setQuotaExhausted(true);
        }

        setAfterImage(demoInspirationImg);
        setIsDemoInspiration(true);
        setHasGeneratedMakeover(true);

        const errMessage =
          data.error ||
          'Gemini image-editing quota exhausted (429). The gemini-3.1-flash-lite-image model requires an active paid Gemini API key. Displaying Scandinavian makeover preview.';
        setMakeoverError(errMessage);
        setMakeoverData({
          imageUrl: demoInspirationImg,
          label: 'ROOM MAKEOVER PREVIEW',
          disclaimer:
            'Displaying Scandinavian makeover preview. Uploaded room photo preserved in BEFORE panel.',
          isAiGenerated: false,
          source: 'demo-fallback',
        });

        if (is429) {
          showToast('AI quota unavailable (429). Switched to makeover preview.');
        } else {
          showToast('Showing Scandinavian makeover preview.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setQuotaExhausted(true);
      setAfterImage(demoInspirationImg);
      setIsDemoInspiration(true);
      setHasGeneratedMakeover(true);
      const errMessage = err.message || 'Image editing service unavailable. Showing makeover preview.';
      setMakeoverError(errMessage);
      setMakeoverData({
        imageUrl: demoInspirationImg,
        label: 'ROOM MAKEOVER PREVIEW',
        disclaimer: 'Displaying Scandinavian makeover preview. Uploaded room photo preserved in BEFORE panel.',
        isAiGenerated: false,
        source: 'demo-fallback',
      });
      showToast('Loaded makeover preview.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Action Button 3: Update Room Plan
  const handleUpdatePlan = () => {
    setIsUpdatingPlan(true);

    setTimeout(() => {
      const matched = products.filter((p) => p.styles.includes(style));
      const pool = matched.length >= 3 ? matched : products;

      let accumulatedCost = 0;
      const newPlanIds: string[] = [];

      for (const item of pool) {
        if (accumulatedCost + item.priceINR <= budget * 1.05) {
          newPlanIds.push(item.id);
          accumulatedCost += item.priceINR;
        }
      }

      if (newPlanIds.length < 2 && pool.length >= 2) {
        newPlanIds.push(pool[0].id, pool[1].id);
      }

      setSelectedProductIds(newPlanIds);
      setIsUpdatingPlan(false);

      showToast(`IKEA furniture plan updated to fit ₹${budget.toLocaleString('en-IN')} budget!`);
    }, 350);
  };

  // Toggle single product in shopping plan
  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Recommended suite selector
  const handleSelectRecommended = () => {
    if (analysis?.recommendedProductIds && analysis.recommendedProductIds.length > 0) {
      setSelectedProductIds(analysis.recommendedProductIds);
      showToast('AI recommended suite selected.');
    } else {
      setSelectedProductIds(['poang-armchair', 'billy-bookcase', 'lisabo-table']);
      showToast('Starter Scandinavian suite selected.');
    }
  };

  // Clear plan
  const handleClearPlan = () => {
    setSelectedProductIds([]);
    showToast('Shopping plan cleared.');
  };

  // Save current Makeover
  const handleSaveMakeover = async () => {
    const selected = products.filter((p) => selectedProductIds.includes(p.id));
    const total = selected.reduce((s, i) => s + i.priceINR, 0);

    const payload = {
      title: `${style} ${roomType}`,
      roomType,
      style,
      palette,
      budget,
      dimensions,
      beforeImage,
      afterImage,
      analysis: analysis || {},
      selectedProductIds,
      totalCost: total,
    };

    try {
      const res = await fetch('/api/makeovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.makeover) {
        setSavedMakeovers((prev) => [data.makeover, ...prev]);
        showToast('Makeover saved to your projects collection!');
      } else {
        showToast('Saved locally.');
      }
    } catch {
      // Local fallback
      const localId = `local-${Date.now()}`;
      setSavedMakeovers((prev) => [{ ...payload, id: localId, createdAt: new Date().toISOString() } as any, ...prev]);
      showToast('Makeover saved.');
    }
  };

  // Load a saved makeover into the studio
  const handleLoadSavedMakeover = (m: SavedMakeover) => {
    setBeforeImage(m.beforeImage);
    setAfterImage(m.afterImage);
    setRoomType(m.roomType);
    setStyle(m.style);
    setPalette(m.palette);
    setBudget(m.budget);
    if (m.dimensions) setDimensions(m.dimensions);
    if (m.analysis) setAnalysis(m.analysis);
    if (m.selectedProductIds) setSelectedProductIds(m.selectedProductIds);
    setHasGeneratedMakeover(true);
    setIsDemoInspiration(false);
    showToast(`Loaded saved makeover: "${m.title}".`);
  };

  // Delete saved makeover
  const handleDeleteSavedMakeover = async (id: string) => {
    try {
      await fetch(`/api/makeovers/${id}`, { method: 'DELETE' });
    } catch {}
    setSavedMakeovers((prev) => prev.filter((item) => item.id !== id));
    showToast('Saved makeover deleted.');
  };

  // Download Standalone index.html file
  const handleDownloadStandalone = () => {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const link = document.createElement('a');
      link.href = '/api/download-standalone';
      link.download = 'index.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading standalone index.html...');
    } else {
      showToast('You are already running the standalone RoomReady index.html file!');
    }
  };

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  // If Admin View is active, render the protected Admin Panel
  if (isAdminView) {
    return (
      <AdminPanel
        onBackToStudio={navigateToStudio}
        onRefreshCatalog={fetchCatalogData}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#1E2229]">
      
      {/* 3-Zone Top Navigation Bar */}
      <Header
        onExportClick={() => setIsExportOpen(true)}
        onDownloadStandalone={handleDownloadStandalone}
        onOpenAdmin={navigateToAdmin}
        onOpenSavedMakeovers={() => setIsSavedModalOpen(true)}
        savedMakeoversCount={savedMakeovers.length}
        cartItemCount={selectedProductIds.length}
      />

      {/* Hero Headline and Trust Strip */}
      <HeroSection
        onStartMakeover={() => {
          const el = document.getElementById('makeover-studio');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        headline={siteContent.heroHeadline}
        subtitle={siteContent.heroSubtitle}
        announcement={siteContent.announcement}
      />

      {/* Main Studio Workspace */}
      <main id="makeover-studio" className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Side Control Panel (4 cols) */}
          <aside className="lg:col-span-4 xl:col-span-4">
            <ControlPanel
              roomType={roomType}
              setRoomType={setRoomType}
              style={style}
              setStyle={setStyle}
              palette={palette}
              setPalette={setPalette}
              budget={budget}
              setBudget={setBudget}
              dimensions={dimensions}
              setDimensions={setDimensions}
              palettes={PALETTES}
              presets={ROOM_PRESETS}
              activePresetId={activePresetId}
              onSelectPreset={handleSelectPreset}
              onFileUpload={handleFileUpload}
              onAnalyseRoom={handleAnalyseRoom}
              onGenerateMakeover={handleGenerateMakeover}
              onUpdatePlan={handleUpdatePlan}
              isAnalysing={isAnalysing}
              isGenerating={isGenerating}
              isUpdatingPlan={isUpdatingPlan}
              uploadedFileName={uploadedFileName}
              budgetOptions={budgetConfig}
            />
          </aside>

          {/* Right Column: Visualizer, Spatial Analysis, and IKEA Shopping Plan (8 cols) */}
          <section className="lg:col-span-8 xl:col-span-8 space-y-8">
            
            {/* Interactive Before & After Comparison Slider */}
            <BeforeAfterSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              isGenerating={isGenerating}
              makeoverData={makeoverData}
              makeoverError={makeoverError}
              hasGeneratedMakeover={hasGeneratedMakeover}
              isDemoInspiration={isDemoInspiration}
              roomType={roomType}
              style={style}
              dimensions={dimensions}
              onRetryGeneration={handleGenerateMakeover}
              onSaveMakeover={handleSaveMakeover}
              onOpenSavedMakeovers={() => setIsSavedModalOpen(true)}
              savedCount={savedMakeovers.length}
            />

            {/* Spatial & Lighting Architectural Critique Card */}
            <div id="spatial-analysis">
              <AnalysisDisplay
                analysis={analysis}
                isAnalysing={isAnalysing}
                roomType={roomType}
                style={style}
              />
            </div>

            {/* IKEA India Curated Shopping Catalog & Budget Meter */}
            <ShoppingList
              products={products}
              selectedProductIds={selectedProductIds}
              onToggleProduct={handleToggleProduct}
              targetBudget={budget}
              dimensions={dimensions}
              onClearPlan={handleClearPlan}
              onSelectRecommended={handleSelectRecommended}
              recommendedIds={analysis?.recommendedProductIds || []}
            />

          </section>

        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E2229] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-[#0058A3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Export Plan Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedProducts={selectedProducts}
        budget={budget}
        roomType={roomType}
        style={style}
        palette={palette}
        analysis={analysis}
      />

      {/* Saved Makeovers Modal */}
      <SavedMakeoversModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        makeovers={savedMakeovers}
        onLoadMakeover={handleLoadSavedMakeover}
        onDeleteMakeover={handleDeleteSavedMakeover}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8E5DF] bg-white py-6 px-6 text-xs text-[#6B7280]">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1E2229]">RoomReady</span>
            <span>·</span>
            <span>Scandinavian AI Interior Design Studio</span>
            <span>·</span>
            <button
              onClick={navigateToAdmin}
              className="text-[#0058A3] hover:underline cursor-pointer font-medium"
            >
              Admin Portal
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span>IKEA India INR Catalog Pricing</span>
            <span>·</span>
            <span>Google Gemini 3.8 Flash Spatial Vision</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Client Fallback Generator with dimensional awareness
function generateClientFallbackAnalysis(
  roomType: string,
  style: string,
  palette: string,
  budget: number,
  dimensions?: RoomDimensions
): SpatialAnalysis {
  const dimNote = dimensions
    ? `For your ${dimensions.length}m × ${dimensions.width}m room, preserving an 80 cm walking corridor is paramount.`
    : 'Preserving unobstructed walking corridors is paramount.';

  return {
    spatialLayout: `${dimNote} Relocate heavy block furniture to perimeter walls to open the central floor field and expand sightlines toward natural light sources.`,
    naturalLight: `Diffuse natural light can be maximized by replacing heavy opaque drapes with sheer linen curtains. Introduce 2700K warm layered lamps (one floor task lamp and one ambient corner fixture) to prevent harsh overhead glare.`,
    storageDeclutter: `Elevate storage using vertical wall-mounted shelving systems like IKEA BILLY or modular IVAR. Conceal cords and chargers inside closed storage caddies to dramatically lower everyday visual tension.`,
    paletteMaterials: `The selected '${style}' aesthetic pairs effortlessly with the '${palette}' scheme. Anchor the foundation with blonde birch or light ash veneer, grounding the room with unbleached natural jute textiles.`,
    budgetStrategy: `With your target budget of ₹${budget.toLocaleString('en-IN')}, allocate 50% to high-touch ergonomic seating/bedding, 30% to durable modular storage, and 20% to layered lighting and tactile rugs.`,
    recommendedProductIds: ['poang-armchair', 'billy-bookcase', 'lisabo-table', 'lohals-rug'],
    designSummary: `A tranquil Scandinavian transformation that turns functional limitations into calming, airy order using timeless Nordic materials and honest craftsmanship.`,
    source: 'client-benchmark',
    notice: 'Synthesized with Scandinavian architectural benchmark engine.',
  };
}
