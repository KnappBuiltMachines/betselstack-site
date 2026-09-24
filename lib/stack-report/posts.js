// lib/stack-report/posts.js
//
// Your own articles. Each post is one Markdown file in content/stack-report/.
// See content/stack-report/_HOW-TO-POST.md for the format.
//
// Files starting with "_" are ignored. Posts with `draft: true` or a date in
// the future stay hidden; future-dated posts appear automatically on their
// date (around 9 AM Eastern, within an hour), so you can queue posts ahead.

import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "stack-report");

// ---------- frontmatter ----------

function parseFrontmatter(raw) {
  const m = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[kv[1].toLowerCase()] = v;
  }
  return { data, body: m[2] };
}

function toList(v) {
  if (!v) return [];
  return v
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

// "2026-10-01" -> 9 AM Eastern-ish (13:00 UTC) that day
function publishTime(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || "")) return NaN;
  return Date.parse(`${dateStr}T13:00:00Z`);
}

// ---------- minimal Markdown -> HTML ----------
// Supports: # ## ### headings, paragraphs, - / * / 1. lists, > quotes,
// ``` code blocks, --- rules, images ![alt](src "caption"), [links](url),
// **bold**, *italic*, `code`. Raw HTML in posts is escaped for safety.

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeUrl(u) {
  const url = u.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(url)) return url;
  return "#";
}

function inline(text) {
  const codes = [];
  let s = esc(text).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src) =>
    `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy" />`
  );
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const url = safeUrl(href.replace(/&amp;/g, "&"));
    const ext = /^https?:/i.test(url) && !/betselstack\.com/i.test(url);
    return `<a href="${esc(url)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
  return s;
}

export function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  const isBlockStart = (l) =>
    /^(#{1,4}\s|```|>\s?|[-*]\s+|\d+\.\s+|---\s*$|!\[)/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (line.startsWith("```")) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      // A post's H1 is its title, so "#" in the body renders as an H2.
      const level = Math.min(4, Math.max(2, h[1].length));
      const text = h[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^---\s*$/.test(line)) { out.push("<hr />"); i++; continue; }

    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/);
    if (img) {
      const cap = img[3] ? `<figcaption>${inline(img[3])}</figcaption>` : "";
      out.push(`<figure><img src="${esc(safeUrl(img[2]))}" alt="${esc(img[1])}" loading="lazy" />${cap}</figure>`);
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${markdownToHtml(buf.join("\n"))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\./.test(line);
      const re = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i++].replace(re, "");
        // continuation lines (indented)
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) item += " " + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++].trim());
    if (!buf.length) { buf.push(lines[i++].trim()); }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

// ---------- loading ----------

function loadAll() {
  let files = [];
  try {
    files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  } catch {
    return [];
  }

  const posts = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, "").toLowerCase();
    const publishAt = publishTime(data.date);
    if (!data.title || isNaN(publishAt)) {
      console.warn(`[stack-report] ${file} skipped: needs a title and a date (YYYY-MM-DD)`);
      continue;
    }
    const words = body.split(/\s+/).filter(Boolean).length;
    posts.push({
      slug,
      title: data.title,
      date: data.date,
      publishAt,
      summary: data.summary || "",
      tags: toList(data.tags),
      author: data.author || "Betsel Stack",
      cover: data.cover || "",
      draft: /^(true|yes)$/i.test(data.draft || ""),
      readMinutes: Math.max(1, Math.round(words / 230)),
      body,
    });
  }
  return posts.sort((a, b) => b.publishAt - a.publishAt);
}

export function getPublishedPosts() {
  const now = Date.now();
  return loadAll().filter((p) => !p.draft && p.publishAt <= now);
}

export function getPost(slug) {
  const p = getPublishedPosts().find((x) => x.slug === String(slug).toLowerCase());
  if (!p) return null;
  return { ...p, html: markdownToHtml(p.body) };
}

export function formatDate(dateStr) {
  return new Date(`${dateStr}T13:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}
