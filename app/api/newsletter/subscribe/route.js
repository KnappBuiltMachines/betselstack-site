// POST /api/newsletter/subscribe  { email, company }
// Public footer signup for prospects. "company" is a hidden honeypot field:
// real visitors leave it empty, bots tend to fill it.
import { NextResponse } from 'next/server';
import { addNewsletterContact } from '../../../../lib/newsletter';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { email, company } = body || {};

  // Honeypot tripped: pretend success, do nothing.
  if (company) return NextResponse.json({ ok: true });

  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    await addNewsletterContact({ email, optIn: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter/subscribe]', err);
    return NextResponse.json({ error: 'Could not subscribe right now. Please try again.' }, { status: 502 });
  }
}
