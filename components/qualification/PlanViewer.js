"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { composeDocument, STATUS_LABELS } from "@/lib/qualification/engine";
import DocumentView from "@/components/qualification/DocumentView";
import { exportPlanPdf } from "@/components/qualification/exportPdf";

export default function PlanViewer({ initialPlan }) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const doc = useMemo(() => composeDocument(plan), [plan]);

  async function changeStatus(status) {
    setBusy("status");
    setErr("");
    try {
      const res = await fetch(`/api/qualification-plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Could not update status");
      setPlan(await res.json());
    } catch (e) {
      setErr(e.message);
    }
    setBusy("");
  }

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

  return (
    <div className="qp-shell">
      <div className="qp-topbar">
        <div>
          <Link href="/qualification-plans" className="qp-back">&larr; All qualification plans</Link>
          <h1 className="qp-h1">{plan.plan_number} <span className="qp-rev">Rev {plan.revision}</span></h1>
          <p className="qp-sub">{plan.title}</p>
        </div>
        <div className="qp-actions">
          <select className="input" value={plan.status} disabled={!!busy} onChange={(e) => changeStatus(e.target.value)} aria-label="Status">
            {Object.entries(STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
          <Link href={`/qualification-plans/${plan.id}/edit`} className="btn btn--ghost">
            {plan.status === "approved" ? "Revise" : "Edit"}
          </Link>
          <button type="button" className="btn btn--primary" disabled={!!busy} onClick={exportPdf}>
            {busy === "pdf" ? "Building PDF…" : "Export PDF"}
          </button>
        </div>
      </div>

      {err && <p className="qp-err">{err}</p>}

      <DocumentView doc={doc} />

      <div className="qp-foot">
        <button type="button" className="qp-danger" disabled={!!busy} onClick={remove}>Delete this plan</button>
      </div>
    </div>
  );
}
