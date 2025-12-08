// SvgLayoutMapPage code
import React, { useEffect, useRef, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Card from "../components/ui/card";
import { useDataStore } from "../state/useDataStore";

type BotSim = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  speed: number; 
};

const SAMPLE_SVG = `
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .rack { fill: #0f1724; stroke: #111827; stroke-width: 2; }
      .floor { fill: #0b1220; }
      .label { font-family: "Poppins", sans-serif; font-size: 14px; fill: #9aa7c7; }
    </style>
  </defs>

  <rect width="100%" height="100%" fill="#081426"/>
  <!-- racks -->
  <g transform="translate(40,40)">
    <rect x="0" y="0" width="720" height="520" fill="#071125" stroke="#0b1220" />
    <!-- aisles (3 vertical racks blocks) -->
    <g fill="#0b1b2b">
      <rect x="20" y="20" width="140" height="480" class="rack" />
      <rect x="200" y="20" width="140" height="480" class="rack" />
      <rect x="380" y="20" width="140" height="480" class="rack" />
      <rect x="560" y="20" width="140" height="480" class="rack" />
    </g>

    <!-- zone labels -->
    <text x="360" y="-6" class="label" text-anchor="middle">Warehouse Layout (sample)</text>
  </g>
</svg>
`;

function randColorForStatus(status?: string) {
  if (status === "error") return "#EF4444";
  if (status === "charging") return "#F59E0B";
  if (status === "busy") return "#4F46E5";
  return "#10B981";
}

export default function SvgLayoutMapPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const botsLayerRef = useRef<SVGGElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const storeBots = useDataStore((s: any) => s.bots) ?? null;

 
  const [bots, setBots] = useState<BotSim[]>(() => {
    if (storeBots && storeBots.length) {
      return storeBots.slice(0, 12).map((b: any, i: number) => ({
        id: b.id ?? `b-${i}`,
        name: b.name ?? `Bot${i + 1}`,
        x: (b.x ?? Math.random() * 600) || Math.random() * 600,
        y: (b.y ?? Math.random() * 400) || Math.random() * 400,
        color: randColorForStatus(b.status),
        speed: 0.8 + Math.random() * 1.8,
      }));
    }
   
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `sim-${i}`,
      name: `B${i + 1}`,
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 360,
      color: ["#10B981", "#4F46E5", "#F59E0B", "#EF4444"][Math.floor(Math.random() * 4)],
      speed: 0.5 + Math.random() * 1.6,
    }));
  });

  const [svgContent, setSvgContent] = useState<string>(SAMPLE_SVG);
  const [isRunning, setRunning] = useState(true);
  const [viewBox, setViewBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // -- helpers to parse viewBox --
  function parseViewBox(svgEl: SVGSVGElement | null) {
    if (!svgEl) return null;
    const vb = svgEl.getAttribute("viewBox");
    if (vb) {
      const parts = vb.split(/\s+|,/).map((p) => parseFloat(p));
      if (parts.length >= 4 && parts.every((n) => !Number.isNaN(n))) {
        return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
      }
    }
    // fallback to width/height attributes or bounding box
    const wAttr = svgEl.getAttribute("width");
    const hAttr = svgEl.getAttribute("height");
    let w = wAttr ? parseFloat(wAttr as string) : null;
    let h = hAttr ? parseFloat(hAttr as string) : null;

    let bbox: DOMRect | null = null;
    try {
    
      const b = (svgEl as any).getBBox?.();
      if (b) bbox = b;
    } catch (e) {
      bbox = null;
    }

    if ((!w || !h) && bbox) {
      w = w || bbox.width || 800;
      h = h || bbox.height || 600;
    }
    if (w && h) return { x: 0, y: 0, w, h };
    return { x: 0, y: 0, w: 800, h: 600 };
  }

  // inject SVG into container and create bots layer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // set HTML
    container.innerHTML = svgContent;

    // find injected svg element
    let svg = container.querySelector("svg") as SVGSVGElement | null;
    if (!svg) {
      console.warn("Uploaded file did not contain <svg> element; using sample.");
      container.innerHTML = SAMPLE_SVG;
      svg = container.querySelector("svg") as SVGSVGElement | null;
    }

    if (!svg) return;

    svgRef.current = svg;

    // ensure preserveAspectRatio is set so scaling is consistent
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // ensure the svg has pointerEvents so we can interact
    svg.style.pointerEvents = "auto";

    // compute viewBox
    const vb = parseViewBox(svg);
    setViewBox(vb);

    // Create (or replace) bots layer
    let botsLayer = svg.querySelector("#bots-layer") as SVGGElement | null;
    if (botsLayer) botsLayer.remove();

    botsLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    botsLayer.setAttribute("id", "bots-layer");
    // ensure topmost
    svg.appendChild(botsLayer);
    botsLayerRef.current = botsLayer;

    // set initial bots positions (clamped to vb) — only if vb is valid
    if (vb) {
      setBots((prev) =>
        prev.map((b) => ({
          ...b,
          x: Math.max(vb.x + 10, Math.min(vb.x + vb.w - 10, b.x)),
          y: Math.max(vb.y + 10, Math.min(vb.y + vb.h - 10, b.y)),
        }))
      );
    }
  }, [svgContent]);

  // draw bots (create circle + label) whenever bots or svg change
  useEffect(() => {
    const svg = svgRef.current;
    const layer = botsLayerRef.current;
    if (!svg || !layer || !viewBox) return;

    // clear existing
    while (layer.firstChild) layer.removeChild(layer.firstChild);

    bots.forEach((b) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-bot-id", b.id);

      const shadow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      shadow.setAttribute("r", "12");
      shadow.setAttribute("cx", String(b.x));
      shadow.setAttribute("cy", String(b.y + 6));
      shadow.setAttribute("fill", "#000");
      shadow.setAttribute("opacity", "0.2");
      g.appendChild(shadow);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", "10");
      circle.setAttribute("cx", String(b.x));
      circle.setAttribute("cy", String(b.y));
      circle.setAttribute("fill", b.color);
      circle.setAttribute("stroke", "#000");
      circle.setAttribute("stroke-opacity", "0.18");
      circle.setAttribute("id", `bot-${b.id}`);
      g.appendChild(circle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(b.x));
      label.setAttribute("y", String(b.y + 4));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "10");
      label.setAttribute("fill", "#fff");
      label.setAttribute("font-weight", "700");
      label.textContent = b.name.slice(0, 2).toUpperCase();
      g.appendChild(label);

      // append group
      layer.appendChild(g);
    });
  }, [bots, viewBox, svgContent]);

  // simulation loop: update bot positions randomly, move DOM elements
  useEffect(() => {
    if (!isRunning || !viewBox) return;

    // capture non-null, destructured viewBox for the closure
    const { x: vbX, y: vbY, w: vbW, h: vbH } = viewBox;
    const pad = 12;

    const step = () => {
      setBots((prev) => {
        const next = prev.map((b) => {
          // random small delta proportional to speed
          const dx = (Math.random() - 0.5) * 2 * b.speed * 8;
          const dy = (Math.random() - 0.5) * 2 * b.speed * 6;
          let nx = b.x + dx;
          let ny = b.y + dy;

          // clamp to inside viewBox with padding
          nx = Math.max(vbX + pad, Math.min(vbX + vbW - pad, nx));
          ny = Math.max(vbY + pad, Math.min(vbY + vbH - pad, ny));

          return { ...b, x: nx, y: ny };
        });

        // update DOM elements immediately for smoother visual feedback
        const layer = botsLayerRef.current;
        if (layer) {
          next.forEach((b) => {
            const grp = layer.querySelector(`g[data-bot-id="${b.id}"]`) as SVGGElement | null;
            if (!grp) return;
            const circle = grp.querySelector(`#bot-${b.id}`) as SVGCircleElement | null;
            const text = grp.querySelector("text") as SVGTextElement | null;
            const shadow = grp.querySelector("circle") as SVGCircleElement | null;
            if (circle) {
              circle.setAttribute("cx", String(b.x));
              circle.setAttribute("cy", String(b.y));
            }
            if (text) {
              text.setAttribute("x", String(b.x));
              text.setAttribute("y", String(b.y + 4));
            }
            if (shadow) {
              shadow.setAttribute("cx", String(b.x));
              shadow.setAttribute("cy", String(b.y + 6));
            }
          });
        }

        return next;
      });

      // queue next animation frame
      rafRef.current = requestAnimationFrame(step);
    };

    // start loop
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isRunning, viewBox]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // file input handler
  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      // simple safety: ensure text contains <svg
      if (!text.includes("<svg")) {
        alert("File does not appear to contain an <svg> element.");
        return;
      }
      setSvgContent(text);
    };
    reader.onerror = () => {
      alert("Failed to read file.");
    };
    reader.readAsText(f);
  }

  function resetBots() {
    setBots((prev) =>
      prev.map((b) => {
        const nx = viewBox ? viewBox.x + 20 + Math.random() * (viewBox.w - 40) : 100 + Math.random() * 600;
        const ny = viewBox ? viewBox.y + 20 + Math.random() * (viewBox.h - 40) : 100 + Math.random() * 400;
        return { ...b, x: nx, y: ny };
      })
    );
  }

  function loadSample() {
    setSvgContent(SAMPLE_SVG);
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">SVG Layout Map (Upload)</h2>
              <div className="text-sm text-slate-500">
                Upload a warehouse SVG, then watch bots move around (simulated).
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept=".svg" onChange={onFileInput} className="hidden" />
                <div className="btn btn-ghost">Upload SVG</div>
              </label>

              <button onClick={loadSample} className="btn btn-primary">
                Use sample SVG
              </button>

              <button
                onClick={() => setRunning((s) => !s)}
                className={`px-3 py-1 rounded ${
                  isRunning ? "bg-red-500 text-white" : "bg-emerald-600 text-white"
                }`}
              >
                {isRunning ? "Stop" : "Start"}
              </button>

              <button onClick={resetBots} className="btn btn-ghost">
                Reset bots
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div ref={containerRef} style={{ width: "100%", height: "680px", overflow: "auto" }} />
        </Card>

        <div className="text-xs text-slate-500">
          Notes: Movement is simulated and random. SVG rendering is direct — uploaded SVG is inserted into the page (do
          not upload untrusted SVGs on a public server).
        </div>
      </div>
    </MainLayout>
  );
}
