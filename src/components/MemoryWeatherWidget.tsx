import React, { useState } from "react";
import { MemoryWeatherMode } from "../types";
import { CloudSun, Sparkles, ChevronDown, Check } from "lucide-react";

interface MemoryWeatherWidgetProps {
  currentWeather: MemoryWeatherMode;
  onSelectWeather: (weather: MemoryWeatherMode) => void;
}

export const MemoryWeatherWidget: React.FC<MemoryWeatherWidgetProps> = ({
  currentWeather,
  onSelectWeather,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const weatherOptions: Array<{ id: MemoryWeatherMode; label: string; icon: string; desc: string }> = [
    { id: "auto", label: "Auto (Seasonal)", icon: "✨", desc: "Syncs with current season & gift theme" },
    { id: "cherry-blossom", label: "Cherry Blossoms", icon: "🌸", desc: "Spring fluttering pink petals" },
    { id: "snowfall", label: "Gentle Snowfall", icon: "❄️", desc: "Soft winter frost & white snow" },
    { id: "autumn-leaves", label: "Autumn Leaves", icon: "🍁", desc: "Golden & crimson falling leaves" },
    { id: "summer-sunbeams", label: "Summer Sunbeams", icon: "☀️", desc: "Warm golden rays & pollen specks" },
    { id: "gentle-rain", label: "Gentle Rain", icon: "🌧️", desc: "Soft translucent rainfall" },
    { id: "starfall", label: "Cosmic Starfall", icon: "✨", desc: "Twinkling stardust & shooting stars" },
    { id: "off", label: "Clear Weather", icon: "☀️", desc: "Disable weather overlay animations" },
  ];

  const currentOption = weatherOptions.find((o) => o.id === currentWeather) || weatherOptions[0];

  return (
    <div className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/70 backdrop-blur-md border border-white/80 text-primary shadow-xs hover:bg-white transition-all cursor-pointer"
        title="Toggle Memory Weather Overlay"
      >
        <span className="text-sm">{currentOption.icon}</span>
        <span className="hidden sm:inline-block font-medium">{currentOption.label}</span>
        <ChevronDown className={`w-3 h-3 text-primary/70 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-white p-2 rounded-2xl shadow-xl z-50 animate-fadeIn text-on-surface">
            <div className="px-2 py-1.5 border-b border-primary/10 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5" />
                <span>Memory Weather Overlay</span>
              </span>
            </div>

            <div className="space-y-1 max-h-60 overflow-y-auto">
              {weatherOptions.map((opt) => {
                const isSelected = currentWeather === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSelectWeather(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-primary-container text-primary font-bold"
                        : "hover:bg-surface-container/60 text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-base">{opt.icon}</span>
                      <div className="overflow-hidden">
                        <p className="truncate text-xs font-semibold">{opt.label}</p>
                        <p className="truncate text-[10px] text-on-surface-variant font-normal">{opt.desc}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
