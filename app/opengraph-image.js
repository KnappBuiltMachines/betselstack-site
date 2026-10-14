// app/opengraph-image.js
// Generates the 1200x630 preview image shown when betselstack.com is shared
// on LinkedIn, Slack, iMessage, X, etc. Built into Next.js; no package needed.
// Every page without its own opengraph-image uses this one.

import { ImageResponse } from "next/og";

export const alt = "Betsel Stack — Fit more on every pallet. Ship fewer trucks.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Isometric case at grid position (c, r, z) on a 2x2x3 mini load
function Cube({ x, y, s, top, left, right }) {
  const h = s * 0.58;
  return (
    <svg width={s * 2} height={s * 2.2} viewBox="0 0 200 220" style={{ position: "absolute", left: x, top: y }}>
      <polygon points="100,0 200,58 100,116 0,58" fill={top} stroke="#0b0c0e" strokeWidth="4" />
      <polygon points="0,58 100,116 100,220 0,162" fill={left} stroke="#0b0c0e" strokeWidth="4" />
      <polygon points="200,58 100,116 100,220 200,162" fill={right} stroke="#0b0c0e" strokeWidth="4" />
    </svg>
  );
}

export default function Image() {
  const s = 60; // half-width of a cube in px
  const cubes = [];
  // back-to-front, bottom-to-top
  for (let z = 0; z < 3; z++)
    for (const [c, r] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const amber = (z + c + r) % 2 === 0;
      cubes.push({
        x: 860 + (c - r) * s - s,
        y: 330 + (c + r) * s * 0.58 - z * s * 1.04 - s * 0.6,
        top: amber ? "#fdb410" : "#ffffff",
        left: amber ? "#d8970a" : "#c9ced4",
        right: amber ? "#b47c06" : "#9aa1a8",
      });
    }
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(circle at 74% 52%, #3a2a06 0%, #0b0c0e 55%)",
          color: "#f3f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "72px 0 0 80px", width: 700 }}>
          <div style={{ fontSize: 30, fontWeight: 700, display: "flex" }}>
            Bet<span style={{ color: "#fdb410" }}>sel</span>&nbsp;Stack
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, marginTop: 70 }}>
            Fit more on every pallet.
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, color: "#fdb410" }}>
            Ship fewer trucks.
          </div>
          <div style={{ fontSize: 28, color: "#9aa1ab", marginTop: 34 }}>
            Pallet pattern software in your browser · 7-day free trial
          </div>
        </div>
        {cubes.map((c, i) => (
          <Cube key={i} s={s} {...c} />
        ))}
      </div>
    ),
    size
  );
}
