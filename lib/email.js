// lib/email.js
// Transactional email for Betsel Stack via the Resend REST API.
// No npm package required — uses fetch, so nothing to install.
//
// The Betsel Stack trial is a NO-CARD trial: access runs for TRIAL_DAYS from
// profiles.created_at (see lib/subscription.js). Nobody is charged when it
// ends — they simply lose access. All copy below reflects that.
//
// Environment variables:
//   RESEND_API_KEY        re_xxxxxxxx
//   EMAIL_FROM            Betsel Stack <hello@send.betselstack.com>
//   EMAIL_REPLY_TO        an inbox you can actually read
//   INTERNAL_ALERT_EMAIL  where new-signup pings go
//   NEXT_PUBLIC_SITE_URL  https://www.betselstack.com

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.betselstack.com";
const FROM = process.env.EMAIL_FROM || "Betsel Stack <hello@send.betselstack.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "";

/**
 * Send one email through Resend.
 * Never throws — email failures must not break a webhook or cron run.
 */
export async function sendEmail({ to, subject, html, text, tags }) {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY is not set — skipping send to", to);
    return { ok: false, error: "missing_api_key" };
  }

  const payload = {
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (text) payload.text = text;
  if (REPLY_TO) payload.reply_to = REPLY_TO;
  if (tags) payload.tags = tags;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[email] Resend rejected the send", res.status, body);
      return { ok: false, error: body?.message || `http_${res.status}` };
    }

    console.log("[email] sent", body?.id, "→", to, "|", subject);
    return { ok: true, id: body?.id };
  } catch (err) {
    console.error("[email] network failure", err);
    return { ok: false, error: "network_error" };
  }
}

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */

function shell({ preheader, heading, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f5;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #dde2e9;">

<tr><td style="background:#0f1722;padding:22px 32px;">
<span style="font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:700;color:#ffffff;letter-spacing:.2px;">Betsel&nbsp;Stack</span>
<span style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;color:#8fa3bd;letter-spacing:1.4px;text-transform:uppercase;float:right;padding-top:7px;">Pallet Patterns</span>
</td></tr>

<tr><td style="padding:32px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#243040;">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;font-weight:700;color:#0f1722;">${heading}</h1>
${bodyHtml}
</td></tr>

<tr><td style="padding:20px 32px 26px;border-top:1px solid #e6eaf0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.55;color:#6b7a8d;">
Betsel Stack &middot; Hammonton, NJ<br>
<a href="${SITE_URL}" style="color:#6b7a8d;">betselstack.com</a>
${REPLY_TO ? ` &middot; <a href="mailto:${REPLY_TO}" style="color:#6b7a8d;">${REPLY_TO}</a>` : ""}
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="background:#1a56db;border-radius:6px;">
<a href="${href}" style="display:inline-block;padding:13px 26px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
</td></tr></table>`;
}

/** Accepts an ISO string, Date, or unix seconds. Returns "Friday, August 21" or null. */
function formatDate(value) {
  if (!value) return null;
  const d =
    typeof value === "number"
      ? new Date(value * 1000)
      : value instanceof Date
        ? value
        : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function firstNameOf(fullName) {
  const full = (fullName || "").trim();
  return full ? full.split(/\s+/)[0] : null;
}

export { firstNameOf };

/* ------------------------------------------------------------------ */
/* 1. Welcome — sent when the account (profile) is created             */
/* ------------------------------------------------------------------ */

export async function sendWelcomeEmail({ to, firstName, trialEndsAt }) {
  const greeting = firstName ? `${firstName}, your` : "Your";
  const endsOn = formatDate(trialEndsAt);

  const bodyHtml = `
<p style="margin:0 0 16px;">${greeting} seven days of full access start now. No card, nothing to configure. Pattern generation, the case size calculator, cloud saves, and the report builder are all unlocked.</p>

<p style="margin:0 0 8px;font-weight:600;">The fastest way to see whether this is worth it:</p>
<ol style="margin:0 0 20px;padding-left:20px;">
  <li style="margin-bottom:7px;">Take a case size you're actually quoting this week.</li>
  <li style="margin-bottom:7px;">Enter it with your pallet footprint and max load height.</li>
  <li style="margin-bottom:7px;">Compare the top patterns by cases per layer and stability score.</li>
  <li>Export the one you want as a report and send it to whoever asked for it.</li>
</ol>

<p style="margin:0 0 4px;">Most people have a usable pattern inside five minutes.</p>

${button(`${SITE_URL}/pallet-builder`, "Build your first pattern")}

${endsOn ? `<p style="margin:0 0 16px;padding:13px 16px;background:#f4f7fb;border-left:3px solid #1a56db;font-size:14px;">Your trial runs through <strong>${endsOn}</strong>. There's no card on file, so nothing will be charged — access just stops unless you pick a plan.</p>` : ""}

<p style="margin:0;">If a pattern comes out looking wrong for how your line actually runs, reply and tell me the case and pallet dimensions. I'd rather hear it than have you assume the tool can't do it.</p>`;

  const text = `Your seven days of full access start now. No card, nothing to configure.

The fastest way to see whether this is worth it:
1. Take a case size you're actually quoting this week.
2. Enter it with your pallet footprint and max load height.
3. Compare the top patterns by cases per layer and stability score.
4. Export the one you want as a report.

Build your first pattern: ${SITE_URL}/pallet-builder
${endsOn ? `\nYour trial runs through ${endsOn}. There's no card on file, so nothing will be charged - access just stops unless you pick a plan.\n` : ""}
If a pattern comes out looking wrong for how your line actually runs, reply and tell me the case and pallet dimensions.

Betsel Stack - Hammonton, NJ`;

  return sendEmail({
    to,
    subject: "Your Betsel Stack trial is live",
    html: shell({
      preheader: "Seven days of full access. Here is the fastest way to test it.",
      heading: "You\u2019re in",
      bodyHtml,
    }),
    text,
    tags: [{ name: "type", value: "welcome" }],
  });
}

/* ------------------------------------------------------------------ */
/* 2. Trial ending — sent by the daily cron, ~3 days out               */
/* ------------------------------------------------------------------ */

export async function sendTrialEndingEmail({ to, firstName, trialEndsAt, daysLeft }) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  const endsOn = formatDate(trialEndsAt);
  const dayPhrase =
    daysLeft === 1 ? "tomorrow" : daysLeft ? `in ${daysLeft} days` : "soon";
  const headingText = daysLeft === 1 ? "Your trial ends tomorrow" : `${daysLeft || "A few"} days left on your trial`;

  const bodyHtml = `
<p style="margin:0 0 16px;">${greeting} your Betsel Stack trial ends ${endsOn ? `<strong>${endsOn}</strong>` : dayPhrase}. There's no card on file, so nothing gets charged — the builder just stops opening.</p>

<p style="margin:0 0 16px;">Your saved patterns and reports stay in your account either way. Pick a plan and everything picks up where you left off.</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 4px;width:100%;border-collapse:collapse;">
<tr>
  <td style="padding:12px 14px;border:1px solid #dde2e9;border-radius:6px 0 0 6px;font-size:14px;">
    <strong>$29</strong> / month<br><span style="color:#6b7a8d;font-size:13px;">Cancel anytime</span>
  </td>
  <td style="padding:12px 14px;border:1px solid #dde2e9;border-left:0;border-radius:0 6px 6px 0;font-size:14px;">
    <strong>$279</strong> / year<br><span style="color:#6b7a8d;font-size:13px;">Two months free</span>
  </td>
</tr>
</table>

${button(`${SITE_URL}/account`, "Choose a plan")}

<p style="margin:0;">And if you got stuck on something and that's why the trial went quiet — reply and tell me where. That's useful to me either way.</p>`;

  const text = `${greeting}

Your Betsel Stack trial ends ${endsOn || dayPhrase}. There's no card on file, so nothing gets charged - the builder just stops opening.

Your saved patterns and reports stay in your account either way.

  $29/month, cancel anytime
  $279/year, two months free

Choose a plan: ${SITE_URL}/account

If you got stuck on something, reply and tell me where.

Betsel Stack - Hammonton, NJ`;

  return sendEmail({
    to,
    subject: endsOn ? `Your trial ends ${endsOn}` : "Your Betsel Stack trial is ending",
    html: shell({
      preheader: "No card on file, so nothing will be charged. Access just stops.",
      heading: headingText,
      bodyHtml,
    }),
    text,
    tags: [{ name: "type", value: "trial_ending" }],
  });
}

/* ------------------------------------------------------------------ */
/* 3. Subscribed — sent from the Stripe webhook after checkout         */
/* ------------------------------------------------------------------ */

export async function sendSubscribedEmail({ to, firstName, planLabel }) {
  const greeting = firstName ? `Thanks, ${firstName}.` : "Thanks.";

  const bodyHtml = `
<p style="margin:0 0 16px;">${greeting} Your Betsel Stack subscription is active${planLabel ? ` on the <strong>${planLabel}</strong> plan` : ""}. Full access continues with nothing else to do.</p>

<p style="margin:0 0 16px;">Stripe emails your receipt separately. You can update your card, download invoices, or change your plan from your account page at any time.</p>

${button(`${SITE_URL}/account`, "Manage your subscription")}

<p style="margin:0;">You're an early customer, which means your feedback shapes what I build next. If something in the builder doesn't match how your line actually runs, tell me — I read every reply.</p>`;

  const text = `${greeting} Your Betsel Stack subscription is active${planLabel ? ` on the ${planLabel} plan` : ""}.

Stripe emails your receipt separately. Update your card, download invoices, or change your plan from your account page.

Manage your subscription: ${SITE_URL}/account

You're an early customer - if something in the builder doesn't match how your line runs, tell me.

Betsel Stack - Hammonton, NJ`;

  return sendEmail({
    to,
    subject: "You're subscribed to Betsel Stack",
    html: shell({
      preheader: "Your subscription is active. Here\u2019s where to manage it.",
      heading: "You\u2019re subscribed",
      bodyHtml,
    }),
    text,
    tags: [{ name: "type", value: "subscribed" }],
  });
}

/* ------------------------------------------------------------------ */
/* 4. Internal pings                                                   */
/* ------------------------------------------------------------------ */

export async function sendInternalAlert({ subject, lines }) {
  const to = process.env.INTERNAL_ALERT_EMAIL;
  if (!to) return { ok: false, error: "no_internal_address" };

  const body = (lines || []).map((l) => `<div>${l}</div>`).join("");

  return sendEmail({
    to,
    subject,
    html: `<div style="font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;">${body}</div>`,
    text: (lines || []).join("\n"),
    tags: [{ name: "type", value: "internal_alert" }],
  });
}
