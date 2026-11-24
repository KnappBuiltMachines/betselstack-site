"use client";

// components/BuilderFrame.js
// Hosts the desktop pallet builder iframe on /builder.
// On small screens (phones, portrait tablets) the builder is rendered at a
// desktop width and scaled down to fit ("Fit screen"), so the whole program is
// visible and usable; pinch-zoom works on top of that. "Actual size" shows it
// at 100% and you scroll around inside it. The choice is saved per device.
// Scaling the <iframe> element (not the page inside it) keeps every click and
// touch position correct inside the builder.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const DESKTOP_W = 1280;   // width the builder is laid out at in Fit mode
const SMALL_BELOW = 1000; // container width that counts as a small screen

export default function BuilderFrame({ src, title }) {
  const wrapRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [mode, setMode] = useState("fit");
  const [tip, setTip] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem("bs_frame_mode");
      if (m === "fit" || m === "actual") setMode(m);
      setTip(localStorage.getItem("bs_frame_tip") !== "hide");
    } catch (e) {}
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const small = box.w > 0 && box.w < SMALL_BELOW;
  const fit = small && mode === "fit";
  const scale = fit ? box.w / DESKTOP_W : 1;

  const choose = (m) => {
    setMode(m);
    try { localStorage.setItem("bs_frame_mode", m); } catch (e) {}
  };
  const hideTip = () => {
    setTip(false);
    try { localStorage.setItem("bs_frame_tip", "hide"); } catch (e) {}
  };

  const frameStyle = fit
    ? {
        position: "absolute", top: 0, left: 0, border: 0,
        width: DESKTOP_W, height: Math.max(box.h / scale, 600),
        transform: `scale(${scale})`, transformOrigin: "0 0",
      }
    : { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 };

  return (
    <>
      {small && tip && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 14px", fontSize: 13, lineHeight: 1.4, background: "rgba(122,200,255,0.08)", borderBottom: "1px solid rgba(122,200,255,0.25)", color: "#cfe6ff" }}>
          <span style={{ flex: "1 1 220px" }}>
            This is the full desktop builder. Pinch to zoom, or switch to Actual size and scroll around.
            For quick looks at saved patterns, use the{" "}
            <Link href="/m" style={{ color: "#7ac8ff", textDecoration: "underline" }}>mobile viewer</Link>.
          </span>
          <button type="button" onClick={hideTip} style={{ background: "none", border: "1px solid rgba(122,200,255,0.35)", color: "#7ac8ff", borderRadius: 6, padding: "4px 10px", fontSize: 13 }}>
            Got it
          </button>
        </div>
      )}

      <div ref={wrapRef} style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <iframe src={src} title={title} style={frameStyle} />

        {small && (
          <div role="group" aria-label="Builder size" style={{ position: "absolute", right: 12, bottom: 12, zIndex: 5, display: "flex", borderRadius: 999, overflow: "hidden", border: "1px solid var(--amber)", boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }}>
            {[["fit", "Fit screen"], ["actual", "Actual size"]].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                aria-pressed={mode === id}
                style={{ padding: "8px 14px", fontSize: 13, fontWeight: 600, border: 0, background: mode === id ? "var(--amber)" : "rgba(11,12,14,0.92)", color: mode === id ? "#1a1205" : "var(--amber)" }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
