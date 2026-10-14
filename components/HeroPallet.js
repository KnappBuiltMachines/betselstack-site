"use client";

// components/HeroPallet.js
// Live, self-building 3D unit load for the home page hero.
// Pure <canvas> — no 3D library, nothing to install.
// Cases drop onto a 48x40 GMA pallet layer by layer in an interlocked
// block pattern (Ti 20 x Hi 5) while the whole load slowly turns.
// Respects prefers-reduced-motion (renders the finished load, still)
// and pauses whenever it is scrolled out of view.

import { useEffect, useRef } from "react";

const PAL_L = 48;
const PAL_W = 40;
const DECK = 4.25; // top of deck
const CL = 12, CW = 8, CH = 9; // case L x W x H (in)
const HI = 5;

// Interlocked 2-block layer: 12 cases turned 90deg + 8 cases square,
// mirrored on alternate layers so the seams never line up.
function layerRects(flip) {
  const turned = [];
  const square = [];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 6; c++) turned.push([c * CW, r * CL, CW, CL]);
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 4; c++) square.push([c * CL, r * CW, CL, CW]);
  const rects = flip
    ? [...square, ...turned.map(([x, y, w, h]) => [x, y + 2 * CW, w, h])]
    : [...turned, ...square.map(([x, y, w, h]) => [x, y + 2 * CL, w, h])];
  return rects;
}

const AMBER = [253, 180, 16];
const SILVER = [214, 219, 225];
const WOOD = [190, 140, 72];

function buildScene() {
  const pallet = [];
  // three stringers running the 48" length
  [0, 19.25, 38.5].forEach((y) =>
    pallet.push({ x: 0, y, z: 0, l: PAL_L, w: 1.5, h: 3.5, c: WOOD, k: 0.78 })
  );
  // seven top deck boards running the 40" width
  for (let i = 0; i < 7; i++) {
    const x = i * ((PAL_L - 5.5) / 6);
    pallet.push({ x, y: 0, z: 3.5, l: 5.5, w: PAL_W, h: 0.75, c: WOOD, k: 1 });
  }
  const cases = [];
  for (let z = 0; z < HI; z++) {
    const color = z % 2 ? SILVER : AMBER;
    layerRects(z % 2 === 1).forEach(([x, y, l, w], i) => {
      const g = 0.06; // small gap so every case edge reads
      cases.push({
        x: x + g, y: y + g, z: DECK + z * CH,
        l: l - 2 * g, w: w - 2 * g, h: CH - 0.05,
        c: color, k: 0.94 + ((i * 7) % 5) * 0.015, layer: z, idx: i,
      });
    });
  }
  return { pallet, cases };
}

const shade = (c, f) =>
  `rgb(${Math.min(255, c[0] * f) | 0},${Math.min(255, c[1] * f) | 0},${Math.min(255, c[2] * f) | 0})`;

const easeOutBack = (t) => {
  const c1 = 1.25, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Back-to-front order for non-overlapping boxes in one layer.
function orderBoxes(boxes, sin, cos) {
  const n = boxes.length;
  const after = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const a = boxes[i], b = boxes[j];
      let first = -1;
      if (a.x + a.l <= b.x + 1e-6) first = sin >= 0 ? i : j;
      else if (b.x + b.l <= a.x + 1e-6) first = sin >= 0 ? j : i;
      else if (a.y + a.w <= b.y + 1e-6) first = cos >= 0 ? i : j;
      else if (b.y + b.w <= a.y + 1e-6) first = cos >= 0 ? j : i;
      if (first < 0) continue;
      const second = first === i ? j : i;
      after[first].push(second);
      indeg[second]++;
    }
  const out = [];
  const q = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);
  while (q.length) {
    const i = q.shift();
    out.push(boxes[i]);
    for (const j of after[i]) if (!--indeg[j]) q.push(j);
  }
  if (out.length < n) boxes.forEach((b) => !out.includes(b) && out.push(b));
  return out;
}

export default function HeroPallet() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    const { pallet, cases } = buildScene();
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const PER = 0.085; // seconds between case drops
    const FALL = 0.55;
    const BUILD = cases.length * PER + FALL;
    const HOLD = 3.2;
    const LIFT = 0.9;
    const CYCLE = BUILD + HOLD + LIFT;
    const ELEV = 0.52; // view elevation (rad)
    const sinE = Math.sin(ELEV), cosE = Math.cos(ELEV);
    const cx0 = PAL_L / 2, cy0 = PAL_W / 2;

    let W = 0, H = 0, dpr = 1, scale = 1, ox = 0, oy = 0;
    const size = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      const diag = Math.hypot(PAL_L, PAL_W);
      const topZ = DECK + HI * CH;
      const fitW = W / (diag * 1.08);
      const fitH = H / (diag * sinE + topZ * cosE + 26);
      scale = Math.min(fitW, fitH);
      ox = W / 2;
      oy = H / 2 + (topZ * cosE * scale) / 2 - 4;
    };

    let theta = -0.62;
    const proj = (x, y, z, s, c) => {
      const dx = x - cx0, dy = y - cy0;
      const rx = dx * c - dy * s;
      const ry = dx * s + dy * c;
      return [ox + rx * scale, oy + (ry * sinE - z * cosE) * scale];
    };

    const light = [-0.55, 0.83];
    const drawBox = (b, zOff, alpha, s, c) => {
      const x0 = b.x, x1 = b.x + b.l, y0 = b.y, y1 = b.y + b.w;
      const z0 = b.z + zOff, z1 = z0 + b.h;
      const P = (x, y, z) => proj(x, y, z, s, c);
      ctx.globalAlpha = alpha;
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(0.6, scale * 0.07);
      ctx.strokeStyle = "rgba(11,12,14,0.92)";
      const faces = [
        { n: [-1, 0], p: [[x0, y0], [x0, y1]] },
        { n: [1, 0], p: [[x1, y1], [x1, y0]] },
        { n: [0, -1], p: [[x1, y0], [x0, y0]] },
        { n: [0, 1], p: [[x0, y1], [x1, y1]] },
      ];
      for (const f of faces) {
        const rnx = f.n[0] * c - f.n[1] * s;
        const rny = f.n[0] * s + f.n[1] * c;
        if (rny <= 0) continue;
        const lit = 0.58 + 0.3 * Math.max(0, rnx * light[0] + rny * light[1]);
        const [a, d] = f.p;
        const pts = [P(a[0], a[1], z0), P(d[0], d[1], z0), P(d[0], d[1], z1), P(a[0], a[1], z1)];
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        ctx.closePath();
        ctx.fillStyle = shade(b.c, lit * b.k);
        ctx.fill();
        ctx.stroke();
      }
      const top = [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)];
      ctx.beginPath();
      top.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.closePath();
      ctx.fillStyle = shade(b.c, 1.04 * b.k);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const draw = (t) => {
      const s = Math.sin(theta), c = Math.cos(theta);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // floor shadow
      const [sx, sy] = proj(cx0, cy0, 0, s, c);
      const rad = Math.hypot(PAL_L, PAL_W) * 0.62 * scale;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
      g.addColorStop(0, "rgba(0,0,0,0.55)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(1, sinE * 1.1);
      ctx.translate(-sx, -sy);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // pallet: stringers, then deck boards
      orderBoxes(pallet.slice(0, 3), s, c).forEach((b) => drawBox(b, 0, 1, s, c));
      orderBoxes(pallet.slice(3), s, c).forEach((b) => drawBox(b, 0, 1, s, c));

      // load
      const lifting = t > BUILD + HOLD;
      const liftT = lifting ? Math.min(1, (t - BUILD - HOLD) / LIFT) : 0;
      for (let z = 0; z < HI; z++) {
        const layer = cases.filter((b) => b.layer === z);
        const live = [];
        for (const b of layer) {
          const start = (z * layer.length + b.idx) * PER;
          const k = Math.min(1, Math.max(0, (t - start) / FALL));
          if (k <= 0) continue;
          let zOff = (1 - easeOutBack(k)) * 26;
          let alpha = Math.min(1, k * 2.2);
          if (lifting) {
            zOff += liftT * liftT * 14 * (1 + z * 0.35);
            alpha *= 1 - liftT;
          }
          live.push({ b, zOff, alpha });
        }
        const order = orderBoxes(live.map((l) => l.b), s, c);
        order.forEach((b) => {
          const l = live.find((v) => v.b === b);
          drawBox(b, l.zOff, l.alpha, s, c);
        });
      }
    };

    size();
    let raf = 0;
    let last = performance.now();
    let clock = reduce ? BUILD + 0.01 : 0;
    let visible = true;

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock = (clock + dt) % CYCLE;
      theta += dt * 0.16;
      draw(clock);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const ro = new ResizeObserver(() => {
      size();
      draw(reduce ? BUILD + 0.01 : clock);
    });
    ro.observe(wrap);

    let io;
    if (reduce) {
      draw(clock);
    } else {
      io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      });
      io.observe(wrap);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io && io.disconnect();
    };
  }, []);

  return (
    <div className="hp-stage" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A pallet load building itself in 3D: twenty cases per layer, five layers, interlocked"
      />
      <div className="hp-hud" aria-hidden="true">
        <span><b>Ti</b> 20</span>
        <span><b>Hi</b> 5</span>
        <span><b>100</b> cases</span>
        <span className="hp-hud-ok">Interlocked</span>
      </div>
    </div>
  );
}
