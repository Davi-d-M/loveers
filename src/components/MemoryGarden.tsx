import React, { useState } from "react";
import { KeepsakeBox, GoodyItem } from "../types";
import { ambientAudio } from "../lib/audioEngine";
import { WaveformAudioPlayer } from "./WaveformAudioPlayer";
import { Play, Mic, MapPin, Music, FileText, Gift, Sparkles, Filter, X, Heart, Eye, ArrowRight, Share2, Calendar, User } from "lucide-react";

interface MemoryGardenProps {
  boxes: KeepsakeBox[];
  activeBox: KeepsakeBox;
  setActiveBox: (box: KeepsakeBox) => void;
  onOpenGiftExperience: (box: KeepsakeBox) => void;
  searchQuery: string;
}

export const MemoryGarden: React.FC<MemoryGardenProps> = ({
  boxes,
  activeBox,
  setActiveBox,
  onOpenGiftExperience,
  searchQuery,
}) => {
  const [selectedItem, setSelectedItem] = useState<GoodyItem | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");

  // Get filtered items
  const items = activeBox.items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesYear = filterYear === "all" || String(item.year) === filterYear;

    return matchesSearch && matchesType && matchesYear;
  });

  const years = Array.from(new Set(activeBox.items.map((i) => i.year).filter(Boolean)));

  const handleFlowerClick = (item: GoodyItem) => {
    ambientAudio.playChime();
    setSelectedItem(item);
  };

  return (
    <div className="relative min-h-screen pt-4 pb-20 md:pb-28 px-4 md:px-8 flex flex-col items-center justify-start z-10">
      
      {/* GardenController - Header & Keepsake Switcher */}
      <div 
        id="garden-controller" 
        className="GardenController w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-6 z-20"
      >
        
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-medium text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Memory Sanctuary</span>
          </div>
          <h1 className="font-serif-title text-3xl md:text-4xl text-primary font-semibold tracking-tight">
            {activeBox.title}
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Created for <span className="font-semibold text-primary">{activeBox.toName}</span> by{" "}
            <span className="font-semibold text-secondary">{activeBox.fromName}</span> • {activeBox.items.length} Memories
          </p>
        </div>

        {/* Keepsake Box Switcher & Action */}
        <div className="flex items-center gap-3">
          <select
            value={activeBox.id}
            onChange={(e) => {
              const box = boxes.find((b) => b.id === e.target.value);
              if (box) setActiveBox(box);
            }}
            className="bg-white/70 backdrop-blur-md border border-white/80 rounded-full px-4 py-2 text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm cursor-pointer"
          >
            {boxes.map((b) => (
              <option key={b.id} value={b.id}>
                🎁 {b.title} ({b.toName})
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenGiftExperience(activeBox)}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>Unbox Experience</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Garden Filter Bar */}
      <div className="w-full max-w-2xl mx-auto glass-panel rounded-full p-1.5 flex items-center justify-center gap-2 mb-10 z-20 overflow-x-auto shadow-sm">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
            filterType === "all" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          All ({activeBox.items.length})
        </button>
        <button
          onClick={() => setFilterType("photo")}
          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
            filterType === "photo" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setFilterType("voice")}
          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
            filterType === "voice" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Voice Notes
        </button>
        <button
          onClick={() => setFilterType("note")}
          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
            filterType === "note" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => setFilterType("location")}
          className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
            filterType === "location" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Places
        </button>

        {years.length > 0 && (
          <div className="border-l border-white/60 pl-2 ml-1 flex items-center gap-1">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-transparent text-xs font-medium text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Glass Flower Garden Canvas */}
      <div className="relative w-full max-w-6xl min-h-[500px] flex items-end justify-center pt-24 pb-20 gap-6 md:gap-12 lg:gap-20 flex-wrap z-10 mt-8 md:mt-12">
        
        {items.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center max-w-md my-auto">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
            <h3 className="font-serif-title text-lg text-primary font-medium">No memory flowers found</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          items.map((item, index) => {
            // Calculate delay for staggered gentle float
            const delaySec = (index % 5) * 0.8;
            const floatSpeed = 5 + (index % 3);

            return (
              <div
                key={item.id}
                onClick={() => handleFlowerClick(item)}
                style={{ animationDelay: `${delaySec}s`, animationDuration: `${floatSpeed}s` }}
                className="relative animate-gentle-bob flex flex-col items-center group cursor-pointer transform hover:scale-105 transition-all duration-500 my-4"
              >
                {/* Floating Memory Preview Badge on top of flower stem */}
                <div className="absolute -top-32 md:-top-36 z-20 transition-all duration-500 transform group-hover:-translate-y-3 group-hover:scale-110">
                  
                  {item.type === "photo" && (
                    <div className="w-28 md:w-36 h-36 md:h-44 bg-white p-2 shadow-2xl shadow-primary/20 rotate-[-4deg] group-hover:rotate-0 rounded-sm border border-white/80">
                      <div
                        className="w-full h-24 md:h-30 bg-cover bg-center rounded-xs mb-1.5"
                        style={{
                          backgroundImage: `url(${
                            item.mediaUrl || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500"
                          })`,
                        }}
                      />
                      <p className="text-center font-handwriting text-xs text-primary font-bold truncate px-1">
                        {item.title}
                      </p>
                      {item.year && (
                        <p className="text-center font-mono text-[10px] text-on-surface-variant/70">
                          {item.year}
                        </p>
                      )}
                    </div>
                  )}

                  {item.type === "voice" && (
                    <div className="w-36 md:w-44 h-24 bg-white/80 backdrop-blur-xl border border-white/90 p-3 rounded-2xl shadow-xl shadow-primary/20 flex flex-col justify-between rotate-[3deg] group-hover:rotate-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-primary">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-primary truncate">{item.title}</p>
                          <p className="text-[10px] text-on-surface-variant">Voice Note</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 h-5 justify-center">
                        <div className="w-1 h-full bg-primary/40 rounded-full animate-pulse" />
                        <div className="w-1 h-3/4 bg-primary/70 rounded-full animate-pulse delay-100" />
                        <div className="w-1 h-1/2 bg-primary/90 rounded-full animate-pulse delay-200" />
                        <div className="w-1 h-full bg-primary/60 rounded-full animate-pulse delay-300" />
                        <div className="w-1 h-2/3 bg-primary/50 rounded-full animate-pulse delay-150" />
                      </div>
                    </div>
                  )}

                  {item.type === "note" && (
                    <div className="w-32 md:w-40 h-28 bg-gradient-to-br from-white/90 to-primary-container/30 backdrop-blur-xl border border-white/90 p-3 rounded-2xl shadow-xl shadow-primary/20 rotate-[-2deg] group-hover:rotate-0 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-3 italic">
                        "{item.content}"
                      </p>
                      <p className="text-[9px] text-primary/70 font-mono text-right">
                        {item.authorName || activeBox.fromName}
                      </p>
                    </div>
                  )}

                  {item.type === "location" && (
                    <div className="w-36 md:w-44 h-24 bg-white/90 backdrop-blur-xl border border-white/90 p-3 rounded-2xl shadow-xl shadow-primary/20 rotate-[2deg] group-hover:rotate-0 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-tertiary font-semibold text-xs">
                        <MapPin className="w-4 h-4 text-deep-terracotta" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant line-clamp-2">
                        📍 {item.locationName || item.content}
                      </p>
                      <span className="text-[9px] font-mono text-secondary">
                        {item.year || "Pinned location"}
                      </span>
                    </div>
                  )}

                  {item.type === "song" && (
                    <div className="w-36 md:w-44 h-24 bg-gradient-to-r from-primary/10 to-secondary/20 backdrop-blur-xl border border-white/90 p-3 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-primary truncate">{item.title}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{item.artist || "Music Track"}</p>
                      </div>
                    </div>
                  )}

                  {item.type === "coupon" && (
                    <div className="w-36 md:w-44 h-24 bg-tertiary-container/80 backdrop-blur-xl border border-tertiary/30 p-3 rounded-2xl shadow-xl shadow-tertiary/20 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-tertiary text-xs font-bold">
                        <span>🎁 Coupon</span>
                        <span className="text-[10px] font-mono bg-white/60 px-1.5 py-0.5 rounded">
                          {item.couponCode || "REDEEM"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-on-tertiary-container line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Glass Flower Base & Glowing Core */}
                <div className="w-32 md:w-40 h-32 md:h-40 rounded-full bg-white/30 backdrop-blur-md border border-white/60 shadow-inner shadow-white/60 flex items-center justify-center relative overflow-hidden group-hover:border-primary/50 group-hover:shadow-primary/30 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 via-transparent to-white/20" />
                  <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-primary-container/80 blur-md animate-pulse group-hover:scale-125 transition-transform duration-500" />
                  <Sparkles className="w-5 h-5 text-primary z-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  
                  {/* Stem stretching down */}
                  <div className="absolute top-full w-1.5 h-32 md:h-48 bg-gradient-to-b from-white/60 via-primary-container/30 to-transparent backdrop-blur-sm rounded-full -z-10" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl border border-white p-6 md:p-8 rounded-3xl shadow-2xl shadow-primary/20 text-on-surface">
            
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Memory Moment • {selectedItem.type}</span>
              {selectedItem.year && <span className="ml-auto font-mono text-on-surface-variant">{selectedItem.year}</span>}
            </div>

            <h2 className="font-serif-title text-2xl font-bold text-primary mb-3">
              {selectedItem.title}
            </h2>

            {selectedItem.mediaUrl && selectedItem.type === "photo" && (
              <div className="w-full h-64 rounded-2xl overflow-hidden mb-4 border border-white shadow-md">
                <img
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="bg-primary-container/30 p-4 rounded-2xl mb-4 text-sm text-on-surface leading-relaxed border border-primary/10">
              <p className="whitespace-pre-line">{selectedItem.content}</p>
            </div>

            {selectedItem.type === "voice" && (
              <div className="mb-4">
                <WaveformAudioPlayer
                  audioUrl={selectedItem.mediaUrl}
                  title={selectedItem.title}
                  subtitle={`Recorded by ${selectedItem.authorName || activeBox.fromName}`}
                  compact={true}
                />
              </div>
            )}

            {selectedItem.type === "location" && (
              <div className="flex items-center gap-2 text-xs text-tertiary bg-tertiary-container/40 p-3 rounded-xl mb-4">
                <MapPin className="w-4 h-4 text-deep-terracotta shrink-0" />
                <span className="font-medium">{selectedItem.locationName || selectedItem.content}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-primary/10">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                From {selectedItem.authorName || activeBox.fromName}
              </span>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  onOpenGiftExperience(activeBox);
                }}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Open in Full Gift Experience →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
