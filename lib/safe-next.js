// lib/safe-next.js
//
// Cleans a "?next=" redirect target so it can only ever point back inside
// this site. Used by the login page, the signup page and /auth/callback.
//
// Rejects anything that could leave the site or run script:
//   javascript:...            (would run code on the page)
//   https://evil.com          (absolute URL to another site)
//   //evil.com, /\evil.com    (protocol-relative tricks)
//   @evil.com, .evil.com      (would glue onto the origin as a new host)
// Anything rejected falls back to the given default.

const PROBE_ORIGIN = "https://betselstack.invalid";

export function safeNext(value, fallback = "/account") {
  if (typeof value !== "string") return fallback;
  const v = value.trim();

  // Must be a plain path on this site.
  if (!v.startsWith("/")) return fallback;
  if (v.startsWith("//")) return fallback;
  if (v.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(v)) return fallback;

  // Final check: resolving it must not change the origin.
  try {
    const url = new URL(v, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
