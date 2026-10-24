import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileText, ArrowUpRight, Package } from 'lucide-react';
import { IkeaProduct, SpatialAnalysis } from '../types';
import { ProductImageWithFallback } from './IkeaProductIllustration';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: string;
  style: string;
  palette: string;
  budget: number;
  selectedProducts: IkeaProduct[];
  analysis: SpatialAnalysis | null;
  onDownloadStandalone?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  roomType,
  style,
  palette,
  budget,
  selectedProducts,
  analysis,
  onDownloadStandalone,
}) => {
  const [copied, setCopied] = useState(false);
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const totalCost = selectedProducts.reduce((sum, item) => sum + item.priceINR, 0);
  const remainingBudget = budget - totalCost;

  const generatePlainText = () => {
    let text = `ROOMREADY · SCANDINAVIAN MAKEOVER PLAN\n`;
    text += `=========================================\n`;
    text += `Room Type: ${roomType}\n`;
    text += `Aesthetic Style: ${style}\n`;
    text += `Colour Palette: ${palette}\n`;
    text += `Target Budget: ₹${budget.toLocaleString('en-IN')}\n`;
    text += `Plan Total: ₹${totalCost.toLocaleString('en-IN')} (${remainingBudget >= 0 ? `₹${remainingBudget.toLocaleString('en-IN')} remaining` : `₹${Math.abs(remainingBudget).toLocaleString('en-IN')} over budget`})\n\n`;

    text += `CURATED IKEA FURNITURE ITEMS:\n`;
    selectedProducts.forEach((item, index) => {
      text += `${index + 1}. ${item.name} (${item.category}) - ₹${item.priceINR.toLocaleString('en-IN')}\n`;
      text += `   Dimensions: ${item.dimensions}\n`;
      text += `   Link: https://www.ikea.com/in/en/search/?q=${item.query}\n`;
    });

    if (analysis) {
      text += `\nARCHITECTURAL DESIGN ADVICE:\n`;
      text += `- Circulation: ${analysis.spatialLayout}\n`;
      text += `- Lighting: ${analysis.naturalLight}\n`;
      text += `- Storage: ${analysis.storageDeclutter}\n`;
      text += `- Materials: ${analysis.paletteMaterials}\n`;
    }

    return text;
  };

  const handleCopy = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E8E5DF] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#E8E5DF] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#0058A3] text-[#FFDB00] text-[10px] font-black px-2 py-0.5 rounded">
              IKEA READY
            </span>
            <h2 className="text-base font-bold text-[#1E2229]">
              Room Makeover Design Brief
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#6B7280] hover:text-[#1E2229] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#1E2229]">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl">
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase block">Room Space</span>
              <strong className="text-xs text-[#1E2229]">{roomType}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase block">Style</span>
              <strong className="text-xs text-[#1E2229]">{style}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase block">Palette</span>
              <strong className="text-xs text-[#1E2229]">{palette}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#6B7280] uppercase block">Budget Target</span>
              <strong className="text-xs text-[#0058A3] tabular-nums">₹{budget.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Itemized Furniture List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2.5">
              Curated IKEA Furniture ({selectedProducts.length} items)
            </h3>

            {selectedProducts.length === 0 ? (
              <p className="text-xs text-[#6B7280] italic py-2">
                No items currently selected. Click "Add to Plan" on any IKEA product to build your kit.
              </p>
            ) : (
              <div className="divide-y divide-[#E8E5DF] border border-[#E8E5DF] rounded-xl overflow-hidden">
                {selectedProducts.map((item) => (
                  <div key={item.id} className="p-3 bg-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#E8E5DF]">
                        <ProductImageWithFallback product={item} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#1E2229] truncate">
                          {item.name}{' '}
                          <span className="font-normal text-[#6B7280] text-[11px]">
                            · {item.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6B7280] block truncate">
                          {item.dimensions}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-xs text-[#0058A3] tabular-nums block">
                        ₹{item.priceINR.toLocaleString('en-IN')}
                      </span>
                      <a
                        href={`https://www.ikea.com/in/en/search/?q=${item.query}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#5B7065] hover:underline inline-flex items-center gap-0.5"
                      >
                        IKEA.in <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Summary Strip */}
            <div className="mt-3 p-3 bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6B7280] uppercase block">Total Furniture Cost</span>
                <span className="text-base font-black text-[#0058A3] tabular-nums">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#6B7280] uppercase block">Budget Status</span>
                <span className={`text-xs font-bold tabular-nums ${remainingBudget >= 0 ? 'text-[#2b8a3e]' : 'text-[#c92a2a]'}`}>
                  {remainingBudget >= 0
                    ? `₹${remainingBudget.toLocaleString('en-IN')} Under Budget`
                    : `₹${Math.abs(remainingBudget).toLocaleString('en-IN')} Over Budget`}
                </span>
              </div>
            </div>
          </div>

          {/* Design Summary Notes */}
          {analysis && (
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B7065]">
                Architectural Execution Notes
              </h3>
              <p className="text-xs text-[#4A505A] leading-relaxed">
                {analysis.spatialLayout}
              </p>
              <p className="text-xs text-[#4A505A] leading-relaxed">
                {analysis.naturalLight}
              </p>
            </div>
          )}

          {/* Standalone HTML Export Banner */}
          {onDownloadStandalone && (
            <div className="p-3.5 bg-[#F2F6FA] border border-[#D0E0EF] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="text-xs text-[#0058A3] block font-semibold">
                  Standalone Offline Website (index.html)
                </strong>
                <span className="text-[11px] text-[#4A505A]">
                  Complete self-contained HTML file. Run locally in any browser with zero dependencies.
                </span>
              </div>
              <button
                type="button"
                onClick={onDownloadStandalone}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0058A3] hover:bg-[#004885] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Download index.html
              </button>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-6 py-3.5 border-t border-[#E8E5DF] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E2229] bg-white border border-[#E8E5DF] hover:bg-[#F4F2EC] rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#2b8a3e]" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
            <span>{copied ? 'Copied Brief to Clipboard!' : 'Copy Brief to Clipboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E2229] bg-white border border-[#E8E5DF] hover:bg-[#F4F2EC] rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#6B7280]" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0058A3] hover:bg-[#004885] rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
