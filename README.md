# Betsel Stack&trade; - Website

Marketing + access site for Betsel Stack, the Pallet Pattern Creator.
Built with Next.js 15 (App Router), plain CSS, zero external UI libraries.
Same structure and dark/amber theme family as knappbuiltmachines.com,
fully rebranded for betselstack.com.

## Pages

| Nav            | Route        | What it is                                   |
| -------------- | ------------ | -------------------------------------------- |
| Home           | `/`          | Product landing: hero, pillars, capabilities |
| Stack Software | `/software`  | Deep feature page (pattern engine, layers...) |
| Pricing        | `/pricing`   | $89/mo, 7-day free trial card                |
| Contact        | `/contact`   | Mailto contact form                          |
| Login          | `/login`     | Member login UI (needs Supabase wiring)      |
| Get Access     | -> `/pricing`| Header button (repoint anytime)              |

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000.

## File structure

```
betsel-stack/
  package.json
  next.config.mjs
  jsconfig.json
  .gitignore
  app/
    globals.css          <- all theme/styling lives here
    layout.js            <- header + footer wrapper, site metadata
    page.js              <- Home
    software/page.js     <- Stack Software
    pricing/page.js      <- Pricing
    contact/page.js      <- Contact
    login/page.js        <- Login
  components/
    SiteHeader.js
    SiteFooter.js
    PalletMark.js        <- the isometric pallet/cube brand SVG
  public/
    betsel-logo.png
```

## Things to edit (quick wins)

1. Contact details: top of `app/contact/page.js`
   - `CONTACT_EMAIL`, `LOCATION` (optional `PHONE` block is commented out).
2. Brand colors: top of `app/globals.css` (`--amber`, `--ink`, etc.).
3. Software screenshots: drop images into `public/screenshots/`, then in
   `app/software/page.js` swap a `<MediaPlaceholder ... />` for:
   `<img src="/screenshots/builder.jpg" alt="..." className="media-frame" />`

## Still to wire up (same pattern as your other site)

- `/login` is UI only. Connect it to Supabase auth (signInWithPassword).
- `/pricing` "Start free trial" currently points to `/login`. Repoint it to
  your signup/Stripe trial flow when ready.
- Add the gated builder route once auth is connected.

## Encoding note

Every source file here is 100% ASCII. Special characters (TM, em dash, &, x,
arrows) are written as HTML entities (`&trade;`, `&mdash;`, `&amp;`) or JS
unicode escapes (`\u2122`). This avoids the mojibake corruption from
copy-pasting into the GitHub web editor.

## Deploy

Push the folder to a new GitHub repo, then import it into Vercel and set the
domain to betselstack.com. No environment variables are needed for the
marketing site as-is.
