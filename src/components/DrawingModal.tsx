import React, { useRef, useState, useEffect } from "react";
import { X, Check, RotateCcw, Palette } from "lucide-react";

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawing: (dataUrl: string) => void;
}

export const DrawingModal: React.FC<DrawingModalProps> = ({ isOpen, onClose, onSaveDrawing }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#605a7c");
  const [brushSize, setBrushSize] = useState(3);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = ("touches" in e) ? e.touches[0].clientX : e.clientX;
    const clientY = ("touches" in e) ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = ("touches" in e) ? e.touches[0].clientX : e.clientX;
    const clientY = ("touches" in e) ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSaveDrawing(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-white p-5 sm:p-6 rounded-3xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif-title text-xl font-bold text-primary mb-1 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <span>Hand-Drawn Doodle</span>
        </h3>
        <p className="text-xs text-on-surface-variant mb-4">
          Draw a heart, signature, or sweet doodle for your gift box.
        </p>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            {["#605a7c", "#6d5a51", "#AD513D", "#ba1a1a", "#7d562d", "#1a1c1c"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? "scale-125 border-white ring-2 ring-primary" : "border-transparent"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCanvas}
              className="p-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border border-outline-variant/40 rounded-2xl overflow-hidden shadow-inner bg-white mb-4 touch-none">
          <canvas
            ref={canvasRef}
            width={380}
            height={260}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-auto cursor-crosshair"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-full bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <Check className="w-4 h-4" />
          <span>Attach Doodle to Gift</span>
        </button>
      </div>
    </div>
  );
};
