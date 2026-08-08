import React, { useState, useEffect } from "react";
import { ActiveTab, MemoryWeatherMode } from "../types";
import { ambientAudio } from "../lib/audioEngine";
import { MemoryWeatherWidget } from "./MemoryWeatherWidget";
import { Sparkles, Flower2, Stars, BookOpen, Gift, Volume2, VolumeX, Plus, Search } from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBuilder: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentWeather: MemoryWeatherMode;
  onSelectWeather: (weather: MemoryWeatherMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBuilder,
  searchQuery,
  setSearchQuery,
  currentWeather,
  onSelectWeather,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleAudio = () => {
    const isPlaying = ambientAudio.toggle("piano");
    setIsPlayingAudio(isPlaying);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto glass-panel rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between shadow-lg shadow-primary/5">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("garden")} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-primary-container/80 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300 shadow-sm">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-serif-title text-xl md:text-2xl font-semibold text-primary tracking-tight italic">
              EverGift
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-medium tracking-wider text-on-surface-variant uppercase bg-primary-container/40 px-2 py-0.5 rounded-full">
              Ethereal Vault
            </span>
          </div>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/40 backdrop-blur-md rounded-full p-1 border border-white/60">
          <button
            onClick={() => setActiveTab("garden")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === "garden"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary hover:bg-white/50"
            }`}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>Memory Garden</span>
          </button>

          <button
            onClick={() => setActiveTab("constellation")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === "constellation"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary hover:bg-white/50"
            }`}
          >
            <Stars className="w-3.5 h-3.5" />
            <span>Constellation</span>
          </button>

          <button
            onClick={() => setActiveTab("story")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === "story"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary hover:bg-white/50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Story Mode</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              activeTab === "dashboard"
                ? "bg-white text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary hover:bg-white/50"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>My Keepsakes</span>
          </button>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search bar */}
          <div className="relative hidden md:block w-36 lg:w-48">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 border border-white/60 rounded-full pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Memory Weather Widget */}
          <MemoryWeatherWidget
            currentWeather={currentWeather}
            onSelectWeather={onSelectWeather}
          />

          {/* Ambient Music Toggle */}
          <button
            onClick={toggleAudio}
            title={isPlayingAudio ? "Mute Ambient Sound" : "Play Ambient Soothing Sound"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
              isPlayingAudio
                ? "bg-primary-container text-primary border-primary/30 shadow-sm animate-pulse"
                : "bg-white/50 text-on-surface-variant border-white/60 hover:bg-white/80"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-on-surface-variant" />
                <span className="hidden sm:inline">Ambient</span>
              </>
            )}
          </button>

          {/* Create Gift Button */}
          <button
            onClick={onOpenBuilder}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Gift</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden mt-2 mb-1 flex justify-center gap-1 bg-white/70 backdrop-blur-md rounded-full p-1 border border-white/70 max-w-sm mx-auto shadow-sm relative z-50">
        <button
          onClick={() => setActiveTab("garden")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            activeTab === "garden" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Garden
        </button>
        <button
          onClick={() => setActiveTab("constellation")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            activeTab === "constellation" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Stars
        </button>
        <button
          onClick={() => setActiveTab("story")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            activeTab === "story" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Story
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
            activeTab === "dashboard" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
          }`}
        >
          Vault
        </button>
      </div>
    </header>
  );
};
