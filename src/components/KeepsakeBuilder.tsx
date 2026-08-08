import React, { useState } from "react";
import { KeepsakeBox, GoodyItem, GoodyType, GiftTheme, MusicTrack } from "../types";
import { DrawingModal } from "./DrawingModal";
import { CheckoutModal } from "./CheckoutModal";
import { WaveformAudioPlayer } from "./WaveformAudioPlayer";
import { ambientAudio } from "../lib/audioEngine";
import { Sparkles, Plus, Trash2, Palette, Music, Lock, Calendar, Eye, Save, ArrowUp, ArrowDown, FileText, Camera, Mic, MapPin, Gift, CreditCard, Newspaper, Pencil, Mail, Smartphone } from "lucide-react";

interface KeepsakeBuilderProps {
  initialBox?: KeepsakeBox;
  onSaveBox: (box: KeepsakeBox) => void;
  onCancel: () => void;
}

export const KeepsakeBuilder: React.FC<KeepsakeBuilderProps> = ({ initialBox, onSaveBox, onCancel }) => {
  const [box, setBox] = useState<KeepsakeBox>(
    initialBox || {
      id: `box-${Date.now()}`,
      slug: `gift-${Date.now()}`,
      title: "Thinking of You ❤️",
      toName: "Cutie",
      fromName: "Bestie",
      occasion: "Just Because",
      createdAt: new Date().toISOString().split("T")[0],
      theme: "ethereal",
      musicTrack: "piano",
      isLocked: false,
      items: [
        {
          id: `item-${Date.now()}-1`,
          type: "note",
          title: "A Little Note For You",
          content: "I made this digital care package just to make you smile today!",
          year: 2026,
        },
      ],
      reactions: [],
      viewsCount: 0,
    }
  );

  const [activeTab, setActiveTab] = useState<"content" | "theme" | "lock">("content");
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // New item form state
  const [newItemType, setNewItemType] = useState<GoodyType>("note");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemContent, setNewItemContent] = useState("");
  const [newItemMediaUrl, setNewItemMediaUrl] = useState("");
  const [newItemLocation, setNewItemLocation] = useState("");
  const [newItemYear, setNewItemYear] = useState<number>(2026);
  const [newItemCode, setNewItemCode] = useState("");

  const handleAddItem = () => {
    if (!newItemTitle.trim() && !newItemContent.trim()) return;

    const newItem: GoodyItem = {
      id: `item-${Date.now()}`,
      type: newItemType,
      title: newItemTitle || `${newItemType.toUpperCase()} Memory`,
      content: newItemContent,
      mediaUrl: newItemMediaUrl,
      locationName: newItemLocation,
      year: newItemYear,
      couponCode: newItemCode,
      authorName: box.fromName,
    };

    setBox((prev) => ({ ...prev, items: [...prev.items, newItem] }));

    // Reset form
    setNewItemTitle("");
    setNewItemContent("");
    setNewItemMediaUrl("");
    setNewItemLocation("");
    setNewItemCode("");
  };

  const handleRemoveItem = (id: string) => {
    setBox((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...box.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setBox((prev) => ({ ...prev, items: newItems }));
  };

  const handleSave = () => {
    onSaveBox(box);
  };

  return (
    <div className="relative min-h-screen pt-6 pb-12 px-4 md:px-8 max-w-7xl mx-auto z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 glass-panel rounded-3xl p-6 border border-white">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Keepsake Builder Studio</span>
          </div>
          <h1 className="font-serif-title text-2xl md:text-3xl font-bold text-primary">
            {box.title || "Craft New Gift Package"}
          </h1>
          <p className="text-xs text-on-surface-variant">
            Build a personalized care package with notes, photos, music, voice notes, and time capsules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-primary/20 text-primary hover:bg-primary-container/30 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-primary text-white shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Checkout & Send Gift ($2.99)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Builder Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Package Core Info */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm space-y-4">
            <h3 className="font-serif-title text-lg font-semibold text-primary">Gift Metadata & Recipient Contact</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">To (Recipient)</label>
                <input
                  type="text"
                  value={box.toName}
                  onChange={(e) => setBox({ ...box, toName: e.target.value })}
                  className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">From (Sender)</label>
                <input
                  type="text"
                  value={box.fromName}
                  onChange={(e) => setBox({ ...box, fromName: e.target.value })}
                  className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Occasion / Title</label>
                <input
                  type="text"
                  value={box.title}
                  onChange={(e) => setBox({ ...box, title: e.target.value })}
                  className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-primary/10">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Recipient Email (for Direct Delivery)</span>
                </label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={box.recipientEmail || ""}
                  onChange={(e) => setBox({ ...box, recipientEmail: e.target.value })}
                  className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Recipient Phone / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={box.recipientPhone || ""}
                  onChange={(e) => setBox({ ...box, recipientPhone: e.target.value })}
                  className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Builder Tabs */}
          <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === "content" ? "bg-primary text-white shadow-sm" : "bg-white/60 text-on-surface-variant hover:bg-white"
              }`}
            >
              Goodies Content ({box.items.length})
            </button>
            <button
              onClick={() => setActiveTab("theme")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === "theme" ? "bg-primary text-white shadow-sm" : "bg-white/60 text-on-surface-variant hover:bg-white"
              }`}
            >
              Theme & Music
            </button>
            <button
              onClick={() => setActiveTab("lock")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === "lock" ? "bg-primary text-white shadow-sm" : "bg-white/60 text-on-surface-variant hover:bg-white"
              }`}
            >
              Time Capsule & Lock
            </button>
          </div>

          {/* Tab 1: Goodies Content Editor */}
          {activeTab === "content" && (
            <div className="space-y-4">
              
              {/* Add New Goody Card */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-title text-base font-bold text-primary">
                    Add New Memory Item
                  </h3>
                  
                  {/* Quick Helpers */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDrawingModalOpen(true)}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-tertiary-container text-tertiary hover:bg-tertiary-container/80 transition-colors flex items-center gap-1 border border-tertiary/20 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Doodle Pad</span>
                    </button>
                  </div>
                </div>

                {/* Goody Type Selector Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {[
                    { type: "note", label: "Note", icon: FileText },
                    { type: "photo", label: "Photo", icon: Camera },
                    { type: "voice", label: "Voice", icon: Mic },
                    { type: "flowers", label: "Flowers", icon: Gift },
                    { type: "location", label: "Place", icon: MapPin },
                    { type: "coupon", label: "Coupon", icon: Gift },
                    { type: "newspaper", label: "News", icon: Newspaper },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = newItemType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setNewItemType(item.type as GoodyType)}
                        className={`p-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-md"
                            : "bg-surface-container/60 text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-1" />
                        <span className="text-[9px] font-semibold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Title / Memory Name (e.g. Sunset in Santorini)"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      className="w-full bg-surface-container/40 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      placeholder="Message or memory description..."
                      value={newItemContent}
                      onChange={(e) => setNewItemContent(e.target.value)}
                      className="w-full bg-surface-container/40 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                    />
                  </div>

                  {newItemType === "voice" && (
                    <div className="space-y-3 bg-surface-container/30 p-4 rounded-2xl border border-primary/10">
                      <label className="block text-xs font-semibold text-primary mb-1">
                        Record or Preview Voice Message
                      </label>
                      <WaveformAudioPlayer
                        audioUrl={newItemMediaUrl}
                        title={newItemTitle || "Voice Note"}
                        subtitle="Web Audio API Waveform Recorder"
                        allowRecording={true}
                        onAudioSaved={(url) => setNewItemMediaUrl(url)}
                        compact={true}
                      />
                      <div>
                        <input
                          type="text"
                          placeholder="Or paste audio URL (e.g. .mp3, .ogg, .wav, or data URL)"
                          value={newItemMediaUrl}
                          onChange={(e) => setNewItemMediaUrl(e.target.value)}
                          className="w-full bg-white/80 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {(newItemType === "photo" || newItemType === "drawing") && (
                    <div>
                      <input
                        type="text"
                        placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                        value={newItemMediaUrl}
                        onChange={(e) => setNewItemMediaUrl(e.target.value)}
                        className="w-full bg-surface-container/40 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                  )}

                  {newItemType === "location" && (
                    <div>
                      <input
                        type="text"
                        placeholder="Location Name (e.g. Central Park, NY)"
                        value={newItemLocation}
                        onChange={(e) => setNewItemLocation(e.target.value)}
                        className="w-full bg-surface-container/40 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-1/2">
                      <label className="block text-[10px] font-semibold text-primary mb-1">Year</label>
                      <input
                        type="number"
                        value={newItemYear}
                        onChange={(e) => setNewItemYear(Number(e.target.value))}
                        className="w-full bg-surface-container/40 border border-outline-variant/30 rounded-xl p-2 text-xs focus:outline-none"
                      />
                    </div>

                    {newItemType === "coupon" && (
                      <div className="w-1/2">
                        <label className="block text-[10px] font-semibold text-primary mb-1">Coupon Code</label>
                        <input
                          type="text"
                          placeholder="e.g. FREE-COFFEE"
                          value={newItemCode}
                          onChange={(e) => setNewItemCode(e.target.value)}
                          className="w-full bg-surface-container/40 border border-outline-variant/30 rounded-xl p-2 text-xs focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2.5 rounded-full bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item to Gift Box</span>
                  </button>
                </div>
              </div>

              {/* Items List Reorder/Delete */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Existing Box Items ({box.items.length})
                </h4>

                {box.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white/90 p-3 rounded-2xl border border-white shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-primary truncate">{item.title}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{item.type} • {item.year || 2026}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === box.items.length - 1}
                        className="p-1 rounded text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded text-error hover:bg-error-container/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Theme & Music */}
          {activeTab === "theme" && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm space-y-4">
              <div>
                <h3 className="font-serif-title text-base font-bold text-primary mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Choose Visual Atmosphere</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "ethereal", name: "Ethereal Light", color: "bg-[#e0d7ff]" },
                    { id: "cherry-blossom", name: "Cherry Blossom", color: "bg-[#ffd5ae]" },
                    { id: "celestial", name: "Celestial Galaxy", color: "bg-[#181528] text-white" },
                    { id: "twilight", name: "Soft Twilight", color: "bg-[#484263] text-white" },
                    { id: "warm-sunset", name: "Warm Sunset", color: "bg-[#f7ddd1]" },
                    { id: "rose-gold", name: "Rose Gold", color: "bg-[#ffd5ae]" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setBox({ ...box, theme: t.id as GiftTheme })}
                      className={`p-3 rounded-2xl border text-xs font-semibold transition-all ${t.color} ${
                        box.theme === t.id ? "ring-2 ring-primary scale-105 shadow-md" : "border-outline-variant/30"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif-title text-base font-bold text-primary mb-2 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span>Background Ambient Music</span>
                </h3>
                <select
                  value={box.musicTrack}
                  onChange={(e) => {
                    const track = e.target.value as MusicTrack;
                    setBox({ ...box, musicTrack: track });
                    ambientAudio.playTrack(track);
                  }}
                  className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                >
                  <option value="piano">Soft Piano Chords</option>
                  <option value="acoustic">Warm Acoustic Tones</option>
                  <option value="celestial-bells">Celestial Bells</option>
                  <option value="lofi-nostalgia">Lo-fi Nostalgia</option>
                  <option value="none">No Music (Silent)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 3: Time Capsule Lock & Secret Password */}
          {activeTab === "lock" && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-title text-base font-bold text-primary flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Time Capsule & Password Lock</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Lock this gift so it can only be opened on a specific future date or with a secret password!
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={Boolean(box.locked ?? box.isLocked)}
                  onChange={(e) => setBox({ ...box, locked: e.target.checked, isLocked: e.target.checked })}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </div>

              {Boolean(box.locked ?? box.isLocked) && (
                <div className="space-y-3 pt-2 border-t border-primary/10">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Unlock Date (Time Capsule)
                    </label>
                    <input
                      type="date"
                      value={box.unlockDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        setBox({
                          ...box,
                          unlockDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                        })
                      }
                      className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Access Code / Secret PIN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. milo or LOVE2026"
                      value={box.accessCode || box.secretPin || ""}
                      onChange={(e) => setBox({ ...box, accessCode: e.target.value, secretPin: e.target.value })}
                      className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Password Question Hint
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. What is our pet's name?"
                      value={box.passwordPrompt || ""}
                      onChange={(e) => setBox({ ...box, passwordPrompt: e.target.value })}
                      className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile Preview Device (5 cols) */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="glass-panel p-4 rounded-3xl border border-white shadow-xl text-center">
            <div className="flex items-center justify-between text-xs font-semibold text-primary mb-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Gift Mobile Preview</span>
              </span>
              <span className="text-[10px] bg-primary-container px-2 py-0.5 rounded-full text-primary font-mono">
                {box.items.length} Items
              </span>
            </div>

            {/* Simulated Smartphone Container */}
            <div className="w-full max-w-[320px] mx-auto h-[520px] bg-white rounded-[36px] border-8 border-primary/20 shadow-2xl overflow-y-auto p-4 flex flex-col justify-between text-left relative">
              
              {/* Phone Notch */}
              <div className="w-24 h-4 bg-primary/20 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-30" />

              <div className="pt-6 space-y-3">
                <div className="text-center pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    To: {box.toName}
                  </p>
                  <h4 className="font-serif-title text-lg font-bold text-primary mt-0.5">
                    {box.title}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant">From {box.fromName}</p>
                </div>

                {/* Items preview list */}
                <div className="space-y-2 pt-2">
                  {box.items.map((item) => (
                    <div key={item.id} className="bg-primary-container/20 p-2.5 rounded-xl border border-primary/10 text-xs">
                      <p className="font-semibold text-primary text-[11px]">{item.title}</p>
                      <p className="text-[10px] text-on-surface-variant line-clamp-2 mt-0.5">"{item.content}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 text-center">
                <span className="text-[9px] font-mono text-on-surface-variant/70">EverGift Digital Care Package</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawing Pad Modal */}
      <DrawingModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSaveDrawing={(dataUrl) => {
          setNewItemType("photo");
          setNewItemTitle(`Hand-Drawn Doodle`);
          setNewItemMediaUrl(dataUrl);
          setNewItemContent("Created with love in EverGift Doodle Studio");
        }}
      />

      {/* Payment & Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        box={box}
        onPaymentSuccess={(paidBox) => {
          setBox(paidBox);
          onSaveBox(paidBox);
        }}
      />
    </div>
  );
};
