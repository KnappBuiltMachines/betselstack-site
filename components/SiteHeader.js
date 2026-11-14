"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/software", label: "Stack Software" },
  { href: "/stack-report", label: "Stack Report" },
  { href: "/contact", label: "Contact" },
];

// Member-only areas where the marketing links are just clutter.
const APP_AREAS = ["/qualification-plans"];

function displayName(user) {
  if (!user) return "";
  const m = user.user_metadata || {};
  const name = (m.full_name || m.name || "").trim();
  return name || (user.email || "").split("@")[0];
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  // undefined = still checking, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    // Reads the saved session from the browser cookie (no sign-in needed).
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const inApp = APP_AREAS.some((p) => pathname.startsWith(p));
  const links = inApp ? [] : LINKS;
  const name = displayName(user);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Betsel Stack home">
          <span>
            Bet<span className="brand-amber">sel</span> Stack
            <span className="brand-tag">{inApp ? "Qualification Plans" : "Pallet Pattern Creator"}</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link ${isActive(l.href) ? "is-active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {user === undefined ? (
            // Reserve the space while the saved session is read, so Login doesn't flash
            <span className="nav-account-placeholder" aria-hidden="true" />
          ) : user ? (
            <Link href="/account" className="nav-account" title={user.email || ""}>
              <span className="nav-account__label">Account</span>
              <span className="nav-account__name">{name}</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/signup" className="btn btn--primary">Get Access</Link>
            </>
          )}
          {links.length > 0 && (
            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {open && links.length > 0 && (
        <div className="container">
          <div className="mobile-menu">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link href="/account" onClick={() => setOpen(false)}>Account &middot; {name}</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/signup" onClick={() => setOpen(false)}>Get Access</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
