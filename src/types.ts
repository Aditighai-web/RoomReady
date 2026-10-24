export interface IkeaProduct {
  id: string;
  name: string;
  swedishMeaning: string;
  category: 'Seating' | 'Storage' | 'Tables' | 'Lighting' | 'Rugs & Textiles' | 'Decor' | string;
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
  length: number; // e.g. 4.2
  width: number;  // e.g. 3.6
  height: number; // e.g. 2.8
  unit: 'm' | 'ft';
  furnitureNotes?: string;
}

export interface SpatialAnalysis {
  spatialLayout: string;
  naturalLight: string;
  storageDeclutter: string;
  paletteMaterials: string;
  budgetStrategy: string;
  recommendedProductIds: string[];
  designSummary: string;
  source: 'gemini' | 'demo' | 'client-benchmark' | string;
  notice?: string;
}

export interface MakeoverRender {
  imageUrl: string;
  label: string;
  disclaimer: string;
  isAiGenerated: boolean;
  source: string;
}

export interface RoomPreset {
  id: string;
  title: string;
  subtitle: string;
  roomType: string;
  style: string;
  palette: string;
  budget: number;
  dimensions?: RoomDimensions;
  beforeImage: string;
  afterImage: string;
  analysis: SpatialAnalysis;
}

export interface ColorPalette {
  id: string;
  name: string;
  subtext: string;
  colors: string[];
}

export interface BudgetConfig {
  min: number;
  max: number;
  default: number;
  presets: number[];
}

export interface SiteContent {
  heroHeadline: string;
  heroSubtitle: string;
  ga4MeasurementId: string;
  announcement: string;
}

export interface SavedMakeover {
  id: string;
  title: string;
  createdAt: string;
  roomType: string;
  style: string;
  palette: string;
  budget: number;
  dimensions: RoomDimensions;
  beforeImage: string;
  afterImage: string;
  analysis: SpatialAnalysis;
  selectedProductIds: string[];
  totalCost: number;
}
