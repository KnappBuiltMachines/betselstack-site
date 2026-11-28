"use client";

// Official provider badges, used unmodified per each provider's brand rules.
//
//  - Stripe: download the official badge kit from
//    https://stripe.com/newsroom/brand-assets ("Badge" files), pick the
//    "Powered by Stripe" badge made for dark backgrounds, and save it as
//    /public/badges/powered-by-stripe.svg. Stripe asks that it link to stripe.com.
//  - Supabase: Supabase serves its official "Made with Supabase" badge from its
//    own site, and that hosted file is what we show here.
//
// If a badge file is missing or fails to load, the badge hides itself instead of
// showing a broken image.

import { useState } from "react";

function Badge({ href, src, alt, width, height, style }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-flex", lineHeight: 0, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onError={() => setOk(false)}
        style={{ height, width: "auto" }}
      />
    </a>
  );
}

export function StripeBadge({ style }) {
  return (
    <Badge
      href="https://stripe.com"
      src="/badges/powered-by-stripe.svg"
      alt="Powered by Stripe"
      width={119}
      height={26}
      style={style}
    />
  );
}

export function SupabaseBadge({ style }) {
  return (
    <Badge
      href="https://supabase.com"
      src="https://supabase.com/badge-made-with-supabase-dark.svg"
      alt="Made with Supabase"
      width={168}
      height={30}
      style={style}
    />
  );
}
