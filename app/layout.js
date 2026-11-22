import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL("https://www.betselstack.com"),
  title: {
    default: "Betsel Stack\u2122 \u2014 Pallet Pattern Creator",
    template: "%s \u2014 Betsel Stack\u2122",
  },
  description:
    "Betsel Stack is browser-based pallet pattern software for packaging engineers. Create pallet patterns fast, check them in 3D, and export branded PDF reports.",
  openGraph: {
    title: "Betsel Stack\u2122 \u2014 Powerful packaging engineering, made practical",
    description:
      "Pallet pattern software that helps packaging engineers create pallet patterns quickly. Runs in your browser. 7-day free trial.",
    url: "https://www.betselstack.com",
    siteName: "Betsel Stack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Site-wide structured data: who publishes the site and what the site is.
// Helps Google show the brand name correctly and tie it to packaging, not
// to the unrelated "bet"/"stack" sites it otherwise gets confused with.
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.betselstack.com/#organization",
      name: "Betsel Stack",
      url: "https://www.betselstack.com/",
      logo: "https://www.betselstack.com/betsel-logo.png",
      email: "team@betselstack.com",
      description: "Pallet pattern software for packaging engineers.",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.betselstack.com/#website",
      name: "Betsel Stack",
      alternateName: "Betsel Stack Pallet Pattern Software",
      url: "https://www.betselstack.com/",
      publisher: { "@id": "https://www.betselstack.com/#organization" },
    },
  ],
};

export const viewport = {
  themeColor: "#0b0c0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
