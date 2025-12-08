// frontend/src/components/SvgMapViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import { useDataStore } from "../state/useDataStore";

/**
 * SvgMapViewer
 * Props:
 *  - containerClassName?: string  (optional, e.g. "h-[560px]")
 *
 * Behavior:
 *  - Accepts an uploaded SVG file
 *  - Renders SVG markup inside a container preserving viewBox scaling
 *  - Overlays bots as circles positioned by mapping (x,y) in viewBox space -> pixels
 *  - Simulates random movement for bots if positions missing
 */

type Props = {
  containerClassName?: string;
};

export default function SvgMapViewer({ containerClassName = "h-[520px]" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgWrapperRef = useRef<HTMLDivElement | null>(null);
  const bots = useDataStore((s) => s.bots || []);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<{ minX: number; minY: number; vbW: number; vbH: number } | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // initialize bot positions to random points in viewBox
  useEffect(() => {
    if (!viewBox) return;
    setPositions((prev) => {
      const next = { ...prev };
      for (const b of bots) {
        if (!next[b.id]) {
          next[b.id] = {
            x: viewBox.minX + Math.random() * viewBox.vbW,
            y: viewBox.minY + Math.random() * viewBox.vbH,
          };
        }
      }
      return next;
    });
  }, [bots, viewBox]);

  // random-walk simulation (client-side)
  useEffect(() => {
    if (!viewBox) return;
    const id = window.setInterval(() => {
      setPositions((prev) => {
        const next = { ...prev };
        for (const b of bots) {
          const p = next[b.id] ?? { x: viewBox.minX + Math.random() * viewBox.vbW, y: viewBox.minY + Math.random() * viewBox.vbH };
          // random small delta scaled by viewBox size
          const dx = (Math.random() - 0.5) * (viewBox.vbW * 0.02);
          const dy = (Math.random() - 0.5) * (viewBox.vbH * 0.02);
          let nx = p.x + dx;
          let ny = p.y + dy;
          // clamp inside viewBox
          nx = Math.max(viewBox.minX, Math.min(viewBox.minX + viewBox.vbW, nx));
          ny = Math.max(viewBox.minY, Math.min(viewBox.minY + viewBox.vbH, ny));
          next[b.id] = { x: nx, y: ny };
        }
        return next;
      });
    }, 500); // update every 500ms
    return () => clearInterval(id);
  }, [bots, viewBox]);

  // helper: parse uploaded SVG text and extract viewBox
  function handleSvgText(text: string) {
    setSvgMarkup(text);
    // Try to parse viewBox from markup
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) {
        setViewBox(null);
        return;
      }
      const vb = svg.getAttribute("viewBox");
      if (vb) {
        const [minX, minY, vbW, vbH] = vb.split(/\s+|,/).map(Number);
        setViewBox({ minX, minY, vbW, vbH });
        return;
      }
      // fallback to width/height attributes
      const w = Number(svg.getAttribute("width") || 0);
      const h = Number(svg.getAttribute("height") || 0);
      if (w && h) {
        setViewBox({ minX: 0, minY: 0, vbW: w, vbH: h });
        return;
      }
      setViewBox(null);
    } catch (err) {
      setViewBox(null);
    }
  }

  // file input change handler
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result ?? "");
      handleSvgText(txt);
    };
    reader.readAsText(f);
  }

  // Map viewBox coords to pixel coordinates inside svgWrapperRef
  // function mapToPixel(x: number, y: number) {
  //   const wrap = svgWrapperRef.current;
  //   if (!wrap || !viewBox) return { px: 0, py: 0 };
  //   const rect = wrap.getBoundingClientRect();
  //   const scaleX = rect.width / viewBox.vbW;
  //   const scaleY = rect.height / viewBox.vbH;
  //   // const px = (x - viewBox.minX) * scaleX + rect.left;
  //   // const py = (y - viewBox.minY) * scaleY + rect.top;
  //   // convert to local coords relative to wrapper
  //   return { px: (x - viewBox.minX) * scaleX, py: (y - viewBox.minY) * scaleY };
  // }

  return (
    <div className={containerClassName + " relative"} ref={containerRef}>
      <div className="flex items-center gap-3 mb-3">
        <label className="inline-flex items-center gap-2 px-3 py-2 border rounded bg-white/80 dark:bg-slate-800/70 cursor-pointer">
          Upload SVG
          <input onChange={onFileChange} accept=".svg" type="file" className="hidden" />
        </label>

        <div className="text-sm text-slate-500">Drop an SVG layout file to render. Bots will be shown on top.</div>
      </div>

      <div
        ref={svgWrapperRef}
        className="w-full h-full bg-white/10 rounded border overflow-hidden relative flex items-center justify-center"
        style={{ minHeight: 280 }}
      >
        {/* Render SVG markup if provided, otherwise show prompt */}
        {svgMarkup ? (
          // Danger note: we insert sanitized-looking markup. For production consider using DOMPurify.
          <div
            className="absolute inset-0"
            style={{ pointerEvents: "none" }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="text-slate-500">No SVG loaded — upload a warehouse layout (SVG).</div>
        )}

        {/* overlay: positioned container for bot markers */}
        {viewBox && (
          <div className="absolute inset-0 pointer-events-none">
            {/* For each bot at positions[b.id], draw a circle */}
            {bots.map((b) => {
              const pos = positions[b.id];
              if (!pos) return null;
              // calculate pixel position relative to wrapper
              const wrapRect = svgWrapperRef.current?.getBoundingClientRect();
              const wrapWidth = wrapRect?.width ?? 0;
              const wrapHeight = wrapRect?.height ?? 0;
              const sx = (pos.x - viewBox.minX) / viewBox.vbW;
              const sy = (pos.y - viewBox.minY) / viewBox.vbH;
              const left = sx * wrapWidth;
              const top = sy * wrapHeight;
              const size = 16 + Math.min(12, Math.max(0, (b.speed ?? 0) * 6)); // size hint based on speed
              return (
                <div key={b.id} style={{ position: "absolute", left: left - size / 2, top: top - size / 2, width: size, height: size, pointerEvents: "auto" }}>
                  <div
                    title={`${b.name} • ${b.status} • ${b.battery}%`}
                    style={{
                      width: size,
                      height: size,
                      borderRadius: 999,
                      background: b.status === "error" ? "linear-gradient(90deg,#ff7a7a,#ff3b3b)" : "linear-gradient(90deg,#7c3aed,#4f46e5)",
                      boxShadow: "0 6px 18px rgba(16,24,40,0.24)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {String(b.name).split("-")[1] ?? "B"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
