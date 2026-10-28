"use client";

// components/TiHiDemo.js
// "Try it now" on the home page: type a case size, get the best simple
// block layer instantly, drawn to scale. This is a deliberately small
// guillotine-block solver (up to 3 cuts) so it runs in a few milliseconds
// in the browser. The real engine (interlock, pinwheel, overhang, mixed
// cases, ranked patterns) lives behind the free trial.

import Link from "next/link";
import { useMemo, useState } from "react";

const PALLETS = [
  { id: "full", label: "Full (48 × 40″)", L: 48, W: 40 },
  { id: "half", label: "Half (48 × 20″)", L: 48, W: 20 },
  { id: "quarter", label: "Quarter (24 × 20″)", L: 24, W: 20 },
  { id: "sixth", label: "Sixth (16 × 20″)", L: 16, W: 20 },
  { id: "custom", label: "Custom" },
];

const EXAMPLES = [[16, 12, 10], [15, 11, 8], [18, 13, 11]];

const S = 100; // work in hundredths of an inch, integers only

function solveLayer(PL, PW, cl, cw) {
  const L = Math.round(PL * S), W = Math.round(PW * S);
  const a = Math.round(cl * S), b = Math.round(cw * S);
  if (a <= 0 || b <= 0) return { n: 0, rects: [] };
  const memo = new Map();
  const cuts = (len) => {
    const set = new Set();
    for (let k = a; k < len; k += a) set.add(k);
    for (let k = b; k < len; k += b) set.add(k);
    return [...set];
  };
  const best = (w, h, d) => {
    const key = w + "|" + h + "|" + d;
    if (memo.has(key)) return memo.get(key);
    const g0 = Math.floor(w / a) * Math.floor(h / b);
    const g1 = Math.floor(w / b) * Math.floor(h / a);
    let res = g0 >= g1 ? { n: g0, p: { t: "g", o: 0 } } : { n: g1, p: { t: "g", o: 1 } };
    const bound = Math.floor((w * h) / (a * b));
    if (d > 0 && res.n < bound) {
      for (const x of cuts(w)) {
        const n = best(x, h, d - 1).n + best(w - x, h, d - 1).n;
        if (n > res.n) res = { n, p: { t: "v", x } };
      }
      for (const y of cuts(h)) {
        const n = best(w, y, d - 1).n + best(w, h - y, d - 1).n;
        if (n > res.n) res = { n, p: { t: "h", y } };
      }
    }
    memo.set(key, res);
    return res;
  };
  const rects = [];
  const emit = (x0, y0, w, h, d) => {
    const { p } = best(w, h, d);
    if (p.t === "g") {
      const [cx, cy] = p.o ? [b, a] : [a, b];
      const nx = Math.floor(w / cx), ny = Math.floor(h / cy);
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < ny; j++)
          rects.push({ x: (x0 + i * cx) / S, y: (y0 + j * cy) / S, l: cx / S, w: cy / S, o: p.o });
    } else if (p.t === "v") {
      emit(x0, y0, p.x, h, d - 1);
      emit(x0 + p.x, y0, w - p.x, h, d - 1);
    } else {
      emit(x0, y0, w, p.y, d - 1);
      emit(x0, y0 + p.y, w, h - p.y, d - 1);
    }
  };
  const depth = Math.min(a, b) < 300 ? 2 : 3; // keep tiny cases fast
  const n = best(L, W, depth).n;
  emit(0, 0, L, W, depth);
  return { n, rects };
}

const num = (v) => {
  const f = parseFloat(v);
  return Number.isFinite(f) && f > 0 ? f : 0;
};

export default function TiHiDemo() {
  const [cl, setCl] = useState("12");
  const [cw, setCw] = useState("8");
  const [ch, setCh] = useState("9");
  const [maxH, setMaxH] = useState("48");
  const [palId, setPalId] = useState("full");
  const [customL, setCustomL] = useState("48");
  const [customW, setCustomW] = useState("40");
  const isCustom = palId === "custom";
  const pal = isCustom
    ? { L: num(customL), W: num(customW) }
    : PALLETS.find((p) => p.id === palId);

  const r = useMemo(() => {
    const L = num(cl), Wd = num(cw), Ht = num(ch), M = num(maxH);
    if (!pal.L || !pal.W) return { err: "Enter your custom pallet length and width." };
    if (pal.L > 120 || pal.W > 120) return { err: "Custom pallets up to 120 in are supported here." };
    if (!L || !Wd || !Ht || !M) return { err: "Enter all four sizes to see a layer." };
    if (Math.min(L, Wd) < 1.5) return { err: "Cases under 1.5 in are best handled in the full app." };
    if (Math.min(L, Wd) > Math.max(pal.L, pal.W) || (L > pal.L && L > pal.W) || (Wd > pal.L && Wd > pal.W))
      return { err: "That case is larger than the pallet." };
    const { n, rects } = solveLayer(pal.L, pal.W, L, Wd);
    if (!n) return { err: "That case doesn’t fit flat on this pallet." };
    const hi = Math.floor(M / Ht + 1e-9);
    if (!hi) return { err: "The case is taller than your max load height." };
    const fp = (n * L * Wd) / (pal.L * pal.W);
    return { n, hi, total: n * hi, fp, rects };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cl, cw, ch, maxH, palId, customL, customW]);

  const field = (id, label, v, set) => (
    <label className="td-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        inputMode="decimal"
        value={v}
        onChange={(e) => set(e.target.value.replace(/[^0-9.]/g, ""))}
        aria-label={label + " in inches"}
      />
      <em>in</em>
    </label>
  );

  const pad = 1.2;
  return (
    <div className="td">
      <div className="td-inputs">
        <p className="td-step">1 · Your case</p>
        <div className="td-row">
          {field("td-l", "Length", cl, setCl)}
          {field("td-w", "Width", cw, setCw)}
          {field("td-h", "Height", ch, setCh)}
        </div>
        <p className="td-step">2 · Your pallet</p>
        <div className="td-chips" role="radiogroup" aria-label="Pallet size">
          {PALLETS.map((p) => (
            <button
              type="button"
              key={p.id}
              role="radio"
              aria-checked={palId === p.id}
              className={palId === p.id ? "is-on" : ""}
              onClick={() => setPalId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {isCustom && (
          <div className="td-row td-row--two">
            {field("td-pl", "Pallet length", customL, setCustomL)}
            {field("td-pw", "Pallet width", customW, setCustomW)}
          </div>
        )}
        <div className="td-row td-row--one">{field("td-m", "Max load height", maxH, setMaxH)}</div>
        <div className="td-try">
          <span>Try:</span>
          {EXAMPLES.map(([l, w, h]) => (
            <button
              type="button"
              key={`${l}x${w}`}
              onClick={() => { setCl(String(l)); setCw(String(w)); setCh(String(h)); }}
            >
              {l} × {w} × {h}
            </button>
          ))}
        </div>
      </div>

      <div className="td-out" aria-live="polite">
        <div className="td-canvas">
          <svg
            viewBox={`${-pad} ${-pad} ${(pal.L || 48) + pad * 2} ${(pal.W || 40) + pad * 2}`}
            role="img"
            aria-label={r.err ? r.err : `Best block layer: ${r.n} cases per layer`}
          >
            <rect x="0" y="0" width={pal.L || 48} height={pal.W || 40} rx="0.6" className="td-pal" />
            {!r.err &&
              r.rects.map((c, i) => (
                <rect
                  key={`${palId}-${i}-${c.x}-${c.y}`}
                  x={c.x + 0.18}
                  y={c.y + 0.18}
                  width={c.l - 0.36}
                  height={c.w - 0.36}
                  rx="0.35"
                  className={c.o ? "td-case td-case--b" : "td-case"}
                  style={{ animationDelay: `${Math.min(i, 40) * 18}ms` }}
                />
              ))}
          </svg>
          {r.err && <p className="td-err">{r.err}</p>}
          {!r.err && r.rects.some((c) => c.o) && (
            <div className="td-legend">
              <span><i />Lengthwise</span>
              <span><i className="b" />Turned 90°</span>
            </div>
          )}
        </div>
        <div className="td-stats">
          <div><b>{r.err ? "—" : r.n}</b><span>Cases per layer (Ti)</span></div>
          <div><b>{r.err ? "—" : r.hi}</b><span>Layers (Hi)</span></div>
          <div className="td-big"><b>{r.err ? "—" : r.total}</b><span>Cases per pallet</span></div>
          <div><b>{r.err ? "—" : Math.round(r.fp * 100) + "%"}</b><span>Footprint used</span></div>
        </div>
        <p className="td-note">
          This quick check uses a simple block layout. The full app ranks every
          viable pattern, including interlocked layers, overhang, mixed cases, and
          trailer loading.
        </p>
        <Link href="/signup" className="btn btn--primary">
          See every pattern for this case &rarr;
        </Link>
      </div>
    </div>
  );
}
