// app/contact/layout.js
// The contact page is a client component, so its title/description live here.

export const metadata = {
  title: "Contact",
  description:
    "Questions about Betsel Stack pallet pattern software? Email team@betselstack.com or send a message about your cases, pallets, and trailers.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }) {
  return children;
}
