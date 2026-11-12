"use client";

// components/showcase/HomeShowcase.js
// Home page hero showcase (Nov 2026): four animated pieces in a sideways
// scrolling frame, each tied to one brand pillar.
//   1 Input       - the builder's input panels fill themselves in
//   2 Output      - ranked patterns + headline numbers
//   3 2D / 3D     - single-layer top view <-> orbiting 3D load (drag to rotate)
//   4 PDF Reports - the branded report builds and is toured up close
//
// Behavior
//   - Swipe / trackpad-scroll sideways, use the arrows, or pick a tab.
//   - Advances on its own; the active tab shows a progress bar.
//     Hovering pauses it. Touching or dragging inside the frame stops it.
//   - Nothing runs while the showcase is off screen.
//   - Reduced motion: no auto-advance, every slide shows its finished state.
//
// Styled by app/showcase.css (sc- / bi- / bo- / bv- / br- classes).

import { useCallback, useEffect, useRef, useState } from "react";
import InputSlide, { INPUT_MS } from "./InputSlide";
import OutputSlide, { OUTPUT_MS } from "./OutputSlide";
import ViewSlide, { VIEW_MS } from "./ViewSlide";
import ReportSlide, { REPORT_MS } from "./ReportSlide";

const SLIDES = [
  {
    tab: "Input",
    ms: INPUT_MS,
    Comp: InputSlide,
    n: "01",
    pillar: "Simplify complexity",
    text: "Enter a case and a pallet. That’s the whole setup.",
  },
  {
    tab: "Output",
    ms: OUTPUT_MS,
    Comp: OutputSlide,
    n: "02",
    pillar: "Give engineers their time back",
    text: "Ranked patterns in seconds. No repetitive math or spreadsheet rework.",
  },
  {
    tab: "2D / 3D",
    ms: VIEW_MS,
    Comp: ViewSlide,
    canvas: true,
    n: "03",
    pillar: "Built for real-world packaging",
    text: "Check each layer in 2D, then turn the full load in 3D. Drag to see it from any angle.",
  },
  {
    tab: "PDF Reports",
    ms: REPORT_MS,
    Comp: ReportSlide,
    n: "04",
    pillar: "Powerful tools, made accessible",
    text: "A professional, branded report your customers and plant floor can use.",
  },
];

export default function HomeShowcase() {
  const root = useRef(null);
  const track = useRef(null);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [auto, setAuto] = useState(true);
  const [still, setStill] = useState(false);

  // scale the 760 x 600 design canvas to the frame, watch visibility
  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const ro = new ResizeObserver(() => {
      el.style.setProperty("--k", String(tr.clientWidth / 760));
    });
    ro.observe(tr);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const onVis = () => setVisible(document.visibilityState === "visible" && isOnScreen(el));
    document.addEventListener("visibilitychange", onVis);
    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const go = useCallback((i) => {
    const tr = track.current;
    if (!tr) return;
    const n = (i + SLIDES.length) % SLIDES.length;
    tr.scrollTo({ left: n * tr.clientWidth, behavior: "smooth" });
    setIdx(n);
  }, []);

  const onScroll = () => {
    const tr = track.current;
    if (!tr || !tr.clientWidth) return;
    const n = Math.round(tr.scrollLeft / tr.clientWidth);
    if (n !== idx && n >= 0 && n < SLIDES.length) setIdx(n);
  };

  // keep the right slide in place when the frame is resized
  useEffect(() => {
    const tr = track.current;
    if (!tr) return;
    const ro = new ResizeObserver(() => {
      tr.scrollTo({ left: idx * tr.clientWidth });
    });
    ro.observe(tr);
    return () => ro.disconnect();
  }, [idx]);

  const running = auto && !still && visible;
  const paused = hover;

  return (
    <div
      className={`sc${paused ? " is-paused" : ""}`}
      ref={root}
      aria-roledescription="carousel"
      aria-label="Betsel Stack in four steps"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="sc-frame">
        <div
          className="sc-track"
          ref={track}
          onScroll={onScroll}
          onPointerDown={() => setAuto(false)}
          onWheel={(e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) setAuto(false);
          }}
        >
          {SLIDES.map((s, i) => {
            const on = i === idx && visible;
            return (
              <section
                key={s.tab}
                className="sc-slide"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${SLIDES.length}: ${s.tab}`}
                aria-hidden={i !== idx}
              >
                {s.canvas ? (
                  <s.Comp active={on} still={still} />
                ) : (
                  <div className="sc-design">
                    <s.Comp active={on} still={still} />
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <button type="button" className="sc-arrow sc-arrow--prev" aria-label="Previous" onClick={() => go(idx - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button type="button" className="sc-arrow sc-arrow--next" aria-label="Next" onClick={() => go(idx + 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="sc-cap" aria-live="polite">
        <span className="sc-n">{SLIDES[idx].n}</span>
        <span>
          <b>{SLIDES[idx].pillar}</b>
          <em>{SLIDES[idx].text}</em>
        </span>
      </div>

      <ol className="sc-rail">
        {SLIDES.map((s, i) => (
          <li key={s.tab}>
            <button
              type="button"
              className={i === idx ? "is-on" : i < idx ? "is-done" : ""}
              aria-current={i === idx ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="sc-bar">
                {i === idx && running ? (
                  <i
                    key={`${idx}-${s.ms}`}
                    style={{ animationDuration: `${s.ms}ms` }}
                    onAnimationEnd={() => go(idx + 1)}
                  />
                ) : (
                  i === idx && <i className="is-full" />
                )}
              </span>
              {s.tab}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function isOnScreen(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}
