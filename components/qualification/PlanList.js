"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_LABELS } from "@/lib/qualification/engine";

export default function PlanList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [plans, setPlans] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const p = new URLSearchParams();
        if (q.trim()) p.set("q", q.trim());
        if (status) p.set("status", status);
        const res = await fetch(`/api/qualification-plans?${p}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
        const json = await res.json();
        setPlans(json.plans || []);
        setErr("");
      } catch (e) {
        if (e.name !== "AbortError") setErr(e.message);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, status]);

  return (
    <div className="qp-shell">
      <div className="qp-topbar">
        <div>
          <Link href="/account" className="qp-back">&larr; Account</Link>
          <h1 className="qp-h1">Qualification Plans</h1>
          <p className="qp-sub">Create, revise and export packaging qualification plans.</p>
        </div>
        <Link href="/qualification-plans/new" className="btn btn--primary">+ New plan</Link>
      </div>

      <div className="qp-filters">
        <input
          className="input"
          type="search"
          placeholder="Search plan number, title, customer, product or SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
      </div>

      {err && <p className="qp-err">{err}</p>}

      {plans === null ? (
        <p className="qp-sub">Loading…</p>
      ) : plans.length === 0 ? (
        <div className="form-panel qp-empty">
          {q || status ? (
            <p>No plans match your search.</p>
          ) : (
            <>
              <p>You haven&rsquo;t created a qualification plan yet.</p>
              <Link href="/qualification-plans/new" className="btn btn--primary">Create your first plan</Link>
            </>
          )}
        </div>
      ) : (
        <div className="qp-table-wrap">
          <table className="qp-listtable">
            <thead>
              <tr>
                <th>Plan No.</th><th>Rev</th><th>Title</th><th>Customer</th><th>Product / SKU</th><th>Risk</th><th>Status</th><th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/qualification-plans/${p.id}`} className="qp-num">{p.plan_number}</Link></td>
                  <td>{p.revision}</td>
                  <td><Link href={`/qualification-plans/${p.id}`}>{p.title}</Link></td>
                  <td>{p.customer || "—"}</td>
                  <td>{[p.product_name, p.sku].filter(Boolean).join(" · ") || "—"}</td>
                  <td>{p.risk_level && <span className={`qp-chip qp-chip--${p.risk_level.toLowerCase()}`}>{p.risk_level}</span>}</td>
                  <td><span className={`qp-status qp-status--${p.status}`}>{STATUS_LABELS[p.status] || p.status}</span></td>
                  <td>{new Date(p.updated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
