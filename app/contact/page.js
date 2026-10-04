"use client";

import { useState } from "react";

// EDIT THIS: your real Betsel Stack contact email
const CONTACT_EMAIL = "team@betselstack.com";

// EDIT THIS: your Betsel Stack LinkedIn company page URL
const LINKEDIN_URL = "https://www.linkedin.com/company/betsel-stack/";

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
            <div className="contact-detail">
              <div className="k">LinkedIn</div>
              <div className="v">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                  Betsel Stack on LinkedIn
                </a>
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
