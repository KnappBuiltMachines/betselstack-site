"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/software", label: "Stack Software" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Betsel Stack home">
          <span>
            Bet<span className="brand-amber">sel</span> Stack
            <span className="brand-tag">Pallet Pattern Creator</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${isActive(l.href) ? "is-active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="nav-link">Login</Link>
          <Link href="/signup" className="btn btn--primary">Get Access</Link>
          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "\u2715" : "\u2630"}
          </button>
        </div>
      </div>

      {open && (
        <div className="container">
          <div className="mobile-menu">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
            <Link href="/signup" onClick={() => setOpen(false)}>Get Access</Link>
          </div>
        </div>
      )}
    </header>
  );
}            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="nav-link">Login</Link>
          <Link href="/pricing" className="btn btn--primary">Get Access</Link>
          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "\u2715" : "\u2630"}
          </button>
        </div>
      </div>

      {open && (
        <div className="container">
          <div className="mobile-menu">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
            <Link href="/pricing" onClick={() => setOpen(false)}>Get Access</Link>
          </div>
        </div>
      )}
    </header>
  );
}
