import React from 'react';
import { X, Calendar, Ruler, Trash2, ArrowRight, Bookmark } from 'lucide-react';
import { SavedMakeover } from '../types';

interface SavedMakeoversModalProps {
  isOpen: boolean;
  onClose: () => void;
  makeovers: SavedMakeover[];
  onLoadMakeover: (makeover: SavedMakeover) => void;
  onDeleteMakeover: (id: string) => void;
}

export const SavedMakeoversModal: React.FC<SavedMakeoversModalProps> = ({
  isOpen,
  onClose,
  makeovers,
  onLoadMakeover,
  onDeleteMakeover,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-[#E8E5DF] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E8E5DF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0058A3]/10 text-[#0058A3] flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E2229]">Saved Room Makeovers</h3>
              <p className="text-xs text-[#6B7280]">
                Revisit and reload previous Scandinavian design projects into the studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#1E2229] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {makeovers.length === 0 ? (
            <div className="py-12 text-center text-[#6B7280] space-y-2">
              <Bookmark className="w-8 h-8 mx-auto opacity-30 text-[#0058A3]" />
              <p className="text-sm font-semibold text-[#1E2229]">No saved makeovers yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Generate or test a room makeover and click "Save Makeover" to keep it in your collection.
              </p>
            </div>
          ) : (
            makeovers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-[#E8E5DF] hover:border-[#0058A3]/40 bg-[#FAF9F6] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Thumbnails */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-14 rounded-lg overflow-hidden border border-[#E8E5DF] bg-[#EAE8E3]">
                    <img src={m.beforeImage} alt="Before" className="w-full h-full object-cover" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6B7280]" />
                  <div className="w-16 h-14 rounded-lg overflow-hidden border border-[#0058A3] bg-[#EAE8E3]">
                    <img src={m.afterImage} alt="After" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#1E2229] truncate">{m.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6B7280] mt-0.5">
                    <span className="font-medium text-[#0058A3]">{m.style}</span>
                    <span>·</span>
                    <span>{m.roomType}</span>
                    <span>·</span>
                    <span className="tabular-nums">₹{m.budget.toLocaleString('en-IN')}</span>
                    {m.dimensions && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Ruler className="w-3 h-3" />
                          {m.dimensions.length}×{m.dimensions.width} {m.dimensions.unit}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      onLoadMakeover(m);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0058A3] hover:bg-[#004885] rounded-lg transition-colors cursor-pointer"
                  >
                    Load into Studio
                  </button>
                  <button
                    onClick={() => onDeleteMakeover(m.id)}
                    className="p-1.5 text-[#6B7280] hover:text-[#c92a2a] hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Delete saved makeover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E5DF] bg-[#FAF9F6] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#1E2229] bg-white border border-[#E8E5DF] hover:bg-[#F4F2EC] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
