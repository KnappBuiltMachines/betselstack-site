"use client";

// components/HeroSteps.js
// Home page hero animation (Nov 2026). One case, followed step by step:
//   01 Case -> 02 Layer -> 03 Pallet -> 04 Trailer -> 05 Truck -> 06 Warehouse
//
// Every step is the same kind of picture: an isometric rendering in the
// amber case style, drawn from real numbers (12 x 9 x 6.5 in case,
// 48 x 40 pallet, 17 cases per layer x 7 layers = 119 cases, 26 pallets
// in a 53' trailer). Nothing to upload; it is all generated here.
//
// Behavior
//   - Advances on its own every STEP_MS. The active tab shows a progress bar.
//   - Visitors can click any step. Hovering or focusing the animation pauses it.
//   - Pauses while it is off screen or the browser tab is hidden.
//   - Reduced motion: no auto-advance and no drop-in effects; tabs still work.
//
// Styled by app/home.css (hs- classes).

import { useEffect, useRef, useState } from "react";

const STEP_MS = 4200;

/* ------------------------------------------------------------------
   isometric helpers (units are inches)
   x runs to the lower right, y to the lower left, z is up.
------------------------------------------------------------------- */
const C = Math.cos(Math.PI / 6);
const S = Math.sin(Math.PI / 6);
const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];
const pts = (list) => list.map(([x, y, z]) => P(x, y, z).map((n) => n.toFixed(2)).join(",")).join(" ");

const AMBER = { top: "var(--amber-soft)", left: "var(--amber)", right: "var(--amber-deep)" };
const WOOD = { top: "#b9823c", left: "#94642a", right: "#77501f" };
const STEEL = { top: "#5b636e", left: "#454c56", right: "#363c45" };
const SHELL = { top: "#2a313b", left: "#1f252d", right: "#181c22" };
const SEAM = "rgba(0,0,0,.28)";
const SILVER = { top: "#e4e7eb", left: "#c7ccd2", right: "#9aa1ab" };

// A box with its three visible faces. b = [x, y, z, dx, dy, dz]
function Box({ b, c = AMBER, seam = SEAM, sw = 0.6, tape = false, style, className }) {
  const [x, y, z, dx, dy, dz] = b;
  const X = x + dx, Y = y + dy, Z = z + dz;
  return (
    <g style={style} className={className}>
      <polygon points={pts([[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]])} fill={c.left} stroke={seam} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={pts([[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]])} fill={c.right} stroke={seam} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={pts([[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]])} fill={c.top} stroke={seam} strokeWidth={sw} strokeLinejoin="round" />
      {tape && (
        <polyline
          points={pts(dx >= dy ? [[x, y + dy / 2, Z], [X, y + dy / 2, Z]] : [[x + dx / 2, y, Z], [x + dx / 2, Y, Z]])}
          stroke="rgba(0,0,0,.16)" strokeWidth={Math.min(dx, dy) * 0.16} fill="none"
        />
      )}
    </g>
  );
}

// A 48 x 40 pallet: three runners and a deck. Origin at (x, y, z).
function Pallet({ x = 0, y = 0, z = 0, L = 48, W = 40 }) {
  const runners = [0, (W - 4) / 2, W - 4];
  return (
    <g>
      {runners.map((ry) => <Box key={ry} b={[x, y + ry, z, L, 4, 4]} c={WOOD} />)}
      <Box b={[x, y, z + 4, L, W, 1.5]} c={WOOD} />
    </g>
  );
}

// 17 cases per layer on a 48 x 40 pallet: 12 cases (12 x 9) plus 5 turned (9 x 12).
function layerCases(mirror) {
  const out = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) out.push([c * 12, r * 9, 12, 9]);
  const off = (48 - 45) / 2;
  for (let c = 0; c < 5; c++) out.push([off + c * 9, 27.5, 9, 12]);
  if (!mirror) return out;
  return out.map(([x, y, dx, dy]) => [48 - x - dx, 40 - y - dy, dx, dy]);
}
const byDepth = (a, b) => a[0] + a[1] - (b[0] + b[1]);

function fitBox(boxes, pad = 6) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  boxes.forEach(([x, y, z, dx, dy, dz]) => {
    for (const cx of [x, x + dx]) for (const cy of [y, y + dy]) for (const cz of [z, z + dz]) {
      const [sx, sy] = P(cx, cy, cz);
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    }
  });
  return `${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${(maxX - minX + pad * 2).toFixed(1)} ${(maxY - minY + pad * 2).toFixed(1)}`;
}

// a small floor shadow under a footprint
function Shadow({ L, W, x = 0, y = 0, grow = 4 }) {
  return <polygon points={pts([[x - grow, y - grow, 0], [x + L + grow, y - grow, 0], [x + L + grow, y + W + grow, 0], [x - grow, y + W + grow, 0]])} fill="rgba(0,0,0,.35)" />;
}

/* ------------------------------------------------------------------
   the six scenes
------------------------------------------------------------------- */
function SceneCase() {
  const b = [0, 0, 0, 12, 9, 6.5];
  const k = "var(--silver)";
  return (
    <svg viewBox={fitBox([[-3, -3, 0, 19, 15, 8]], 3)} className="hs-svg" aria-hidden="true">
      <Shadow L={12} W={9} grow={1.2} />
      <g className="hs-pop"><Box b={b} sw={0.12} tape /></g>
      <g stroke={k} strokeWidth=".12" opacity=".7" fill="none" className="hs-fade" style={{ "--d": ".35s" }}>
        <polyline points={pts([[0, 10.6, 0], [12, 10.6, 0]])} />
        <polyline points={pts([[13.6, 0, 0], [13.6, 9, 0]])} />
        <polyline points={pts([[12, -1.6, 0], [12, -1.6, 6.5]])} />
      </g>
      <g fill="var(--text)" fontFamily="var(--display)" fontWeight="600" fontSize="1.35" className="hs-fade" style={{ "--d": ".5s" }}>
        <text {...xy(P(5, 12.6, 0))} textAnchor="middle">12″</text>
        <text {...xy(P(15.6, 4.5, 0))} textAnchor="middle">9″</text>
        <text {...xy(P(12, -1.6, 3.4), 0.9)}>6.5″</text>
      </g>
    </svg>
  );
}
const xy = ([x, y], dx = 0) => ({ x: (x + dx).toFixed(2), y: y.toFixed(2) });

function SceneLayer() {
  const cases = layerCases(false).sort(byDepth);
  return (
    <svg viewBox={fitBox([[-2, -2, 0, 52, 44, 13]])} className="hs-svg" aria-hidden="true">
      <Shadow L={48} W={40} />
      <Pallet />
      {cases.map(([x, y, dx, dy], i) => (
        <Box key={i} b={[x, y, 5.5, dx, dy, 6.5]} sw={0.35} className="hs-drop" style={{ "--d": `${0.15 + i * 0.07}s` }} />
      ))}
    </svg>
  );
}

function ScenePallet() {
  const layers = [];
  for (let l = 0; l < 7; l++) layers.push(layerCases(l % 2 === 1).sort(byDepth));
  return (
    <svg viewBox={fitBox([[-2, -2, 0, 52, 44, 52]])} className="hs-svg" aria-hidden="true">
      <Shadow L={48} W={40} />
      <Pallet />
      {layers.map((cases, l) => (
        <g key={l} className="hs-drop" style={{ "--d": `${0.1 + l * 0.16}s` }}>
          {cases.map(([x, y, dx, dy], i) => (
            <Box key={i} b={[x, y, 5.5 + l * 6.5, dx, dy, 6.5]} sw={0.3} />
          ))}
        </g>
      ))}
    </svg>
  );
}

// One loaded pallet shown as a block with layer lines (for the wide scenes).
function Load({ x, y, z = 0, L = 48, W = 40, layers = 7, h = 6.5, sw = 0.5 }) {
  const lines = [];
  for (let l = 1; l < layers; l++) lines.push(5.5 + l * h);
  return (
    <g>
      <Pallet x={x} y={y} z={z} L={L} W={W} />
      <Box b={[x, y, z + 5.5, L, W, layers * h]} sw={sw} />
      {lines.map((lz) => (
        <polyline key={lz} points={pts([[x, y + W, z + lz], [x + L, y + W, z + lz], [x + L, y, z + lz]])} stroke={SEAM} strokeWidth={sw} fill="none" />
      ))}
    </g>
  );
}

// 53' trailer, inside 630 x 98 in. 13 rows of 2 pallets (48 long, 40 wide).
const TRAILER_L = 636, TRAILER_W = 100, TRAILER_H = 110;
const ROWS = Array.from({ length: 13 }, (_, r) => r);

function SceneTrailer() {
  const deckZ = 8;
  return (
    <svg viewBox={fitBox([[-10, -10, 0, TRAILER_L + 20, TRAILER_W + 20, TRAILER_H + 14]])} className="hs-svg" aria-hidden="true">
      <Shadow L={TRAILER_L} W={TRAILER_W} grow={6} />
      {/* far walls (back + left), then floor */}
      <Box b={[0, -3, deckZ, TRAILER_L, 3, TRAILER_H]} c={SHELL} sw={1} />
      <Box b={[-3, -3, deckZ, 3, TRAILER_W + 3, TRAILER_H]} c={SHELL} sw={1} />
      <Box b={[0, 0, 0, TRAILER_L, TRAILER_W, deckZ]} c={STEEL} sw={1} />
      {ROWS.map((r) =>
        [6, 54].map((py) => (
          <g key={`${r}-${py}`} className="hs-slide" style={{ "--d": `${0.1 + r * 0.09}s` }}>
            <Load x={4 + r * 48.4} y={py} z={deckZ} sw={0.9} />
          </g>
        ))
      )}
      {/* center-of-mass marker */}
      <g className="hs-fade" style={{ "--d": "1.45s" }}>
        <circle cx={P(TRAILER_L / 2, TRAILER_W / 2, deckZ + 62)[0]} cy={P(TRAILER_L / 2, TRAILER_W / 2, deckZ + 62)[1]} r="9" fill="#7ee2a1" stroke="#0b0c0e" strokeWidth="3" />
      </g>
    </svg>
  );
}

function Wheel({ x, y }) {
  // a 40 in tire on the near (y = max) side, drawn in the side plane
  const ring = (r) => Array.from({ length: 24 }, (_, i) => {
    const t = (i / 24) * Math.PI * 2;
    return [x + r * Math.cos(t), y, 20 + r * Math.sin(t)];
  });
  return (
    <g>
      <polygon points={pts(ring(20))} fill="#08090b" stroke="#2a3038" strokeWidth="3" />
      <polygon points={pts(ring(8))} fill="#5b636e" />
    </g>
  );
}

function SceneTruck() {
  const zT = 44; // trailer floor height above the road
  return (
    <svg viewBox={fitBox([[-40, -20, 0, 900, 150, 170]], 4)} className="hs-svg" aria-hidden="true">
      {/* road + lane marks */}
      <polygon points={pts([[-120, -60, 0], [880, -60, 0], [880, 180, 0], [-120, 180, 0]])} fill="#101317" />
      <g className="hs-road">
        {[-80, 40, 160, 280, 400, 520, 640, 760].map((x) => (
          <polygon key={x} points={pts([[x, 150, 0], [x + 60, 150, 0], [x + 60, 156, 0], [x, 156, 0]])} fill="var(--amber)" opacity=".55" />
        ))}
      </g>
      <g className="hs-pop">
        {/* trailer box */}
        <Box b={[0, 0, zT, TRAILER_L, TRAILER_W, TRAILER_H]} c={SILVER} sw={1.2} />
        <polygon points={pts([[0, TRAILER_W, zT], [TRAILER_L, TRAILER_W, zT], [TRAILER_L, TRAILER_W, zT + 8], [0, TRAILER_W, zT + 8]])} fill="#363c45" />
        {/* brand stripe on the side */}
        <polygon points={pts([[60, TRAILER_W, zT + 54], [420, TRAILER_W, zT + 54], [420, TRAILER_W, zT + 62], [60, TRAILER_W, zT + 62]])} fill="var(--amber)" opacity=".85" />
        {/* tractor */}
        <Box b={[650, 4, 30, 130, 92, 54]} c={AMBER} sw={1.2} />
        <Box b={[650, 4, 84, 70, 92, 52]} c={AMBER} sw={1.2} />
        <polygon points={pts([[720, 14, 112], [720, 86, 112], [720, 86, 90], [720, 14, 90]])} fill="#3b5266" />
        <polygon points={pts([[780, 14, 74], [780, 30, 74], [780, 30, 64], [780, 14, 64]])} fill="#ffe6a3" />
        <polygon points={pts([[780, 70, 74], [780, 86, 74], [780, 86, 64], [780, 70, 64]])} fill="#ffe6a3" />
        {[90, 150, 690, 750].map((wx) => <Wheel key={wx} x={wx} y={TRAILER_W} />)}
        {[540, 600].map((wx) => <Wheel key={wx} x={wx} y={TRAILER_W} />)}
      </g>
    </svg>
  );
}

function SceneWarehouse() {
  const bayL = 104, bays = 3, levels = 3, levelH = 62, depth = 44;
  const uprights = Array.from({ length: bays + 1 }, (_, i) => i * bayL);
  const loads = [];
  for (let lv = 0; lv < levels; lv++)
    for (let b = 0; b < bays; b++)
      for (let p = 0; p < 2; p++) loads.push({ lv, b, p });
  const height = levels * levelH + 6;
  return (
    <svg viewBox={fitBox([[-12, -6, 0, bays * bayL + 24, depth + 70, height + 6]])} className="hs-svg" aria-hidden="true">
      <polygon points={pts([[-12, -6, 0], [bays * bayL + 12, -6, 0], [bays * bayL + 12, depth + 64, 0], [-12, depth + 64, 0]])} fill="#14181d" />
      {/* back uprights */}
      {uprights.map((ux) => <Box key={`b${ux}`} b={[ux - 2, 0, 0, 4, 3, height]} c={STEEL} sw={0.6} />)}
      {Array.from({ length: levels }, (_, lv) => {
        const z = lv * levelH;
        return (
          <g key={lv}>
            {/* beams */}
            {lv > 0 && <Box b={[0, 0, z - 4, bays * bayL, 3, 4]} c={{ top: "var(--amber-soft)", left: "var(--amber-deep)", right: "var(--amber-deep)" }} sw={0.5} />}
            {loads.filter((l) => l.lv === lv).sort((a, c) => a.b * 2 + a.p - (c.b * 2 + c.p)).map(({ b, p }) => (
              <g key={`${b}-${p}`} className="hs-drop" style={{ "--d": `${0.1 + (lv * 6 + b * 2 + p) * 0.06}s` }}>
                <Load x={b * bayL + 4 + p * 50} y={2} z={z} L={46} W={depth - 4} layers={7} h={6.4} sw={0.5} />
              </g>
            ))}
            {lv > 0 && <Box b={[0, depth - 3, z - 4, bays * bayL, 3, 4]} c={{ top: "var(--amber-soft)", left: "var(--amber)", right: "var(--amber-deep)" }} sw={0.5} />}
          </g>
        );
      })}
      {/* front uprights */}
      {uprights.map((ux) => <Box key={`f${ux}`} b={[ux - 2, depth - 3, 0, 4, 3, height]} c={STEEL} sw={0.6} />)}
    </svg>
  );
}

const STEPS = [
  { key: "case", label: "Case", title: "It starts with one box.", chip: "12 × 9 × 6.5 in case · 48 × 40 pallet", Scene: SceneCase },
  { key: "layer", label: "Layer", title: "Every layer, mapped.", chip: "17 cases per layer · 95.6% efficient", Scene: SceneLayer },
  { key: "pallet", label: "Pallet", title: "The full pallet, in 3D.", chip: "119 cases · 51 in tall · 0 in overhang", Scene: ScenePallet },
  { key: "trailer", label: "Trailer", title: "Fill the trailer. Keep it balanced.", chip: "26 pallets · center of mass ✓", Scene: SceneTrailer },
  { key: "truck", label: "Truck", title: "More product on every trip.", chip: "3,094 cases on one truck", Scene: SceneTruck },
  { key: "dc", label: "Warehouse", title: "Arrives ready for the shelf.", chip: "Branded report shared in 1 click", Scene: SceneWarehouse },
];

export default function HeroSteps() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduce, setReduce] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress bar
  const root = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduce(mq.matches);
    set();
    mq.addEventListener?.("change", set);

    let io;
    if ("IntersectionObserver" in window && root.current) {
      io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
      io.observe(root.current);
    }
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener?.("change", set);
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const running = !paused && visible && !reduce;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setActive((a) => (a + 1) % STEPS.length);
      setCycle((c) => c + 1);
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [running, active, cycle]);

  function go(i) {
    setActive(i);
    setCycle((c) => c + 1);
  }

  const s = STEPS[active];

  return (
    <div
      ref={root}
      className={`hs ${reduce ? "hs--still" : ""} ${running ? "" : "is-paused"}`}
      style={{ "--hs-ms": `${STEP_MS}ms` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <figure className="hs-frame" role="img" aria-label={`Step ${active + 1} of ${STEPS.length}: ${s.label}. ${s.title} ${s.chip}`}>
        <div className="hs-stage">
          {STEPS.map(({ key, Scene }, i) => (
            <div key={key} className={`hs-scene ${i === active ? "is-on" : ""}`}>
              {/* the active scene re-mounts each time so its build-up replays */}
              {i === active ? <Scene key={cycle} /> : <Scene />}
            </div>
          ))}
        </div>
        <figcaption className="hs-cap" aria-hidden="true">
          <span className="hs-n">{String(active + 1).padStart(2, "0")}</span>
          <span>
            <b>{s.title}</b>
            <em>{s.chip}</em>
          </span>
        </figcaption>
      </figure>

      <ol className="hs-rail" aria-label="Steps">
        {STEPS.map((st, i) => (
          <li key={st.key}>
            <button
              type="button"
              className={i === active ? "is-on" : i < active ? "is-done" : ""}
              aria-current={i === active ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="hs-bar">
                {i === active && <i key={cycle} />}
              </span>
              {st.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
