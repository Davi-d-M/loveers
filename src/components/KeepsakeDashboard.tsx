import React, { useState } from "react";
import { KeepsakeBox } from "../types";
import { Gift, Plus, Sparkles, Share2, Edit3, Trash2, Eye, Heart, Lock, Calendar, ArrowRight } from "lucide-react";

interface KeepsakeDashboardProps {
  boxes: KeepsakeBox[];
  onSelectBox: (box: KeepsakeBox) => void;
  onOpenGiftExperience: (box: KeepsakeBox) => void;
  onEditBox: (box: KeepsakeBox) => void;
  onDeleteBox: (id: string) => void;
  onCreateNew: () => void;
  onShare: (box: KeepsakeBox) => void;
}

export const KeepsakeDashboard: React.FC<KeepsakeDashboardProps> = ({
  boxes,
  onSelectBox,
  onOpenGiftExperience,
  onEditBox,
  onDeleteBox,
  onCreateNew,
  onShare,
}) => {
  const [filterTag, setFilterTag] = useState("all");

  const filteredBoxes = boxes.filter((b) => {
    if (filterTag === "locked") return b.isLocked;
    if (filterTag === "collaborative") return b.isCollaborative;
    return true;
  });

  const totalMemories = boxes.reduce((acc, b) => acc + b.items.length, 0);
  const totalViews = boxes.reduce((acc, b) => acc + b.viewsCount, 0);

  return (
    <div className="relative min-h-screen pt-6 pb-12 px-4 md:px-8 max-w-7xl mx-auto z-10">
      
      {/* Hero Stats Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white mb-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Digital Keepsake Vault</span>
          </div>
          <h1 className="font-serif-title text-3xl md:text-4xl font-bold text-primary">
            My Precious Keepsakes
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Preserving heartfelt moments, digital care packages, and time capsules.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-4">
          <div className="bg-white/80 p-3 rounded-2xl border border-white text-center shadow-xs">
            <p className="text-xl font-bold text-primary">{boxes.length}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Gift Packages</p>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-white text-center shadow-xs">
            <p className="text-xl font-bold text-secondary">{totalMemories}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Saved Memories</p>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-white text-center shadow-xs">
            <p className="text-xl font-bold text-tertiary">{totalViews}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Times Opened</p>
          </div>

          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Gift Box</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilterTag("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterTag === "all" ? "bg-primary text-white shadow-sm" : "bg-white/60 text-on-surface-variant hover:bg-white"
          }`}
        >
          All Boxes ({boxes.length})
        </button>
        <button
          onClick={() => setFilterTag("locked")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterTag === "locked" ? "bg-primary text-white shadow-sm" : "bg-white/60 text-on-surface-variant hover:bg-white"
          }`}
        >
          Time Capsules
        </button>
        <button
          onClick={() => setFilterTag("collaborative")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filterTag === "collaborative" ? "bg-primary text-white shadow-sm" : "bg-white/60 text-on-surface-variant hover:bg-white"
          }`}
        >
          Collaborative
        </button>
      </div>

      {/* Keepsake Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Create New Hero Card */}
        <div
          onClick={onCreateNew}
          className="bg-white/40 border-2 border-dashed border-primary/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/70 hover:border-primary transition-all duration-300 min-h-[280px] group"
        >
          <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title text-lg font-bold text-primary">Build New Care Package</h3>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
            Combine notes, photos, voice recordings, coupons, and music into a shareable gift box.
          </p>
        </div>

        {/* Existing Boxes */}
        {filteredBoxes.map((box) => (
          <div
            key={box.id}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
          >
            {box.coverImageUrl && (
              <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 relative">
                <img
                  src={box.coverImageUrl}
                  alt={box.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {box.isLocked && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-full">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-primary uppercase mb-1">
                <span>To: {box.toName}</span>
                <span className="text-on-surface-variant">{box.items.length} Items</span>
              </div>

              <div className="mb-2">
                {box.isPaid ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ Paid & Active
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    ⚠️ Unpaid Draft ($2.99)
                  </span>
                )}
              </div>

              <h3 className="font-serif-title text-xl font-bold text-primary mb-1 line-clamp-1">
                {box.title}
              </h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Created by {box.fromName} • {box.createdAt}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-primary/10 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenGiftExperience(box)}
                className="flex-1 py-2 rounded-full text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Open Box</span>
              </button>

              <button
                onClick={() => onShare(box)}
                className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                title="Share Link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEditBox(box)}
                className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDeleteBox(box.id)}
                className="p-2 rounded-full bg-surface-container hover:bg-error-container text-error transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
