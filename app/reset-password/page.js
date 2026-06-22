"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
      setReady(true);
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => {
      window.location.href = "/account";
    }, 1500);
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Set a new password</h1>

        {!ready ? (
          <p className="sub">Loading...</p>
        ) : done ? (
          <p className="auth-note" style={{ borderStyle: "solid" }}>
            Password updated. Taking you to your account...
          </p>
        ) : !hasSession ? (
          <>
            <p className="sub">
              This page opens from the password reset link in your email. Request
              a reset and use the link we send you.
            </p>
            <Link href="/forgot-password" className="btn btn--primary btn--block">
              Request a reset link
            </Link>
          </>
        ) : (
          <>
            <p className="sub">Choose a new password for your account.</p>
            <form onSubmit={handleReset}>
              <div className="field">
                <label htmlFor="password">New password</label>
                <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" minLength={6} required />
              </div>
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input id="confirm" type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter new password" minLength={6} required />
              </div>
              {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 12 }}>{err}</p>}
              <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
