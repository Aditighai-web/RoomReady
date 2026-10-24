import React from 'react';
import { ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';
import heroImg from '../assets/images/hero_scandinavian_room_1792679067859.jpg';

interface HeroSectionProps {
  onStartMakeover: () => void;
  headline?: string;
  subtitle?: string;
  announcement?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartMakeover,
  headline = 'Transform your room into a Nordic sanctuary.',
  subtitle = 'Upload any room photo to receive multimodal architectural critique, generative Scandinavian makeover concepts, and curated IKEA India furniture kits precisely tailored to your Indian Rupee budget.',
  announcement = 'Authentic IKEA India INR catalog · Gemini 3.8 Flash Spatial Vision',
}) => {
  return (
    <section className="relative pt-8 pb-10 border-b border-[#E8E5DF] bg-[#FAF9F6]">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Top Eyebrow */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5B7065] mb-3 uppercase tracking-wider">
          <span>Scandinavian AI Studio</span>
          <span aria-hidden="true">·</span>
          <span>Powered by Gemini 3.8 Flash</span>
          <span aria-hidden="true">·</span>
          <span>{announcement}</span>
        </div>

        {/* Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Editorial Copy */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E2229] leading-[1.15] text-balance">
              {headline.includes('Nordic sanctuary') ? (
                <>
                  Transform your room into a{' '}
                  <em className="font-serif-display font-medium italic text-[#0058A3]">Nordic sanctuary</em>.
                </>
              ) : (
                headline
              )}
            </h1>
            
            <p className="text-sm sm:text-base text-[#4A505A] leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            {/* Micro Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#4A505A]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0058A3]" />
                <span>Multimodal spatial &amp; light analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0058A3]" />
                <span>Real IKEA India INR catalog &amp; links</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0058A3]" />
                <span>Transparent AI concept generation</span>
              </div>
            </div>

            {/* Quick jump CTA */}
            <div className="pt-3">
              <button
                onClick={onStartMakeover}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0058A3] hover:bg-[#004885] active:scale-[0.98] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FFDB00]" />
                <span>Launch Interactive Studio</span>
                <ArrowDown className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with Reliable Imported Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#E8E5DF] shadow-md group bg-[#FAF9F6]">
              <img
                src={heroImg}
                alt="Scandinavian Serene Interior"
                referrerPolicy="no-referrer"
                className="w-full h-[280px] sm:h-[320px] object-cover transition-transform duration-500 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <div className="text-white text-xs">
                  <span className="font-bold block">Nordic Living Archetype</span>
                  <span className="text-[11px] text-white/80">Blonde oak, 2700K illumination, natural linen textures</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column KPI Trust Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E8E5DF]/70">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-[#0058A3] tabular-nums block">
              100%
            </span>
            <span className="text-xs text-[#6B7280]">
              Authentic IKEA India items
            </span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-[#1E2229] tabular-nums block">
              ₹15k – ₹2.5L
            </span>
            <span className="text-xs text-[#6B7280]">
              Dynamic INR budget bounds
            </span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-[#5B7065] tabular-nums block">
              2700K
            </span>
            <span className="text-xs text-[#6B7280]">
              Warm Nordic ambient lighting
            </span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-[#D97D64] tabular-nums block">
              &lt; 3.5s
            </span>
            <span className="text-xs text-[#6B7280]">
              Multimodal room synthesis
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
