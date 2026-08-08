import React, { useState } from "react";
import { KeepsakeBox } from "../types";
import { ambientAudio } from "../lib/audioEngine";
import { BookOpen, ChevronLeft, ChevronRight, Gift } from "lucide-react";

interface StoryModeProps {
  box: KeepsakeBox;
  onOpenGiftExperience: (box: KeepsakeBox) => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ box, onOpenGiftExperience }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = box.items;
  const currentItem = items[currentIndex] || items[0];

  const handleNext = () => {
    ambientAudio.playChime();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    ambientAudio.playChime();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative min-h-screen pt-6 pb-12 px-4 md:px-8 flex flex-col items-center justify-start z-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 z-20">
        <div className="flex items-center justify-center gap-2 text-primary font-medium text-xs uppercase tracking-widest mb-1 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full w-fit mx-auto shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>Cinematic Story Experience</span>
        </div>
        <h1 className="font-serif-title text-3xl md:text-5xl font-bold text-primary tracking-tight mt-2">
          {box.title}
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-2">
          Step through your gift package, memory by memory.
        </p>
      </div>

      {/* Slide Carousel Viewer */}
      {currentItem && (
        <div className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 z-20 border border-white">
          
          {/* Media Display */}
          <div className="w-full md:w-1/2 h-72 md:h-96 rounded-2xl overflow-hidden border border-white shadow-lg bg-surface-container relative group">
            {currentItem.mediaUrl ? (
              <img
                src={currentItem.mediaUrl}
                alt={currentItem.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-container/40 to-secondary-container/40 flex items-center justify-center p-6 text-center">
                <BookOpen className="w-12 h-12 text-primary/40 mb-2" />
              </div>
            )}
            
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
              {currentItem.year || "Memory"}
            </div>
          </div>

          {/* Narrative Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-between h-full min-h-[250px]">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <span>{currentItem.type}</span>
                <span>{currentIndex + 1} of {items.length}</span>
              </div>

              <h2 className="font-serif-title text-2xl md:text-3xl font-bold text-primary mb-3">
                {currentItem.title}
              </h2>

              <p className="font-handwriting text-lg md:text-xl text-on-surface leading-relaxed bg-white/50 p-4 rounded-2xl border border-white/80">
                "{currentItem.content}"
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary/10">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary-container transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                {items.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full cursor-pointer transition-all ${
                      i === currentIndex ? "w-6 bg-primary" : "w-2 bg-primary/20"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary-container transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
