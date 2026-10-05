// Newsletter contact sync for Resend (Contacts + Segments + Topics API).
// Env: RESEND_API_KEY, RESEND_NEWSLETTER_SEGMENT_ID, RESEND_NEWSLETTER_TOPIC_ID

const API = 'https://api.resend.com';

async function resendFetch(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

export async function getContact(email) {
  const r = await resendFetch(`/contacts/${encodeURIComponent(email)}`);
  return r.ok ? r.body : null;
}

/**
 * Adds an email to the newsletter segment with the given topic preference.
 * If the contact already exists it is left untouched. Resend is the source
 * of truth for unsubscribes, so a re-sync never re-subscribes anyone.
 */
// Splits profiles.full_name ("Jane Smith") into first/last for Resend.
export function splitName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: undefined, lastName: undefined };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') || undefined };
}

export async function addNewsletterContact({ email, fullName, optIn }) {
  const normalized = String(email).trim().toLowerCase();
  const { firstName, lastName } = splitName(fullName);

  const existing = await getContact(normalized);
  if (existing) return { status: 'exists', id: existing.id };

  const r = await resendFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      email: normalized,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      unsubscribed: false,
      segments: [process.env.RESEND_NEWSLETTER_SEGMENT_ID],
      topics: [
        {
          id: process.env.RESEND_NEWSLETTER_TOPIC_ID,
          subscription: optIn ? 'opt_in' : 'opt_out',
        },
      ],
    }),
  });

  if (!r.ok) {
    throw new Error(`Resend contact create failed (${r.status}): ${JSON.stringify(r.body)}`);
  }
  return { status: 'created', id: r.body.id };
}
