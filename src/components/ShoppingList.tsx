import React, { useState } from 'react';
import { Plus, Check, ShoppingBag, ArrowUpRight, AlertTriangle, ShieldCheck, Ruler } from 'lucide-react';
import { IkeaProduct, RoomDimensions } from '../types';
import { trackProductClicked } from '../services/tracker';
import { ProductImageWithFallback } from './IkeaProductIllustration';

interface ShoppingListProps {
  products: IkeaProduct[];
  selectedProductIds: string[];
  onToggleProduct: (id: string) => void;
  targetBudget: number;
  dimensions: RoomDimensions;
  onClearPlan: () => void;
  onSelectRecommended: () => void;
  recommendedIds: string[];
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  products,
  selectedProductIds,
  onToggleProduct,
  targetBudget,
  dimensions,
  onClearPlan,
  onSelectRecommended,
  recommendedIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewFilter, setViewFilter] = useState<'all' | 'in-plan'>('all');

  // Derive unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Calculate cart total
  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));
  const currentTotal = selectedProducts.reduce((sum, item) => sum + item.priceINR, 0);
  const budgetDelta = targetBudget - currentTotal;
  const isWithinBudget = budgetDelta >= 0;
  const percentage = Math.min(Math.round((currentTotal / (targetBudget || 1)) * 100), 100);

  // Defensive fallback for room dimensions
  const safeDims = dimensions || { length: 3.8, width: 3.4, height: 2.7, unit: 'm' as const };
  const unit = safeDims.unit || 'm';
  const roomWidthCm = unit === 'm' ? (safeDims.width || 3.4) * 100 : (safeDims.width || 11.1) * 30.48;
  const roomLengthCm = unit === 'm' ? (safeDims.length || 3.8) * 100 : (safeDims.length || 12.5) * 30.48;
  const roomHeightCm = unit === 'm' ? (safeDims.height || 2.7) * 100 : (safeDims.height || 8.8) * 30.48;

  // Compute dimensional fit warning for a product
  const computeFitNotice = (dimString: string) => {
    // Try to extract numbers from dimensions (e.g. "80 x 28 x 206 cm" or "120 x 40 x 64 cm")
    const matches = dimString.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length === 0) return null;

    const nums = matches.map(Number);
    const maxDim = Math.max(...nums);
    const minDim = Math.min(...nums);

    // Height check
    if (dimString.toLowerCase().includes('height') || (nums.length >= 3 && nums[2] > 150)) {
      const height = nums.length >= 3 ? nums[2] : nums[0];
      if (height > 150) {
        const ceilingClearance = Math.max(0, Math.round(roomHeightCm - height));
        return {
          type: 'vertical',
          severity: ceilingClearance < 30 ? 'warn' : 'info',
          text: `Height ${height} cm leaves ${ceilingClearance} cm ceiling clearance`,
        };
      }
    }

    // Width check against room width
    const pieceWidth = nums[0];
    const widthRatio = pieceWidth / Math.min(roomWidthCm, roomLengthCm);

    if (widthRatio > 0.45) {
      return {
        type: 'width-high',
        severity: 'warn',
        text: `Occupies ${(widthRatio * 100).toFixed(0)}% of room width. Align along main wall.`,
      };
    } else if (widthRatio < 0.28) {
      return {
        type: 'compact',
        severity: 'good',
        text: `Compact profile (takes ${(widthRatio * 100).toFixed(0)}% width). Leaves 80+ cm walking corridor.`,
      };
    }

    return {
      type: 'standard',
      severity: 'good',
      text: `Proportional fit: leaves ${(100 - widthRatio * 100).toFixed(0)}% wall clearance.`,
    };
  };

  // Filter products by category and in-plan toggle
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesPlanView = viewFilter === 'all' || selectedProductIds.includes(p.id);
    return matchesCategory && matchesPlanView;
  });

  return (
    <section id="ikea-catalog" className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm space-y-6">
      
      {/* Top Section Header & Budget Meter */}
      <div id="budget-tracker" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1E2229]">
              Curated IKEA India Shopping Plan
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Hand-selected Scandinavian pieces with furniture-fit clearances for your {dimensions.length}×{dimensions.width} {dimensions.unit} space
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSelectRecommended}
              className="px-3 py-1.5 text-xs font-semibold text-[#0058A3] bg-[#0058A3]/10 hover:bg-[#0058A3]/15 rounded-lg transition-colors cursor-pointer"
            >
              Select Recommended Suite
            </button>
            {selectedProductIds.length > 0 && (
              <button
                onClick={onClearPlan}
                className="px-2.5 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#c92a2a] transition-colors cursor-pointer"
                title="Reset selection"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Budget Meter Card with Itemized Pricing Summary */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#6B7280]">Plan Total:</span>
              <span className="text-xl font-bold text-[#0058A3] tabular-nums">
                ₹{currentTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#6B7280] tabular-nums">
                / ₹{targetBudget.toLocaleString('en-IN')} Budget
              </span>
            </div>

            <div className="text-xs font-semibold">
              {isWithinBudget ? (
                <span className="text-[#2b8a3e]">
                  Within Budget (₹{budgetDelta.toLocaleString('en-IN')} remaining)
                </span>
              ) : (
                <span className="text-[#c92a2a]">
                  Over budget by ₹{Math.abs(budgetDelta).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="w-full h-2.5 bg-[#EAE8E3] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isWithinBudget ? 'bg-[#0058A3]' : 'bg-[#c92a2a]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>{selectedProductIds.length} items selected in active plan</span>
            <span className="tabular-nums">{percentage}% of budget allocated (All INR prices inclusive of taxes)</span>
          </div>

          {/* Itemized selected products chip breakdown if items selected */}
          {selectedProducts.length > 0 && (
            <div className="pt-2 border-t border-[#E8E5DF]/70">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">
                Itemized Cost Breakdown ({selectedProducts.length} items):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedProducts.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white border border-[#E8E5DF] rounded-md text-[#1E2229]"
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[#0058A3] font-bold tabular-nums">₹{p.priceINR.toLocaleString('en-IN')}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Category Bar */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Category Filter Pills (Functional Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E2229] text-white border-[#1E2229] shadow-xs'
                      : 'bg-[#FAF9F6] text-[#4A505A] border-[#E8E5DF] hover:bg-[#EAE8E3]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Plan view filter */}
          <div className="flex items-center p-0.5 bg-[#F4F2EC] rounded-lg border border-[#E8E5DF] text-xs">
            <button
              onClick={() => setViewFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                viewFilter === 'all' ? 'bg-white text-[#1E2229] shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setViewFilter('in-plan')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                viewFilter === 'in-plan' ? 'bg-white text-[#1E2229] shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              In Plan ({selectedProductIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((item) => {
          const isSelected = selectedProductIds.includes(item.id);
          const isRecommended = recommendedIds.includes(item.id);
          const fitNotice = computeFitNotice(item.dimensions);

          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group bg-white ${
                isSelected
                  ? 'border-[#0058A3] shadow-md ring-1 ring-[#0058A3]'
                  : 'border-[#E8E5DF] hover:border-[#D5D0C7] hover:shadow-xs'
              }`}
            >
              {/* Product Image Slot with Authentic Fallback */}
              <div className="relative h-44 bg-[#F4F2EC] overflow-hidden">
                <ProductImageWithFallback product={item} />

                {/* Status Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#1E2229] px-2 py-0.5 rounded shadow-xs">
                    {item.category}
                  </span>
                  {isRecommended && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0058A3] text-white px-2 py-0.5 rounded shadow-xs">
                      AI Recommended
                    </span>
                  )}
                </div>

                {/* Plan Toggle Corner Button */}
                <button
                  onClick={() => onToggleProduct(item.id)}
                  aria-label={isSelected ? `Remove ${item.name} from plan` : `Add ${item.name} to plan`}
                  className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm z-10 ${
                    isSelected
                      ? 'bg-[#0058A3] text-white'
                      : 'bg-white/90 hover:bg-white text-[#1E2229]'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>

              {/* Product Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-[#1E2229] tracking-tight">
                      {item.name}
                    </h3>
                    <span className="text-xs text-[#6B7280] italic">
                      "{item.swedishMeaning}"
                    </span>
                  </div>

                  <p className="text-xs text-[#4A505A] mt-1 line-clamp-2">
                    {item.desc}
                  </p>

                  {/* Dimensions & Material */}
                  <div className="mt-2 pt-2 border-t border-[#F0EEE9] text-[11px] text-[#6B7280] space-y-0.5">
                    <div>
                      <span className="font-medium text-[#1E2229]">Dimensions:</span> {item.dimensions}
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-[#1E2229]">Material:</span> {item.materials}
                    </div>
                  </div>

                  {/* Dynamic Furniture-Fit Warning / Clearance Indicator */}
                  {fitNotice && (
                    <div
                      className={`mt-2 p-1.5 rounded flex items-center gap-1.5 text-[10px] font-medium leading-tight ${
                        fitNotice.severity === 'warn'
                          ? 'bg-[#FFF7ED] text-[#9A3412] border border-[#FED7AA]'
                          : fitNotice.severity === 'good'
                          ? 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
                          : 'bg-[#F0F5FA] text-[#0058A3] border border-[#BAE6FD]'
                      }`}
                    >
                      {fitNotice.severity === 'warn' ? (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{fitNotice.text}</span>
                    </div>
                  )}

                  {/* Why this works (spatial reason) */}
                  <div className="mt-2 p-2 bg-[#FAF9F6] border border-[#E8E5DF]/70 rounded text-[11px] text-[#5B7065] leading-snug">
                    <span className="font-semibold text-[#1E2229]">Design fit:</span> {item.spatialBenefit}
                  </div>
                </div>

                {/* Card Bottom Bar: Price in INR + Action Links */}
                <div className="pt-3 border-t border-[#F0EEE9] flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">Price</span>
                    <span className="text-base font-bold text-[#0058A3] tabular-nums">
                      ₹{item.priceINR.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleProduct(item.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#EAE8E3] text-[#1E2229] hover:bg-[#dedbd4]'
                          : 'bg-[#0058A3] text-white hover:bg-[#004885]'
                      }`}
                    >
                      {isSelected ? 'In Plan' : 'Add to Plan'}
                    </button>

                    <a
                      href={`https://www.ikea.com/in/en/search/?q=${item.query}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackProductClicked({
                          item_id: item.id,
                          item_name: item.name,
                          item_category: item.category,
                          price_inr: item.priceINR,
                        });
                      }}
                      title="View product specifications on IKEA India"
                      className="p-1.5 text-[#6B7280] hover:text-[#0058A3] hover:bg-[#FAF9F6] rounded-lg transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-8 text-center bg-[#FAF9F6] rounded-xl border border-[#E8E5DF]">
          <ShoppingBag className="w-7 h-7 text-[#6B7280] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold text-[#1E2229]">No products found in this category.</p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">Switch filters or browse all furniture options.</p>
        </div>
      )}

    </section>
  );
};
