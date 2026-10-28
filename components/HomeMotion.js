"use client";

// components/HomeMotion.js
// Two small client helpers for the home page.
//
// <RevealObserver /> — fades and lifts any element with class "rv" into
//   view as you scroll. Content is fully visible without JavaScript:
//   the hidden starting state only applies after this runs.
//
// <LoopVideo /> — a silent, looping product clip that only downloads and
//   plays while it is on screen (Apple-style), and stays still for
//   visitors who prefer reduced motion.

import { useEffect, useRef, useState } from "react";

export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll(".rv"));
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    root.classList.add("rv-ready");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("rv-ready");
    };
  }, []);
  return null;
}

//   eager   — start downloading right away (use for the hero clip that is
//             on screen at page load).
//   control — show a small pause / play button over the clip. Visitors who
//             prefer reduced motion see the poster and can press play.
export function LoopVideo({ src, poster, label, eager = false, control = false }) {
  const ref = useRef(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      userPaused.current = true;
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute("src")) v.setAttribute("src", src);
          if (!userPaused.current) v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: eager ? 0.01 : 0.3 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src, eager]);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      if (!v.getAttribute("src")) v.setAttribute("src", src);
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  }

  const video = (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager ? "auto" : "none"}
      aria-label={label}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
    />
  );

  if (!control) return video;
  return (
    <div className="lv">
      {video}
      <button
        type="button"
        className="lv-btn"
        onClick={toggle}
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="2" y="1.5" width="3.4" height="11" rx="1" fill="currentColor" />
            <rect x="8.6" y="1.5" width="3.4" height="11" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 1.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5Z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
