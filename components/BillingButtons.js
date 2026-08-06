"use client";

import { useState } from "react";

export default function BillingButtons({
  subscribed = false,
  plan = "monthly",
  label,
  variant = "primary",
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const go = async (endpoint, body) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr(data.error || "Something went wrong. Please try again.");
    } catch {
      setErr("Network error. Please try again.");
    }
    setLoading(false);
  };

  if (subscribed) {
    return (
      <>
        <button
          className="btn btn--ghost btn--block"
          disabled={loading}
          onClick={() => go("/api/stripe/portal", {})}
        >
          {loading ? "Opening..." : "Manage billing"}
        </button>
        {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginTop: 10 }}>{err}</p>}
      </>
    );
  }

  const defaultLabel = plan === "annual" ? "Pay yearly" : "Subscribe monthly";

  return (
    <>
      <button
        className={`btn btn--${variant} btn--block`}
        disabled={loading}
        onClick={() => go("/api/stripe/checkout", { plan })}
      >
        {loading ? "Redirecting..." : label || defaultLabel}
      </button>
      {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginTop: 10 }}>{err}</p>}
    </>
  );
}
