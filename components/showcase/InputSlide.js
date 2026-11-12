"use client";

// components/showcase/InputSlide.js
// Slide 1 of the home showcase: a faithful recreation of the pallet builder's
// input panels (project, pallet size, load constraints, case dimensions,
// trailer configuration, stacking). Values type themselves in, then the
// panel "generates" ranked patterns and the loop starts over.
// Drawn on a fixed 760 x 600 design canvas; HomeShowcase scales it to fit.

import { useClock } from "./useClock";

export const INPUT_MS = 11800;
const CH = 38; // ms per typed character

// field typing script: [key, startMs, text]
const TYPE = [
  ["project", 400, "12pk Eggs Optimization"],
  ["desc", 1450, "12pk 12ct Eggs Organic"],
  ["notes", 2450, "Regular 3 top / 2 middle / 3 bottom stretch wrapping"],
  ["maxStack", 5750, "52"],
  ["caseL", 6250, "9.5"],
  ["caseW", 6650, "8"],
  ["caseH", 6950, "5"],
];
// fields that are only focused (left blank on purpose)
const FOCUS = [
  ["edge", 5150, 5650],
  ["weight", 7300, 7700],
];
const T_PALLET = 4700;
const T_TRAILER = 8000;
const T_STACK = 8550;
const T_GEN = 9300;

function typed(t, key) {
  const row = TYPE.find((r) => r[0] === key);
  if (!row) return "";
  const [, start, text] = row;
  if (t < start) return "";
  return text.slice(0, Math.min(text.length, Math.floor((t - start) / CH) + 1));
}
function activeKey(t) {
  for (const [k, s, text] of TYPE) if (t >= s - 120 && t < s + text.length * CH + 260) return k;
  for (const [k, a, b] of FOCUS) if (t >= a && t < b) return k;
  return null;
}

function Field({ k, t, act, placeholder, area, spin, small }) {
  const v = typed(t, k);
  const on = act === k;
  return (
    <div className={`bi-in${area ? " bi-in--area" : ""}${on ? " is-focus" : ""}${small ? " bi-in--sm" : ""}`}>
      {v ? <span className="bi-val">{v}</span> : !on && <span className="bi-ph">{placeholder}</span>}
      {on && <i className="bi-caret" />}
      {spin && <span className="bi-spin" aria-hidden="true" />}
    </div>
  );
}

export default function InputSlide({ active, still }) {
  const t = useClock(active, INPUT_MS, still);
  const act = still ? null : activeKey(t);
  const palletOn = t >= T_PALLET;
  const trailerOn = t >= T_TRAILER;
  const stackOn = t >= T_STACK;
  const gen = t >= T_GEN && !still;
  const genP = Math.min(1, Math.max(0, (t - T_GEN - 250) / 1700));

  return (
    <div className="bi" aria-hidden="true">
      {/* ---------------- left column ---------------- */}
      <div className="bi-panel">
        <div className="bi-box">
          <p className="bi-lab">Project name</p>
          <Field k="project" t={t} act={act} placeholder="e.g. Acme Corp — SKU 12345" />
          <p className="bi-lab">Pallet pattern description</p>
          <Field k="desc" t={t} act={act} placeholder="Describe this pallet pattern..." area />
          <p className="bi-lab">Notes / disclaimer</p>
          <Field k="notes" t={t} act={act} placeholder="Special instructions, customer notes, disclaimer..." area />
        </div>

        <p className="bi-h bi-h--flush">Pallet size</p>
        <div className="bi-sizes">
          <span className={`bi-chip${palletOn ? " is-on" : ""}${t >= T_PALLET && t < T_PALLET + 500 ? " is-press" : ""}`}>Full (48&times;40&quot;)</span>
          <span className="bi-chip">Half (48&times;20&quot;)</span>
          <span className="bi-chip">Quarter (24&times;20&quot;)</span>
          <span className="bi-chip">Sixth (16&times;20&quot;)</span>
          <span className="bi-chip">Custom</span>
        </div>
        <p className={`bi-note bi-deck${palletOn ? " is-on" : ""}`}>48&quot;&times;40&quot;&times;5.5&quot; deck</p>

        <div className="bi-box bi-box--grow">
          <p className="bi-h">Load constraints</p>
          <p className="bi-lab">Edge offset / side (in)</p>
          <Field k="edge" t={t} act={act} placeholder="e.g. 1 or -0.75" spin />
          <p className="bi-help">
            Positive = overhang allowed per side
            <br />
            Negative = inset (cases must stay back from edge)
            <br />
            Blank = cases flush with pallet edge
          </p>
          <p className="bi-lab">Max stack height (in)</p>
          <Field k="maxStack" t={t} act={act} placeholder="" spin />
        </div>
      </div>

      {/* ---------------- right column ---------------- */}
      <div className="bi-panel">
        <div className="bi-box">
          <p className="bi-h">Packaging options</p>
          <p className="bi-check">
            <span className="bi-cb" /> Slip Sheets
          </p>
        </div>

        <p className="bi-h bi-h--flush">Case dimensions</p>
        <div className="bi-case">
          <div className="bi-case-name">
            <span className="bi-swatch" />
            <span className="bi-name">Case A</span>
          </div>
          <div className="bi-dims">
            <div>
              <p className="bi-lab">L (in)</p>
              <Field k="caseL" t={t} act={act} placeholder="" spin />
            </div>
            <div>
              <p className="bi-lab">W (in)</p>
              <Field k="caseW" t={t} act={act} placeholder="" spin />
            </div>
            <div>
              <p className="bi-lab">H (in)</p>
              <Field k="caseH" t={t} act={act} placeholder="" spin />
            </div>
          </div>
          <div className="bi-weight">
            <p className="bi-lab">Weight (lbs)</p>
            <Field k="weight" t={t} act={act} placeholder="lbs" spin small />
          </div>
        </div>
        <div className="bi-add">+ Add case</div>

        <div className="bi-box bi-box--grow">
          <p className="bi-h">Trailer configuration</p>
          <p className="bi-lab">Trailer type</p>
          {[
            "53' Reefer — 630×93×100\"",
            "53' Dry Van — 636×96×110\"",
            "48' Trailer — 576×96×110\"",
            "Custom — L×W×H",
          ].map((l, i) => (
            <p className="bi-radio" key={l}>
              <span className={`bi-rb${i === 0 && trailerOn ? " is-on" : ""}`} /> {l}
            </p>
          ))}
          <p className="bi-lab bi-lab--gap">Stacking</p>
          <div className="bi-stack">
            <span className={`bi-btn${stackOn ? " is-on" : ""}`}>Single</span>
            <span className="bi-btn">Double</span>
            <span className="bi-btn is-off">Triple</span>
          </div>
          <p className={`bi-help bi-heights${stackOn ? " is-on" : ""}`}>
            Stack heights: 1&times; 50.5&quot; &#10003; | 2&times; 95.5&quot; &#10003; | 3&times; 140.5&quot; &#10007; (trailer: 100&quot;)
          </p>
        </div>
      </div>

      {/* generate overlay */}
      <div className={`bi-gen${gen ? " is-on" : ""}`}>
        <div className="bi-gen-card">
          <p>{genP < 1 ? "Generating ranked patterns…" : "25 cases / layer · 9 high · 225 cases"}</p>
          <span className="bi-gen-bar">
            <i style={{ transform: `scaleX(${genP})` }} />
          </span>
        </div>
      </div>
    </div>
  );
}
