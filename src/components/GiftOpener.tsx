import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { KeepsakeBox, Reaction } from "../types";
import { ambientAudio } from "../lib/audioEngine";
import { MemoryWeatherCanvas } from "./MemoryWeatherCanvas";
import { WaveformAudioPlayer } from "./WaveformAudioPlayer";
import { Gift, Heart, Sparkles, Volume2, Share2, ArrowRight, Lock, Key, Play, FileText, Camera, Mic, MapPin, Music, Check, X, RefreshCw, ShieldAlert, ShieldCheck, CreditCard } from "lucide-react";

interface GiftOpenerProps {
  box: KeepsakeBox;
  providedKey?: string;
  onClose: () => void;
  onShare: () => void;
  onOpenCheckout?: (box: KeepsakeBox) => void;
}

export const GiftOpener: React.FC<GiftOpenerProps> = ({ box, providedKey, onClose, onShare, onOpenCheckout }) => {
  const isKeyRequired = Boolean(box.isPaid && box.accessKey);
  const [isKeyAuthorized, setIsKeyAuthorized] = useState<boolean>(() => {
    if (!isKeyRequired) return true;
    return providedKey === box.accessKey;
  });
  const [keyInput, setKeyInput] = useState(providedKey || "");
  const [keyError, setKeyError] = useState(false);

  const isBoxLocked = Boolean(box.locked ?? box.isLocked);
  const [isOpened, setIsOpened] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!isBoxLocked);
  const [thankYouMsg, setThankYouMsg] = useState("");
  const [userReactions, setUserReactions] = useState<Reaction[]>(box.reactions || []);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  useEffect(() => {
    if (!isKeyRequired) {
      setIsKeyAuthorized(true);
    } else if (providedKey && providedKey === box.accessKey) {
      setIsKeyAuthorized(true);
    } else {
      setIsKeyAuthorized(false);
    }
  }, [providedKey, box.accessKey, isKeyRequired]);

  const handleVerifyKey = () => {
    if (keyInput.trim() === box.accessKey) {
      setIsKeyAuthorized(true);
      setKeyError(false);
      ambientAudio.playChime();
    } else {
      setKeyError(true);
    }
  };

  useEffect(() => {
    if (isOpened && isKeyAuthorized) {
      // Fire festive confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#605a7c", "#e0d7ff", "#f7ddd1", "#ffd5ae", "#AD513D"],
      });

      // Start ambient audio
      ambientAudio.playTrack(box.musicTrack || "piano");
    }
  }, [isOpened, isKeyAuthorized, box.musicTrack]);

  const handleUnlock = () => {
    const code = box.accessCode || box.secretPin;
    if (
      !code ||
      passwordInput.trim().toLowerCase() === code.trim().toLowerCase()
    ) {
      setIsUnlocked(true);
      setPasswordError(false);
      ambientAudio.playChime();
    } else {
      setPasswordError(true);
    }
  };

  const handleOpenGift = () => {
    setIsOpened(true);
  };

  const handleAddReaction = (emoji: "❤️" | "😭" | "🥹" | "😂" | "😍" | "🎉") => {
    ambientAudio.playChime();
    const newReaction: Reaction = {
      id: `r-${Date.now()}`,
      emoji,
      userName: box.toName || "Recipient",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      message: thankYouMsg,
    };

    setUserReactions((prev) => [newReaction, ...prev]);
    box.reactions = [newReaction, ...(box.reactions || [])];
    setThankYouMsg("");
  };

  const currentItem = box.items[activeItemIndex] || box.items[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      
      {/* Dynamic Memory Weather Overlay */}
      <MemoryWeatherCanvas mode="auto" theme={box.theme} />

      {/* Unpaid Warning Banner if Box is Draft/Unpaid */}
      {!box.isPaid && (
        <div className="fixed top-3 sm:top-6 left-3 right-16 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[105] bg-amber-500/95 text-white backdrop-blur-md px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold shadow-xl flex items-center justify-center gap-2 max-w-md pointer-events-auto truncate">
          <span className="truncate">⚠️ Pending Checkout: Payment activation needed.</span>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-primary shadow-xl transition-all z-[110] cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* State 0: Access Key Authorization Gate */}
      {!isKeyAuthorized && (
        <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-2xl text-center space-y-5 animate-fadeIn z-50">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              Access Key Required
            </span>
            <h2 className="font-serif-title text-2xl font-bold text-primary mt-2">
              Private Gift Access Key
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              This gift package is protected. Please enter the unique access key provided in your gift link to view this package.
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Key className="w-4 h-4 text-primary/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Paste or type access key..."
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setKeyError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyKey()}
                className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl py-3 pl-10 pr-3 text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {keyError && (
              <p className="text-xs text-error font-medium">
                Invalid access key. Please check your share link or key and try again.
              </p>
            )}
          </div>

          <button
            onClick={handleVerifyKey}
            className="w-full py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Access Key</span>
          </button>

          {!box.isPaid && onOpenCheckout && (
            <div className="pt-2 border-t border-primary/10">
              <button
                onClick={() => {
                  onClose();
                  onOpenCheckout(box);
                }}
                className="w-full py-2.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Activate Gift ($2.99)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Unboxing Views (Only when Key Authorized) */}
      {isKeyAuthorized && (
        <>
          {/* State 1: Locked Box Challenge */}
          {!isUnlocked && (
        <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary-container/80 text-primary flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-serif-title text-2xl font-bold text-primary">
            Locked Keepsake Box ⏳
          </h2>

          <p className="text-xs text-on-surface-variant">
            {box.passwordPrompt || "Enter the access code to unlock this gift box and unveil its memories."}
          </p>

          <div>
            <input
              type="password"
              placeholder="Enter access code..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-xl p-3 text-xs text-center font-bold focus:outline-none"
            />
            {passwordError && (
              <p className="text-xs text-error font-medium mt-1">Incorrect access code. Please try again!</p>
            )}
          </div>

          <button
            onClick={handleUnlock}
            className="w-full py-2.5 rounded-full bg-primary text-white font-semibold text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Unlock Gift Box</span>
          </button>
        </div>
      )}

      {/* State 2: Unlocked but Not Opened (Wrapped Gift Parcel) */}
      {isUnlocked && !isOpened && (
        <div className="w-full max-w-lg text-center space-y-6">
          
          {/* Floating Gift Box Illustration */}
          <div
            onClick={handleOpenGift}
            className="relative w-64 h-64 md:w-80 md:h-80 mx-auto bg-gradient-to-tr from-primary via-primary-container to-secondary rounded-[40px] p-8 shadow-2xl border-4 border-white flex flex-col items-center justify-center cursor-pointer group hover:scale-105 transition-all duration-500 animate-gentle-bob"
          >
            {/* Satin Ribbon */}
            <div className="absolute inset-y-0 w-12 bg-white/40 backdrop-blur-sm left-1/2 -translate-x-1/2" />
            <div className="absolute inset-x-0 h-12 bg-white/40 backdrop-blur-sm top-1/2 -translate-y-1/2" />

            {/* Wax Seal Center */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-tertiary-container border-2 border-tertiary text-tertiary flex flex-col items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Gift className="w-8 h-8 text-tertiary" />
            </div>

            <p className="relative z-10 font-handwriting text-2xl font-bold text-white mt-6 drop-shadow">
              Tap to Open
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white text-on-surface">
            <p className="text-xs uppercase font-semibold text-primary tracking-wider mb-1">
              Care Package From {box.fromName}
            </p>
            <h1 className="font-serif-title text-3xl font-bold text-primary">
              {box.title}
            </h1>
            <p className="text-xs text-on-surface-variant mt-2">
              For <span className="font-semibold text-primary">{box.toName}</span> • Prepared with love
            </p>
          </div>
        </div>
      )}

      {/* State 3: Unboxed Gift Experience View */}
      {isUnlocked && isOpened && (
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl p-6 md:p-10 border border-white shadow-2xl flex flex-col justify-between min-h-[550px] relative">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-primary/10 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Opened Gift Experience
              </span>
              <h2 className="font-serif-title text-2xl font-bold text-primary">
                {box.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onShare}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-container text-primary hover:bg-primary-container/80 transition-colors flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Active Memory Item Carousel Screen */}
          {currentItem && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 my-auto">
              
              {/* Media Preview Column */}
              <div className="md:col-span-6 h-64 md:h-80 rounded-2xl overflow-hidden border border-white shadow-md bg-surface-container flex items-center justify-center relative p-2">
                {currentItem.type === "voice" ? (
                  <div className="w-full">
                    <WaveformAudioPlayer
                      audioUrl={currentItem.mediaUrl}
                      title={currentItem.title}
                      subtitle={`Voice note by ${currentItem.authorName || box.fromName}`}
                      compact={true}
                    />
                  </div>
                ) : currentItem.mediaUrl ? (
                  <img
                    src={currentItem.mediaUrl}
                    alt={currentItem.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="p-6 text-center">
                    <Sparkles className="w-12 h-12 text-primary/40 mx-auto mb-2" />
                    <p className="text-xs text-on-surface-variant font-medium">{currentItem.type.toUpperCase()}</p>
                  </div>
                )}
                
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white z-20">
                  {currentItem.year || "2026"}
                </div>
              </div>

              {/* Memory Text & Details Column */}
              <div className="md:col-span-6 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Item {activeItemIndex + 1} of {box.items.length}</span>
                  </div>

                  <h3 className="font-serif-title text-2xl font-bold text-primary mb-2">
                    {currentItem.title}
                  </h3>

                  {/* Handwriting text box */}
                  <div className="bg-primary-container/20 p-4 rounded-2xl border border-primary/10">
                    <p className="font-handwriting text-xl text-on-surface leading-relaxed whitespace-pre-line">
                      "{currentItem.content}"
                    </p>
                  </div>
                </div>

                {/* Item Navigation Selector */}
                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <button
                    onClick={() => setActiveItemIndex((prev) => (prev - 1 + box.items.length) % box.items.length)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container hover:bg-surface-container-high transition-colors text-primary"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {box.items.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveItemIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                          i === activeItemIndex ? "bg-primary scale-125" : "bg-primary/20"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveItemIndex((prev) => (prev + 1) % box.items.length)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    Next Item →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reactions Bar Footer */}
          <div className="pt-6 border-t border-primary/10 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary">React to Gift:</span>
              {(["❤️", "😭", "🥹", "😂", "😍", "🎉"] as const).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAddReaction(emoji)}
                  className="w-9 h-9 rounded-full bg-surface-container hover:bg-primary-container hover:scale-125 transition-all text-base flex items-center justify-center shadow-xs"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* User Reaction Badge display */}
            {userReactions.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary-container/40 px-3 py-1 rounded-full">
                <span>{userReactions[0].emoji} You reacted "{userReactions[0].emoji}"</span>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
