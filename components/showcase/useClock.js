"use client";

// components/showcase/useClock.js
// Looping millisecond clock for showcase slides.
//   active - runs only while the slide is the one on screen
//   loopMs - wraps back to 0 after this long
//   still  - reduced motion: returns the end state and never ticks
// Restarts from 0 each time the slide becomes active.

import { useEffect, useState } from "react";

export function useClock(active, loopMs, still = false) {
  const [t, setT] = useState(still ? loopMs - 1 : 0);

  useEffect(() => {
    if (still) {
      setT(loopMs - 1);
      return;
    }
    if (!active) {
      setT(0);
      return;
    }
    let raf = 0;
    let last = 0;
    const start = performance.now();
    const tick = (now) => {
      if (now - last > 33) {
        last = now;
        setT((now - start) % loopMs);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, loopMs, still]);

  return t;
}
