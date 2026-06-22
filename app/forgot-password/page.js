"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Reset your password</h1>

        {done ? (
          <p className="auth-note" style={{ borderStyle: "solid" }}>
            If an account exists for that email, we have sent a link to set a new
            password. Check your inbox (and your spam folder).
          </p>
        ) : (
          <>
            <p className="sub">
              Enter the email for your Betsel Stack&trade; account and we will
              send you a link to set a new password.
            </p>
            <form onSubmit={handleReset}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 12 }}>{err}</p>}
              <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <p className="auth-foot">
          Remembered it? <Link href="/login">Back to login</Link>
        </p>
      </div>
    </section>
  );
}
