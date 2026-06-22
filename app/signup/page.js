"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("/account");

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n) setNext(n);
  }, []);

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
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    // Email confirmation OFF: session exists right away.
    if (data.session) {
      window.location.href = next;
      return;
    }
    setDone(true);
    setLoading(false);
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="sub">
          Get started with Betsel Stack&trade; &mdash; the Pallet Pattern
          Creator. Start a free trial, or subscribe right after signing up.
        </p>

        {done ? (
          <p className="auth-note" style={{ borderStyle: "solid" }}>
            Check your email to confirm your account. The confirmation link will
            bring you right back to finish.
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
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

        <p className="auth-foot">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
        </p>
      </div>
    </section>
  );
}
