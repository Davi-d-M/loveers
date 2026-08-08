import React, { useState } from "react";
import { KeepsakeBox, GoodyItem } from "../types";
import { ambientAudio } from "../lib/audioEngine";
import { Stars, Sparkles, MapPin, Music, FileText, Camera, Mic, Gift, Calendar, ArrowRight, X } from "lucide-react";

interface ConstellationViewProps {
  box: KeepsakeBox;
  onOpenGiftExperience: (box: KeepsakeBox) => void;
}

export const ConstellationView: React.FC<ConstellationViewProps> = ({ box, onOpenGiftExperience }) => {
  const [activeStar, setActiveStar] = useState<GoodyItem | null>(box.items[0] || null);

  const sortedItems = [...box.items].sort((a, b) => (a.year || 2026) - (b.year || 2026));

  const handleStarClick = (item: GoodyItem) => {
    ambientAudio.playChime();
    setActiveStar(item);
  };

  return (
    <div className="relative min-h-screen pt-6 pb-12 px-4 md:px-8 flex flex-col items-center justify-start z-10">
      
      {/* Celestial Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 z-20">
        <div className="flex items-center justify-center gap-2 text-primary-container font-medium text-xs uppercase tracking-widest mb-1 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full w-fit mx-auto shadow-sm">
          <Stars className="w-3.5 h-3.5 text-primary-fixed-dim" />
          <span>Signature Constellation Map</span>
        </div>
        <h1 className="font-serif-title text-3xl md:text-5xl font-bold text-primary tracking-tight mt-2">
          {box.title}
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-2">
          Every memory is a star in your galaxy. Connected chronologically through time.
        </p>
      </div>

      {/* Main Galaxy Interactive Sky */}
      <div className="relative w-full max-w-5xl h-[550px] bg-gradient-to-b from-[#181528]/90 via-[#231e3d]/80 to-[#120f22]/95 backdrop-blur-2xl rounded-3xl border border-primary/20 shadow-2xl p-6 md:p-10 flex flex-col justify-between overflow-hidden z-20">
        
        {/* Background Ambient Stars & Glowing Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full">
            {/* Draw connecting lines between stars */}
            {sortedItems.map((item, idx) => {
              if (idx === sortedItems.length - 1) return null;
              const nextItem = sortedItems[idx + 1];

              // Calculate positions percentage
              const x1 = 15 + ((idx * 85) / Math.max(1, sortedItems.length - 1));
              const y1 = 30 + ((idx * 37) % 55);
              const x2 = 15 + (((idx + 1) * 85) / Math.max(1, sortedItems.length - 1));
              const y2 = 30 + (((idx + 1) * 37) % 55);

              return (
                <line
                  key={`line-${item.id}-${nextItem.id}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="rgba(224, 215, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>
        </div>

        {/* Interactive Stars Placement */}
        <div className="relative w-full h-full">
          {sortedItems.map((item, idx) => {
            const leftPct = 15 + ((idx * 85) / Math.max(1, sortedItems.length - 1));
            const topPct = 25 + ((idx * 37) % 55);
            const isSelected = activeStar?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleStarClick(item)}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Glowing Star Halo */}
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isSelected
                      ? "bg-primary-container text-primary scale-125 shadow-lg shadow-primary-container/80 ring-4 ring-primary-container/30"
                      : "bg-white/20 text-white/80 hover:bg-white/40 hover:scale-110"
                  }`}
                >
                  <Stars className={`w-5 h-5 ${isSelected ? "animate-spin" : ""}`} />
                </div>

                {/* Star Label */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white/90 font-medium border border-white/20 opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.year || "Memory"} • {item.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Star Detail Card Panel (Floating inside sky) */}
        {activeStar && (
          <div className="relative z-30 w-full bg-white/95 backdrop-blur-2xl rounded-2xl p-4 md:p-6 border border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {activeStar.mediaUrl && (
                <img
                  src={activeStar.mediaUrl}
                  alt={activeStar.title}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shrink-0 border border-primary/10 shadow-sm"
                />
              )}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeStar.type} • {activeStar.year || "2026"}</span>
                </div>
                <h3 className="font-serif-title text-lg md:text-xl font-bold text-primary mt-0.5">
                  {activeStar.title}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                  "{activeStar.content}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenGiftExperience(box)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <span>Full Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
