"use client";

// components/showcase/ReportSlide.js
// Slide 4 of the home showcase: the branded PDF report, recreated from the
// "12pk Eggs Optimization" sample (A4 page, 595 x 842 pt).
// The page builds itself section by section, then a camera tours it up close
// while a checklist on the left calls out what each report includes.

import { useEffect, useRef } from "react";
import { useClock } from "./useClock";
import { drawScene3D, drawLayer2D } from "./render3d";

export const REPORT_MS = 12500;

// left checklist, with the time (ms) each item lights up
const ITEMS = [
  ["Your logo & company name", 1400],
  ["Project, description & notes", 2000],
  ["3D load rendering", 3700],
  ["TI · HI · Total cases · Cubic eff", 4300],
  ["Case, pallet & truck level specs", 6200],
  ["2D layer diagrams", 8700],
];
const T_EXPORT = 10600;

// paper camera: the page (396 x 560 px inside a 446 x 560 viewport) tours
// these focus points [paper x, paper y, zoom] in A4 points
const VP_W = 446, VP_H = 560, PS = VP_H / 842, PX = (VP_W - 595 * PS) / 2;
const STOPS = [
  [0, null],
  [9, null],
  [15, [205, 150, 1.85]],
  [28, [205, 150, 1.85]],
  [35, [298, 240, 1.32]],
  [47, [298, 240, 1.32]],
  [54, [158, 560, 1.75]],
  [66, [158, 560, 1.75]],
  [73, [430, 590, 1.62]],
  [84, [430, 590, 1.62]],
  [92, null],
  [100, null],
];
function camAt([px, py, z]) {
  const u = PX + px * PS, v = py * PS;
  let tx = VP_W / 2 - z * u;
  let ty = VP_H / 2 - z * v;
  ty = Math.min(0, Math.max(VP_H - z * VP_H, ty));
  const lo = VP_W - z * (PX + 595 * PS) - 8, hi = -z * PX + 8;
  tx = Math.min(hi, Math.max(lo, tx));
  return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${z})`;
}
const KEYFRAMES =
  "@keyframes br-cam {" +
  STOPS.map(([pct, f]) => `${pct}% { transform: ${f ? camAt(f) : "translate(0px, 0px) scale(1)"}; }`).join(" ") +
  "}";

const PALLET_ROWS = [
  ["Pattern", "100% Column Stack (90°)"],
  ["Unit Load Dims", "48 × 40 × 45 in (L×W×H)"],
  ["Unit Load+Pallet", "48 × 40 × 50.5 in (L×W×H)"],
  ["OH Length", "0 — flush"],
  ["OH Width", "0 — flush"],
  ["TI", "25"],
  ["HI", "9"],
  ["Total Cases", "225"],
  ["Pallet Weight", "—"],
  ["Cubic Eff%", "98.96%"],
  ["UL+Pallet Cube (ft³)", "56.11"],
  ["Slip Sheets", "NO"],
];

function Table({ title, rows, style }) {
  return (
    <div className="br-tbl br-in" style={style}>
      <p className="br-tbl-h">{title}</p>
      {rows.map(([k, v]) => (
        <p className="br-tbl-r" key={k}>
          <span>{k}</span>
          <b>{v}</b>
        </p>
      ))}
    </div>
  );
}

// draws once per mount at the size it is shown
function Paint({ kind, className, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const w = cv.clientWidth, h = cv.clientHeight;
    const dpr = 3; // the page zooms up to ~1.9x, keep it crisp
    cv.width = w * dpr;
    cv.height = h * dpr;
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (kind === "3d") drawScene3D(ctx, w, h, { yaw: -36, pitch: 26 });
    else drawLayer2D(ctx, w, h, { background: false, compact: true });
  }, [kind]);
  return <canvas ref={ref} className={className} style={style} />;
}

export default function ReportSlide({ active, still }) {
  const t = useClock(active, REPORT_MS, still);
  const run = active && !still;

  return (
    <div className={`br${run ? " is-run" : ""}${still ? " is-still" : ""}`} aria-hidden="true">
      <style>{KEYFRAMES}</style>
      <div className="br-side">
        <p className="br-kick">Stack Report&trade; PDF</p>
        <p className="br-title">Professional. Branded. One click.</p>
        <ul className="br-list">
          {ITEMS.map(([label, at]) => (
            <li key={label} className={still || t >= at ? "is-on" : ""}>
              <span className="br-tick" />
              {label}
            </li>
          ))}
        </ul>
        <div className={`br-export${still || t >= T_EXPORT ? " is-on" : ""}`}>
          <span className="br-pdf">PDF</span>
          <span>
            <b>12pk_Eggs_Optimization.pdf</b>
            <em>{still || t >= T_EXPORT + 600 ? "Ready to send ✓" : "Exporting…"}</em>
          </span>
        </div>
      </div>

      <div className="br-vp">
        <div className="br-cam">
          <div className="br-page">
            {/* header */}
            <div className="br-in" style={{ "--d": "0.15s" }}>
              <div className="br-logo">
                <img src="/betsel-logo.png" alt="" />
              </div>
              <p className="br-co">My Company</p>
              <p className="br-sub">Pallet Pattern Engineering Report</p>
              <span className="br-rule" />
            </div>

            {/* project block */}
            <div className="br-proj br-in" style={{ "--d": "0.35s" }}>
              <p className="br-lab">Project name</p>
              <p className="br-val">12pk Eggs Optimization</p>
              <p className="br-lab">Pallet pattern description</p>
              <p className="br-val">12pk 12ct Eggs Organic</p>
              <p className="br-lab">Notes / disclaimer</p>
              <p className="br-val">Regular 3 top / 2 middle / 3 bottom stretch wrapping</p>
            </div>

            {/* 3D image + dims bar */}
            <div className="br-in" style={{ "--d": "0.55s" }}>
              <Paint kind="3d" className="br-3d" />
              <p className="br-dims">48 &times; 40 &times; 50.5 in (L&times;W&times;H)</p>
            </div>

            {/* KPI row */}
            <div className="br-kpis br-in" style={{ "--d": "0.75s" }}>
              {[
                ["Cases/Layer (TI)", "25"],
                ["Layers High (HI)", "9"],
                ["Total Cases", "225"],
                ["Cubic Eff", "98.96%"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p>{k}</p>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <span className="br-rule br-rule--mid" />

            <Table
              title="Case level"
              rows={[
                ["Case Dimensions", "9.5×8×5 in (L×W×H)"],
                ["Case Weight", "—"],
              ]}
              style={{ "--d": "0.95s", top: 400 }}
            />
            <Table title="Pallet level" rows={PALLET_ROWS} style={{ "--d": "1.1s", top: 452 }} />
            <Table
              title="Truck level"
              rows={[
                ["Truck Type", "53' Reefer"],
                ["Pallets/Truck", "26"],
                ["Total Weight", "1300 lbs"],
              ]}
              style={{ "--d": "1.25s", top: 680 }}
            />

            <Paint kind="2d" className="br-layer br-in" style={{ "--d": "1.0s", top: 398 }} />
            <Paint kind="2d" className="br-layer br-in" style={{ "--d": "1.2s", top: 598 }} />

            <div className="br-foot br-in" style={{ "--d": "1.35s" }}>
              <span>Confidential &mdash; Internal Use Only</span>
              <span>Prepared by: Jacob Pepperoni</span>
            </div>
          </div>
        </div>
        <span className="br-scan" />
      </div>
    </div>
  );
}
