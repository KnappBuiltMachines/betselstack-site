import Link from "next/link";
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <span className="brand">
              <span>Bet<span className="brand-amber">sel</span> Stack</span>
            </span>
            <p className="footer-blurb">
              Betsel Stack&trade; is advanced pallet pattern creation software
              built to help packaging engineers develop optimized pallet
              configurations faster. Create standard and mixed-case patterns,
              place multiple case sizes on one pallet, customize footprints, and
              optimize trailer loading &mdash; all in one engineering-focused tool.
            </p>
          </div>
          <nav className="footer-nav" aria-label="Footer">
            <Link href="/">Home</Link>
            <Link href="/software">Stack Software</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/stack-report">The Stack Report</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Member Login</Link>
            <Link href="/pricing">Get Access</Link>
            <Link href="/compare/tops-pro-alternative">TOPS Pro Alternative</Link>
            <Link href="/compare/cube-iq-alternative">Cube-IQ Alternative</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Betsel Stack. All rights reserved.</span>
          <span>betselstack.com</span>
        </div>
      </div>
    </footer>
  );
}
