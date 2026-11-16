"use client";
// "Report settings" dialog — company branding for Qualification Plan documents.

import { useRef, useState } from "react";
import { DEFAULT_BRANDING, prepareLogo } from "@/components/qualification/branding";

export default function BrandingSettings({ branding, save, onClose }) {
  const [form, setForm] = useState(() => ({
    companyName: branding.companyName || "",
    reportTitle: branding.reportTitle || DEFAULT_BRANDING.reportTitle,
    footerText: branding.footerText || DEFAULT_BRANDING.footerText,
    brandColor: branding.brandColor || DEFAULT_BRANDING.brandColor,
    logoDataUrl: branding.logoDataUrl || null,
  }));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  const set = (k) => (v) => setForm((s) => ({ ...s, [k]: v }));

  async function onLogo(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    try {
      set("logoDataUrl")(await prepareLogo(file));
    } catch (x) {
      setErr(x.message);
    }
  }

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      await save({
        companyName: form.companyName.trim().slice(0, 120),
        reportTitle: form.reportTitle.trim().slice(0, 120) || DEFAULT_BRANDING.reportTitle,
        footerText: form.footerText.trim().slice(0, 160) || DEFAULT_BRANDING.footerText,
        brandColor: /^#[0-9a-f]{6}$/i.test(form.brandColor) ? form.brandColor : DEFAULT_BRANDING.brandColor,
        logoDataUrl: form.logoDataUrl || null,
      });
      onClose();
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  }

  return (
    <div className="qp-modal" onClick={onClose}>
      <div className="qp-modal__inner qp-brandbox form-panel" onClick={(e) => e.stopPropagation()}>
        <h3 className="qp-h3" style={{ marginTop: 0 }}>Report settings</h3>
        <p className="qp-sub" style={{ marginBottom: 18 }}>
          Brand your qualification plans. These settings apply to every plan on screen and in the exported PDF.
          {branding.fromBuilder && " Pre-filled from your Pallet Builder report settings."}
        </p>

        <div className="qp-grid">
          <div className="field">
            <label>Company name</label>
            <input className="input" value={form.companyName} onChange={(e) => set("companyName")(e.target.value)} placeholder="e.g. Acme Packaging Co." />
          </div>
          <div className="field">
            <label>Report title</label>
            <input className="input" value={form.reportTitle} onChange={(e) => set("reportTitle")(e.target.value)} placeholder={DEFAULT_BRANDING.reportTitle} />
          </div>
          <div className="field">
            <label>Report footer text</label>
            <input className="input" value={form.footerText} onChange={(e) => set("footerText")(e.target.value)} placeholder={DEFAULT_BRANDING.footerText} />
          </div>
          <div className="field">
            <label>Primary brand color</label>
            <div className="qp-colorrow">
              <input type="color" value={form.brandColor} onChange={(e) => set("brandColor")(e.target.value)} aria-label="Primary brand color" />
              <input className="input" value={form.brandColor} onChange={(e) => set("brandColor")(e.target.value)} maxLength={7} />
              <button type="button" className="btn btn--ghost" onClick={() => set("brandColor")(DEFAULT_BRANDING.brandColor)}>Reset</button>
            </div>
          </div>
          <div className="field qp-wide">
            <label>Company logo</label>
            <div className="qp-logorow">
              <div className="qp-logobox">
                {form.logoDataUrl ? <img src={form.logoDataUrl} alt="Company logo" /> : <span className="qp-hint">No logo</span>}
              </div>
              <div className="qp-logobtns">
                <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>
                  {form.logoDataUrl ? "Replace logo" : "Upload logo"}
                </button>
                {form.logoDataUrl && (
                  <button type="button" className="qp-danger" onClick={() => set("logoDataUrl")(null)}>Remove logo</button>
                )}
                <div className="qp-hint">PNG, JPG or SVG. A wide logo on a white or transparent background works best.</div>
              </div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={onLogo} />
            </div>
          </div>
        </div>

        {/* live header preview */}
        <div className="qp-brandprev" style={{ "--qp-brand": form.brandColor }}>
          <div className="qp-paper__brand">
            {form.logoDataUrl && <img className="qp-paper__logo" src={form.logoDataUrl} alt="" />}
            {form.companyName.trim() && <span className="qp-paper__company">{form.companyName.trim()}</span>}
          </div>
          <div className="qp-paper__eyebrow">{form.reportTitle.trim() || DEFAULT_BRANDING.reportTitle}</div>
          <div className="qp-brandprev__title">Qualification Plan — Example Product</div>
          <div className="qp-brandprev__foot">Draft &nbsp;|&nbsp; {form.footerText.trim() || DEFAULT_BRANDING.footerText}</div>
        </div>

        {err && <p className="qp-err">{err}</p>}
        <div className="qp-nav">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn--primary" disabled={busy} onClick={submit}>
            {busy ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
