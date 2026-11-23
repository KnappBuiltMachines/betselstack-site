// lib/case-size/calc.js
// Case Size Calculator math, shared by the free tool at /tools/case-size-calculator.
// This is the same logic as the CASE SIZE CALCULATOR in protected/pallet-builder.html
// (csGenerate / CS_STYLES / csBoardLbPerFt2). If you change the math there,
// change it here too so the free tool and the paid tool always agree.
//
// All math is in inches and pounds. Convert at the UI boundary.

// Carton styles.
// od(): inside dims + score allowances -> outside dims (t = board caliper)
// blankArea(): approx corrugate blank area (sq in) from OUTSIDE dims,
//              used for material-weight estimation.
export const CARTON_STYLES = {
  RSC: {
    label: "RSC — Regular Slotted Container",
    short: "RSC",
    allowance: "+2t L, +2t W, +4t H",
    od: (L, W, H, t) => ({ L: L + 2 * t, W: W + 2 * t, H: H + 4 * t }),
    blankArea: (L, W, H) => (2 * (L + W) + 1.5) * (H + W),
  },
  HSC: {
    label: "HSC — Half Slotted Container",
    short: "HSC",
    allowance: "+2t L, +2t W, +2t H",
    od: (L, W, H, t) => ({ L: L + 2 * t, W: W + 2 * t, H: H + 2 * t }),
    blankArea: (L, W, H) => (2 * (L + W) + 1.5) * (H + W / 2),
  },
  TRAY: {
    label: "Tray",
    short: "Tray",
    allowance: "+2t L, +2t W, +1t H",
    od: (L, W, H, t) => ({ L: L + 2 * t, W: W + 2 * t, H: H + t }),
    blankArea: (L, W, H) => (L + 2 * H) * (W + 2 * H) * 1.1,
  },
  BLISS: {
    label: "Bliss Box",
    short: "Bliss",
    allowance: "+2t L, +4t W, +2t H",
    od: (L, W, H, t) => ({ L: L + 2 * t, W: W + 4 * t, H: H + 2 * t }),
    blankArea: (L, W, H) => (L + 2 * H) * (W + 2 * H) * 1.15,
  },
  DCT: {
    label: "Die-Cut Tray",
    short: "Die-Cut Tray",
    allowance: "+4t L, +4t W, +1t H",
    od: (L, W, H, t) => ({ L: L + 4 * t, W: W + 4 * t, H: H + t }),
    blankArea: (L, W, H) => (L + 2 * H) * (W + 2 * H) * 1.3,
  },
};

// Board presets. value = caliper in inches.
export const FLUTES = [
  { value: "0.0625", label: 'E-Flute (1/16")' },
  { value: "0.125", label: 'B-Flute (1/8")' },
  { value: "0.15625", label: 'C-Flute (5/32")' },
  { value: "0.25", label: 'BC Double Wall (1/4")' },
  { value: "custom", label: "Custom…" },
];

// Approx. single/double-wall board basis weight (lb/ft²) from caliper (in).
// Anchors: E≈0.075, B≈0.10, C≈0.11, BC≈0.15 — linear fit, floor at 0.05.
export function boardLbPerFt2(t) {
  return Math.max(0.05, 0.05 + 0.4 * t);
}

export const r2 = (v) => Math.round(v * 100) / 100;

/**
 * Generate every case configuration for a given unit and count.
 * inp: { pkgType: 'cuboid'|'cylinder', uL, uW, uH, count, maxLayers,
 *        style, t, clr, unitWtLbs }   (inches / lbs; for a cylinder uL = uW = diameter)
 * Returns [] when inputs are incomplete.
 */
export function generateCases(inp) {
  const count = Math.max(0, Math.floor(inp.count || 0));
  const valid =
    inp.pkgType === "cylinder"
      ? inp.uL > 0 && inp.uH > 0 && count > 0
      : inp.uL > 0 && inp.uW > 0 && inp.uH > 0 && count > 0;
  if (!valid) return [];

  const style = CARTON_STYLES[inp.style] || CARTON_STYLES.RSC;
  const seen = new Set();
  const results = [];
  for (let nz = 1; nz <= inp.maxLayers; nz++) {
    if (count % nz !== 0) continue;
    const perLayer = count / nz;
    for (let a = 1; a <= perLayer; a++) {
      if (perLayer % a !== 0) continue;
      const b = perLayer / a;
      // Orientations of the unit footprint within the case grid.
      // Cylinder: footprint is square -> one orientation, dedupe mirrored grids.
      const orients =
        inp.pkgType === "cylinder" || Math.abs(inp.uL - inp.uW) < 1e-9
          ? [[inp.uL, inp.uW]]
          : [
              [inp.uL, inp.uW],
              [inp.uW, inp.uL],
            ];
      for (const [dx, dy] of orients) {
        const idL = a * dx + inp.clr;
        const idW = b * dy + inp.clr;
        const idH = nz * inp.uH + inp.clr;
        // Dedupe: case L/W labels are interchangeable at the pallet level
        const key = [r2(Math.min(idL, idW)), r2(Math.max(idL, idW)), r2(idH)].join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        const od = style.od(idL, idW, idH, inp.t);
        const blank = style.blankArea(od.L, od.W, od.H); // sq in
        const boardWt = (blank / 144) * boardLbPerFt2(inp.t); // lbs
        const caseWt = count * (inp.unitWtLbs || 0) + boardWt; // lbs
        results.push({
          key,
          arr: `${a}×${b}×${nz}`,
          a,
          b,
          nz,
          dx,
          dy,
          idL,
          idW,
          idH,
          odL: r2(od.L),
          odW: r2(od.W),
          odH: r2(od.H),
          boardWt: r2(boardWt),
          caseWt: r2(caseWt),
          cube: r2((od.L * od.W * od.H) / 1728), // ft³
        });
      }
    }
  }
  // Same order as the pallet builder: footprint area, then height
  results.sort((p, q) => p.odL * p.odW - q.odL * q.odW || p.odH - q.odH);
  return results;
}
