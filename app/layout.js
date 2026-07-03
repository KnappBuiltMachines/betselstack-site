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
    "Betsel Stack is advanced pallet pattern creation software for packaging engineers. Build mixed-case patterns, customize pallet footprints, visualize loads in 3D, and optimize trailer loading.",
  openGraph: {
    title: "Betsel Stack\u2122 \u2014 Pallet Pattern Creator",
    description:
      "Advanced pallet pattern creation software for packaging engineers.",
    url: "https://www.betselstack.com",
    siteName: "Betsel Stack",
    type: "website",
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
