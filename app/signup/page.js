"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    // TODO: wire to Supabase auth (signUp) + start the 7-day trial, same as your other site.
    // e.g. await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
    alert("Signup not connected yet. Wire this to Supabase to create accounts and start trials.");
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1>Start your free trial</h1>
        <p className="sub">
          Create your Betsel Stack&trade; account and get 7 days of full access
          to the Pallet Pattern Creator &mdash; no credit card required.
        </p>

        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
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
            placeholder="Create a password"
          />
        </div>

        <button className="btn btn--primary btn--block" onClick={handleSignup}>
          Start 7-day free trial
        </button>

        <p className="auth-foot">
          Already have an account? <Link href="/login">Log in</Link>
        </p>

        <p className="auth-note">
          Heads up: this signup form is UI only. Connect it to Supabase auth to
          create accounts and start the 7-day trial.
        </p>
      </div>
    </section>
  );
}
