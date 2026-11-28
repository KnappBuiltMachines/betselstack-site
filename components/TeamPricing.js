"use client";

// "Bring your team" block for the homepage pricing section and /pricing.
// Prices must match lib/team.js (SEAT_LABELS) and the plan prices.

import { useState } from "react";

const BASE = { monthly: 29, annual: 279 };
const SEAT = { monthly: 10, annual: 96 };
const MAX = 25;

const money = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

export default function TeamPricing() {
  const [users, setUsers] = useState(3);
  const added = users - 1;
  const monthly = BASE.monthly + SEAT.monthly * added;
  const annual = BASE.annual + SEAT.annual * added;
  const saved = monthly * 12 - annual;

  return (
    <div className="tp rv">
      <style>{`
        .tp {
          margin: 56px auto 0;
          max-width: 980px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: clamp(24px, 4vw, 40px);
        }
        .tp-tag {
          font-family: var(--display);
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--amber);
          font-weight: 600;
          margin: 0 0 10px;
        }
        .tp h3 {
          font-family: var(--display);
          font-size: clamp(24px, 3vw, 32px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--text);
          margin: 0 0 12px;
        }
        .tp h3 .tp-dim { color: var(--muted); }
        .tp-lede {
          color: var(--muted);
          font-size: 16px;
          line-height: 1.65;
          max-width: 720px;
          margin: 0 0 28px;
        }
        .tp-lede strong { color: var(--text); font-weight: 600; }
        .tp-paths {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .tp-path {
          background: var(--panel-2);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          padding: 20px 22px;
        }
        .tp-path--best { border-color: var(--amber-deep); }
        .tp-path h4 {
          font-family: var(--display);
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--silver);
          margin: 0 0 12px;
          font-weight: 600;
        }
        .tp-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: var(--muted);
          font-size: 15px;
          padding: 6px 0;
          border-bottom: 1px solid var(--line-soft);
        }
        .tp-row:last-of-type { border-bottom: 0; }
        .tp-row b { color: var(--text); font-weight: 600; white-space: nowrap; }
        .tp-calc {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 18px 28px;
          align-items: center;
          border-top: 1px solid var(--line);
          padding-top: 24px;
        }
        .tp-step {
          display: inline-flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .tp-step button {
          background: var(--panel-2);
          color: var(--text);
          border: 0;
          width: 44px;
          height: 44px;
          font-size: 20px;
          cursor: pointer;
        }
        .tp-step button:hover:not(:disabled) { color: var(--amber); }
        .tp-step button:disabled { opacity: 0.35; cursor: default; }
        .tp-step output {
          min-width: 108px;
          text-align: center;
          font-family: var(--display);
          font-weight: 600;
          color: var(--text);
        }
        .tp-label {
          font-size: 13px;
          color: var(--muted-2);
          margin: 0 0 8px;
        }
        .tp-totals {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 32px;
          align-items: baseline;
        }
        .tp-total { color: var(--muted); font-size: 15px; }
        .tp-total b {
          font-family: var(--display);
          font-size: 24px;
          color: var(--text);
          margin-right: 4px;
        }
        .tp-save {
          color: var(--amber);
          font-family: var(--display);
          font-weight: 600;
          font-size: 15px;
        }
        .tp-fine {
          margin: 22px 0 0;
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--muted-2);
        }
        @media (max-width: 720px) {
          .tp-paths { grid-template-columns: 1fr; }
          .tp-calc { grid-template-columns: 1fr; }
        }
      `}</style>

      <p className="tp-tag">For teams</p>
      <h3>
        Bring your team.{" "}
        <span className="tp-dim">Added users are just $10 a month.</span>
      </h3>
      <p className="tp-lede">
        The first user on your company&rsquo;s account is the plan price. Every
        engineer you add after that is <strong>$10/month</strong> on the monthly
        plan, or <strong>$96/year</strong> on the annual plan (that&rsquo;s
        $8/month). Each person gets the full program and their own login, and you
        manage everyone from one account and one bill.
      </p>

      <div className="tp-paths">
        <div className="tp-path">
          <h4>Monthly path</h4>
          <div className="tp-row"><span>First user</span><b>$29 / month</b></div>
          <div className="tp-row"><span>Each added user</span><b>+ $10 / month</b></div>
          <div className="tp-row"><span>Team of 3</span><b>$49 / month</b></div>
        </div>
        <div className="tp-path tp-path--best">
          <h4>Annual path &mdash; save 20%</h4>
          <div className="tp-row"><span>First user</span><b>$279 / year</b></div>
          <div className="tp-row"><span>Each added user</span><b>+ $96 / year</b></div>
          <div className="tp-row"><span>Team of 3</span><b>$471 / year</b></div>
        </div>
      </div>

      <div className="tp-calc">
        <div>
          <p className="tp-label">Your team size</p>
          <div className="tp-step">
            <button
              type="button"
              aria-label="Remove a user"
              onClick={() => setUsers((u) => Math.max(1, u - 1))}
              disabled={users <= 1}
            >
              &minus;
            </button>
            <output aria-live="polite">
              {users} {users === 1 ? "user" : "users"}
            </output>
            <button
              type="button"
              aria-label="Add a user"
              onClick={() => setUsers((u) => Math.min(MAX, u + 1))}
              disabled={users >= MAX}
            >
              +
            </button>
          </div>
        </div>
        <div className="tp-totals">
          <span className="tp-total">
            <b>{money(monthly)}</b>/month
          </span>
          <span className="tp-total">
            or <b>{money(annual)}</b>/year
          </span>
          <span className="tp-save">Annual saves {money(saved)} a year</span>
        </div>
      </div>

      <p className="tp-fine">
        Start your free trial on your own. Once you subscribe, add teammates by
        email from your Account page and each one sets their own password. Users
        added mid-term are charged pro-rated for the rest of your current billing
        period, then renew with your plan. Removing a user stops future charges;
        time already paid isn&rsquo;t refunded.
      </p>
    </div>
  );
}
