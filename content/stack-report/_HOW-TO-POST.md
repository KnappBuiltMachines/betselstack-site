# How to publish on The Stack Report

This file starts with `_` so it never shows up on the site.

## Publish a new article (GitHub web UI)

1. Open the `content/stack-report` folder on GitHub.
2. Click **Add file → Create new file**.
3. Name it with the URL you want, ending in `.md`, e.g. `mixed-case-pallets-101.md`
   → becomes `betselstack.com/stack-report/mixed-case-pallets-101`
   (lowercase, hyphens, no spaces).
4. Paste the template below, fill it in, and **Commit** to `main`.
5. Vercel deploys in a minute or two. Done.

```
---
title: Your headline here
date: 2026-10-01
summary: One or two sentences shown on the listing and in Google results.
tags: Palletizing, Case Design
cover: /stack-report/my-image.jpg
draft: false
---

Your article starts here. Plain paragraphs, separated by a blank line.

## A section heading

- Bullet points
- **Bold**, *italic*, and [links](https://example.com) work.

![Describe the image](/stack-report/diagram.png "Optional caption")

> A pull quote.
```

Only `title` and `date` are required. Everything else is optional.

## Scheduling

Set `date` in the future and commit whenever you like. The post stays hidden
and appears on its date (around 9 AM Eastern, within an hour) without another
deploy. Write four in one sitting, date them a week apart, and the page keeps
itself fresh for a month.

`draft: true` hides a post no matter the date.

## Images

Upload images to `public/stack-report/` (drag and drop in GitHub), then
reference them as `/stack-report/filename.jpg`. `cover` is the image shown on
the listing card and when the link is shared.

## The Industry Wire

The headline feed at the bottom of the page runs itself. Sources, keywords,
and limits are in `lib/stack-report/config.js`.
