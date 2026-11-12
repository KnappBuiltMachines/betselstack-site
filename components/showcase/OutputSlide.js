"use client";

// components/showcase/OutputSlide.js
// Slide 2 of the home showcase: ranked pattern output for the sample case
// (9.5 x 8 x 5 in on a 48 x 40 pallet, 52 in max stack height).
// Headline numbers count up, ranked rows slide in, the top pattern is picked.
// Every row is a real, buildable layer for this case (checked by hand):
//   25: 5 x 5 at 90 deg (47.5 x 40)
//   24: 6 x 4 at 0 deg (48 x 38)
//   24: 4 x 5 + 1 x 4 rotated block (38 + 8 = 46 x 40)
//   23: 3 x 5 + 2 x 4 rotated block (28.5 + 16 = 44.5 x 40)
// Cubic efficiency = cases x 380 in3 / (48 x 40 x 45 in).

import { useClock } from "./useClock";

export const OUTPUT_MS = 9000;

// mini layer: list of [x, y, w, h] in inches on a 48 x 40 pallet
const grid = (x0, cols, rows, cw, ch) => {
  const out = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) out.push([x0 + i * cw, j * ch, cw, ch]);
  return out;
};

const ROWS = [
  { name: "100% Column Stack (90°)", ti: 25, eff: "98.96", cells: grid(0.25, 5, 5, 9.5, 8) },
  { name: "100% Column Stack (0°)", ti: 24, eff: "95.00", cells: grid(0, 6, 4, 8, 9.5) },
  { name: "Interlock 2-Block", ti: 24, eff: "95.00", cells: [...grid(1, 4, 5, 9.5, 8), ...grid(39, 1, 4, 8, 9.5)] },
  { name: "Interlock 2-Block (Alt)", ti: 23, eff: "91.04", cells: [...grid(1.75, 3, 5, 9.5, 8), ...grid(30.25, 2, 4, 8, 9.5)] },
];

const KPIS = [
  { label: "Cases/Layer (TI)", value: 25, dec: 0 },
  { label: "Layers High (HI)", value: 9, dec: 0 },
  { label: "Total Cases", value: 225, dec: 0 },
  { label: "Cubic Eff", value: 98.96, dec: 2, suffix: "%" },
];

function Mini({ cells }) {
  return (
    <svg viewBox="-1 -1 50 42" className="bo-mini">
      <rect x="0" y="0" width="48" height="40" rx="1" fill="rgba(196,140,62,.25)" stroke="rgba(196,140,62,.7)" strokeWidth=".8" />
      {cells.map(([x, y, w, h], i) => (
        <rect key={i} x={x + 0.35} y={y + 0.35} width={w - 0.7} height={h - 0.7} rx=".6" fill="#3a78d8" stroke="#16294d" strokeWidth=".6" />
      ))}
    </svg>
  );
}

const ease = (p) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

export default function OutputSlide({ active, still }) {
  const t = useClock(active, OUTPUT_MS, still);
  const pick = still || t > 4300;

  return (
    <div className="bo" aria-hidden="true">
      <div className="bo-top">
        <div>
          <p className="bo-kick">Ranked patterns</p>
          <p className="bo-title">12pk Eggs Optimization</p>
        </div>
        <div className="bo-tags">
          <span>Case 9.5&times;8&times;5 in</span>
          <span>Pallet 48&times;40</span>
          <span>Max 52 in</span>
        </div>
      </div>

      <div className="bo-kpis">
        {KPIS.map((k, i) => {
          const p = ease((t - 300 - i * 120) / 1300);
          const v = (k.value * p).toFixed(k.dec);
          return (
            <div className="bo-kpi" key={k.label}>
              <p>{k.label}</p>
              <b>
                {v}
                {k.suffix}
              </b>
            </div>
          );
        })}
      </div>

      <div className="bo-table">
        <div className="bo-row bo-row--head">
          <span>#</span>
          <span>Layer</span>
          <span>Pattern</span>
          <span>TI</span>
          <span>HI</span>
          <span>Total</span>
          <span>Cubic Eff%</span>
        </div>
        {ROWS.map((r, i) => {
          const shown = still || t > 1500 + i * 420;
          return (
            <div
              key={r.name}
              className={`bo-row${shown ? " is-in" : ""}${i === 0 && pick ? " is-pick" : ""}`}
            >
              <span className="bo-rank">{i + 1}</span>
              <span>
                <Mini cells={r.cells} />
              </span>
              <span className="bo-name">
                {r.name}
                {i === 0 && <em className="bo-best">Best fit</em>}
              </span>
              <span>{r.ti}</span>
              <span>9</span>
              <span>{r.ti * 9}</span>
              <span className="bo-eff">
                <i style={{ "--p": Number(r.eff) / 100 }} />
                {r.eff}%
              </span>
            </div>
          );
        })}
      </div>

      <div className={`bo-foot${pick ? " is-on" : ""}`}>
        <span>Unit Load+Pallet 48 &times; 40 &times; 50.5 in</span>
        <span>UL+Pallet Cube 56.11 ft&sup3;</span>
        <span>53&apos; Reefer &middot; 26 pallets/truck</span>
      </div>
    </div>
  );
}
