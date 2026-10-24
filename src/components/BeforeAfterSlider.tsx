import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, AlertCircle, Sparkles, ImageOff, Bookmark, RotateCcw } from 'lucide-react';
import { MakeoverRender, RoomDimensions } from '../types';
import { FALLBACK_DEMO_IMAGE } from '../data/presets';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  isGenerating: boolean;
  makeoverData?: MakeoverRender | null;
  makeoverError?: string | null;
  hasGeneratedMakeover?: boolean;
  isDemoInspiration?: boolean;
  roomType: string;
  style: string;
  dimensions?: RoomDimensions;
  onRetryGeneration?: () => void;
  onSaveMakeover?: () => void;
  onOpenSavedMakeovers?: () => void;
  savedCount?: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  isGenerating,
  makeoverData,
  makeoverError,
  hasGeneratedMakeover,
  isDemoInspiration,
  roomType,
  style,
  dimensions,
  onRetryGeneration,
  onSaveMakeover,
  onOpenSavedMakeovers,
  savedCount = 0,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [viewMode, setViewMode] = useState<'split' | 'after' | 'before'>('split');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [beforeLoadFailed, setBeforeLoadFailed] = useState<boolean>(false);
  const [afterLoadFailed, setAfterLoadFailed] = useState<boolean>(false);
  const [displayAfterSrc, setDisplayAfterSrc] = useState<string>(afterImage || FALLBACK_DEMO_IMAGE);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync displayed after image and reset load error state
  useEffect(() => {
    setDisplayAfterSrc(afterImage || FALLBACK_DEMO_IMAGE);
    setAfterLoadFailed(false);
  }, [afterImage]);

  useEffect(() => {
    setBeforeLoadFailed(false);
  }, [beforeImage]);

  // Keep track of exact pixel width of container for pixel-perfect split image alignment
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(containerRef.current);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const handleAfterError = () => {
    if (displayAfterSrc !== FALLBACK_DEMO_IMAGE) {
      console.warn('After image failed to load, switching to guaranteed local demo asset');
      setDisplayAfterSrc(FALLBACK_DEMO_IMAGE);
    } else {
      setAfterLoadFailed(true);
    }
  };

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) updatePosition(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches[0]) updatePosition(e.touches[0].clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, updatePosition]);

  const activeWidth = viewMode === 'split' ? sliderPos : viewMode === 'after' ? 100 : 0;

  // Compute After Badge text and appearance
  let afterBadgeText = 'After · AI Makeover (Preserving Your Room)';
  let afterBadgeStyle = 'bg-[#0058A3] text-white font-bold text-[10px]';

  if (isDemoInspiration) {
    afterBadgeText = 'Style Reference Preview · Not an edit of your photo';
    afterBadgeStyle = 'bg-white/95 text-[#6B7280] border border-[#D5D0C7] text-[10px] font-medium tracking-wide backdrop-blur-sm shadow-xs';
  } else if (!hasGeneratedMakeover) {
    afterBadgeText = 'After · Awaiting Makeover Generation';
    afterBadgeStyle = 'bg-black/70 text-white text-[10px]';
  }

  return (
    <div className={`bg-white rounded-2xl border border-[#E8E5DF] p-5 shadow-sm transition-all ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-white/95 backdrop-blur-md' : ''}`}>
      
      {/* Top comparison controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1E2229]">Interactive Makeover Visualisation</h2>
            <span className="text-xs font-semibold text-[#5B7065] bg-[#EAE8E3]/60 px-2.5 py-0.5 rounded">
              {style} · {roomType}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Slide horizontally to contrast current room layout with Scandinavian redesign
          </p>
        </div>

        {/* View mode toggle pills & actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onSaveMakeover && (
            <button
              onClick={onSaveMakeover}
              className="px-2.5 py-1 text-xs font-semibold text-[#0058A3] bg-[#0058A3]/10 hover:bg-[#0058A3]/15 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Save this makeover to your projects"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#0058A3]" />
              <span>Save Makeover</span>
            </button>
          )}

          {onOpenSavedMakeovers && savedCount > 0 && (
            <button
              onClick={onOpenSavedMakeovers}
              className="px-2.5 py-1 text-xs font-medium text-[#4A505A] hover:text-[#1E2229] bg-[#FAF9F6] border border-[#E8E5DF] rounded-lg transition-colors cursor-pointer"
            >
              Saved ({savedCount})
            </button>
          )}

          <div className="flex items-center p-0.5 bg-[#FAF9F6] rounded-lg border border-[#E8E5DF] text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                viewMode === 'split' ? 'bg-[#0058A3] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1E2229]'
              }`}
            >
              Split Slider
            </button>
            <button
              onClick={() => setViewMode('before')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                viewMode === 'before' ? 'bg-[#0058A3] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1E2229]'
              }`}
            >
              Before Only
            </button>
            <button
              onClick={() => setViewMode('after')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                viewMode === 'after' ? 'bg-[#0058A3] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#1E2229]'
              }`}
            >
              After Only
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            className="p-1.5 rounded-lg border border-[#E8E5DF] text-[#6B7280] hover:text-[#1E2229] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Image Comparison Frame with Fixed Natural Aspect Ratio */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`relative w-full aspect-[16/10] max-h-[560px] rounded-xl overflow-hidden select-none bg-[#EAE8E3] border border-[#E8E5DF] ${
          viewMode === 'split' ? 'cursor-ew-resize' : ''
        }`}
      >
        {/* Layer 1: BEFORE Image (Full container width underneath) */}
        <div className="absolute inset-0 w-full h-full">
          {beforeLoadFailed ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9F6] text-[#6B7280] p-6 text-center">
              <ImageOff className="w-8 h-8 mb-2 opacity-40 text-[#c92a2a]" />
              <p className="text-xs font-semibold">Before Image Unavailable</p>
              <p className="text-[11px] mt-0.5">Please upload another photo</p>
            </div>
          ) : (
            <img
              src={beforeImage}
              alt="Original room layout (Before)"
              referrerPolicy="no-referrer"
              onError={() => setBeforeLoadFailed(true)}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          )}

          {/* Before Label Badge */}
          <div className="absolute bottom-3 left-3 pointer-events-none z-10">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white rounded-md backdrop-blur-xs shadow-xs">
              Before · Original Room
            </span>
          </div>
        </div>

        {/* Layer 2: AFTER Image (Clipped dynamically by activeWidth percentage) */}
        <div
          className="absolute inset-0 h-full overflow-hidden transition-all ease-out"
          style={{
            width: `${activeWidth}%`,
            transitionDuration: isDragging ? '0ms' : '150ms',
          }}
        >
          <div
            className="absolute top-0 left-0 h-full"
            style={{ width: containerWidth > 0 ? `${containerWidth}px` : '100%' }}
          >
            {afterLoadFailed ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9F6] text-[#6B7280] p-6 text-center">
                <ImageOff className="w-8 h-8 mb-2 opacity-40 text-[#0058A3]" />
                <p className="text-xs font-semibold">Makeover Preview Loading Error</p>
                <p className="text-[11px] mt-0.5">Click 'Generate Room Makeover' to load preview</p>
              </div>
            ) : (
              <img
                src={displayAfterSrc}
                alt="Scandinavian makeover redesign (After)"
                referrerPolicy="no-referrer"
                onError={handleAfterError}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            )}

            {/* After Label Badge */}
            <div className="absolute bottom-3 right-3 pointer-events-none z-10">
              <span className={`px-2.5 py-1 rounded-md shadow-xs ${afterBadgeStyle}`}>
                {afterBadgeText}
              </span>
            </div>
          </div>
        </div>

        {/* Layer 3: Split Slider Divider Line & Handle */}
        {viewMode === 'split' && (
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none transition-all ease-out"
            style={{
              left: `${sliderPos}%`,
              transitionDuration: isDragging ? '0ms' : '150ms',
            }}
          >
            {/* Vertical hairline divider */}
            <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] -ml-[1px]" />
            
            {/* Grab handle knob */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#1E2229] border border-[#D5D0C7] shadow-lg flex items-center justify-center">
              <div className="flex items-center gap-0.5 text-xs text-[#0058A3] font-bold">
                <span>‹</span>
                <span>›</span>
              </div>
            </div>
          </div>
        )}

        {/* Layer 4: Generation Spinner Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 p-6 text-center">
            <div className="w-10 h-10 border-3 border-white/20 border-t-[#FFDB00] rounded-full animate-spin mb-3" />
            <span className="text-sm font-bold tracking-tight">
              Synthesizing Scandinavian Makeover Concept...
            </span>
            <span className="text-xs text-white/80 max-w-sm mt-1">
              Preserving walls, window angles, and perspective while introducing Nordic furniture
            </span>
          </div>
        )}
      </div>

      {/* Makeover Error Alert with Explicit Retry Option */}
      {makeoverError && (
        <div className="mt-3 p-3 bg-[#FFF5F5] border border-[#FFD8D8] rounded-xl flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2 text-[#c92a2a]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Notice:</span>
              <span className="text-[#495057]">{makeoverError}</span>
            </div>
          </div>

          {onRetryGeneration && (
            <button
              onClick={onRetryGeneration}
              disabled={isGenerating}
              className="px-2.5 py-1 text-xs font-semibold text-[#c92a2a] hover:bg-[#FFE3E3] rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Editorial Disclaimer & Concept Transparency Notice */}
      <div className="mt-3 pt-3 border-t border-[#F0EEE9] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7280]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0058A3] shrink-0" />
          <span>
            {makeoverData?.disclaimer ||
              'Generated images are visual design concepts and not guaranteed to be dimensionally exact.'}
          </span>
        </div>

        {dimensions && (
          <span className="font-medium text-[#4A505A]">
            Room Scale: {dimensions.length}m × {dimensions.width}m (Height: {dimensions.height}m)
          </span>
        )}
      </div>

    </div>
  );
};
