// One-time backfill: pushes existing profiles into Resend as newsletter contacts.
// Safe to re-run; existing contacts are skipped, never re-subscribed.
//
// Usage:
//   node scripts/backfill-newsletter-contacts.mjs                    # honors profiles.newsletter_opt_in only
//   node scripts/backfill-newsletter-contacts.mjs --opt-in-existing  # treat all existing users as opted in
//
// Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
//      RESEND_NEWSLETTER_SEGMENT_ID, RESEND_NEWSLETTER_TOPIC_ID
import { createClient } from '@supabase/supabase-js';

const OPT_IN_EXISTING = process.argv.includes('--opt-in-existing');
const API = 'https://api.resend.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function resendFetch(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return { ok: res.ok, status: res.status, body: await res.json().catch(() => ({})) };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: profiles, error } = await supabase
  .from('profiles')
  .select('email, full_name, newsletter_opt_in');
if (error) throw error;

let created = 0, skipped = 0, failed = 0;

for (const p of profiles) {
  if (!p.email) { skipped++; continue; }
  const email = p.email.trim().toLowerCase();

  const existing = await resendFetch(`/contacts/${encodeURIComponent(email)}`);
  await sleep(600); // stay under Resend's default rate limit
  if (existing.ok) { skipped++; continue; }

  const optIn = OPT_IN_EXISTING || p.newsletter_opt_in === true;
  const parts = String(p.full_name || '').trim().split(/\s+/).filter(Boolean);
  const r = await resendFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      email,
      first_name: parts[0] || undefined,
      last_name: parts.slice(1).join(' ') || undefined,
      unsubscribed: false,
      segments: [process.env.RESEND_NEWSLETTER_SEGMENT_ID],
      topics: [{ id: process.env.RESEND_NEWSLETTER_TOPIC_ID, subscription: optIn ? 'opt_in' : 'opt_out' }],
    }),
  });
  await sleep(600);

  if (r.ok) { created++; console.log(`+ ${email} (${optIn ? 'opt_in' : 'opt_out'})`); }
  else { failed++; console.error(`! ${email}: ${r.status} ${JSON.stringify(r.body)}`); }
}

console.log(`\nDone. created=${created} skipped=${skipped} failed=${failed}`);
