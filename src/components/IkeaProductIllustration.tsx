import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { IkeaProduct } from '../types';

interface IkeaProductIllustrationProps {
  product: IkeaProduct;
  className?: string;
}

/**
 * Authentic Scandinavian schematic vector render for specific IKEA furniture pieces.
 * Guarantees that if an external image link fails or is blocked, the user sees an
 * accurate, high-fidelity visual representation of that specific piece, NOT an unrelated photo.
 */
export const IkeaProductIllustration: React.FC<IkeaProductIllustrationProps> = ({ product, className = '' }) => {
  const id = product.id.toLowerCase();

  // POÄNG Armchair (Bentwood birch cantilever frame & cushion)
  if (id.includes('poang') || id.includes('armchair')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <svg viewBox="0 0 200 160" className="w-36 h-28 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bent birch cantilever frame */}
          <path d="M40 140 C40 140 150 140 160 140 C170 140 175 130 170 115 L145 60 C140 50 130 45 120 45 L95 45" stroke="#D4B996" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M45 140 C55 110 70 80 85 55 L95 40 C105 25 125 25 135 40 L155 75" stroke="#C5A882" strokeWidth="6" strokeLinecap="round" />
          {/* Hillared beige cushion profile */}
          <path d="M80 35 C80 35 120 42 135 65 C145 80 135 105 110 110 C85 115 65 110 65 110" fill="#E6DFC8" stroke="#7A6855" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M92 48 Q108 52 118 70" stroke="#7A6855" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Base shadow */}
          <ellipse cx="100" cy="148" rx="65" ry="5" fill="#E5E0D8" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">POÄNG · Curved Bentwood</span>
      </div>
    );
  }

  // BILLY Bookcase (Vertical library shelving with adjustable tiers)
  if (id.includes('billy') || id.includes('bookcase')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-3 select-none ${className}`}>
        <svg viewBox="0 0 160 180" className="w-28 h-32 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer birch frame */}
          <rect x="45" y="15" width="70" height="150" rx="2" fill="#F3EFEA" stroke="#D4B996" strokeWidth="4" />
          {/* Shelves */}
          <line x1="45" y1="45" x2="115" y2="45" stroke="#D4B996" strokeWidth="3" />
          <line x1="45" y1="75" x2="115" y2="75" stroke="#D4B996" strokeWidth="3" />
          <line x1="45" y1="105" x2="115" y2="105" stroke="#D4B996" strokeWidth="3" />
          <line x1="45" y1="135" x2="115" y2="135" stroke="#D4B996" strokeWidth="3" />
          {/* Book representations */}
          <rect x="50" y="24" width="7" height="21" rx="1" fill="#0058A3" opacity="0.8" />
          <rect x="59" y="27" width="9" height="18" rx="1" fill="#5E7A68" opacity="0.8" />
          <rect x="70" y="22" width="6" height="23" rx="1" fill="#D97D64" opacity="0.8" />
          {/* Vase on shelf 3 */}
          <ellipse cx="80" cy="98" rx="5" ry="7" fill="#8E979C" stroke="#2F343B" strokeWidth="1" />
          {/* Plinth */}
          <rect x="45" y="158" width="70" height="7" fill="#C5A882" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">BILLY · 206 cm Vertical Storage</span>
      </div>
    );
  }

  // LISABO Table (Tapered solid birch legs & floating beveled tabletop)
  if (id.includes('lisabo') || id.includes('table')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <svg viewBox="0 0 200 140" className="w-36 h-24 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floating beveled top */}
          <polygon points="25,48 175,48 165,58 35,58" fill="#E8D8C3" stroke="#C5A882" strokeWidth="2" />
          {/* Apron */}
          <rect x="40" y="58" width="120" height="6" fill="#C5A882" />
          {/* 4 Tapered legs */}
          <polygon points="40,64 48,64 36,125 30,125" fill="#D4B996" stroke="#9E8062" strokeWidth="1" />
          <polygon points="62,64 68,64 60,118 56,118" fill="#C5A882" opacity="0.7" />
          <polygon points="132,64 138,64 140,118 144,118" fill="#C5A882" opacity="0.7" />
          <polygon points="152,64 160,64 170,125 164,125" fill="#D4B996" stroke="#9E8062" strokeWidth="1" />
          {/* Ground shadow */}
          <ellipse cx="100" cy="128" rx="72" ry="4" fill="#E5E0D8" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">LISABO · Bevelled Ash Table</span>
      </div>
    );
  }

  // KALLAX Unit (Modular 4x2 shelving cubes)
  if (id.includes('kallax') || id.includes('cube')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-3 select-none ${className}`}>
        <svg viewBox="0 0 180 140" className="w-32 h-26 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Thick outer perimeter */}
          <rect x="20" y="20" width="140" height="95" rx="3" fill="#FFFFFF" stroke="#2F343B" strokeWidth="5" />
          {/* Horizontal divider */}
          <line x1="20" y1="67" x2="160" y2="67" stroke="#2F343B" strokeWidth="4" />
          {/* Vertical dividers */}
          <line x1="55" y1="20" x2="55" y2="115" stroke="#2F343B" strokeWidth="3" />
          <line x1="90" y1="20" x2="90" y2="115" stroke="#2F343B" strokeWidth="3" />
          <line x1="125" y1="20" x2="125" y2="115" stroke="#2F343B" strokeWidth="3" />
          {/* Storage basket insert in 1 cube */}
          <rect x="58" y="71" width="29" height="40" rx="2" fill="#D4B996" />
          <line x1="72" y1="76" x2="72" y2="82" stroke="#634832" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">KALLAX · 8-Cube Modular Shelving</span>
      </div>
    );
  }

  // HEKTAR Lamp (Industrial steel flared pendant/floor dome lamp)
  if (id.includes('hektar') || id.includes('lamp')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-3 select-none ${className}`}>
        <svg viewBox="0 0 160 170" className="w-28 h-30 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Curved steel neck */}
          <path d="M80 155 L80 50 C80 30 110 25 115 45" stroke="#2F343B" strokeWidth="4" strokeLinecap="round" />
          {/* Brass joint fixture */}
          <circle cx="115" cy="45" r="4.5" fill="#D4AF37" stroke="#9E8062" strokeWidth="1" />
          {/* Flared dome shade */}
          <path d="M102 52 L128 52 L138 80 L92 80 Z" fill="#2F343B" stroke="#1E2229" strokeWidth="2" />
          {/* Warm 2700K ambient light cone */}
          <polygon points="92,82 138,82 155,145 75,145" fill="#FFDB00" opacity="0.18" />
          {/* Heavy cast base */}
          <ellipse cx="80" cy="155" rx="25" ry="6" fill="#2F343B" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">HEKTAR · 2700K Nordic Task Lamp</span>
      </div>
    );
  }

  // LOHALS Rug (100% natural jute flatwoven textured mat)
  if (id.includes('lohals') || id.includes('rug')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <svg viewBox="0 0 190 130" className="w-36 h-24 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Natural jute flatweave grid */}
          <rect x="25" y="25" width="140" height="80" rx="2" fill="#D8C3A5" stroke="#9E8062" strokeWidth="3" />
          {/* Texture lines */}
          <line x1="25" y1="45" x2="165" y2="45" stroke="#B89B77" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="25" y1="65" x2="165" y2="65" stroke="#B89B77" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="25" y1="85" x2="165" y2="85" stroke="#B89B77" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="60" y1="25" x2="60" y2="105" stroke="#B89B77" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="95" y1="25" x2="95" y2="105" stroke="#B89B77" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="130" y1="25" x2="130" y2="105" stroke="#B89B77" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* Fringe edges */}
          <path d="M22 25 L22 105" stroke="#8D7B68" strokeWidth="2" strokeDasharray="2 3" />
          <path d="M168 25 L168 105" stroke="#8D7B68" strokeWidth="2" strokeDasharray="2 3" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">LOHALS · 100% Flatwoven Jute</span>
      </div>
    );
  }

  // NISSAFORS Utility Cart (Nimble 3-tier powder-coated trolley on castors)
  if (id.includes('nissafors') || id.includes('cart')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-3 select-none ${className}`}>
        <svg viewBox="0 0 160 170" className="w-28 h-30 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 4 Tubular uprights */}
          <line x1="50" y1="30" x2="50" y2="145" stroke="#2F343B" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="110" y1="30" x2="110" y2="145" stroke="#2F343B" strokeWidth="3.5" strokeLinecap="round" />
          {/* 3 Tier trays */}
          <rect x="42" y="35" width="76" height="18" rx="2" fill="#3D444F" stroke="#1E2229" strokeWidth="1.5" />
          <rect x="42" y="75" width="76" height="18" rx="2" fill="#3D444F" stroke="#1E2229" strokeWidth="1.5" />
          <rect x="42" y="115" width="76" height="18" rx="2" fill="#3D444F" stroke="#1E2229" strokeWidth="1.5" />
          {/* Castors */}
          <circle cx="50" cy="152" r="5" fill="#8E979C" stroke="#2F343B" strokeWidth="1.5" />
          <circle cx="110" cy="152" r="5" fill="#8E979C" stroke="#2F343B" strokeWidth="1.5" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">NISSAFORS · 3-Tier Utility Cart</span>
      </div>
    );
  }

  // GLADOM Tray Table (Round removable tray top with steel cross legs)
  if (id.includes('gladom') || id.includes('tray')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <svg viewBox="0 0 170 140" className="w-32 h-26 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular tray lip */}
          <ellipse cx="85" cy="45" rx="55" ry="16" fill="#F0F5FA" stroke="#0058A3" strokeWidth="3" />
          <ellipse cx="85" cy="43" rx="50" ry="13" fill="#FFFFFF" />
          {/* Crossed wire legs */}
          <line x1="50" y1="56" x2="115" y2="120" stroke="#0058A3" strokeWidth="3" strokeLinecap="round" />
          <line x1="120" y1="56" x2="55" y2="120" stroke="#0058A3" strokeWidth="3" strokeLinecap="round" />
          {/* Ground foot pads */}
          <ellipse cx="85" cy="122" rx="42" ry="3" fill="#E5E0D8" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">GLADOM · Removable Tray Table</span>
      </div>
    );
  }

  // SKÅDIS Pegboard (Perforated desk wall organizer)
  if (id.includes('skadis') || id.includes('pegboard')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <svg viewBox="0 0 160 150" className="w-30 h-28 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Perforated board */}
          <rect x="25" y="15" width="110" height="115" rx="6" fill="#FAF9F6" stroke="#D5D0C7" strokeWidth="3" />
          {/* Peg slots grid */}
          {[35, 55, 75, 95, 115].map((x) =>
            [30, 50, 70, 90, 110].map((y) => (
              <rect key={`${x}-${y}`} x={x} y={y} width="5" height="10" rx="2.5" fill="#A8A29E" opacity="0.6" />
            ))
          )}
          {/* Elastic cord & container attachment */}
          <rect x="45" y="85" width="40" height="24" rx="2" fill="#5E7A68" />
          <line x1="90" y1="40" x2="115" y2="65" stroke="#D97D64" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">SKÅDIS · Perforated Wall Pegboard</span>
      </div>
    );
  }

  // GRADVIS / FEJKA (Ceramic fluted vase with botanical foliage)
  if (id.includes('fejka') || id.includes('gradvis') || id.includes('vase')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Eucalyptus botanical stem */}
          <path d="M80 80 Q65 45 70 20" stroke="#5E7A68" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="60" cy="38" rx="8" ry="4" fill="#5E7A68" transform="rotate(-30 60 38)" />
          <ellipse cx="78" cy="28" rx="7" ry="4" fill="#718F7B" transform="rotate(20 78 28)" />
          {/* Fluted ribbed ceramic vase */}
          <path d="M60 80 L100 80 L95 140 L65 140 Z" fill="#EAEAEA" stroke="#8E979C" strokeWidth="2" />
          <line x1="70" y1="80" x2="72" y2="140" stroke="#8E979C" strokeWidth="1" />
          <line x1="80" y1="80" x2="80" y2="140" stroke="#8E979C" strokeWidth="1" />
          <line x1="90" y1="80" x2="88" y2="140" stroke="#8E979C" strokeWidth="1" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">GRADVIS · Fluted Nordic Ceramic</span>
      </div>
    );
  }

  // STRANDMON Wing Chair (Embracing high-back classic armchair)
  if (id.includes('strandmon') || id.includes('wing')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-3 select-none ${className}`}>
        <svg viewBox="0 0 170 160" className="w-30 h-28 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* High wing back */}
          <path d="M50 25 C45 35 40 55 45 90 L125 90 C130 55 125 35 120 25 C115 15 55 15 50 25 Z" fill="#3E454E" stroke="#1E2229" strokeWidth="2" />
          {/* Wings */}
          <path d="M42 35 C35 50 40 70 45 80" stroke="#2F343B" strokeWidth="4" strokeLinecap="round" />
          <path d="M128 35 C135 50 130 70 125 80" stroke="#2F343B" strokeWidth="4" strokeLinecap="round" />
          {/* Thick cushion */}
          <rect x="42" y="90" width="86" height="25" rx="5" fill="#4B535E" stroke="#1E2229" strokeWidth="2" />
          {/* Solid beech turned legs */}
          <line x1="50" y1="115" x2="42" y2="145" stroke="#9E8062" strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="115" x2="128" y2="145" stroke="#9E8062" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">STRANDMON · High Wingback Armchair</span>
      </div>
    );
  }

  // BESTÅ Storage Console (Low-line flush cabinet with cable grommets)
  if (id.includes('besta') || id.includes('storage') || id.includes('console')) {
    return (
      <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <svg viewBox="0 0 190 130" className="w-36 h-24 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* White oak frame */}
          <rect x="25" y="40" width="140" height="55" rx="2" fill="#F5EBE1" stroke="#C5A882" strokeWidth="3" />
          {/* Twin push-to-open flush doors */}
          <line x1="95" y1="40" x2="95" y2="95" stroke="#C5A882" strokeWidth="2" />
          {/* Cable port notch */}
          <ellipse cx="95" cy="40" rx="6" ry="2" fill="#2F343B" />
          {/* Minimalist metal feet */}
          <line x1="35" y1="95" x2="35" y2="112" stroke="#2F343B" strokeWidth="3" />
          <line x1="155" y1="95" x2="155" y2="112" stroke="#2F343B" strokeWidth="3" />
        </svg>
        <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase mt-1">BESTÅ · Low-Line Media Console</span>
      </div>
    );
  }

  // Default Scandinavian Furniture Blueprint
  return (
    <div className={`w-full h-full bg-[#FAF8F5] flex flex-col items-center justify-center p-4 select-none ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#EAE8E3] flex items-center justify-center text-[#0058A3] mb-2 shadow-xs">
        <Package className="w-6 h-6" />
      </div>
      <span className="text-xs font-bold text-[#1E2229] truncate max-w-[170px] text-center">{product.name}</span>
      <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">{product.category} · {product.dimensions}</span>
    </div>
  );
};

interface ProductImageWithFallbackProps {
  product: IkeaProduct;
  className?: string;
}

/**
 * Robust Product Image with smooth skeleton loading state,
 * error handling, and 100% authentic IKEA item fallback.
 */
export const ProductImageWithFallback: React.FC<ProductImageWithFallbackProps> = ({ product, className = '' }) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // If already flagged with error, immediately show authentic illustration
  if (hasError || !product.imageUrl) {
    return <IkeaProductIllustration product={product} className={className} />;
  }

  return (
    <div className={`relative w-full h-full bg-[#FAF8F5] overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F2EC] via-[#ECE9E1] to-[#F4F2EC] animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#0058A3]/30 border-t-[#0058A3] rounded-full animate-spin" />
        </div>
      )}

      <img
        src={product.imageUrl}
        alt={`${product.name} — ${product.category}`}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
