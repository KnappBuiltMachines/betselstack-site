"use client";

// Account page panel: add / remove users on the owner's subscription.
// Talks to app/api/team/route.js. Every change is confirmed inline first,
// because adding a user charges the owner's card.

import { useEffect, useState } from "react";

const PRICING = {
  monthly: { base: 29, seat: 10, per: "month" },
  annual: { base: 279, seat: 96, per: "year" },
};

const muted = { color: "var(--muted)" };
const errStyle = { color: "#ff6b6b", fontSize: 14, marginTop: 10 };
const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  padding: "10px 0",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};
const smallBtn = { padding: "6px 12px", fontSize: 13, width: "auto" };

export default function TeamMembers({ plan = "monthly" }) {
  const price = PRICING[plan] || PRICING.monthly;

  const [users, setUsers] = useState(null);
  const [email, setEmail] = useState("");
  const [pendingAdd, setPendingAdd] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [note, setNote] = useState(null);

  const call = async (method, body) => {
    setBusy(true);
    setErr(null);
    setNote(null);
    try {
      const res = await fetch("/api/team", {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Something went wrong. Please try again.");
        return null;
      }
      if (data.users) setUsers(data.users);
      if (data.warning) setErr(data.warning);
      return data;
    } catch {
      setErr("Network error. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/team");
        const data = await res.json().catch(() => ({}));
        if (res.ok) setUsers(data.users || []);
        else {
          setUsers([]);
          setErr(data.error || "Could not load your users.");
        }
      } catch {
        setUsers([]);
        setErr("Could not load your users.");
      }
    })();
  }, []);

  const startAdd = (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setPendingRemove(null);
    setPendingAdd(clean);
  };

  const confirmAdd = async () => {
    const data = await call("POST", { email: pendingAdd });
    if (data) {
      setNote(`Added ${pendingAdd}. We emailed them a link to create their account.`);
      setEmail("");
    }
    setPendingAdd(null);
  };

  const confirmRemove = async () => {
    const data = await call("DELETE", { email: pendingRemove });
    if (data && !data.warning) setNote(`Removed ${pendingRemove}.`);
    setPendingRemove(null);
  };

  const resend = async (address) => {
    const data = await call("POST", { email: address, action: "resend" });
    if (data) setNote(`Invite re-sent to ${address}.`);
  };

  const count = users ? users.length : 0;
  const total = price.base + price.seat * count;

  return (
    <div style={{ marginTop: 26 }}>
      <h2 style={{ fontSize: 20, margin: "0 0 6px" }}>Users</h2>
      <p style={{ ...muted, fontSize: 14, marginTop: 0 }}>
        Give coworkers their own login on your subscription. Each added user
        is ${price.seat}/{price.per}. They create their own password.
      </p>

      <form onSubmit={startAdd} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          type="email"
          className="input"
          placeholder="coworker@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
          required
          style={{ flex: 1 }}
        />
        <button className="btn btn--ghost" type="submit" disabled={busy} style={{ width: "auto" }}>
          Add user
        </button>
      </form>

      {pendingAdd && (
        <div className="auth-note" style={{ borderStyle: "solid", marginTop: 12 }}>
          <p style={{ margin: "0 0 8px" }}>
            Add <strong>{pendingAdd}</strong> for ${price.seat}/{price.per}?
          </p>
          <p style={{ ...muted, fontSize: 13, margin: "0 0 12px" }}>
            Your card on file is charged today for the rest of the current
            billing {price.per}, then ${price.seat} at each renewal. They get
            an email to set up their login.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn--primary" style={smallBtn} disabled={busy} onClick={confirmAdd}>
              {busy ? "Adding..." : "Confirm and add"}
            </button>
            <button className="btn btn--ghost" style={smallBtn} disabled={busy} onClick={() => setPendingAdd(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {err && <p style={errStyle}>{err}</p>}
      {note && <p style={{ color: "var(--amber)", fontSize: 14, marginTop: 10 }}>{note}</p>}

      <div style={{ marginTop: 14 }}>
        {users === null ? (
          <p style={{ ...muted, fontSize: 14 }}>Loading...</p>
        ) : users.length === 0 ? (
          <p style={{ ...muted, fontSize: 14 }}>No added users yet.</p>
        ) : (
          users.map((u) => (
            <div key={u.email}>
              <div style={rowStyle}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ overflowWrap: "anywhere" }}>{u.email}</div>
                  <div style={{ ...muted, fontSize: 12 }}>
                    {u.joined ? "Account active" : "Invite sent \u2014 not signed up yet"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {!u.joined && (
                    <button className="btn btn--ghost" style={smallBtn} disabled={busy} onClick={() => resend(u.email)}>
                      Resend
                    </button>
                  )}
                  <button
                    className="btn btn--ghost"
                    style={smallBtn}
                    disabled={busy}
                    onClick={() => {
                      setPendingAdd(null);
                      setPendingRemove(u.email);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              {pendingRemove === u.email && (
                <div className="auth-note" style={{ borderStyle: "solid", margin: "4px 0 10px" }}>
                  <p style={{ margin: "0 0 8px" }}>
                    Remove <strong>{u.email}</strong>? Their access ends now.
                  </p>
                  <p style={{ ...muted, fontSize: 13, margin: "0 0 12px" }}>
                    There&rsquo;s no refund or credit for the current billing{" "}
                    {price.per}. Your bill drops by ${price.seat} at your next
                    renewal.
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn--primary" style={smallBtn} disabled={busy} onClick={confirmRemove}>
                      {busy ? "Removing..." : "Remove user"}
                    </button>
                    <button className="btn btn--ghost" style={smallBtn} disabled={busy} onClick={() => setPendingRemove(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {users !== null && (
        <p style={{ ...muted, fontSize: 14, marginTop: 12 }}>
          You + {count} added user{count === 1 ? "" : "s"}:{" "}
          <strong style={{ color: "var(--amber)" }}>
            ${total.toLocaleString("en-US")}/{price.per}
          </strong>
        </p>
      )}
    </div>
  );
}
