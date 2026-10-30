"use client";

// components/ScrollStory.js
// Home page "How it works": follows one case from the first dimension typed
// in, through the 2D layer and 3D pallet, into the trailer, onto the road,
// and into the distribution center.
//
// Desktop: the text steps scroll on the left while the picture on the right
//   stays pinned and cross-fades to match the step you are reading.
// Phones / tablets: each step shows its own picture, stacked in order.
// No JavaScript or reduced motion: everything is still readable; the pinned
//   picture simply stays on step 1 and each step keeps its own picture.

import { useEffect, useRef, useState } from "react";
import { CaseInputArt, TruckArt, WarehouseArt } from "@/components/StoryArt";

function Scene({ step }) {
  if (step.art === "input") return <CaseInputArt />;
  if (step.photo) {
    return <img className="ss-photo" src={step.photo} alt={step.alt} loading="lazy" decoding="async" />;
  }
  if (step.art === "truck") return <TruckArt />;
  if (step.art === "warehouse") return <WarehouseArt />;
  if (step.wide) {
    // very wide screenshot: shown large and slowly panned so it stays readable
    return (
      <div className="ss-pan">
        <img src={step.img} alt={step.alt} loading="lazy" decoding="async" />
      </div>
    );
  }
  return (
    <img
      className="ss-shot"
      src={step.img}
      alt={step.alt}
      loading="lazy"
      decoding="async"
    />
  );
}

export default function ScrollStory({ steps }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.i));
        });
      },
      // a step becomes "current" when it crosses the middle of the screen
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="ss">
      <ol className="ss-steps">
        {steps.map((s, i) => (
          <li
            key={s.key}
            data-i={i}
            ref={(el) => (refs.current[i] = el)}
            className={`ss-step ${i === active ? "is-active" : ""}`}
          >
            <p className="ss-n">
              <b>{String(i + 1).padStart(2, "0")}</b> {s.label}
            </p>
            <h3>{s.title}</h3>
            <p className="ss-body">{s.body}</p>
            <p className="ss-chip">{s.chip}</p>
            <div className="ss-inline">
              <figure className="ss-frame">
                <Scene step={s} />
              </figure>
            </div>
          </li>
        ))}
      </ol>

      <div className="ss-pin" aria-hidden="true">
        <div className="ss-stage">
          {steps.map((s, i) => (
            <figure key={s.key} className={`ss-frame ss-layer ${i === active ? "is-on" : ""}`}>
              <Scene step={s} />
            </figure>
          ))}
        </div>
        <ol className="ss-rail">
          {steps.map((s, i) => (
            <li key={s.key} className={i === active ? "is-on" : i < active ? "is-done" : ""}>
              <span />
              {s.label}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
