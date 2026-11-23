"use client";

// components/tools/CaseSizeCalculator.js
// Free Case Size Calculator (public, no login) at /tools/case-size-calculator.
// Same math as the paid pallet builder's calculator (lib/case-size/calc.js),
// without the pallet comparison. Inputs are kept in the units shown on screen;
// everything is converted to inches / lbs before calculating.

import { useMemo, useState } from "react";
import Link from "next/link";
import { CARTON_STYLES, FLUTES, generateCases, r2 } from "@/lib/case-size/calc";
import { UnitDiagram, CaseDiagram, DIM_COLORS } from "./IsoDiagrams";

const MM = 25.4;
const KG = 0.453592;

// Starting example so the page shows real results on first load.
const START = { L: "3", W: "2", H: "6", dia: "2.75", cylH: "4.5", wt: "0.75", clr: "0.125", thick: "0.15625" };

const num = (v) => {
  const n = parseFloat(v);
  return isFinite(n) ? n : 0;
};

const COLUMNS = [
  { id: "arr", label: "Arrangement", sub: "L × W × layers", sv: (r) => r.a * 10000 + r.b * 100 + r.nz },
  { id: "od", label: "Case OD", sub: "L × W × H", sv: (r) => r.odL * r.odW * r.odH },
  { id: "caseWt", label: "Case weight", sub: "incl. board", sv: (r) => r.caseWt },
  { id: "boardWt", label: "Board weight", sub: "est.", sv: (r) => r.boardWt },
  { id: "cube", label: "Cube", sub: "ft³", sv: (r) => r.cube },
];

function Dot({ dim }) {
  return <span className="csc-dot" style={{ background: DIM_COLORS[dim] }} aria-hidden="true" />;
}

export default function CaseSizeCalculator() {
  const [metric, setMetric] = useState(false);
  const [pkg, setPkg] = useState("cuboid");
  const [v, setV] = useState(START);
  const [count, setCount] = useState("12");
  const [maxLayers, setMaxLayers] = useState("2");
  const [style, setStyle] = useState("RSC");
  const [flute, setFlute] = useState("0.15625");
  const [sort, setSort] = useState({ id: null, dir: 1 });
  const [selKey, setSelKey] = useState(null);

  const lenU = metric ? "mm" : "in";
  const wtU = metric ? "kg" : "lbs";
  const toIn = (x) => (metric ? x / MM : x);
  const showLen = (inches) => (metric ? r2(inches * MM) : r2(inches));
  const showWt = (lbs) => (lbs > 0 ? `${metric ? r2(lbs * KG) : r2(lbs)} ${wtU}` : "—");

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  // Switch units and convert what's already typed in.
  const switchUnits = (toMetric) => {
    if (toMetric === metric) return;
    const f = toMetric ? MM : 1 / MM;
    const conv = (x, factor) => (x === "" ? "" : String(r2(num(x) * factor)));
    setV((s) => ({
      L: conv(s.L, f),
      W: conv(s.W, f),
      H: conv(s.H, f),
      dia: conv(s.dia, f),
      cylH: conv(s.cylH, f),
      clr: conv(s.clr, f),
      thick: conv(s.thick, f),
      wt: conv(s.wt, toMetric ? KG : 1 / KG),
    }));
    setMetric(toMetric);
  };

  // Board thickness in inches: preset value, or the custom box.
  const tIn = flute === "custom" ? toIn(num(v.thick)) : parseFloat(flute);

  const unit = useMemo(() => {
    if (pkg === "cylinder") {
      const d = toIn(num(v.dia));
      return { uL: d, uW: d, uH: toIn(num(v.cylH)) };
    }
    return { uL: toIn(num(v.L)), uW: toIn(num(v.W)), uH: toIn(num(v.H)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg, v, metric]);

  const results = useMemo(
    () =>
      generateCases({
        pkgType: pkg,
        ...unit,
        count: num(count),
        maxLayers: parseInt(maxLayers, 10) || 1,
        style,
        t: tIn,
        clr: toIn(num(v.clr)),
        unitWtLbs: metric ? num(v.wt) / KG : num(v.wt),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pkg, unit, count, maxLayers, style, tIn, v.clr, v.wt, metric]
  );

  const sorted = useMemo(() => {
    if (!sort.id) return results;
    const col = COLUMNS.find((c) => c.id === sort.id);
    return [...results].sort((p, q) => (col.sv(p) - col.sv(q)) * sort.dir);
  }, [results, sort]);

  const selected = results.find((r) => r.key === selKey) || sorted[0] || null;

  const clickSort = (id) =>
    setSort((s) => (s.id === id ? { id, dir: -s.dir } : { id, dir: 1 }));

  const unitLabels =
    pkg === "cylinder"
      ? { L: `${v.dia || "?"} ${lenU}`, H: `${v.cylH || "?"} ${lenU}` }
      : { L: `${v.L || "?"} ${lenU}`, W: `${v.W || "?"} ${lenU}`, H: `${v.H || "?"} ${lenU}` };

  return (
    <div className="csc">
      {/* ─────────── Inputs ─────────── */}
      <div className="csc-panel csc-inputs">
        <div className="csc-row csc-row--between">
          <p className="csc-step">1 &middot; Your unit</p>
          <div className="csc-seg" role="group" aria-label="Units">
            <button type="button" className={!metric ? "is-on" : ""} onClick={() => switchUnits(false)}>in / lbs</button>
            <button type="button" className={metric ? "is-on" : ""} onClick={() => switchUnits(true)}>mm / kg</button>
          </div>
        </div>

        <div className="csc-seg csc-seg--wide" role="group" aria-label="Unit shape">
          <button type="button" className={pkg === "cuboid" ? "is-on" : ""} onClick={() => setPkg("cuboid")}>
            Box shape <span>cartons, pouches, trays</span>
          </button>
          <button type="button" className={pkg === "cylinder" ? "is-on" : ""} onClick={() => setPkg("cylinder")}>
            Cylinder <span>jars, cans, bottles</span>
          </button>
        </div>

        {pkg === "cuboid" ? (
          <div className="csc-grid3">
            <label><span><Dot dim="L" />Length ({lenU})</span><input type="number" inputMode="decimal" min="0" step="any" value={v.L} onChange={set("L")} /></label>
            <label><span><Dot dim="W" />Width ({lenU})</span><input type="number" inputMode="decimal" min="0" step="any" value={v.W} onChange={set("W")} /></label>
            <label><span><Dot dim="H" />Height ({lenU})</span><input type="number" inputMode="decimal" min="0" step="any" value={v.H} onChange={set("H")} /></label>
          </div>
        ) : (
          <div className="csc-grid2">
            <label><span><Dot dim="L" />Diameter ({lenU})</span><input type="number" inputMode="decimal" min="0" step="any" value={v.dia} onChange={set("dia")} /></label>
            <label><span><Dot dim="H" />Height ({lenU})</span><input type="number" inputMode="decimal" min="0" step="any" value={v.cylH} onChange={set("cylH")} /></label>
          </div>
        )}
        <label className="csc-full">
          <span>Unit weight ({wtU})</span>
          <input type="number" inputMode="decimal" min="0" step="any" value={v.wt} onChange={set("wt")} />
        </label>

        <UnitDiagram
          pkgType={pkg}
          L={unit.uL}
          W={unit.uW}
          H={unit.uH}
          labels={unitLabels}
          title={pkg === "cylinder" ? "Your unit (upright)" : "Your unit (upright, H is height)"}
        />

        <p className="csc-step">2 &middot; Your case</p>
        <div className="csc-grid2">
          <label><span>Units per case</span><input type="number" inputMode="numeric" min="1" step="1" value={count} onChange={(e) => setCount(e.target.value)} /></label>
          <label>
            <span>Max layers in case</span>
            <select value={maxLayers} onChange={(e) => setMaxLayers(e.target.value)}>
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <label className="csc-full">
          <span>Carton style</span>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            {Object.entries(CARTON_STYLES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </label>
        <div className="csc-grid2">
          <label>
            <span>Board / flute</span>
            <select
              value={flute}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "custom") {
                  const cur = parseFloat(flute);
                  setV((s) => ({ ...s, thick: String(showLen(isFinite(cur) ? cur : 0.15625)) }));
                }
                setFlute(val);
              }}
            >
              {FLUTES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </label>
          <label>
            <span>Thickness ({lenU})</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              disabled={flute !== "custom"}
              value={flute === "custom" ? v.thick : showLen(parseFloat(flute))}
              onChange={set("thick")}
            />
          </label>
        </div>
        <label className="csc-full">
          <span title="Extra internal room added to each inside dimension for fit">Clearance per dimension ({lenU})</span>
          <input type="number" inputMode="decimal" min="0" step="any" value={v.clr} onChange={set("clr")} />
        </label>
      </div>

      {/* ─────────── Results ─────────── */}
      <div className="csc-panel csc-results">
        <div className="csc-row csc-row--between">
          <p className="csc-step">3 &middot; Case options</p>
          <p className="csc-count" aria-live="polite">
            {results.length ? `${results.length} option${results.length === 1 ? "" : "s"} for ${Math.floor(num(count))} units` : ""}
          </p>
        </div>

        {results.length === 0 ? (
          <p className="csc-empty">Enter your unit size and units per case to see case options.</p>
        ) : (
          <>
            <CaseDiagram
              pkgType={pkg}
              row={selected}
              uH={unit.uH}
              labels={
                selected
                  ? {
                      L: `${showLen(selected.odL)} ${lenU}`,
                      W: `${showLen(selected.odW)} ${lenU}`,
                      H: `${showLen(selected.odH)} ${lenU}`,
                    }
                  : {}
              }
            />

            <div className="csc-tablewrap">
              <table className="csc-table">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c.id} scope="col" aria-sort={sort.id === c.id ? (sort.dir > 0 ? "ascending" : "descending") : "none"}>
                        <button type="button" onClick={() => clickSort(c.id)}>
                          {c.label}
                          {sort.id === c.id ? (sort.dir > 0 ? " ▲" : " ▼") : ""}
                          <span>{c.id === "od" ? `${c.sub} (${lenU})` : c.sub}</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => {
                    const on = selected && r.key === selected.key;
                    return (
                      <tr
                        key={r.key}
                        className={on ? "is-sel" : ""}
                        onClick={() => setSelKey(r.key)}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelKey(r.key))}
                        aria-selected={on}
                      >
                        <td className="csc-arr">{r.arr}</td>
                        <td>{showLen(r.odL)} &times; {showLen(r.odW)} &times; {showLen(r.odH)}</td>
                        <td>{showWt(r.caseWt)}</td>
                        <td className="csc-dim">{showWt(r.boardWt)}</td>
                        <td className="csc-dim">{r.cube}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="csc-fine">
              Click a row to draw it. Outside dimensions and corrugate weights are engineering
              estimates based on standard score allowances and typical board basis weights.
              Verify with your box supplier.
            </p>
          </>
        )}

        <div className="csc-next">
          <p className="csc-next__title">Next: which case fits your pallet best?</p>
          <p>
            Betsel Stack compares every case option on your pallet, ranks the patterns, shows
            the load in 3D, and builds a branded PDF report.
          </p>
          <div className="csc-next__actions">
            <Link href="/signup" className="btn btn--primary">Try it free for 7 days</Link>
            <Link href="/software#watch" className="csc-textlink">Watch the tour &rarr;</Link>
          </div>
          <p className="csc-fine">No credit card &middot; then $29/month</p>
        </div>
      </div>
    </div>
  );
}
