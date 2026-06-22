"use client";

import { useState } from "react";

// EDIT THIS: your real Betsel Stack contact email
const CONTACT_EMAIL = "team@betselstack.com";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = () => {
    const subject = encodeURIComponent(`Betsel Stack inquiry from ${name || "website"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="container">
          <p className="eyebrow">Contact</p>
          <h1 style={{ fontSize: "clamp(38px, 5.5vw, 58px)" }}>Get in touch</h1>
          <p className="lead">
            Questions about the Pallet Pattern Creator, pricing, or your
            account? Send us a note and we will get back to you.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container split">
          <div>
            <div className="contact-detail">
              <div className="k">Email</div>
              <div className="v">
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </div>
            </div>
          </div>

          <div className="form-panel">
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
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your cases, pallets, and trailers."
              />
            </div>
            <button className="btn btn--primary btn--block" onClick={sendEmail}>
              Email us
            </button>
            <p className="auth-note">
              Opens your email app with the message ready to send to{" "}
              {CONTACT_EMAIL}.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
