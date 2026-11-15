import { useEffect, useRef } from "react";
import { drawArtwork } from "./artwork";

const W = 160, H = 90;

// Pixel-art space station with the ship safely docked. Drawn tiny and scaled
// up with image-rendering: pixelated, like the rest of the game's art.
export function StationScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d");
    if (!c) return;
    c.imageSmoothingEnabled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const loop = (t: number) => {
      c.clearRect(0, 0, W, H);
      // central hull
      c.fillStyle = "#2b3350"; c.fillRect(58, 30, 44, 30);
      c.fillStyle = "#3a4468"; c.fillRect(58, 30, 44, 4);
      c.fillStyle = "#1c2138"; c.fillRect(58, 56, 44, 4);
      // side arms
      c.fillStyle = "#232a44"; c.fillRect(20, 40, 38, 10); c.fillRect(102, 40, 38, 10);
      c.fillStyle = "#39436a"; c.fillRect(20, 40, 38, 2); c.fillRect(102, 40, 38, 2);
      // solar panels
      c.fillStyle = "#123a5c"; c.fillRect(6, 34, 14, 22); c.fillRect(140, 34, 14, 22);
      c.fillStyle = "#1f6f9e";
      for (let y = 36; y < 56; y += 4) { c.fillRect(7, y, 12, 2); c.fillRect(141, y, 12, 2); }
      // antenna with blinking beacon
      c.fillStyle = "#4a5578"; c.fillRect(79, 18, 2, 12);
      c.fillStyle = Math.sin(t / 400) > 0 ? "#ff5a5a" : "#7a2b2b"; c.fillRect(78, 15, 4, 4);
      // windows, some flickering warm/cool
      for (let i = 0; i < 6; i++) {
        const lit = Math.sin(t / 900 + i * 1.7) > -0.3;
        c.fillStyle = lit ? (i % 2 ? "#9fd8ff" : "#ffd98a") : "#141a30";
        c.fillRect(62 + i * 7, 38, 4, 5);
      }
      // docking bay (lower left of the hull), sized around the enlarged crew module
      c.fillStyle = "#0d1226"; c.fillRect(26, 48, 32, 28);
      c.fillStyle = "#39d7ff";
      c.fillRect(26, 48, 32, 1); c.fillRect(26, 75, 32, 1); c.fillRect(26, 48, 1, 28); c.fillRect(57, 48, 1, 28);
      // cyan docking lights chasing along the bay
      for (let i = 0; i < 4; i++) {
        c.fillStyle = Math.floor(t / 300 + i) % 2 === 0 ? "#39d7ff" : "#0e3a4a";
        c.fillRect(29 + i * 8, 46, 2, 2);
      }
      // the ship, parked prominently in the bay
      if (!drawArtwork(c, "ship", 28, 49, 28)) {
        c.fillStyle = "#e8ecf4"; c.fillRect(35, 53, 14, 17);
        c.fillStyle = "#7fc4ff"; c.fillRect(39, 55, 6, 5);
        c.fillStyle = "#3a3f52"; c.fillRect(35, 67, 14, 3);
      }
      // green docking-success indicator
      const greenOn = Math.sin(t / 500) > -0.2;
      if (greenOn) { c.globalAlpha = 0.25; c.fillStyle = "#4dff7a"; c.fillRect(57, 61, 5, 5); c.globalAlpha = 1; }
      c.fillStyle = greenOn ? "#4dff7a" : "#14522a";
      c.fillRect(58, 62, 3, 3);
      if (!reducedMotion.matches) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={W} height={H} className="pixel-canvas h-auto w-full max-w-md" aria-hidden="true" />;
}
