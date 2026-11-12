import Link from "next/link";

// Footer links, grouped into columns. Legal links sit in the bottom bar.
// (No "Home" link: the Betsel Stack logo in the header goes home.)
const COLUMNS = [
  {
    title: "Product",
    links: [
      ["/software", "Stack Software"],
      ["/#pricing", "Pricing"],
      ["/signup", "Start free trial"],
      ["/login", "Member login"],
    ],
  },
  {
    title: "Compare",
    links: [
      ["/compare/tops-pro-alternative", "TOPS Pro alternative"],
      ["/compare/cube-iq-alternative", "Cube-IQ alternative"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["/stack-report", "The Stack Report"],
      ["/faq", "FAQ"],
      ["/contact", "Contact"],
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top footer-top--cols">
          <div>
            <Link href="/" className="brand" aria-label="Betsel Stack home">
              <span>Bet<span className="brand-amber">sel</span> Stack</span>
            </Link>
            <p className="footer-blurb">
              Pallet pattern software for packaging engineers.
            </p>
            <p className="footer-blurb footer-motto">
              Focused by design. Powerful where it matters.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav className="footer-col" aria-label={col.title} key={col.title}>
              <p className="footer-col-title">{col.title}</p>
              <ul>
                {col.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Betsel Stack. All rights reserved.</span>
          <span className="footer-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
