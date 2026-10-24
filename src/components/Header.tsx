import React from 'react';
import { Download, ShieldCheck, Bookmark } from 'lucide-react';

interface HeaderProps {
  onExportClick: () => void;
  onDownloadStandalone: () => void;
  onOpenAdmin: () => void;
  onOpenSavedMakeovers?: () => void;
  savedMakeoversCount?: number;
  cartItemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onExportClick,
  onDownloadStandalone,
  onOpenAdmin,
  onOpenSavedMakeovers,
  savedMakeoversCount = 0,
  cartItemCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#E8E5DF] px-6 py-3.5 transition-colors">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
        
        {/* Zone 1: Wordmark */}
        <a href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#1E2229] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity">
          <span className="bg-[#0058A3] text-[#FFDB00] text-xs font-black px-2 py-0.5 rounded tracking-wider">
            IKEA READY
          </span>
          <span className="font-serif-display text-xl text-[#1E2229]">
            Room<span className="text-[#0058A3] font-sans font-extrabold">Ready</span>
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#4A505A]">
          <a href="#makeover-studio" className="hover:text-[#0058A3] transition-colors whitespace-nowrap shrink-0">
            Makeover Studio
          </a>
          <a href="#spatial-analysis" className="hover:text-[#0058A3] transition-colors whitespace-nowrap shrink-0">
            Spatial Analysis
          </a>
          <a href="#ikea-catalog" className="hover:text-[#0058A3] transition-colors whitespace-nowrap shrink-0">
            IKEA Catalog
          </a>
          <a href="#budget-tracker" className="hover:text-[#0058A3] transition-colors whitespace-nowrap shrink-0">
            Budget Tracker
          </a>
        </nav>

        {/* Zone 3: Actions (Admin, Saved, Standalone Download, Export) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Saved Makeovers Button */}
          {onOpenSavedMakeovers && savedMakeoversCount > 0 && (
            <button
              onClick={onOpenSavedMakeovers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E2229] bg-white hover:bg-[#F4F2EC] rounded-lg transition-all border border-[#D5D0C6] cursor-pointer shadow-2xs"
              title="View your saved room makeovers"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#0058A3]" />
              <span className="hidden sm:inline">Saved</span>
              <span className="bg-[#0058A3]/10 text-[#0058A3] px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                {savedMakeoversCount}
              </span>
            </button>
          )}

          {/* Admin Panel button */}
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4A505A] hover:text-[#0058A3] bg-white hover:bg-[#F0F5FA] rounded-lg transition-all border border-[#D5D0C6] cursor-pointer shadow-2xs"
            title="Open protected admin console (/admin)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0058A3]" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Download Standalone index.html */}
          <button
            onClick={onDownloadStandalone}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E2229] bg-[#EAE8E3] hover:bg-[#DCD8D0] active:scale-[0.98] rounded-lg transition-all border border-[#D5D0C6] whitespace-nowrap shrink-0 cursor-pointer"
            title="Download complete standalone HTML file (index.html)"
          >
            <Download className="w-3.5 h-3.5 text-[#0058A3]" />
            <span className="hidden md:inline">Download</span>
            <span>index.html</span>
          </button>

          {/* Export Shopping Plan */}
          <button
            onClick={onExportClick}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0058A3] hover:bg-[#004885] active:scale-[0.98] rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#FFDB00]" />
            <span>Export Plan ({cartItemCount})</span>
          </button>
        </div>

      </div>
    </header>
  );
};
