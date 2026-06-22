"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next") || "/account";
    window.location.href = next;
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Member login</h1>
        <p className="sub">
          Sign in to your Betsel Stack&trade; account to open the Pallet Pattern
          Creator.
        </p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
          </div>
          {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 12 }}>{err}</p>}
          <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="auth-foot" style={{ marginTop: 14 }}>
          <Link href="/forgot-password">Forgot your password?</Link>
        </p>
        <p className="auth-foot" style={{ marginTop: 6 }}>
          No account yet? <Link href="/signup">Start your free trial</Link>
        </p>
      </div>
    </section>
  );
}
