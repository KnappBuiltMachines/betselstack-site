"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: wire to Supabase auth (signInWithPassword), same as your other site.
    // e.g. await supabase.auth.signInWithPassword({ email, password })
    alert("Auth not connected yet. Wire this to Supabase to log members in.");
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Member login</h1>
        <p className="sub">
          Sign in to your Betsel Stack&trade; account to open the Pallet Pattern
          Creator.
        </p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        <button className="btn btn--primary btn--block" onClick={handleLogin}>
          Log in
        </button>

        <p className="auth-foot">
          No account yet? <Link href="/signup">Start your free trial</Link>
        </p>

        <p className="auth-note">
          Heads up: this login form is UI only. Connect it to Supabase auth
          (the same way your other site does) to sign members in and gate the
          builder.
        </p>
      </div>
    </section>
  );
}
