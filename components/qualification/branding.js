"use client";
// Company branding for Qualification Plan documents (on-screen + PDF).
// Saved per user in user_settings.data.qpBranding via PATCH /api/settings.
// Until the user saves their own, the Pallet Builder's report settings
// (company name, logo, brand color) are used as a starting point.

import { useCallback, useEffect, useState } from "react";

export const DEFAULT_BRANDING = {
  companyName: "",
  reportTitle: "Packaging Qualification Plan",
  footerText: "Uncontrolled when printed",
  brandColor: "#fdb410",
  logoDataUrl: null,
};

const HEX = /^#[0-9a-f]{6}$/i;

export function resolveBranding(data) {
  const d = data && typeof data === "object" ? data : {};
  const qp = d.qpBranding && typeof d.qpBranding === "object" ? d.qpBranding : null;
  const src = qp || {
    companyName: d.companyName || "",
    logoDataUrl: d.logoDataUrl || null,
    brandColor: d.brandColor || "",
  };
  const b = { ...DEFAULT_BRANDING };
  if (typeof src.companyName === "string") b.companyName = src.companyName.trim();
  if (typeof src.reportTitle === "string" && src.reportTitle.trim()) b.reportTitle = src.reportTitle.trim();
  if (typeof src.footerText === "string" && src.footerText.trim()) b.footerText = src.footerText.trim();
  if (typeof src.brandColor === "string" && HEX.test(src.brandColor)) b.brandColor = src.brandColor;
  if (typeof src.logoDataUrl === "string" && src.logoDataUrl.startsWith("data:image/")) b.logoDataUrl = src.logoDataUrl;
  return { ...b, fromBuilder: !qp && !!(d.companyName || d.logoDataUrl) };
}

export function hexToRgb(hex) {
  const h = HEX.test(hex || "") ? hex.slice(1) : DEFAULT_BRANDING.brandColor.slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// One fetch per page load, shared by every component that needs branding.
let cache = null;
function loadSettings() {
  if (!cache) {
    cache = fetch("/api/settings?with=qpBranding", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { data: {} }))
      .then((row) => (row && row.data && typeof row.data === "object" ? row.data : {}))
      .catch(() => ({}));
  }
  return cache;
}

export function useBranding() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let live = true;
    loadSettings().then((d) => live && setData(d));
    return () => {
      live = false;
    };
  }, []);

  const save = useCallback(async (value) => {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ key: "qpBranding", value }),
    });
    if (!res.ok) throw new Error((await res.text()) || `Save failed (${res.status})`);
    const row = await res.json();
    const next = row && row.data && typeof row.data === "object" ? row.data : {};
    cache = Promise.resolve(next);
    setData(next);
    return next;
  }, []);

  return { loading: data === null, branding: resolveBranding(data || {}), save };
}

/**
 * Read an uploaded image and shrink it to a logo-sized PNG (or JPEG if the PNG
 * is still large) so it stores compactly and embeds cleanly in the PDF.
 */
export function prepareLogo(file, { maxW = 800, maxH = 300, maxBytes = 450_000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error("Choose an image file (PNG, JPG or SVG)."));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("That image is over 8 MB — please use a smaller file."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't open that image."));
      img.onload = () => {
        const w0 = img.naturalWidth || img.width || maxW;
        const h0 = img.naturalHeight || img.height || maxH;
        const k = Math.min(1, maxW / w0, maxH / h0);
        const w = Math.max(1, Math.round(w0 * k));
        const h = Math.max(1, Math.round(h0 * k));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        let url = canvas.toDataURL("image/png");
        if (url.length > maxBytes) {
          // Flatten onto white for JPEG (no transparency).
          const c2 = document.createElement("canvas");
          c2.width = w;
          c2.height = h;
          const x = c2.getContext("2d");
          x.fillStyle = "#fff";
          x.fillRect(0, 0, w, h);
          x.drawImage(canvas, 0, 0);
          url = c2.toDataURL("image/jpeg", 0.85);
        }
        if (url.length > maxBytes * 1.4) return reject(new Error("That logo is too detailed to store — try a simpler or smaller image."));
        resolve(url);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Natural size of a data-URL image (for keeping the logo's aspect ratio in the PDF). */
export function imageSize(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
