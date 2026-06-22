"use client";

import { useState } from "react";

export default function BillingButtons({ subscribed = false }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const go = async (endpoint) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
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
          onClick={() => go("/api/stripe/portal")}
        >
          {loading ? "Opening..." : "Manage billing"}
        </button>
        {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginTop: 10 }}>{err}</p>}
      </>
    );
  }

  return (
    <>
      <button
        className="btn btn--primary btn--block"
        disabled={loading}
        onClick={() => go("/api/stripe/checkout")}
      >
        {loading ? "Redirecting..." : "Subscribe"}
      </button>
      {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginTop: 10 }}>{err}</p>}
    </>
  );
}
