import React from 'react';
import { Compass, Sun, Package, Palette, TrendingUp, Sparkles } from 'lucide-react';
import { SpatialAnalysis } from '../types';

interface AnalysisDisplayProps {
  analysis: SpatialAnalysis | null;
  isAnalysing: boolean;
  roomType: string;
  style: string;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  analysis,
  isAnalysing,
  roomType,
  style,
}) => {
  if (isAnalysing) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 border-2 border-[#E8E5DF] border-t-[#0058A3] rounded-full animate-spin" />
          <div>
            <h2 className="text-base font-bold text-[#1E2229]">Spatial & Lighting Analysis</h2>
            <p className="text-xs text-[#6B7280]">Synthesizing multimodal architectural insights with Gemini 3.8 Flash...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF]/60 space-y-2">
              <div className="h-3 bg-[#EAE8E3] rounded w-28" />
              <div className="h-2.5 bg-[#EAE8E3] rounded w-full" />
              <div className="h-2.5 bg-[#EAE8E3] rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 text-center shadow-sm">
        <Compass className="w-8 h-8 text-[#5B7065] mx-auto mb-2 opacity-60" />
        <h3 className="text-sm font-bold text-[#1E2229]">Awaiting Spatial Analysis</h3>
        <p className="text-xs text-[#6B7280] max-w-md mx-auto mt-1">
          Click "Analyse Room with Gemini" to generate detailed spatial circulation advice, natural light mapping, and storage optimization tailored to {roomType}.
        </p>
      </div>
    );
  }

  const isGemini = analysis.source === 'gemini';

  return (
    <section id="spatial-analysis" className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm space-y-5">
      
      {/* Header with clean unboxed metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E5DF]">
        <div>
          <h2 className="text-lg font-bold text-[#1E2229]">
            Spatial &amp; Lighting Critique
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
            <span>{roomType}</span>
            <span aria-hidden="true">·</span>
            <span>{style}</span>
            <span aria-hidden="true">·</span>
            <span>Architectural Guidance</span>
          </div>
        </div>

        {/* Source indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#E8E5DF] text-[#4A505A]">
          <span className={`w-2 h-2 rounded-full ${isGemini ? 'bg-[#38A169]' : 'bg-[#0058A3]'}`} />
          <span>{isGemini ? 'Live Gemini 3.8 Flash' : 'Curated Architectural Model'}</span>
        </div>
      </div>

      {/* Evocative Design Vision Quote */}
      {analysis.designSummary && (
        <div className="p-4 bg-[#FAF9F6] border border-[#E8E5DF] rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0058A3] block mb-1">
            Design Philosophy &amp; Concept
          </span>
          <p className="text-xs sm:text-sm text-[#1E2229] italic leading-relaxed">
            "{analysis.designSummary}"
          </p>
        </div>
      )}

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pillar 1: Floor Circulation */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] space-y-1.5 hover:border-[#D5D0C7] transition-colors">
          <div className="flex items-center gap-2 text-[#5B7065]">
            <Compass className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1E2229]">
              Floor Circulation &amp; Flow
            </h3>
          </div>
          <p className="text-xs text-[#4A505A] leading-relaxed">
            {analysis.spatialLayout}
          </p>
        </div>

        {/* Pillar 2: Natural Light & Illumination */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] space-y-1.5 hover:border-[#D5D0C7] transition-colors">
          <div className="flex items-center gap-2 text-[#C48C46]">
            <Sun className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1E2229]">
              Daylight &amp; 2700K Layers
            </h3>
          </div>
          <p className="text-xs text-[#4A505A] leading-relaxed">
            {analysis.naturalLight}
          </p>
        </div>

        {/* Pillar 3: Vertical Storage & Decluttering */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] space-y-1.5 hover:border-[#D5D0C7] transition-colors">
          <div className="flex items-center gap-2 text-[#0058A3]">
            <Package className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1E2229]">
              Modular Storage &amp; Decluttering
            </h3>
          </div>
          <p className="text-xs text-[#4A505A] leading-relaxed">
            {analysis.storageDeclutter}
          </p>
        </div>

        {/* Pillar 4: Palette & Materials */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] space-y-1.5 hover:border-[#D5D0C7] transition-colors">
          <div className="flex items-center gap-2 text-[#8D7B68]">
            <Palette className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1E2229]">
              Wood &amp; Textile Harmony
            </h3>
          </div>
          <p className="text-xs text-[#4A505A] leading-relaxed">
            {analysis.paletteMaterials}
          </p>
        </div>

      </div>

      {/* Budget Allocation Strategy */}
      {analysis.budgetStrategy && (
        <div className="p-4 rounded-xl bg-[#F0F5FA] border border-[#0058A3]/20 flex items-start gap-3">
          <TrendingUp className="w-4 h-4 text-[#0058A3] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0058A3] mb-0.5">
              INR Budget Allocation Strategy
            </h4>
            <p className="text-xs text-[#1E2229] leading-relaxed">
              {analysis.budgetStrategy}
            </p>
          </div>
        </div>
      )}

    </section>
  );
};
