"use client";
// Exports a composed qualification plan to a real (text, searchable) PDF using
// jsPDF — the same library and CDN build the Pallet Builder already uses.

import { hexToRgb, imageSize, DEFAULT_BRANDING } from "@/components/qualification/branding";

const JSPDF_SRC = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

function loadJsPdf() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${JSPDF_SRC}"]`);
    const s = existing || document.createElement("script");
    s.src = JSPDF_SRC;
    s.async = true;
    s.onload = () => (window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error("jsPDF failed to load")));
    s.onerror = () => reject(new Error("Could not load the PDF library. Check your connection and try again."));
    if (!existing) document.head.appendChild(s);
  });
}

// jsPDF's built-in Helvetica is WinAnsi — swap characters it can't draw.
const pdfText = (s) =>
  String(s ?? "")
    .replace(/[−–]/g, "-")
    .replace(/—/g, "-")
    .replace(/×/g, "x")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/σ/g, "sigma")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/•/g, "-")
    .replace(/[^\x09\x0a\x0d\x20-\x7e -ÿ]/g, "");

const INK = [20, 22, 26];
const MUTED = [110, 116, 126];
const LINE = [205, 209, 214];
const SHADE = [244, 245, 247];

export async function exportPlanPdf(doc, fileName, branding) {
  const JsPDF = await loadJsPdf();
  const B = { ...DEFAULT_BRANDING, ...(branding || {}) };
  const BRAND = hexToRgb(B.brandColor); // accent color from Report settings
  const pdf = new JsPDF({ unit: "pt", format: "letter" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 48;
  const CW = W - M * 2;
  const TOP = 78;
  const BOTTOM = H - 54;
  let y = TOP;

  const { header, sections } = doc;

  const setFont = (size, style = "normal", color = INK) => {
    pdf.setFont("helvetica", style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };
  const lh = (size) => size * 1.32;
  const ensure = (h) => {
    if (y + h > BOTTOM) {
      pdf.addPage();
      y = TOP;
      return true;
    }
    return false;
  };

  const para = (text, { size = 10, style = "normal", color = INK, indent = 0, gap = 6 } = {}) => {
    setFont(size, style, color);
    const linesArr = pdf.splitTextToSize(pdfText(text), CW - indent);
    for (const ln of linesArr) {
      ensure(lh(size));
      pdf.text(ln, M + indent, y + size);
      y += lh(size);
    }
    y += gap;
  };

  const list = (items, ordered) => {
    setFont(10);
    items.forEach((it, k) => {
      const bullet = ordered ? `${k + 1}.` : "-";
      const linesArr = pdf.splitTextToSize(pdfText(it), CW - 18);
      linesArr.forEach((ln, j) => {
        ensure(lh(10));
        if (j === 0) pdf.text(bullet, M + 4, y + 10);
        pdf.text(ln, M + 18, y + 10);
        y += lh(10);
      });
      y += 2;
    });
    y += 4;
  };

  const table = (columns, rows, { kv = false, signature = false } = {}) => {
    const widths = columns.map((c) => (c.w / 100) * CW);
    const pad = 5;
    const size = 8.5;
    const drawHead = () => {
      if (kv) return;
      setFont(size, "bold", [255, 255, 255]);
      const hh = lh(size) + pad * 2;
      pdf.setFillColor(...INK);
      pdf.rect(M, y, CW, hh, "F");
      let x = M;
      columns.forEach((c, k) => {
        pdf.text(pdfText(c.label), x + pad, y + pad + size);
        x += widths[k];
      });
      y += hh;
    };
    drawHead();
    rows.forEach((r, ri) => {
      const cells = r.map((cell, k) => {
        setFont(size, kv && k === 0 ? "bold" : "normal", kv && k === 0 ? MUTED : INK);
        return pdf.splitTextToSize(pdfText(cell), widths[k] - pad * 2);
      });
      const rh = Math.max(signature ? 30 : 0, Math.max(...cells.map((c) => c.length)) * lh(size) + pad * 2);
      if (ensure(rh)) drawHead();
      if (ri % 2 === 1 && !kv) {
        pdf.setFillColor(...SHADE);
        pdf.rect(M, y, CW, rh, "F");
      }
      let x = M;
      cells.forEach((c, k) => {
        setFont(size, kv && k === 0 ? "bold" : "normal", kv && k === 0 ? MUTED : INK);
        c.forEach((ln, j) => pdf.text(ln, x + pad, y + pad + size + j * lh(size)));
        x += widths[k];
      });
      pdf.setDrawColor(...LINE);
      pdf.setLineWidth(0.5);
      pdf.line(M, y + rh, M + CW, y + rh);
      y += rh;
    });
    y += 10;
  };

  // ---- Company logo / name (page 1) ----------------------------------------
  if (B.logoDataUrl || B.companyName) {
    const bandTop = 34;
    let x = M;
    let bandH = 14;
    if (B.logoDataUrl) {
      const sz = await imageSize(B.logoDataUrl);
      if (sz) {
        const maxH = 40;
        const maxW = 170;
        const k = Math.min(maxW / sz.w, maxH / sz.h);
        const w = sz.w * k;
        const h = sz.h * k;
        const fmt = /^data:image\/jpe?g/i.test(B.logoDataUrl) ? "JPEG" : "PNG";
        try {
          pdf.addImage(B.logoDataUrl, fmt, x, bandTop, w, h);
          x += w + 12;
          bandH = Math.max(bandH, h);
        } catch {
          /* unreadable image — skip the logo rather than fail the export */
        }
      }
    }
    if (B.companyName) {
      setFont(12, "bold", INK);
      pdf.text(pdfText(B.companyName), x, bandTop + bandH / 2 + 4);
    }
    y = Math.max(TOP, bandTop + bandH + 26);
  }
  const titleTop = y;

  // ---- Title block (page 1) ------------------------------------------------
  setFont(8, "bold", MUTED);
  pdf.text(pdfText(B.reportTitle.toUpperCase()), M, y);
  setFont(16, "bold", INK);
  pdf.text(pdfText(header.planNumber), W - M, y + 4, { align: "right" });
  y += 8;
  setFont(17, "bold");
  const titleLines = pdf.splitTextToSize(pdfText(header.title), CW - 150);
  titleLines.forEach((ln) => {
    pdf.text(ln, M, y + 17);
    y += lh(17);
  });
  setFont(9, "normal", MUTED);
  pdf.text(pdfText(`Rev ${header.revision}  |  ${header.date}`), W - M, titleTop + 26, { align: "right" });
  y += 8;
  pdf.setFillColor(...BRAND);
  pdf.rect(M, y, CW, 2.5, "F");
  y += 12;

  // header kv in two pairs per row
  const kvRows = [];
  for (let k = 0; k < header.kv.length; k += 2) {
    const a = header.kv[k];
    const b = header.kv[k + 1] || ["", ""];
    kvRows.push([a[0], a[1], b[0], b[1]]);
  }
  // draw as 4-col kv-ish table (labels bold muted in cols 0 and 2)
  {
    const widths = [17, 33, 17, 33].map((w) => (w / 100) * CW);
    const pad = 5;
    const size = 9;
    kvRows.forEach((r) => {
      const cells = r.map((cell, k) => {
        setFont(size, k % 2 === 0 ? "bold" : "normal", k % 2 === 0 ? MUTED : INK);
        return pdf.splitTextToSize(pdfText(cell), widths[k] - pad * 2);
      });
      const rh = Math.max(...cells.map((c) => c.length)) * lh(size) + pad * 2;
      ensure(rh);
      let x = M;
      cells.forEach((c, k) => {
        setFont(size, k % 2 === 0 ? "bold" : "normal", k % 2 === 0 ? MUTED : INK);
        c.forEach((ln, j) => pdf.text(ln, x + pad, y + pad + size + j * lh(size)));
        x += widths[k];
      });
      pdf.setDrawColor(...LINE);
      pdf.setLineWidth(0.5);
      pdf.line(M, y + rh, M + CW, y + rh);
      y += rh;
    });
    y += 16;
  }

  // ---- Sections --------------------------------------------------------------
  sections.forEach((s) => {
    ensure(lh(12) + 40);
    setFont(12, "bold", INK);
    pdf.text(pdfText(`${s.num}.  ${s.title.toUpperCase()}`), M, y + 12);
    y += lh(12) + 2;
    pdf.setDrawColor(...BRAND);
    pdf.setLineWidth(1);
    pdf.line(M, y, M + 40, y);
    y += 8;
    s.blocks.forEach((b) => {
      if (b.type === "p") para(b.text);
      else if (b.type === "note") para(b.text, { size: 8.5, style: "italic", color: MUTED });
      else if (b.type === "list") list(b.items, b.ordered);
      else if (b.type === "kv") table([{ label: "", w: 35 }, { label: "", w: 65 }], b.rows, { kv: true });
      else if (b.type === "table") table(b.columns, b.rows, { signature: b.signature });
    });
    y += 6;
  });

  // ---- Running header / footer on every page --------------------------------
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    if (p > 1) {
      setFont(8, "bold", MUTED);
      pdf.text(pdfText(`${header.planNumber}  Rev ${header.revision}`), M, 40);
      setFont(8, "normal", MUTED);
      const t = pdf.splitTextToSize(pdfText(header.title), CW / 2)[0];
      pdf.text(t, W - M, 40, { align: "right" });
      pdf.setDrawColor(...LINE);
      pdf.setLineWidth(0.5);
      pdf.line(M, 48, W - M, 48);
    }
    pdf.setDrawColor(...LINE);
    pdf.setLineWidth(0.5);
    pdf.line(M, H - 38, W - M, H - 38);
    setFont(7.5, "normal", MUTED);
    const foot = pdf.splitTextToSize(pdfText(`${header.status}  |  ${B.footerText}`), CW - 80)[0];
    pdf.text(foot, M, H - 26);
    pdf.text(`Page ${p} of ${pages}`, W - M, H - 26, { align: "right" });
  }

  pdf.setProperties({ title: pdfText(`${header.planNumber} ${header.title}`), subject: pdfText(B.reportTitle), author: pdfText(B.companyName) });
  pdf.save(fileName || `${header.planNumber}_Rev${header.revision}.pdf`);
}
