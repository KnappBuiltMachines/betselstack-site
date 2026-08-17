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

// Absolute URL to a hosted logo image. Leave unset to fall back to a typeset
// wordmark, which always renders even when a client blocks images.
const LOGO_URL = process.env.EMAIL_LOGO_URL || "";
const LOGO_WIDTH = process.env.EMAIL_LOGO_WIDTH || "280";

// Brand
const INK = "#0f1011";
const GOLD = "#f5a623";
const PAGE = "#eef1f5";
const RULE = "#e3e8ef";
const MUTED = "#66748a";

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

function brandmark() {
  if (LOGO_URL) {
    return `<img src="${LOGO_URL}" width="${LOGO_WIDTH}" alt="Betsel Stack"
      style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:${LOGO_WIDTH}px;">`;
  }
  return `<span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:.2px;">Betsel<span style="color:${GOLD};">&nbsp;Stack</span></span>`;
}

function shell({ preheader, heading, bodyHtml }) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${heading}</title>
<!--[if mso]>
<style type="text/css">
  body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
  a { color:#1a56db; }
  @media only screen and (max-width:600px) {
    .sp { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:21px !important; }
    .btn a { display:block !important; text-align:center !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preheader}</div>
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};">
<tr><td align="center" style="padding:34px 12px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${RULE};border-radius:12px;overflow:hidden;">

  <tr><td style="height:4px;line-height:4px;font-size:0;background:${GOLD};">&nbsp;</td></tr>

  <tr><td align="center" bgcolor="${INK}" class="sp" style="padding:26px 36px 24px;background:${INK};">
    ${brandmark()}
  </td></tr>

  <tr><td class="sp" style="padding:34px 36px 32px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#26313f;">
    <h1 class="h1" style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:700;color:${INK};">${heading}</h1>
    ${bodyHtml}
  </td></tr>

  <tr><td class="sp" style="padding:22px 36px 28px;background:#f7f9fc;border-top:1px solid ${RULE};font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
    <strong style="color:#4a5768;">Betsel Stack</strong> &nbsp;&middot;&nbsp; Hammonton, New Jersey<br>
    <a href="${SITE_URL}" style="color:${MUTED};text-decoration:underline;">betselstack.com</a>${REPLY_TO ? ` &nbsp;&middot;&nbsp; <a href="mailto:${REPLY_TO}" style="color:${MUTED};text-decoration:underline;">${REPLY_TO}</a>` : ""}
    <div style="margin-top:10px;color:#8b98a9;">You're receiving this because you created a Betsel Stack account.</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href, label) {
  return `<table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 24px;">
<tr><td align="center" bgcolor="${GOLD}" style="border-radius:8px;">
<a href="${href}" style="display:inline-block;padding:15px 34px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:${INK};text-decoration:none;border-radius:8px;">${label}</a>
</td></tr></table>`;
}

function callout(html) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
<tr>
  <td width="4" style="width:4px;background:${GOLD};font-size:0;line-height:0;">&nbsp;</td>
  <td style="padding:15px 18px;background:#f7f9fc;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#3b4757;">${html}</td>
</tr></table>`;
}

function steps(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 22px;">
${items.map((t, i) => `<tr>
  <td width="30" valign="top" style="width:30px;padding:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:700;color:${GOLD};">${i + 1}.</td>
  <td valign="top" style="padding:0 0 12px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#3b4757;">${t}</td>
</tr>`).join("")}
</table>`;
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
<p style="margin:0 0 18px;">${greeting} seven days of full access start now. No card, nothing to configure. Pattern generation, the case size calculator, cloud saves, and the report builder are all unlocked.</p>

<p style="margin:0 0 10px;font-weight:700;color:${INK};">The fastest way to see whether this is worth it</p>
${steps([
  "Take a case size you're actually quoting this week.",
  "Enter it with your pallet footprint and max load height.",
  "Compare the top patterns by cases per layer and stability score.",
  "Export the one you want as a report and send it on.",
])}

<p style="margin:0 0 4px;">Most people have a usable pattern inside five minutes.</p>

${button(`${SITE_URL}/builder`, "Build your first pattern")}

${endsOn ? callout(`Your trial runs through <strong style="color:${INK};">${endsOn}</strong>. There's no card on file, so nothing will be charged &mdash; access simply stops unless you choose a plan.`) : ""}

<p style="margin:0;">If a pattern comes out looking wrong for how your line actually runs, reply and tell me the case and pallet dimensions. I'd rather hear it than have you assume the tool can't do it.</p>`;

  const text = `Your seven days of full access start now. No card, nothing to configure.

The fastest way to see whether this is worth it:
1. Take a case size you're actually quoting this week.
2. Enter it with your pallet footprint and max load height.
3. Compare the top patterns by cases per layer and stability score.
4. Export the one you want as a report.

Build your first pattern: ${SITE_URL}/builder
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
<p style="margin:0 0 18px;">${greeting} your Betsel Stack trial ends ${endsOn ? `<strong style="color:${INK};">${endsOn}</strong>` : dayPhrase}. There's no card on file, so nothing gets charged &mdash; the builder simply stops opening.</p>

${callout("Your saved patterns and reports stay in your account either way. Choose a plan and everything picks up exactly where you left off.")}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;border-collapse:separate;border-spacing:0;">
<tr>
  <td width="49%" valign="top" style="padding:16px 18px;border:1px solid ${RULE};border-radius:8px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="font-size:23px;font-weight:700;color:${INK};font-family:Georgia,'Times New Roman',serif;">$29</div>
    <div style="font-size:13px;color:${MUTED};margin-top:3px;">per month &middot; cancel anytime</div>
  </td>
  <td width="2%">&nbsp;</td>
  <td width="49%" valign="top" style="padding:16px 18px;border:2px solid ${GOLD};border-radius:8px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="font-size:23px;font-weight:700;color:${INK};font-family:Georgia,'Times New Roman',serif;">$279</div>
    <div style="font-size:13px;color:${MUTED};margin-top:3px;">per year &middot; two months free</div>
  </td>
</tr>
</table>

${button(`${SITE_URL}/account`, "Choose a plan")}

<p style="margin:0;">And if you got stuck on something and that's why the trial went quiet &mdash; reply and tell me where. That's useful to me either way.</p>`;

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
<p style="margin:0 0 18px;">${greeting} Your Betsel Stack subscription is active${planLabel ? ` on the <strong style="color:${INK};">${planLabel}</strong> plan` : ""}. Full access continues with nothing else to do.</p>

${callout("Stripe emails your receipt separately. You can update your card, download invoices, or change plans from your account page at any time.")}

${button(`${SITE_URL}/account`, "Manage your subscription")}

<p style="margin:0;">You're an early customer, which means your feedback shapes what I build next. If something in the builder doesn't match how your line actually runs, tell me &mdash; I read every reply.</p>`;

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
