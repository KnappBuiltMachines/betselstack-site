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
    "Powerful packaging engineering, made practical. Betsel Stack is pallet pattern software that turns real-world palletization problems into clear workflows: ranked patterns, mixed-case loads, 3D checks, trailer planning, and branded reports, in your browser.",
  openGraph: {
    title: "Betsel Stack\u2122 \u2014 Powerful packaging engineering, made practical",
    description:
      "Pallet pattern software that gives packaging engineers their time back. Runs in your browser. 7-day free trial.",
    url: "https://www.betselstack.com",
    siteName: "Betsel Stack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
