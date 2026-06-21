"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${siteUrl}/auth/callback?next=/account`,
      },
    });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    // Email confirmation OFF: session exists right away.
    if (data.session) {
      window.location.href = "/account";
      return;
    }
    setDone(true);
    setLoading(false);
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Start your free trial</h1>
        <p className="sub">
          Create your Betsel Stack&trade; account and get 7 days of full access
          to the Pallet Pattern Creator &mdash; no credit card required.
        </p>

        {done ? (
          <p className="auth-note" style={{ borderStyle: "solid" }}>
            Check your email to confirm your account, then come back and{" "}
            <Link href="/login" style={{ color: "var(--amber)" }}>log in</Link>.
          </p>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" minLength={6} required />
            </div>
            {err && <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 12 }}>{err}</p>}
            <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Start 7-day free trial"}
            </button>
          </form>
        )}

        <p className="auth-foot">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}
