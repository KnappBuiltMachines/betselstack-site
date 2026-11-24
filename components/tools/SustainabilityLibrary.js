"use client";

// components/tools/SustainabilityLibrary.js
// Interactive materials explorer for the free Sustainability Library
// (/tools/sustainability-library). Search, filter by category, sort by a
// rating, and compare up to three materials side by side. All data lives in
// lib/sustainability/library.js so the page can also render it as plain text.

import { useMemo, useState } from "react";
import { MATERIALS, CATEGORIES, RATING_KEYS, H2R } from "@/lib/sustainability/library";

const COMPOST = { certified: "Certified compostable options", possible: "Possible (uncoated fiber)", no: "No" };
const MAX_COMPARE = 3;

function Meter({ value, label }) {
  return (
    <span className="sl-meter" role="img" aria-label={`${label}: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={"sl-meter__seg" + (i <= value ? " is-on" : "")} data-v={value} />
      ))}
    </span>
  );
}

function H2RBadge({ id }) {
  const d = H2R[id];
  if (!d) return null;
  return (
    <span className={`sl-badge sl-badge--${d.tone}`} title={d.text}>
      {d.label}
    </span>
  );
}

export default function SustainabilityLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("recycle");
  const [open, setOpen] = useState(null);
  const [cmp, setCmp] = useState([]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = MATERIALS.filter((m) => cat === "all" || m.cat === cat);
    if (needle) {
      out = out.filter((m) =>
        [m.name, m.examples, m.summary, ...(m.tips || []), ...(m.watch || [])]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
    if (sort !== "name") {
      out = [...out].sort((a, b) => b.ratings[sort] - a.ratings[sort] || a.name.localeCompare(b.name));
    } else {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    }
    return out;
  }, [q, cat, sort]);

  const toggleCmp = (id) =>
    setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : [...c, id]));

  const cmpItems = cmp.map((id) => MATERIALS.find((m) => m.id === id)).filter(Boolean);
  const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || "";

  return (
    <div className="sl">
      <div className="sl-bar">
        <label className="sl-search">
          <span className="sr-only">Search materials</span>
          <input
            type="search"
            placeholder="Search materials, uses or issues (e.g. PFAS, stretch film, clamshell)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label className="sl-sort">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {RATING_KEYS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
            <option value="name">Name (A–Z)</option>
          </select>
        </label>
      </div>

      <div className="sl-chips" role="group" aria-label="Filter by category">
        <button type="button" className={cat === "all" ? "is-on" : ""} onClick={() => setCat("all")}>
          All <span>{MATERIALS.length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={cat === c.id ? "is-on" : ""} onClick={() => setCat(c.id)}>
            {c.label} <span>{MATERIALS.filter((m) => m.cat === c.id).length}</span>
          </button>
        ))}
      </div>

      {cmpItems.length > 0 && (
        <div className="sl-compare" aria-live="polite">
          <div className="sl-compare__head">
            <strong>Compare ({cmpItems.length}/{MAX_COMPARE})</strong>
            <button type="button" className="sl-textbtn" onClick={() => setCmp([])}>Clear</button>
          </div>
          <div className="csc-tablewrap" style={{ maxHeight: "none" }}>
            <table className="tools-ref sl-compare__table">
              <thead>
                <tr>
                  <th>Material</th>
                  {cmpItems.map((m) => (
                    <th key={m.id}>{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>U.S. recycling label (typical)</td>
                  {cmpItems.map((m) => (
                    <td key={m.id}><H2RBadge id={m.h2r} /></td>
                  ))}
                </tr>
                {RATING_KEYS.map((r) => (
                  <tr key={r.id}>
                    <td>{r.label}</td>
                    {cmpItems.map((m) => (
                      <td key={m.id}><Meter value={m.ratings[r.id]} label={r.label} /> <span className="sl-num">{m.ratings[r.id]}/5</span></td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td>Compostable</td>
                  {cmpItems.map((m) => (
                    <td key={m.id}>{COMPOST[m.compost]}</td>
                  ))}
                </tr>
                <tr>
                  <td>Watch out for</td>
                  {cmpItems.map((m) => (
                    <td key={m.id} className="sl-wrap">{(m.watch && m.watch[0]) || "—"}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="sl-count">
        {list.length} {list.length === 1 ? "material" : "materials"}
        {cmp.length === 0 ? " · tick Compare on up to three cards to see them side by side" : ""}
      </p>

      <div className="sl-grid">
        {list.map((m) => {
          const isOpen = open === m.id;
          const inCmp = cmp.includes(m.id);
          return (
            <article key={m.id} className={"sl-card" + (isOpen ? " is-open" : "")}>
              <header className="sl-card__head">
                <span className="sl-card__cat">{catLabel(m.cat)}</span>
                <h3>{m.name}</h3>
                <p className="sl-card__ex">{m.examples}</p>
                <H2RBadge id={m.h2r} />
              </header>

              <dl className="sl-ratings">
                {RATING_KEYS.map((r) => (
                  <div key={r.id} title={r.hint}>
                    <dt>{r.label}</dt>
                    <dd><Meter value={m.ratings[r.id]} label={r.label} /></dd>
                  </div>
                ))}
              </dl>

              <p className="sl-card__sum">{m.summary}</p>

              {isOpen && (
                <div className="sl-card__more">
                  {m.tips && m.tips.length > 0 && (
                    <>
                      <h4>Design tips</h4>
                      <ul>{m.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                    </>
                  )}
                  {m.watch && m.watch.length > 0 && (
                    <>
                      <h4>Watch out for</h4>
                      <ul className="sl-watch">{m.watch.map((t) => <li key={t}>{t}</li>)}</ul>
                    </>
                  )}
                  <p className="sl-fine">Compostable: {COMPOST[m.compost]}</p>
                </div>
              )}

              <footer className="sl-card__foot">
                <button type="button" className="sl-textbtn" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen}>
                  {isOpen ? "Show less" : "Design tips & watch-outs"}
                </button>
                <label className={"sl-cmp" + (!inCmp && cmp.length >= MAX_COMPARE ? " is-disabled" : "")}>
                  <input
                    type="checkbox"
                    checked={inCmp}
                    disabled={!inCmp && cmp.length >= MAX_COMPARE}
                    onChange={() => toggleCmp(m.id)}
                  />
                  Compare
                </label>
              </footer>
            </article>
          );
        })}
        {list.length === 0 && <p className="csc-empty">No materials match that search.</p>}
      </div>
    </div>
  );
}
