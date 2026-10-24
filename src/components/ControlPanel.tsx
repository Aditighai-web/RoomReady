import React from 'react';
import { Upload, Search, Sparkles, RefreshCw, Check, Ruler } from 'lucide-react';
import { ColorPalette, RoomPreset, RoomDimensions } from '../types';
import { trackBudgetSelected } from '../services/tracker';

interface ControlPanelProps {
  roomType: string;
  setRoomType: (val: string) => void;
  style: string;
  setStyle: (val: string) => void;
  palette: string;
  setPalette: (val: string) => void;
  budget: number;
  setBudget: (val: number) => void;
  dimensions: RoomDimensions;
  setDimensions: React.Dispatch<React.SetStateAction<RoomDimensions>>;
  palettes: ColorPalette[];
  presets: RoomPreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: RoomPreset) => void;
  onFileUpload: (file: File) => void;
  onAnalyseRoom: () => void;
  onGenerateMakeover: () => void;
  onUpdatePlan: () => void;
  isAnalysing: boolean;
  isGenerating: boolean;
  isUpdatingPlan: boolean;
  uploadedFileName?: string;
  budgetOptions?: { min: number; max: number; default: number; presets: number[] };
}

const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Home Office',
  'Studio Apartment',
  'Dining Area',
  'Balcony Sunroom',
];

const STYLES = [
  { name: 'Modern Scandinavian', desc: 'Airy, blonde birch, clean lines' },
  { name: 'Japandi', desc: 'Nordic functionality + wabi-sabi organic warmth' },
  { name: 'Nordic Hygge', desc: 'Cozy wool, honey oak, warm hearth tones' },
  { name: 'Stockholm Industrial', desc: 'Matte dark steel, exposed grain, raw pine' },
  { name: 'Botanical Nordic', desc: 'Muted sage greens, eucalyptus, ceramic forms' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  roomType,
  setRoomType,
  style,
  setStyle,
  palette,
  setPalette,
  budget,
  setBudget,
  dimensions,
  setDimensions,
  palettes,
  presets,
  activePresetId,
  onSelectPreset,
  onFileUpload,
  onAnalyseRoom,
  onGenerateMakeover,
  onUpdatePlan,
  isAnalysing,
  isGenerating,
  isUpdatingPlan,
  uploadedFileName,
  budgetOptions = { min: 15000, max: 250000, default: 45000, presets: [35000, 65000, 110000, 180000] },
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  // Convert unit calculations
  const areaValue = (dimensions.length * dimensions.width).toFixed(1);
  const secondaryArea =
    dimensions.unit === 'm'
      ? `${(dimensions.length * dimensions.width * 10.7639).toFixed(0)} sq.ft`
      : `${(dimensions.length * dimensions.width * 0.092903).toFixed(1)} m²`;

  const handleUnitToggle = (newUnit: 'm' | 'ft') => {
    if (newUnit === dimensions.unit) return;
    if (newUnit === 'ft') {
      setDimensions((prev) => ({
        ...prev,
        unit: 'ft',
        length: parseFloat((prev.length * 3.28084).toFixed(1)),
        width: parseFloat((prev.width * 3.28084).toFixed(1)),
        height: parseFloat((prev.height * 3.28084).toFixed(1)),
      }));
    } else {
      setDimensions((prev) => ({
        ...prev,
        unit: 'm',
        length: parseFloat((prev.length / 3.28084).toFixed(1)),
        width: parseFloat((prev.width / 3.28084).toFixed(1)),
        height: parseFloat((prev.height / 3.28084).toFixed(1)),
      }));
    }
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Room Photo Dropzone & Presets */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
            1. Room Photograph
          </h3>
          {uploadedFileName && (
            <span className="text-[11px] font-medium text-[#0058A3] truncate max-w-[160px]">
              {uploadedFileName}
            </span>
          )}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#D5D0C7] hover:border-[#0058A3] bg-[#FAF9F6] hover:bg-[#F0F5FA] rounded-xl p-4 text-center cursor-pointer transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="w-10 h-10 mx-auto rounded-full bg-[#EAE8E3] group-hover:bg-[#0058A3]/10 flex items-center justify-center text-[#4A505A] group-hover:text-[#0058A3] transition-colors mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#1E2229]">
            Upload your room photo
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            Preserves your room walls, windows, and camera viewpoint
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mt-3.5">
          <span className="text-[11px] font-medium text-[#6B7280] block mb-2">
            Or test with sample apartments:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {presets.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded-lg border transition-all text-center cursor-pointer truncate ${
                    isSelected
                      ? 'bg-[#0058A3] text-white border-[#0058A3] shadow-xs'
                      : 'bg-[#F4F2EC] text-[#1E2229] border-[#E8E5DF] hover:bg-[#EAE8E3]'
                  }`}
                  title={`${preset.title} (${preset.subtitle})`}
                >
                  {preset.title.split(' ')[0]} {preset.title.split(' ')[1] || ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Room Physical Dimensions & Clearance */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-[#0058A3]" />
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              2. Room Dimensions
            </h3>
          </div>

          {/* Unit Toggle (Meters vs Feet) */}
          <div className="flex items-center bg-[#F4F2EC] p-0.5 rounded-lg border border-[#E8E5DF] text-[11px] font-medium">
            <button
              onClick={() => handleUnitToggle('m')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                dimensions.unit === 'm' ? 'bg-[#0058A3] text-white font-bold' : 'text-[#4A505A] hover:text-[#1E2229]'
              }`}
            >
              Meters (m)
            </button>
            <button
              onClick={() => handleUnitToggle('ft')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                dimensions.unit === 'ft' ? 'bg-[#0058A3] text-white font-bold' : 'text-[#4A505A] hover:text-[#1E2229]'
              }`}
            >
              Feet (ft)
            </button>
          </div>
        </div>

        {/* 3 Dimensional inputs */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-[#1E2229] mb-1">
              Length ({dimensions.unit})
            </label>
            <input
              type="number"
              step={dimensions.unit === 'm' ? 0.1 : 0.5}
              min={1}
              max={50}
              value={dimensions.length}
              onChange={(e) =>
                setDimensions((prev) => ({ ...prev, length: parseFloat(e.target.value) || 1 }))
              }
              className="w-full text-xs font-semibold bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-2.5 py-1.5 text-[#1E2229] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#1E2229] mb-1">
              Width ({dimensions.unit})
            </label>
            <input
              type="number"
              step={dimensions.unit === 'm' ? 0.1 : 0.5}
              min={1}
              max={50}
              value={dimensions.width}
              onChange={(e) =>
                setDimensions((prev) => ({ ...prev, width: parseFloat(e.target.value) || 1 }))
              }
              className="w-full text-xs font-semibold bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-2.5 py-1.5 text-[#1E2229] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#1E2229] mb-1">
              Ceiling Height ({dimensions.unit})
            </label>
            <input
              type="number"
              step={dimensions.unit === 'm' ? 0.1 : 0.5}
              min={1.5}
              max={20}
              value={dimensions.height}
              onChange={(e) =>
                setDimensions((prev) => ({ ...prev, height: parseFloat(e.target.value) || 2.4 }))
              }
              className="w-full text-xs font-semibold bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-2.5 py-1.5 text-[#1E2229] outline-none"
            />
          </div>
        </div>

        {/* Calculated Floor Area Pill */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F6] border border-[#E8E5DF] text-[11px]">
          <span className="text-[#6B7280]">Calculated Floor Area:</span>
          <span className="font-bold text-[#0058A3] tabular-nums">
            {areaValue} {dimensions.unit === 'm' ? 'm²' : 'sq.ft'} <span className="text-[#6B7280] font-normal">({secondaryArea})</span>
          </span>
        </div>

        {/* Optional Existing Furniture / Clearance Notes */}
        <div>
          <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
            Optional Furniture Fit Notes:
          </label>
          <input
            type="text"
            placeholder="e.g. Queen bed 1.8m x 2.0m on east wall, 90cm corridor"
            value={dimensions.furnitureNotes || ''}
            onChange={(e) =>
              setDimensions((prev) => ({ ...prev, furnitureNotes: e.target.value }))
            }
            className="w-full text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] rounded-lg px-2.5 py-1.5 text-[#1E2229] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>
      </div>

      {/* 3. Styling & Budget Parameters */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
          3. Style & Budget Parameters
        </h3>

        {/* Room Type */}
        <div>
          <label htmlFor="room-type-select" className="block text-xs font-semibold text-[#1E2229] mb-1.5">
            Room Type
          </label>
          <select
            id="room-type-select"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full text-xs font-medium bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] focus:ring-2 focus:ring-[#0058A3]/10 rounded-lg px-3 py-2 text-[#1E2229] outline-none transition-all cursor-pointer"
          >
            {ROOM_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>

        {/* Scandinavian Style */}
        <div>
          <label htmlFor="aesthetic-style-select" className="block text-xs font-semibold text-[#1E2229] mb-1.5">
            Aesthetic Style
          </label>
          <select
            id="aesthetic-style-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full text-xs font-medium bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#0058A3] focus:ring-2 focus:ring-[#0058A3]/10 rounded-lg px-3 py-2 text-[#1E2229] outline-none transition-all cursor-pointer"
          >
            {STYLES.map((st) => (
              <option key={st.name} value={st.name}>
                {st.name} — {st.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette Grid */}
        <div>
          <label className="block text-xs font-semibold text-[#1E2229] mb-1.5">
            Nordic Colour Palette
          </label>
          <div className="grid grid-cols-1 gap-2">
            {palettes.map((p) => {
              const isSelected = palette === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setPalette(p.id)}
                  className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0058A3] bg-[#F0F5FA]'
                      : 'border-[#E8E5DF] bg-[#FAF9F6] hover:bg-[#F4F2EC]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center -space-x-1 shrink-0">
                      {p.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1E2229] block leading-tight">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-[#6B7280] leading-none">
                        {p.subtext}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0058A3] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Slider in INR */}
        <div className="pt-2 border-t border-[#E8E5DF]">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="budget-slider" className="text-xs font-semibold text-[#1E2229]">
              Budget Target (INR)
            </label>
            <span className="text-sm font-bold text-[#0058A3] tabular-nums">
              ₹{budget.toLocaleString('en-IN')}
            </span>
          </div>

          <input
            id="budget-slider"
            type="range"
            min={budgetOptions.min}
            max={budgetOptions.max}
            step={5000}
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value, 10))}
            onMouseUp={() => trackBudgetSelected({ budget_inr: budget, room_type: roomType, style })}
            onTouchEnd={() => trackBudgetSelected({ budget_inr: budget, room_type: roomType, style })}
            className="w-full h-1.5 bg-[#EAE8E3] rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-[#6B7280] mt-1 tabular-nums">
            <span>₹{(budgetOptions.min / 1000)}k</span>
            <span>₹{((budgetOptions.min + budgetOptions.max) / 2000).toFixed(0)}k</span>
            <span>₹{(budgetOptions.max / 100000).toFixed(1)}L</span>
          </div>

          {/* Quick budget chip shortcuts */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {budgetOptions.presets.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setBudget(b);
                  trackBudgetSelected({ budget_inr: b, room_type: roomType, style });
                }}
                className={`flex-1 py-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer tabular-nums ${
                  budget === b
                    ? 'bg-[#0058A3] text-white border-[#0058A3]'
                    : 'bg-[#F4F2EC] text-[#4A505A] border-[#E8E5DF] hover:bg-[#EAE8E3]'
                }`}
              >
                ₹{(b / 1000)}k
              </button>
            ))}
          </div>
        </div>

        {/* 3 Working Action Buttons */}
        <div className="pt-2 space-y-2">
          {/* Button 1: Analyse Room with Gemini */}
          <button
            onClick={onAnalyseRoom}
            disabled={isAnalysing}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#0058A3] hover:bg-[#004885] active:scale-[0.99] disabled:opacity-60 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalysing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Analysing with Gemini...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-[#FFDB00]" />
                <span>Analyse Room with Gemini</span>
              </>
            )}
          </button>

          {/* Button 2: Generate Room Makeover */}
          <button
            onClick={onGenerateMakeover}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 text-xs font-bold text-[#1E2229] bg-[#FFDB00] hover:bg-[#F0CD00] active:scale-[0.99] disabled:opacity-60 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Generating Makeover Render...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#0058A3]" />
                <span>Generate Room Makeover</span>
              </>
            )}
          </button>

          {/* Button 3: Update Room Plan */}
          <button
            onClick={onUpdatePlan}
            disabled={isUpdatingPlan}
            className="w-full py-2 px-4 text-xs font-semibold text-[#1E2229] bg-[#EAE8E3] hover:bg-[#dedbd4] active:scale-[0.99] disabled:opacity-60 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isUpdatingPlan ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Recalculating Plan...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-[#5B7065]" />
                <span>Update Room Plan</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
