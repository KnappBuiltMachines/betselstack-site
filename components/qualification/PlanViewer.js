"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  composeDocument,
  buildPlan,
  approversOf,
  fmtDateTime,
  STATUS_LABELS,
  RESULT_OPTIONS,
  OUTCOME_LABELS,
} from "@/lib/qualification/engine";
import DocumentView from "@/components/qualification/DocumentView";
import { exportPlanPdf } from "@/components/qualification/exportPdf";

const STATUS_HELP = {
  draft: "Edit freely. Submit for approval when the plan is ready.",
  in_review: "Waiting for signatures. The plan becomes Approved when every role has signed.",
  approved: "Approved and locked. Record lab, distribution and line-trial results below, then complete the qualification.",
  completed: "Qualification complete. To change the plan, create a new revision.",
  obsolete: "Obsolete — kept for the record. Create a new revision to reuse it.",
};

export default function PlanViewer({ initialPlan }) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [signing, setSigning] = useState(null); // approver being signed
  const [sigName, setSigName] = useState("");
  const [sigOk, setSigOk] = useState(false);
  const [results, setResults] = useState(() => ({ ...(initialPlan.results?.tests || {}) }));
  const [dirty, setDirty] = useState(false);
  const [outcome, setOutcome] = useState("qualified");
  const [conclNotes, setConclNotes] = useState("");
  const [conclName, setConclName] = useState("");

  // Dates/times are shown in the viewer's own time zone, so render after mount
  // (avoids a server/browser time-zone mismatch on first paint).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const doc = useMemo(() => composeDocument(plan), [plan]);
  const content = useMemo(() => (plan.content?.tests ? plan.content : buildPlan(plan.inputs)), [plan]);
  const items = useMemo(
    () => [
      ...content.tests.map((t) => ({ ...t, kind: "Test" })),
      ...(content.lineTrials || []).map((t) => ({ ...t, kind: "Line trial", standard: t.line })),
    ],
    [content]
  );
  const approvers = approversOf(plan.inputs);
  const approvals = Array.isArray(plan.approvals) ? plan.approvals : [];

  async function workflow(action, extra = {}, tag = action) {
    setBusy(tag);
    setErr("");
    try {
      const res = await fetch(`/api/qualification-plans/${plan.id}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Something went wrong");
      const next = await res.json();
      setPlan(next);
      setResults({ ...(next.results?.tests || {}) });
      setBusy("");
      return true;
    } catch (e) {
      setErr(e.message);
      setBusy("");
      return false;
    }
  }

  async function sign() {
    const ok = await workflow("sign", { approverId: signing.id, name: sigName, confirm: sigOk }, "sign");
    if (ok) {
      setSigning(null);
      setSigName("");
      setSigOk(false);
    }
  }

  async function saveResults() {
    if (await workflow("results", { results }, "results")) setDirty(false);
  }

  async function complete() {
    if (dirty && !(await workflow("results", { results }, "results"))) return;
    setDirty(false);
    if (!window.confirm(`Complete ${plan.plan_number} as "${OUTCOME_LABELS[outcome]}"?`)) return;
    await workflow("complete", { outcome, notes: conclNotes, name: conclName }, "complete");
  }

  const setR = (id, k, v) => {
    setDirty(true);
    setResults((s) => ({ ...s, [id]: { ...(s[id] || {}), [k]: v } }));
  };

  async function exportPdf() {
    setBusy("pdf");
    setErr("");
    try {
      const safe = (plan.title || "").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_").slice(0, 60);
      await exportPlanPdf(doc, `${plan.plan_number}_Rev${plan.revision}${safe ? "_" + safe : ""}.pdf`);
    } catch (e) {
      setErr(e.message);
    }
    setBusy("");
  }

  async function remove() {
    if (!window.confirm(`Delete ${plan.plan_number}? This can't be undone.`)) return;
    setBusy("delete");
    const res = await fetch(`/api/qualification-plans/${plan.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/qualification-plans");
      router.refresh();
    } else {
      setErr((await res.text()) || "Delete failed");
      setBusy("");
    }
  }

  const locked = ["approved", "completed", "obsolete"].includes(plan.status);
  const signedCount = approvers.filter((a) => approvals.some((s) => s.approverId === a.id)).length;
  const recordedCount = items.filter((t) => results[t.id]?.result).length;

  if (!mounted) {
    return (
      <div className="qp-shell">
        <p className="qp-sub">Loading {plan.plan_number}…</p>
      </div>
    );
  }

  return (
    <div className="qp-shell">
      <div className="qp-topbar">
        <div>
          <Link href="/qualification-plans" className="qp-back">&larr; All qualification plans</Link>
          <h1 className="qp-h1">{plan.plan_number} <span className="qp-rev">Rev {plan.revision}</span></h1>
          <p className="qp-sub">{plan.title}</p>
        </div>
        <div className="qp-actions">
          <Link href={`/qualification-plans/${plan.id}/edit`} className="btn btn--ghost">
            {locked ? "New revision" : "Edit"}
          </Link>
          <button type="button" className="btn btn--primary" disabled={!!busy} onClick={exportPdf}>
            {busy === "pdf" ? "Building PDF…" : "Export PDF"}
          </button>
        </div>
      </div>

      {err && <p className="qp-err">{err}</p>}

      {/* ---------- workflow status ---------- */}
      <div className="form-panel qp-flow">
        <ol className="qp-flow__track">
          {["draft", "in_review", "approved", "completed"].map((s) => {
            const order = ["draft", "in_review", "approved", "completed"];
            const cur = order.indexOf(plan.status);
            const idx = order.indexOf(s);
            return (
              <li key={s} className={plan.status === s ? "is-current" : cur > idx ? "is-done" : ""}>
                {STATUS_LABELS[s]}
              </li>
            );
          })}
          {plan.status === "obsolete" && <li className="is-current">Obsolete</li>}
        </ol>
        <p className="qp-sub">{STATUS_HELP[plan.status]}</p>

        <div className="qp-flow__btns">
          {plan.status === "draft" && (
            <button className="btn btn--primary" disabled={!!busy} onClick={() => workflow("submit")}>
              Submit for approval
            </button>
          )}
          {plan.status === "in_review" && (
            <button className="btn btn--ghost" disabled={!!busy} onClick={() => workflow("withdraw")}>
              Withdraw to draft
            </button>
          )}
          {plan.status === "completed" && (
            <button className="btn btn--ghost" disabled={!!busy} onClick={() => workflow("reopen")}>
              Reopen to edit results
            </button>
          )}
          {plan.status !== "obsolete" && (
            <button
              className="qp-danger"
              disabled={!!busy}
              onClick={() => window.confirm(`Mark ${plan.plan_number} Rev ${plan.revision} obsolete?`) && workflow("obsolete")}
            >
              Mark obsolete
            </button>
          )}
        </div>

        {/* ---------- approvals ---------- */}
        {plan.status !== "draft" && (
          <>
            <h3 className="qp-h3">Approvals &middot; {signedCount} of {approvers.length} signed</h3>
            <div className="qp-sigs">
              {approvers.map((a) => {
                const s = approvals.find((x) => x.approverId === a.id);
                return (
                  <div key={a.id} className={`qp-sig ${s ? "is-signed" : ""}`}>
                    <div className="qp-sig__role">{a.role}</div>
                    {s ? (
                      <div className="qp-sig__done">
                        <strong>&#10003; {s.name}</strong>
                        <span>{fmtDateTime(s.signedAt)}</span>
                        {s.email && <span>{s.email}</span>}
                      </div>
                    ) : plan.status === "in_review" ? (
                      <button
                        className="btn btn--ghost"
                        onClick={() => {
                          setSigning(a);
                          setSigName(a.name || "");
                          setSigOk(false);
                        }}
                      >
                        Sign{a.name ? ` as ${a.name}` : ""}
                      </button>
                    ) : (
                      <span className="qp-hint">Not signed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ---------- results ---------- */}
      {(plan.status === "approved" || plan.status === "completed") && (
        <div className="form-panel qp-flow">
          <h3 className="qp-h3" style={{ marginTop: 0 }}>
            Results &middot; {recordedCount} of {items.length} recorded
          </h3>
          <div className="qp-table-wrap">
            <table className="qp-results">
              <thead>
                <tr>
                  <th>#</th><th>Test / trial</th><th>Result</th><th>Date</th><th>Measured / observed</th><th>By</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t, k) => {
                  const r = results[t.id] || {};
                  const ro = plan.status !== "approved";
                  return (
                    <tr key={t.id}>
                      <td className="qp-muted">{k + 1}</td>
                      <td>
                        <div className="qp-test__name">{t.name}</div>
                        <div className="qp-hint">{t.kind}{t.standard ? ` · ${t.standard}` : ""}</div>
                      </td>
                      <td>
                        <select className={`input qp-res qp-res--${(r.result || "").toLowerCase().replace("/", "")}`} value={r.result || ""} disabled={ro} onChange={(e) => setR(t.id, "result", e.target.value)}>
                          <option value="">Pending</option>
                          {RESULT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </td>
                      <td><input className="input" type="date" value={r.date || ""} disabled={ro} onChange={(e) => setR(t.id, "date", e.target.value)} /></td>
                      <td>
                        <textarea className="input qp-obs" rows={1} value={r.value || ""} disabled={ro} onChange={(e) => setR(t.id, "value", e.target.value)}
                          placeholder={t.kind === "Line trial" ? "e.g. 598 cans/min avg, 2 jams, seams in spec" : "e.g. BCT 742 lbf mean, no damage"} />
                      </td>
                      <td><input className="input" value={r.by || ""} disabled={ro} onChange={(e) => setR(t.id, "by", e.target.value)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {plan.status === "approved" && (
            <>
              <div className="qp-flow__btns">
                <button className="btn btn--primary" disabled={!!busy || !dirty} onClick={saveResults}>
                  {busy === "results" ? "Saving…" : dirty ? "Save results" : "Results saved"}
                </button>
              </div>

              <h3 className="qp-h3">Complete the qualification</h3>
              <div className="qp-grid">
                <div className="field">
                  <label>Outcome</label>
                  <select className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                    {Object.entries(OUTCOME_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Your full name</label>
                  <input className="input" value={conclName} onChange={(e) => setConclName(e.target.value)} />
                </div>
                <div className="field qp-wide">
                  <label>Conclusion notes</label>
                  <textarea className="textarea" style={{ minHeight: 90 }} value={conclNotes} onChange={(e) => setConclNotes(e.target.value)}
                    placeholder="Summary of results, any conditions or follow-up actions." />
                </div>
              </div>
              <button className="btn btn--primary" disabled={!!busy || conclName.trim().length < 2} onClick={complete}>
                {busy === "complete" ? "Completing…" : "Complete qualification"}
              </button>
            </>
          )}
        </div>
      )}

      <DocumentView doc={doc} />

      <div className="qp-foot">
        <button type="button" className="qp-danger" disabled={!!busy} onClick={remove}>Delete this plan</button>
      </div>

      {/* ---------- signature dialog ---------- */}
      {signing && (
        <div className="qp-modal" onClick={() => setSigning(null)}>
          <div className="qp-modal__inner qp-signbox form-panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="qp-h3" style={{ marginTop: 0 }}>Sign as {signing.role}</h3>
            <p className="qp-sub" style={{ marginBottom: 16 }}>
              {plan.plan_number} Rev {plan.revision} &mdash; {plan.title}
            </p>
            <div className="field">
              <label>Type your full name</label>
              <input className="input" autoFocus value={sigName} onChange={(e) => setSigName(e.target.value)} />
            </div>
            <label className="qp-check" style={{ alignItems: "flex-start" }}>
              <input type="checkbox" checked={sigOk} onChange={(e) => setSigOk(e.target.checked)} />
              <span>
                I have reviewed {plan.plan_number} Rev {plan.revision} and approve it as {signing.role}. I understand this
                electronic signature is recorded with my name, account and the date and time.
              </span>
            </label>
            {err && <p className="qp-err">{err}</p>}
            <div className="qp-nav">
              <button className="btn btn--ghost" onClick={() => setSigning(null)}>Cancel</button>
              <button className="btn btn--primary" disabled={!!busy || !sigOk || sigName.trim().length < 2} onClick={sign}>
                {busy === "sign" ? "Signing…" : "Sign and approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
