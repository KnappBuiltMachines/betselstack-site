// lib/stack-report/wire.js
//
// The Industry Wire: pulls headlines from the RSS/Atom feeds listed in
// config.js, keeps the on-topic ones, removes duplicates, and returns the
// newest first. No database, no cron, no dependencies — the page that calls
// this rebuilds itself every REPORT.refreshSeconds, which is what keeps the
// Wire fresh.
//
// We only show headline, source, date and a link out. Nothing is republished.

import {
  REPORT,
  WIRE_SOURCES,
  WIRE_KEYWORDS,
  WIRE_BLOCKLIST,
  WIRE_LIMIT,
} from "./config";

const FETCH_TIMEOUT_MS = 8000;
const MAX_AGE_DAYS = 45;
const USER_AGENT =
  "Mozilla/5.0 (compatible; BetselStackWire/1.0; +https://www.betselstack.com/stack-report)";

// ---------- tiny XML helpers (RSS 2.0 + Atom) ----------

function decodeEntities(str) {
  return str
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201d")
    .replace(/&ldquo;/g, "\u201c")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&amp;/g, "&");
}

function safeChar(code) {
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

function stripCdata(str) {
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function cleanText(raw) {
  if (!raw) return "";
  let s = stripCdata(raw);
  s = decodeEntities(s); // entity-encoded HTML becomes real tags...
  s = s.replace(/<[^>]*>/g, " "); // ...which we then strip
  s = decodeEntities(s);
  return s.replace(/\s+/g, " ").trim();
}

function tag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

function atomLink(block) {
  const links = block.match(/<link\b[^>]*>/gi) || [];
  let fallback = "";
  for (const l of links) {
    const href = (l.match(/href=["']([^"']+)["']/i) || [])[1];
    if (!href) continue;
    const rel = (l.match(/rel=["']([^"']+)["']/i) || [])[1];
    if (!rel || rel === "alternate") return href;
    if (!fallback) fallback = href;
  }
  return fallback;
}

export function parseFeed(xml) {
  const items = [];
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks = isAtom
    ? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || []
    : xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];

  for (const b of blocks) {
    const title = cleanText(tag(b, "title"));
    let link = isAtom ? atomLink(b) : cleanText(tag(b, "link"));
    if (!link && !isAtom) link = cleanText(tag(b, "guid"));
    const dateRaw =
      tag(b, "pubDate") ||
      tag(b, "published") ||
      tag(b, "updated") ||
      tag(b, "dc:date");
    const summary = cleanText(
      tag(b, "description") || tag(b, "summary") || tag(b, "content")
    );
    const itemSource = cleanText(tag(b, "source"));
    const date = dateRaw ? new Date(cleanText(dateRaw)) : null;

    if (!title || !/^https?:\/\//i.test(link)) continue;
    items.push({
      title,
      link,
      summary,
      itemSource,
      date: date && !isNaN(date) ? date.toISOString() : null,
    });
  }
  return items;
}

// ---------- filtering ----------

function matchesKeywords(item) {
  const hay = `${item.title} ${item.summary}`.toLowerCase();
  return WIRE_KEYWORDS.some((k) => hay.includes(k));
}

function blocked(item) {
  const t = item.title.toLowerCase();
  return WIRE_BLOCKLIST.some((k) => t.includes(k));
}

function normTitle(t) {
  return t
    .toLowerCase()
    .replace(/\s[-\u2013\u2014|]\s[^-\u2013\u2014|]+$/, "") // drop " - Publisher" suffix
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Google News titles end in " - Publisher"; peel that off for display.
function tidyTitle(title, publisher) {
  if (!publisher) return title;
  const suffix = ` - ${publisher}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

function trimSummary(s, max = 180) {
  if (!s || s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(" ", max)) + "\u2026";
}

// ---------- fetching ----------

async function fetchSource(src) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(src.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
      next: { revalidate: REPORT.refreshSeconds },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;

    return parseFeed(xml)
      .filter((it) => !blocked(it))
      .filter((it) => !src.filter || matchesKeywords(it))
      .filter((it) => !it.date || new Date(it.date).getTime() >= cutoff)
      .map((it) => {
        const publisher = src.useItemSource && it.itemSource ? it.itemSource : src.name;
        return {
          title: tidyTitle(it.title, publisher),
          link: it.link,
          summary: src.useItemSource ? "" : trimSummary(it.summary), // Google News "summaries" are just the title again
          date: it.date,
          source: publisher,
        };
      })
      .slice(0, src.max || 5);
  } catch (err) {
    console.warn(`[wire] ${src.name} (${src.url}) skipped: ${err.message}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function getWire() {
  const results = await Promise.all(WIRE_SOURCES.map(fetchSource));
  const seen = new Set();
  const all = [];
  for (const it of results.flat()) {
    const key = normTitle(it.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    all.push(it);
  }
  all.sort((a, b) => (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0));
  return all.slice(0, WIRE_LIMIT);
}
