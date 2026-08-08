import React, { useState, useEffect } from "react";
import { KeepsakeBox, ActiveTab, MemoryWeatherMode } from "./types";
import { sampleBoxes } from "./data/sampleBoxes";
import { ParticleCanvas } from "./components/ParticleCanvas";
import { MemoryWeatherCanvas } from "./components/MemoryWeatherCanvas";
import { Navbar } from "./components/Navbar";
import { MemoryGarden } from "./components/MemoryGarden";
import { ConstellationView } from "./components/ConstellationView";
import { StoryMode } from "./components/StoryMode";
import { KeepsakeDashboard } from "./components/KeepsakeDashboard";
import { KeepsakeBuilder } from "./components/KeepsakeBuilder";
import { GiftOpener } from "./components/GiftOpener";
import { ShareModal } from "./components/ShareModal";
import { CheckoutModal } from "./components/CheckoutModal";

export default function App() {
  const [boxes, setBoxes] = useState<KeepsakeBox[]>(() => {
    try {
      const saved = localStorage.getItem("evergift_boxes");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed loading saved boxes", e);
    }
    return sampleBoxes;
  });

  const [activeBoxId, setActiveBoxId] = useState<string>(boxes[0]?.id || "box-1");
  const [activeTab, setActiveTab] = useState<ActiveTab>("garden");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBox, setEditingBox] = useState<KeepsakeBox | null>(null);
  const [memoryWeather, setMemoryWeather] = useState<MemoryWeatherMode>("auto");

  // Modals
  const [isOpenerOpen, setIsOpenerOpen] = useState(false);
  const [providedAccessKey, setProvidedAccessKey] = useState<string>("");
  const [shareBox, setShareBox] = useState<KeepsakeBox | null>(null);
  const [checkoutBox, setCheckoutBox] = useState<KeepsakeBox | null>(null);

  // Parse URL Hash & Access Key on route changes
  useEffect(() => {
    const handleUrlHashAndKey = () => {
      const hash = window.location.hash; // e.g. #gift-box-1?key=sample-key-1
      if (hash.startsWith("#gift-")) {
        const raw = hash.replace("#gift-", "");
        const [boxIdAndQuery] = raw.split("&");
        const [boxId, queryString] = boxIdAndQuery.split("?");

        let key = "";
        if (queryString) {
          const params = new URLSearchParams(queryString);
          key = params.get("key") || "";
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          key = urlParams.get("key") || "";
        }

        const targetBox = boxes.find((b) => b.id === boxId || b.slug === boxId);
        if (targetBox) {
          setActiveBoxId(targetBox.id);
          setProvidedAccessKey(key);
          setIsOpenerOpen(true);
        }
      }
    };

    handleUrlHashAndKey();
    window.addEventListener("hashchange", handleUrlHashAndKey);
    return () => window.removeEventListener("hashchange", handleUrlHashAndKey);
  }, [boxes]);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem("evergift_boxes", JSON.stringify(boxes));
    } catch (e) {
      console.error("Failed persisting boxes", e);
    }
  }, [boxes]);

  const activeBox = boxes.find((b) => b.id === activeBoxId) || boxes[0] || sampleBoxes[0];

  const handleSaveBoxFromBuilder = (newBox: KeepsakeBox) => {
    setBoxes((prev) => {
      const exists = prev.some((b) => b.id === newBox.id);
      if (exists) {
        return prev.map((b) => (b.id === newBox.id ? newBox : b));
      } else {
        return [newBox, ...prev];
      }
    });

    setActiveBoxId(newBox.id);
    setEditingBox(null);
    setActiveTab("garden");
  };

  const handleDeleteBox = (id: string) => {
    if (boxes.length <= 1) return;
    setBoxes((prev) => prev.filter((b) => b.id !== id));
    if (activeBoxId === id) {
      const remaining = boxes.filter((b) => b.id !== id);
      if (remaining.length > 0) setActiveBoxId(remaining[0].id);
    }
  };

  const handleOpenGiftExperience = (boxToOpen: KeepsakeBox, explicitKey?: string) => {
    setActiveBoxId(boxToOpen.id);
    setProvidedAccessKey(explicitKey || boxToOpen.accessKey || "");
    boxToOpen.viewsCount += 1;
    setIsOpenerOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#faf9f8] text-[#1a1c1c] overflow-x-hidden selection:bg-[#e0d7ff]">
      
      {/* Background Particle & Memory Weather Canvas Overlay */}
      <ParticleCanvas theme={activeBox.theme} />
      <MemoryWeatherCanvas mode={memoryWeather} theme={activeBox.theme} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBuilder={() => {
          setEditingBox(null);
          setActiveTab("builder");
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentWeather={memoryWeather}
        onSelectWeather={setMemoryWeather}
      />

      {/* Main Active View */}
      <main className="relative z-10 pt-28 sm:pt-32 lg:pt-24 pb-40 min-h-[calc(100vh-80px)]">
        {activeTab === "garden" && (
          <MemoryGarden
            boxes={boxes}
            activeBox={activeBox}
            setActiveBox={(box) => setActiveBoxId(box.id)}
            onOpenGiftExperience={handleOpenGiftExperience}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "constellation" && (
          <ConstellationView
            box={activeBox}
            onOpenGiftExperience={handleOpenGiftExperience}
          />
        )}

        {activeTab === "story" && (
          <StoryMode
            box={activeBox}
            onOpenGiftExperience={handleOpenGiftExperience}
          />
        )}

        {activeTab === "dashboard" && (
          <KeepsakeDashboard
            boxes={boxes}
            onSelectBox={(box) => setActiveBoxId(box.id)}
            onOpenGiftExperience={handleOpenGiftExperience}
            onEditBox={(box) => {
              setEditingBox(box);
              setActiveTab("builder");
            }}
            onDeleteBox={handleDeleteBox}
            onCreateNew={() => {
              setEditingBox(null);
              setActiveTab("builder");
            }}
            onShare={(box) => setShareBox(box)}
          />
        )}

        {activeTab === "builder" && (
          <KeepsakeBuilder
            initialBox={editingBox || undefined}
            onSaveBox={handleSaveBoxFromBuilder}
            onCancel={() => setActiveTab("garden")}
          />
        )}
      </main>

      {/* Gift Opener Overlay Experience */}
      {isOpenerOpen && (
        <GiftOpener
          box={activeBox}
          providedKey={providedAccessKey}
          onClose={() => setIsOpenerOpen(false)}
          onShare={() => setShareBox(activeBox)}
          onOpenCheckout={(b) => setCheckoutBox(b)}
        />
      )}

      {/* Share Link Modal */}
      {shareBox && (
        <ShareModal
          isOpen={Boolean(shareBox)}
          onClose={() => setShareBox(null)}
          box={shareBox}
          onOpenCheckout={(b) => setCheckoutBox(b)}
        />
      )}

      {/* Global Checkout Modal */}
      {checkoutBox && (
        <CheckoutModal
          isOpen={Boolean(checkoutBox)}
          onClose={() => setCheckoutBox(null)}
          box={checkoutBox}
          onPaymentSuccess={(paidBox) => {
            handleSaveBoxFromBuilder(paidBox);
            setShareBox(paidBox);
          }}
        />
      )}
    </div>
  );
}
