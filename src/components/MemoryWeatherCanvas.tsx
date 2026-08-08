import React, { useEffect, useRef } from "react";
import { MemoryWeatherMode, GiftTheme } from "../types";

interface MemoryWeatherCanvasProps {
  mode: MemoryWeatherMode;
  theme?: GiftTheme;
}

export const MemoryWeatherCanvas: React.FC<MemoryWeatherCanvasProps> = ({ mode, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine active weather type based on auto / theme / mode
  const getEffectiveWeather = (): MemoryWeatherMode => {
    if (mode !== "auto") return mode;

    // If theme is explicitly seasonal
    if (theme === "cherry-blossom") return "cherry-blossom";
    if (theme === "celestial") return "snowfall";
    if (theme === "warm-sunset") return "autumn-leaves";
    if (theme === "twilight") return "gentle-rain";
    if (theme === "ethereal") return "summer-sunbeams";

    // Otherwise determine based on current real-world month
    const month = new Date().getMonth(); // 0-indexed (0=Jan, 7=Aug, etc)
    if (month >= 2 && month <= 4) return "cherry-blossom"; // Mar-May (Spring)
    if (month >= 5 && month <= 7) return "summer-sunbeams"; // Jun-Aug (Summer)
    if (month >= 8 && month <= 10) return "autumn-leaves";  // Sep-Nov (Autumn)
    return "snowfall"; // Dec-Feb (Winter)
  };

  const activeWeather = getEffectiveWeather();

  useEffect(() => {
    if (activeWeather === "off") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle pool setup depending on active weather
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      sway: number;
      swaySpeed: number;
      color: string;
      alpha: number;
      type?: string;
    }> = [];

    const count = activeWeather === "gentle-rain" ? 80 : 40;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 1.2 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        color: "#ffffff",
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    // Helper functions to draw custom shapes
    const drawPetal = (x: number, y: number, size: number, angle: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size / 2, -size, -size, -size * 1.5, 0, -size * 2);
      ctx.bezierCurveTo(size, -size * 1.5, size / 2, -size, 0, 0);
      ctx.fill();
      ctx.restore();
    };

    const drawLeaf = (x: number, y: number, size: number, angle: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.8, -size * 0.3, size * 0.2, size);
      ctx.quadraticCurveTo(0, size * 1.2, -size * 0.2, size);
      ctx.quadraticCurveTo(-size * 0.8, -size * 0.3, 0, -size);
      ctx.fill();

      // Stem line
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.8);
      ctx.lineTo(0, size * 1.1);
      ctx.stroke();

      ctx.restore();
    };

    const drawStar = (x: number, y: number, size: number, alpha: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(0, -size);
        ctx.quadraticCurveTo(0, 0, size, 0);
        ctx.rotate(Math.PI / 2);
      }
      ctx.fill();
      ctx.restore();
    };

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Render weather background effects (e.g. gentle sunbeams)
      if (activeWeather === "summer-sunbeams") {
        ctx.save();
        const beamGradient = ctx.createLinearGradient(0, 0, width, height);
        beamGradient.addColorStop(0, "rgba(254, 240, 138, 0.08)");
        beamGradient.addColorStop(0.5, "rgba(253, 224, 71, 0.03)");
        beamGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = beamGradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      particles.forEach((p) => {
        p.sway += p.swaySpeed;
        p.rotation += p.rotationSpeed;

        if (activeWeather === "cherry-blossom") {
          const swayX = Math.sin(p.sway) * 1.2;
          p.x += p.vx + swayX;
          p.y += p.vy * 0.9;

          const petalColors = ["#fbcfe8", "#f472b6", "#fce7f3", "#ffd1dc"];
          const color = petalColors[Math.floor((p.size * 10) % petalColors.length)];
          drawPetal(p.x, p.y, p.size, p.rotation, color, p.alpha * 0.85);

        } else if (activeWeather === "snowfall") {
          const swayX = Math.sin(p.sway) * 0.6;
          p.x += p.vx + swayX;
          p.y += p.vy * 0.8;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.shadowBlur = p.size * 2;
          ctx.shadowColor = "rgba(224, 242, 254, 0.8)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (activeWeather === "autumn-leaves") {
          const swayX = Math.sin(p.sway) * 1.8;
          p.x += p.vx + swayX;
          p.y += p.vy * 1.1;

          const leafColors = ["#d97706", "#ea580c", "#b91c1c", "#f59e0b", "#9a3412"];
          const color = leafColors[Math.floor((p.size * 10) % leafColors.length)];
          drawLeaf(p.x, p.y, p.size * 1.2, p.rotation, color, p.alpha * 0.9);

        } else if (activeWeather === "summer-sunbeams") {
          const swayX = Math.cos(p.sway) * 0.8;
          p.x += p.vx + swayX;
          p.y -= p.vy * 0.4; // float upward softly like golden pollen

          ctx.save();
          ctx.globalAlpha = p.alpha * 0.8;
          ctx.fillStyle = "rgba(253, 224, 71, 0.8)";
          ctx.shadowBlur = p.size * 3;
          ctx.shadowColor = "rgba(250, 204, 21, 0.9)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (activeWeather === "gentle-rain") {
          p.x += 1.2;
          p.y += p.vy * 6; // fast rain drop

          ctx.save();
          ctx.globalAlpha = p.alpha * 0.5;
          ctx.strokeStyle = "rgba(186, 230, 253, 0.8)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 4, p.y - p.size * 2.5);
          ctx.stroke();
          ctx.restore();

        } else if (activeWeather === "starfall") {
          p.x += p.vx * 0.3;
          p.y += p.vy * 0.3;
          const starAlpha = Math.abs(Math.sin(frame * 0.03 + p.sway));
          drawStar(p.x, p.y, p.size * 0.6, starAlpha, "rgba(255, 255, 255, 0.95)");
        }

        // Wrap around canvas boundaries
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeWeather, mode, theme]);

  if (activeWeather === "off") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-1000"
      style={{ opacity: 0.9 }}
    />
  );
};
