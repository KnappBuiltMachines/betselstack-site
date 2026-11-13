"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OPTIONS, emptyInputs, buildPlan, composeDocument, nextRevision } from "@/lib/qualification/engine";
import DocumentView from "@/components/qualification/DocumentView";

const STEPS = ["Identification", "Product", "Packaging Materials", "Distribution", "Background & Scope", "Tests & Review"];

// ---------- small field helpers ----------
function Field({ label, hint, children, wide }) {
  return (
    <div className={`field ${wide ? "qp-wide" : ""}`}>
      <label>{label}</label>
      {children}
      {hint && <div className="qp-hint">{hint}</div>}
    </div>
  );
}
function Text({ value, onChange, ...rest }) {
  return <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />;
}
function Area({ value, onChange, rows = 4, ...rest }) {
  return (
    <textarea className="textarea" style={{ minHeight: rows * 24 }} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
  );
}
function Select({ list, value, onChange }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      {OPTIONS[list].map(([k, l]) => (
        <option key={k} value={k}>{l}</option>
      ))}
    </select>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <label className="qp-check">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function PlanWizard({ plan }) {
  const router = useRouter();
  const editing = !!plan;
  const [inputs, setInputs] = useState(() => ({ ...emptyInputs(), ...(plan?.inputs || {}) }));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(false);
  const mustRevise = editing && plan.status === "approved";
  const [asRevision, setAsRevision] = useState(mustRevise);
  const [revNote, setRevNote] = useState("");

  const set = (k) => (v) => setInputs((s) => ({ ...s, [k]: v }));
  const computed = useMemo(() => buildPlan(inputs), [inputs]);
  const risk = computed.risk;

  // ---------- materials ----------
  const setMat = (idx, k, v) =>
    setInputs((s) => ({ ...s, materials: s.materials.map((m, j) => (j === idx ? { ...m, [k]: v } : m)) }));
  const addMat = () =>
    setInputs((s) => ({ ...s, materials: [...s.materials, { level: "secondary", type: "corrugated", component: "", spec: "", supplier: "" }] }));
  const delMat = (idx) => setInputs((s) => ({ ...s, materials: s.materials.filter((_, j) => j !== idx) }));

  // ---------- tests ----------
  const toggleTest = (id, on) =>
    setInputs((s) => {
      const ex = new Set(s.excludedTests || []);
      on ? ex.delete(id) : ex.add(id);
      return { ...s, excludedTests: [...ex] };
    });
  const setCustom = (idx, k, v) =>
    setInputs((s) => ({ ...s, customTests: s.customTests.map((t, j) => (j === idx ? { ...t, [k]: v } : t)) }));
  const addCustom = () =>
    setInputs((s) => ({ ...s, customTests: [...(s.customTests || []), { name: "", standard: "", purpose: "", samples: "", priority: "Required" }] }));
  const delCustom = (idx) => setInputs((s) => ({ ...s, customTests: s.customTests.filter((_, j) => j !== idx) }));

  const canSave = !!(inputs.productName || inputs.title).trim();

  async function save() {
    setErr("");
    if (!canSave) {
      setErr("Add at least a plan title or product name (Identification step).");
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/qualification-plans/${plan.id}` : "/api/qualification-plans", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { inputs, newRevision: asRevision, revisionNote: revNote } : { inputs }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Save failed (${res.status})`);
      const saved = await res.json();
      router.push(`/qualification-plans/${saved.id}`);
      router.refresh();
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  }

  const previewDoc = useMemo(
    () =>
      preview
        ? composeDocument({
            ...(plan || {}),
            revision: editing && asRevision ? nextRevision(plan.revision) : plan?.revision || "A",
            status: editing && asRevision ? "draft" : plan?.status || "draft",
            inputs,
            content: computed,
          })
        : null,
    [preview, plan, inputs, computed, editing, asRevision]
  );

  return (
    <div className="qp-shell">
      <div className="qp-topbar">
        <div>
          <Link href="/qualification-plans" className="qp-back">&larr; All qualification plans</Link>
          <h1 className="qp-h1">
            {editing ? `Edit ${plan.plan_number} Rev ${plan.revision}` : "New qualification plan"}
          </h1>
          {!editing && <p className="qp-sub">A plan number (QP-YYYY-NNNN) is assigned automatically when you save.</p>}
        </div>
        <div className={`qp-risk qp-risk--${risk.level.toLowerCase()}`}>
          <span>Risk</span>
          <strong>{risk.level}</strong>
          <em>{risk.score} pts &middot; {computed.tests.length} tests</em>
        </div>
      </div>

      <ol className="qp-steps">
        {STEPS.map((s, k) => (
          <li key={s}>
            <button type="button" className={k === step ? "is-active" : k < step ? "is-done" : ""} onClick={() => setStep(k)}>
              <span>{k + 1}</span> {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="form-panel qp-panel">
        {step === 0 && (
          <div className="qp-grid">
            <Field label="Plan title" hint="Leave blank to use “Qualification Plan — {product}”." wide>
              <Text value={inputs.title} onChange={set("title")} placeholder="e.g. 5 lb Clamshell Shipper — Material Change" />
            </Field>
            <Field label="Customer"><Text value={inputs.customer} onChange={set("customer")} /></Field>
            <Field label="Product name"><Text value={inputs.productName} onChange={set("productName")} /></Field>
            <Field label="SKU / item number"><Text value={inputs.sku} onChange={set("sku")} /></Field>
            <Field label="Reason for qualification"><Select list="changeType" value={inputs.changeType} onChange={set("changeType")} /></Field>
            <Field label="Prepared by"><Text value={inputs.preparedBy} onChange={set("preparedBy")} /></Field>
            <Field label="Company / department"><Text value={inputs.company} onChange={set("company")} /></Field>
          </div>
        )}

        {step === 1 && (
          <div className="qp-grid">
            <Field label="Product category"><Select list="productCategory" value={inputs.productCategory} onChange={set("productCategory")} /></Field>
            <Field label="Packed case weight (lb)"><Text type="number" min="0" step="0.1" value={inputs.caseWeightLb} onChange={set("caseWeightLb")} /></Field>
            <Field label="Case dimensions L × W × H (in)">
              <div className="qp-row3">
                <Text type="number" min="0" step="0.01" placeholder="L" value={inputs.caseL} onChange={set("caseL")} />
                <Text type="number" min="0" step="0.01" placeholder="W" value={inputs.caseW} onChange={set("caseW")} />
                <Text type="number" min="0" step="0.01" placeholder="H" value={inputs.caseH} onChange={set("caseH")} />
              </div>
            </Field>
            <Field label="Product fragility"><Select list="fragility" value={inputs.fragility} onChange={set("fragility")} /></Field>
            <Field label="Unit value"><Select list="unitValue" value={inputs.unitValue} onChange={set("unitValue")} /></Field>
            <Field label="Special attributes" wide>
              <div className="qp-checks">
                <Check label="Food contact" checked={inputs.foodContact} onChange={set("foodContact")} />
                <Check label="Perishable" checked={inputs.perishable} onChange={set("perishable")} />
                <Check label="Liquid" checked={inputs.liquid} onChange={set("liquid")} />
                <Check label="Hazardous material" checked={inputs.hazmat} onChange={set("hazmat")} />
              </div>
            </Field>
            <Field label="Product description" wide>
              <Area value={inputs.productDescription} onChange={set("productDescription")} rows={4} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="qp-sub" style={{ marginBottom: 16 }}>List every component in the packaging system, from primary package to unit load.</p>
            <div className="qp-mat-head">
              <span>Level</span><span>Material</span><span>Component</span><span>Specification</span><span>Supplier</span><span />
            </div>
            {inputs.materials.map((m, k) => (
              <div className="qp-mat-row" key={k}>
                <Select list="materialLevel" value={m.level} onChange={(v) => setMat(k, "level", v)} />
                <Select list="materialType" value={m.type} onChange={(v) => setMat(k, "type", v)} />
                <Text value={m.component} onChange={(v) => setMat(k, "component", v)} placeholder="e.g. RSC shipper" />
                <Text value={m.spec} onChange={(v) => setMat(k, "spec", v)} placeholder="e.g. 32 ECT C-flute" />
                <Text value={m.supplier} onChange={(v) => setMat(k, "supplier", v)} />
                <button type="button" className="qp-x" onClick={() => delMat(k)} aria-label="Remove component">&times;</button>
              </div>
            ))}
            <button type="button" className="btn btn--ghost" onClick={addMat}>+ Add component</button>
            <div className="qp-grid" style={{ marginTop: 24 }}>
              <Field label="Pallet pattern reference (optional)" hint="e.g. your saved Betsel Stack pattern name, Ti × Hi" wide>
                <Text value={inputs.palletPatternRef} onChange={set("palletPatternRef")} placeholder="e.g. 10 × 6 interlock, 60 cases" />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="qp-grid">
            <Field label="Distribution channel"><Select list="channel" value={inputs.channel} onChange={set("channel")} /></Field>
            <Field label="Customer / retailer requirement" hint="Typing “Amazon” adds ISTA 6-Amazon.com-SIOC.">
              <Text value={inputs.retailerRequirement} onChange={set("retailerRequirement")} placeholder="e.g. Amazon SIOC, Walmart, none" />
            </Field>
            <Field label="Temperature"><Select list="temperature" value={inputs.temperature} onChange={set("temperature")} /></Field>
            <Field label="Humidity"><Select list="humidity" value={inputs.humidity} onChange={set("humidity")} /></Field>
            <Field label="Handling"><Select list="handlingTouches" value={inputs.handlingTouches} onChange={set("handlingTouches")} /></Field>
            <Field label="Transit time (days)"><Text type="number" min="0" value={inputs.transitDays} onChange={set("transitDays")} /></Field>
            <Field label="Warehouse stack height (pallets)"><Text type="number" min="1" max="6" value={inputs.stackHeightPallets} onChange={set("stackHeightPallets")} /></Field>
            <Field label="Storage duration (weeks)"><Text type="number" min="0" value={inputs.storageWeeks} onChange={set("storageWeeks")} /></Field>
            <Field label="Damage history"><Select list="damageHistory" value={inputs.damageHistory} onChange={set("damageHistory")} /></Field>
          </div>
        )}

        {step === 4 && (
          <div className="qp-grid">
            <Field label="Background" hint="Why is this qualification needed? Blank lines start new paragraphs." wide>
              <Area value={inputs.background} onChange={set("background")} rows={5} />
            </Field>
            <Field label="Objectives (one per line)" wide>
              <Area value={inputs.objectives} onChange={set("objectives")} rows={3} placeholder={"Reduce board cost 8% without increasing damage\nQualify second-source supplier"} />
            </Field>
            <Field label="Additional in-scope items (one per line)" wide>
              <Area value={inputs.scopeNotes} onChange={set("scopeNotes")} rows={3} />
            </Field>
            <Field label="Out of scope (one per line)" hint="Leave blank to use standard exclusions." wide>
              <Area value={inputs.outOfScope} onChange={set("outOfScope")} rows={3} />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className={`qp-riskcard qp-riskcard--${risk.level.toLowerCase()}`}>
              <div>
                <div className="qp-riskcard__lvl">{risk.level} risk</div>
                <div className="qp-sub">{risk.score} of {risk.max} points &middot; Low 0–9 &middot; Medium 10–19 &middot; High 20+</div>
                {risk.overrides.map((o) => <div key={o} className="qp-hint">{o}</div>)}
              </div>
              <table className="qp-mini">
                <tbody>
                  {risk.factors.map((f) => (
                    <tr key={f.factor}><td>{f.factor}</td><td>{f.value}</td><td>{f.points}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="qp-h3">Recommended tests</h3>
            <p className="qp-sub" style={{ marginBottom: 12 }}>Uncheck any test you don&rsquo;t want in the plan.</p>
            <div className="qp-tests">
              {computed.recommended.map((t) => {
                const on = !(inputs.excludedTests || []).includes(t.id);
                return (
                  <label key={t.id} className={`qp-test ${on ? "" : "is-off"}`}>
                    <input type="checkbox" checked={on} onChange={(e) => toggleTest(t.id, e.target.checked)} />
                    <div>
                      <div className="qp-test__name">
                        {t.name} <span className="qp-std">{t.standard}</span>
                        <span className={`qp-pri qp-pri--${t.priority.toLowerCase()}`}>{t.priority}</span>
                      </div>
                      <div className="qp-test__why">{t.purpose} <em>Samples: {t.samples}</em></div>
                    </div>
                  </label>
                );
              })}
            </div>

            <h3 className="qp-h3">Custom tests</h3>
            {(inputs.customTests || []).map((t, k) => (
              <div className="qp-custom" key={k}>
                <Text value={t.name} onChange={(v) => setCustom(k, "name", v)} placeholder="Test name" />
                <Text value={t.standard} onChange={(v) => setCustom(k, "standard", v)} placeholder="Standard / method" />
                <Text value={t.purpose} onChange={(v) => setCustom(k, "purpose", v)} placeholder="Purpose" />
                <Text value={t.samples} onChange={(v) => setCustom(k, "samples", v)} placeholder="Samples" />
                <select className="input" value={t.priority} onChange={(e) => setCustom(k, "priority", e.target.value)}>
                  <option>Required</option><option>Recommended</option>
                </select>
                <button type="button" className="qp-x" onClick={() => delCustom(k)} aria-label="Remove test">&times;</button>
              </div>
            ))}
            <button type="button" className="btn btn--ghost" onClick={addCustom}>+ Add custom test</button>

            {editing && (
              <div className="qp-revbox">
                {mustRevise ? (
                  <p>This plan is <strong>Approved</strong>. Saving will create <strong>Rev {nextRevision(plan.revision)}</strong> as a new draft.</p>
                ) : (
                  <Check label={`Save as new revision (Rev ${nextRevision(plan.revision)})`} checked={asRevision} onChange={setAsRevision} />
                )}
                {asRevision && (
                  <Field label="What changed in this revision?">
                    <Text value={revNote} onChange={setRevNote} placeholder="e.g. Updated board grade to 44 ECT" />
                  </Field>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {err && <p className="qp-err">{err}</p>}

      <div className="qp-nav">
        <button type="button" className="btn btn--ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</button>
        <div className="qp-nav__right">
          <button type="button" className="btn btn--ghost" onClick={() => setPreview(true)}>Preview document</button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn--primary" onClick={() => setStep((s) => s + 1)}>Next</button>
          ) : (
            <button type="button" className="btn btn--primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : editing ? (asRevision ? "Save new revision" : "Save changes") : "Create plan"}
            </button>
          )}
        </div>
      </div>

      {preview && previewDoc && (
        <div className="qp-modal" onClick={() => setPreview(false)}>
          <div className="qp-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="qp-modal__close" onClick={() => setPreview(false)}>Close preview &times;</button>
            <DocumentView doc={previewDoc} />
          </div>
        </div>
      )}
    </div>
  );
}
