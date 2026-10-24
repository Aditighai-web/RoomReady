import { ColorPalette, RoomPreset } from '../types';
import demoMakeoverImg from '../assets/images/demo_scandinavian_makeover_1792682337681.jpg';
import demoStudioImg from '../assets/images/sample_makeover_studio_1792679069093.jpg';
import demoLivingImg from '../assets/images/sample_makeover_living_1792679069020.jpg';
import demoHeroImg from '../assets/images/hero_scandinavian_room_1792679067859.jpg';
import sampleStudioBeforeImg from '../assets/images/sample_room_indian_studio_1792679068006.jpg';
import sampleLivingBeforeImg from '../assets/images/sample_room_cluttered_living_1792679069559.jpg';

export const PALETTES: ColorPalette[] = [
  {
    id: 'Birch & Sage',
    name: 'Birch & Sage',
    subtext: 'Light ash wood, muted eucalyptus, warm paper',
    colors: ['#E6EBE6', '#5E7A68', '#D8C3A5', '#FAF9F6'],
  },
  {
    id: 'Stockholm Monochrome',
    name: 'Stockholm Gray',
    subtext: 'Granite, chalk white, matte carbon steel',
    colors: ['#EAEAEA', '#8E979C', '#2F343B', '#FFFFFF'],
  },
  {
    id: 'Warm Hygge Terracotta',
    name: 'Warm Terracotta',
    subtext: 'Fired clay, honey oak, raw linen',
    colors: ['#D97D64', '#E6CBA8', '#634832', '#FFFBF5'],
  },
  {
    id: 'Coastal Fjord Blue',
    name: 'Coastal Fjord',
    subtext: 'Nordic indigo, mist gray, untreated pine',
    colors: ['#C5D3E8', '#0058A3', '#EFECE6', '#324B66'],
  },
  {
    id: 'Pale Oak & Cream',
    name: 'Pale Oak & Cream',
    subtext: 'Minimalist blonde wood, soft wool, warm taupe',
    colors: ['#F5EBE1', '#D4B996', '#8D7B68', '#FBF8F4'],
  },
];

export const ROOM_PRESETS: RoomPreset[] = [
  {
    id: 'indian-studio',
    title: 'Indian 1-BHK Studio',
    subtitle: 'Compact 140 sq.ft bedroom requiring storage and light',
    roomType: 'Studio Apartment',
    style: 'Modern Scandinavian',
    palette: 'Birch & Sage',
    budget: 45000,
    dimensions: { length: 3.8, width: 3.4, height: 2.7, unit: 'm' },
    beforeImage: sampleStudioBeforeImg,
    afterImage: demoStudioImg,
    analysis: {
      spatialLayout: 'Narrow floor circulation pinched between wardrobe and bed. Shifting clothes storage into high-level vertical cabinets opens up a 90 cm perimeter walkway.',
      naturalLight: 'Strong direct sunlight from north-facing balcony window. Layer translucent white linen shears to diffuse heat while keeping the study desk luminous.',
      storageDeclutter: 'Clear loose books and chargers using the IKEA SKÅDIS wall pegboard and under-bed rolling drawers, freeing 35% more usable floor area.',
      paletteMaterials: 'Blonde birch veneer and pale ash pair harmoniously with sage green linen accents, creating a calm visual sanctuary in a bustling urban context.',
      budgetStrategy: 'Allocate ₹20,000 to multifunctional birch storage, ₹15,000 to ergonomic seating and desk, and ₹10,000 to soft textiles and layered lighting.',
      recommendedProductIds: ['poang-armchair', 'billy-bookcase', 'lisabo-table', 'skadis-pegboard', 'nissafors-cart'],
      designSummary: 'A light-filled Scandinavian sanctuary transforming a compact Mumbai/Bengaluru studio into an uncluttered haven of peace and productivity.',
      source: 'demo',
      notice: 'Verified architectural case study for compact urban apartments.'
    },
  },
  {
    id: 'cluttered-living',
    title: 'Urban Family Living',
    subtitle: '190 sq.ft lounge with dispersed furniture and cord tangle',
    roomType: 'Living Room',
    style: 'Japandi',
    palette: 'Stockholm Monochrome',
    budget: 65000,
    dimensions: { length: 4.6, width: 3.8, height: 2.8, unit: 'm' },
    beforeImage: sampleLivingBeforeImg,
    afterImage: demoMakeoverImg,
    analysis: {
      spatialLayout: 'Centrally crowded arrangement causes visual fatigue. Aligning seating along a single clean sightline toward the balcony enhances perceived depth by 40%.',
      naturalLight: 'Ceiling lighting is too harsh and directional. Replace with a 3-layer Nordic ambient plan: 1 soft floor uplight, 1 low reading task lamp, and warm sconces.',
      storageDeclutter: 'Open TV console gathers clutter. Transition to flush BESTÅ cabinets with discreet cable grommets to cleanly mask multimedia boxes.',
      paletteMaterials: 'Warm chalk walls, solid ash accents, and tactile flatwoven jute rugs ground the space with organic wabi-sabi composure.',
      budgetStrategy: 'Direct ₹28,000 toward closed low-line media storage, ₹22,000 toward focal lounge seating, and ₹15,000 toward natural jute rug and warm lighting.',
      recommendedProductIds: ['lisabo-table', 'besta-storage', 'lohals-rug', 'hektar-lamp', 'fejka-gradvis'],
      designSummary: 'An airy Japandi living room that eliminates visual noise while maintaining warm hospitality for family gatherings.',
      source: 'demo',
      notice: 'Verified architectural case study for residential living rooms.'
    },
  },
  {
    id: 'work-nook',
    title: 'Balcony / Study Nook',
    subtitle: '75 sq.ft study corner with screen glare and loose paperwork',
    roomType: 'Home Office',
    style: 'Stockholm Industrial',
    palette: 'Coastal Fjord Blue',
    budget: 35000,
    dimensions: { length: 2.8, width: 2.5, height: 2.6, unit: 'm' },
    beforeImage: sampleStudioBeforeImg,
    afterImage: demoHeroImg,
    analysis: {
      spatialLayout: 'Desk directly opposes window causing eye fatigue. Angle work surface 90 degrees perpendicular to window wall to invite side illumination.',
      naturalLight: 'Strong ambient contrast between computer display and dark corners. Add a dimmable HEKTAR task lamp positioned above eye level.',
      storageDeclutter: 'Introduce vertical modular KALLAX cubes to keep binders and electronics off desk surface, leaving workspace pristine.',
      paletteMaterials: 'Matte dark steel framework balanced by blonde birch surfaces and deep indigo wool accessories.',
      budgetStrategy: 'Invest ₹16,000 in ergonomic support, ₹12,000 in modular vertical shelving, and ₹7,000 in directional lighting and acoustic desk mats.',
      recommendedProductIds: ['kallax-unit', 'skadis-pegboard', 'nissafors-cart', 'hektar-lamp', 'gladom-tray-table'],
      designSummary: 'An intentional, distraction-free Scandinavian workstation maximizing small square footage with industrial precision.',
      source: 'demo',
      notice: 'Verified architectural case study for small work nooks.'
    },
  },
];

// Returns a valid, local, high-definition Scandinavian makeover inspiration image
export function getDemoInspirationImage(roomType: string, _style?: string): string {
  if (roomType === 'Bedroom' || roomType === 'Studio Apartment') {
    return demoStudioImg;
  }
  if (roomType === 'Home Office' || roomType === 'Balcony Sunroom') {
    return demoHeroImg;
  }
  return demoMakeoverImg || demoLivingImg;
}

export const FALLBACK_DEMO_IMAGE = demoMakeoverImg || demoLivingImg;
