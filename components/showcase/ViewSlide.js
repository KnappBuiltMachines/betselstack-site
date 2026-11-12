"use client";

// components/showcase/ViewSlide.js
// Slide 3 of the home showcase: the same pattern in 2D and 3D.
// Auto mode loops: single-layer top view -> camera tilts down into 3D ->
// full orbit around the load -> rises back to the top view.
// Visitors can pick 2D or 3D, and drag the 3D view to look from any angle.

import { useEffect, useRef, useState } from "react";
import { drawScene3D, drawLayer2D } from "./render3d";

export const VIEW_MS = 14000;

const smooth = (p) => {
  const x = Math.min(1, Math.max(0, p));
  return x * x * (3 - 2 * x);
};
const TOP = 89.4;

// auto camera as a pure function of time in the loop
function autoCam(t) {
  if (t < 3400) return { b: 0, yaw: 0, pitch: TOP };
  if (t < 5000) {
    const p = smooth((t - 3400) / 1600);
    return { b: smooth((t - 3400) / 500), yaw: -38 * p, pitch: TOP + (28 - TOP) * p };
  }
  if (t < 12300) {
    const p = (t - 5000) / 7300;
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    return { b: 1, yaw: -38 - 360 * e, pitch: 28 + 12 * Math.sin(p * Math.PI * 2) };
  }
  const p = smooth((t - 12300) / 1300);
  return { b: 1 - smooth((t - 13300) / 500), yaw: -398 + 38 * p, pitch: 28 + (TOP - 28) * p };
}

export default function ViewSlide({ active, still }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const st = useRef({ mode: "auto", t: 0, yaw: -38, pitch: 28, b: 1, drag: null, idle: 0 });
  const [mode, setMode] = useState("auto");
  const [is3d, setIs3d] = useState(false);

  // a fresh loop every time this slide comes on screen
  useEffect(() => {
    if (active) {
      st.current.mode = "auto";
      st.current.t = 0;
      setMode("auto");
    }
  }, [active]);

  useEffect(() => {
    const cv = canvas.current;
    const el = wrap.current;
    if (!cv || !el) return;
    const ctx = cv.getContext("2d");
    let raf = 0;
    let last = performance.now();
    let w = 0, h = 0, dpr = 1;

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    };
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(el);
    size();

    function draw() {
      if (!w || !h) return;
      const s = st.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (s.b < 1) drawLayer2D(ctx, w, h, { alpha: 1 });
      if (s.b > 0) drawScene3D(ctx, w, h, { yaw: s.yaw, pitch: s.pitch, alpha: s.b });
    }

    function step(now) {
      const dt = Math.min(64, now - last);
      last = now;
      const s = st.current;
      if (s.mode === "auto") {
        s.t = (s.t + dt) % VIEW_MS;
        const c = autoCam(s.t);
        s.b = c.b;
        s.yaw = c.yaw;
        s.pitch = c.pitch;
      } else {
        const want3d = s.mode === "3d";
        const k = Math.min(1, dt / 220);
        s.b += ((want3d ? 1 : 0) - s.b) * Math.min(1, dt / 160);
        if (want3d) {
          if (!s.drag) {
            if (s.pitch > 75) s.pitch += (32 - s.pitch) * k;
            if (now - s.idle > 1800) s.yaw -= dt * 0.02;
          }
        } else {
          s.pitch += (TOP - s.pitch) * k;
          const target = Math.round(s.yaw / 360) * 360;
          s.yaw += (target - s.yaw) * k;
        }
      }
      setIs3d((prev) => (prev !== s.b > 0.5 ? s.b > 0.5 : prev));
      draw();
      raf = requestAnimationFrame(step);
    }

    if (still) {
      st.current = { ...st.current, b: 1, yaw: -38, pitch: 28 };
      draw();
      setIs3d(true);
    } else if (active) {
      raf = requestAnimationFrame(step);
    } else {
      draw();
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active, still]);

  const choose = (m) => {
    st.current.mode = m;
    if (m === "3d" && st.current.b < 0.5) {
      st.current.yaw = Math.round(st.current.yaw / 360) * 360;
    }
    st.current.idle = performance.now();
    setMode(m);
  };

  const onDown = (e) => {
    if (!active) return;
    const s = st.current;
    if (s.mode === "auto" || s.mode === "2d") choose("3d");
    s.drag = { x: e.clientX, y: e.clientY, yaw: s.yaw, pitch: s.pitch };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const s = st.current;
    if (!s.drag) return;
    s.yaw = s.drag.yaw - (e.clientX - s.drag.x) * 0.45;
    s.pitch = Math.max(8, Math.min(86, s.drag.pitch + (e.clientY - s.drag.y) * 0.35));
    s.idle = performance.now();
  };
  const onUp = () => {
    st.current.drag = null;
    st.current.idle = performance.now();
  };

  return (
    <div className="bv" ref={wrap}>
      <canvas
        ref={canvas}
        className="bv-canvas"
        role="img"
        aria-label="100% Column Stack pattern, 25 cases per layer, shown as a single-layer top view and as a rotating 3D load on a 48 by 40 pallet"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
      <div className="bv-ui">
        <div className="bv-toggle" role="group" aria-label="View">
          <button type="button" className={!is3d ? "is-on" : ""} onClick={() => choose("2d")} aria-pressed={!is3d}>
            2D Layer
          </button>
          <button type="button" className={is3d ? "is-on" : ""} onClick={() => choose("3d")} aria-pressed={is3d}>
            3D View
          </button>
        </div>
        <span className="bv-hint">{is3d ? "Drag to rotate" : "Layer 1 of 9 · 25 cases"}</span>
      </div>
      <div className={`bv-dims${is3d ? " is-on" : ""}`}>48 &times; 40 &times; 50.5 in (L&times;W&times;H)</div>
      {mode !== "auto" && (
        <button type="button" className="bv-auto" onClick={() => choose("auto")}>
          Auto tour
        </button>
      )}
    </div>
  );
}
