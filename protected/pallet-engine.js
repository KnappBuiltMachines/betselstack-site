// pallet-engine.js — Betsel Stack pattern engine (shared)
//
// ONE copy of the pattern engine, loaded by BOTH the desktop builder
// (pallet-builder.html) and the mobile builder (pallet-mobile.html) through
// the login-protected /api/engine route. Edit the engine here only.
//
// Relies on these globals, which each page defines BEFORE loading this file:
//   ST  — page state (reads ST.maxOverhang, ST.isMetric, ST.tightMode)
//   r2  — round to 2 decimals
//   KBM_SETTINGS — desktop only, used by getSlipSheetH() (mobile never calls it)
//
// Entry points:
//   buildPatterns(cW, cL, pW, pL)  — generate the ranked pattern list
//   _distributePattern(p, pW, pL)  — apply the TIGHT / SPREAD layout to one
//                                    pattern (desktop runs this on every
//                                    pattern right after buildPatterns)

// ═══════════════════════════════════════════════════════════════════════
// PHYSICAL CASE PLACEMENT ENGINE
// Every case is a solid rectangular body. Placement is validated before
// confirmation. No overlap, no clipping, no penetration — ever.
// ═══════════════════════════════════════════════════════════════════════

const EPSILON = 0.0001; // floating-point tolerance for boundary checks

// ── Case constructor
// All cases carry their true physical footprint after rotation
function makeCase(x, y, nomW, nomL, rotation, ori){
  // Physical dimensions after rotation
  const pw = rotation === 90 ? nomL : nomW;  // physical width  (X axis)
  const pl = rotation === 90 ? nomW : nomL;  // physical length (Y axis)
  // Store positions and dimensions with full precision (6 dp) to avoid
  // rounding errors when case dims have 3+ decimal places.
  // r2 (2dp) is only used at display time via dp().
  const rnd6 = v => Math.round(v * 1000000) / 1000000;
  return { x:rnd6(x), y:rnd6(y), w:rnd6(pw), l:rnd6(pl), nomW, nomL, ori:rotation||ori||0 };
}

// ── AABB collision check
// Returns true if two cases physically overlap (strict — excludes touching edges)
function casesOverlap(a, b){
  return !(a.x + a.w <= b.x + EPSILON ||
           b.x + b.w <= a.x + EPSILON ||
           a.y + a.l <= b.y + EPSILON ||
           b.y + b.l <= a.y + EPSILON);
}

// ── Boundary check: case must be fully inside zone [0,zW] × [0,zL]
// ── Zone boundary check
// zX,zY = zone origin (0,0 for default; negative for overhang)
// zW,zL = zone width/length
function caseInZone(c, zW, zL, zX, zY){
  const ox = zX !== undefined ? zX : 0;
  const oy = zY !== undefined ? zY : 0;
  return c.x >= ox - EPSILON &&
         c.y >= oy - EPSILON &&
         c.x + c.w <= ox + zW + EPSILON &&
         c.y + c.l <= oy + zL + EPSILON;
}

// ── Full validation: boundary check + collision check
function isValidPlacement(candidate, placed, zW, zL, zX, zY){
  if(!caseInZone(candidate, zW, zL, zX, zY)) return false;
  for(let i = 0; i < placed.length; i++){
    if(casesOverlap(candidate, placed[i])) return false;
  }
  return true;
}

// ── Collision-only check (no zone boundary — for use when boundary is pre-validated)
function noOverlap(candidate, placed){
  for(let i = 0; i < placed.length; i++){
    if(casesOverlap(candidate, placed[i])) return false;
  }
  return true;
}

// ── Row-based physical packer
// Builds a layer by packing rows. Each case is validated before placement.
// rotation: 0 or 90 for the whole row  |  altRow: if true, every other row uses opposite rotation
// Returns array of physically validated case objects.
function buildPhysicalLayer(nomW, nomL, zoneW, zoneL, rotation, altRow, offsetX, offsetY){
  const placed = [];

  // Determine physical dims for main rotation and alternate rotation
  const mainPW = rotation === 90 ? nomL : nomW;   // physical width in X
  const mainPL = rotation === 90 ? nomW : nomL;   // physical depth in Y
  const altRot  = rotation === 90 ? 0   : 90;
  const altPW  = altRot  === 90 ? nomL : nomW;
  const altPL  = altRot  === 90 ? nomW : nomL;

  let curY = offsetY || 0;
  let rowIdx = 0;

  while(curY + Math.min(mainPL, altPL) - EPSILON < zoneL){
    const useAlt = altRow && (rowIdx % 2 === 1);
    const rot  = useAlt ? altRot  : rotation;
    const pW   = useAlt ? altPW   : mainPW;
    const pL   = useAlt ? altPL   : mainPL;

    // Will this row fit vertically?
    if(curY + pL > zoneL + EPSILON) break;

    let curX = offsetX || 0;
    let placedInRow = 0;

    while(curX + pW - EPSILON < zoneW){
      const c = makeCase(curX, curY, nomW, nomL, rot);

      // Validate — must be in zone and not overlap anything placed so far
      if(isValidPlacement(c, placed, zoneW, zoneL)){
        placed.push(c);
        placedInRow++;
      } else {
        // Skip this X position (shouldn't happen in a clean grid, but be safe)
        break;
      }
      curX = r2(curX + pW);
    }

    if(placedInRow === 0) break; // nothing fit in this row — stop
    curY = r2(curY + pL);
    rowIdx++;
  }
  return placed;
}

// ── Offset / shift a validated layer and re-validate
// Used for interlocked Layer B — shift existing placements by (dx, dy)
// Cases that would fall outside zone or overlap are dropped
function shiftLayer(pls, dx, dy, zoneW, zoneL){
  const shifted = [];
  for(const p of pls){
    const c = { ...p, x: r2(p.x + dx), y: r2(p.y + dy) };
    if(isValidPlacement(c, shifted, zoneW, zoneL)){
      shifted.push(c);
    }
    // If invalid, drop the case — never force an invalid placement
  }
  return shifted;
}

// ── Merge two physically separate placement groups (top + bottom half for Pinwheel)
// Validates each case from group B against group A before adding
function mergeGroups(groupA, groupB, zoneW, zoneL){
  const merged = [...groupA];
  for(const c of groupB){
    if(isValidPlacement(c, merged, zoneW, zoneL)){
      merged.push(c);
    }
  }
  return merged;
}

// ── Centre a validated placement set on the pallet
// Returns new set with adjusted coordinates, re-validated (centering never causes overlap)
function centreOnPallet(pls, pW, pL){
  if(!pls.length) return pls;
  const mxX = Math.max(...pls.map(p => p.x + p.w));
  const mxY = Math.max(...pls.map(p => p.y + p.l));
  const mnX = Math.min(...pls.map(p => p.x));
  const mnY = Math.min(...pls.map(p => p.y));
  const blockW = mxX - mnX;
  const blockL = mxY - mnY;
  const offX = r2((pW - blockW) / 2 - mnX);
  const offY = r2((pL - blockL) / 2 - mnY);
  return pls.map(p => ({ ...p, x: r2(p.x + offX), y: r2(p.y + offY) }));
}


// Total cases for alternating patterns: sum layer by layer
// Non-alternating: TI * HI
// Alternating (TI_A / TI_B): (TI_A + TI_B) * floor(HI/2) + TI_A * (HI % 2)
function calcTotalCases(TI, HI, TI_B){
  const b = (TI_B && TI_B !== TI) ? TI_B : TI;
  if(b === TI) return TI * HI;  // non-alternating
  // Alternate: A,B,A,B,...
  const pairs = Math.floor(HI / 2);
  const remainder = HI % 2;
  return pairs * (TI + b) + remainder * TI;
}
// ── Analysis helpers
// ── Spatial hash for fast axis-aligned rectangle overlap queries ──
// Large layers (hundreds+ of small cases) make the naive O(n²) overlap
// loops freeze the browser; these helpers give exact results in ~O(n).
function _buildRectHash(pls){
  const avg=pls.reduce((s,p)=>s+p.w*p.l,0)/pls.length;
  const cell=Math.max(1e-6, Math.sqrt(avg));
  const map=new Map();
  const key=(cx,cy)=>cx*100003+cy;
  pls.forEach((p,i)=>{
    const x0=Math.floor(p.x/cell), x1=Math.floor((p.x+p.w-1e-9)/cell);
    const y0=Math.floor(p.y/cell), y1=Math.floor((p.y+p.l-1e-9)/cell);
    for(let cx=x0;cx<=x1;cx++)for(let cy=y0;cy<=y1;cy++){
      const k=key(cx,cy);
      let a=map.get(k); if(!a){a=[];map.set(k,a);}
      a.push(i);
    }
  });
  return {cell,map,key,pls};
}
function _hashOverlapArea(h,c){
  const seen=new Set(); let area=0;
  const x0=Math.floor(c.x/h.cell), x1=Math.floor((c.x+c.w-1e-9)/h.cell);
  const y0=Math.floor(c.y/h.cell), y1=Math.floor((c.y+c.l-1e-9)/h.cell);
  for(let cx=x0;cx<=x1;cx++)for(let cy=y0;cy<=y1;cy++){
    const a=h.map.get(h.key(cx,cy)); if(!a) continue;
    for(const i of a){
      if(seen.has(i)) continue; seen.add(i);
      const b=h.pls[i];
      const ox=Math.max(0,Math.min(c.x+c.w,b.x+b.w)-Math.max(c.x,b.x));
      const oy=Math.max(0,Math.min(c.y+c.l,b.y+b.l)-Math.max(c.y,b.y));
      area+=ox*oy;
    }
  }
  return area;
}

function overlapRatio(plsA, plsB){
  if(!plsA.length || !plsB.length) return 0;
  let overlap = 0;
  if(plsA.length*plsB.length>40000){
    // Hash-accelerated exact computation for large layers
    const h=_buildRectHash(plsB);
    plsA.forEach(a=>{ overlap+=_hashOverlapArea(h,a); });
  } else {
    plsA.forEach(a => {
      plsB.forEach(b => {
        const ox = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
        const oy = Math.max(0, Math.min(a.y+a.l, b.y+b.l) - Math.max(a.y, b.y));
        overlap += ox * oy;
      });
    });
  }
  const total = plsA.reduce((s,p) => s + p.w * p.l, 0);
  return total > 0 ? r2(Math.min(1, overlap / total)) : 0;
}

// ── Genuine interlock quality (0–1) ─────────────────────────────
// overlapRatio() above is ~1.0 for ANY two full layers (their footprints
// almost fully overlap regardless of arrangement), so it cannot tell a
// real interlock from a column stack. What actually creates interlock is
// BRIDGING: a case in the alternate layer resting across two or more
// cases below, tying their seams together. This measures the fraction of
// layer-B cases that genuinely bridge: supported by >= 2 layer-A cases
// (each contributing >= 8% of the case's footprint) with no single
// supporter covering >= 92% (which would mean the case just sits on one
// case below — column behaviour). A symmetric pattern whose 180° turn is
// identical to itself scores 0 here, exactly as it should.
function interlockQuality(plsA, plsB){
  if(!plsA || !plsB || !plsA.length || !plsB.length) return 0;
  const B = plsB.length > 250 ? plsB.slice(0, 250) : plsB;
  let bridged = 0;
  for(const b of B){
    const area = b.w * b.l;
    if(area <= 0) continue;
    let supporters = 0, maxShare = 0;
    for(const a of plsA){
      const ox = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
      const oy = Math.max(0, Math.min(a.y+a.l, b.y+b.l) - Math.max(a.y, b.y));
      const ov = ox * oy;
      if(ov > area * 0.08) supporters++;
      if(ov > maxShare) maxShare = ov;
    }
    if(supporters >= 2 && maxShare < area * 0.92) bridged++;
  }
  return r2(bridged / B.length);
}

// Largest internal gap in a layer (checked along rows and columns).
// Big internal gaps break interlock bridging and let cases shift in
// transit, so they must pull the stability score down.
function maxInternalGapG(pls){
  if(!pls || pls.length < 2) return 0;
  const rk = v => Math.round(v * 100) / 100;
  const rowMap = new Map(), colMap = new Map();
  pls.forEach(p => {
    const ky = rk(p.y); if(!rowMap.has(ky)) rowMap.set(ky, []); rowMap.get(ky).push(p);
    const kx = rk(p.x); if(!colMap.has(kx)) colMap.set(kx, []); colMap.get(kx).push(p);
  });
  let mg = 0;
  rowMap.forEach(row => {
    const s = [...row].sort((a,b) => a.x - b.x);
    for(let i=1; i<s.length; i++) mg = Math.max(mg, s[i].x - (s[i-1].x + s[i-1].w));
  });
  colMap.forEach(col => {
    const s = [...col].sort((a,b) => a.y - b.y);
    for(let i=1; i<s.length; i++) mg = Math.max(mg, s[i].y - (s[i-1].y + s[i-1].l));
  });
  return mg;
}

// Gap fraction = largest internal gap / smallest case dimension in the layer
function _gapFracOf(pls){
  if(!pls || !pls.length) return 0;
  let sm = Infinity;
  pls.forEach(p => { sm = Math.min(sm, p.w, p.l); });
  return sm > 0 ? maxInternalGapG(pls) / sm : 0;
}

function continuousSeamFraction(pls, axis){
  if(!pls.length) return 1;
  const lines = new Map();
  pls.forEach(p => {
    const key = r2(axis === 'x' ? p.x : p.y);
    lines.set(key, (lines.get(key)||0) + 1);
  });
  const maxCount = Math.max(...lines.values());
  return lines.size <= 1 ? 1 : maxCount / pls.length;
}

function weightDistScore(pls, pW, pL){
  if(!pls.length) return 0;
  const totalArea = pls.reduce((s,p) => s + p.w * p.l, 0);
  if(totalArea === 0) return 0;
  const cx = pls.reduce((s,p) => s + (p.x + p.w/2) * p.w * p.l, 0) / totalArea;
  const cy = pls.reduce((s,p) => s + (p.y + p.l/2) * p.w * p.l, 0) / totalArea;
  const dx = Math.abs(cx - pW/2) / (pW/2);
  const dy = Math.abs(cy - pL/2) / (pL/2);
  return r2((1 - Math.sqrt(dx*dx + dy*dy) / Math.SQRT2) * 100);
}

// ═══════════════════════════════════════════════════════════════════════
// PATTERN BUILDER — Column Stack & Interlocked
// Follows exact industrial packaging engineering specifications.
// ═══════════════════════════════════════════════════════════════════════
// PATTERN BUILDER — Column Stack & Interlocked
// CENTERING RULE: The pallet CENTER is ALWAYS the anchor point.
//   startX = (palletWidth  - loadWidth)  / 2
//   startY = (palletLength - loadLength) / 2
// Overhang/inset is applied symmetrically from the centre outward.
// Gaps are distributed evenly — never accumulated on one side.
// ═══════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════
// PALLET PATTERN ENGINE — 4 patterns
//
// #1 Column Stack (L∥Pallet-L): 0° every layer, cases touching, centred
// #2 Column Stack (W∥Pallet-L): 90° every layer, cases touching, centred
// #3 Interlock-1: Layer 1 = 0° (CS1 base), alternates 90°/0°/90°…
// #4 Interlock-2: Layer 1 = 90° (CS2 base), alternates 0°/90°/0°…
//
// INTERLOCK RULES:
//   DUAL-AXIS MASTER FOOTPRINT:
//     masterW = max(blockW_0°, blockW_90°)  — widest packed block
//     masterL = max(blockL_0°, blockL_90°)  — longest packed block
//     (these may come from different orientations)
//   EVEN DISTRIBUTION TO OUTER EDGES:
//     n cases of caseDim spread across masterSpan:
//     gap = (masterSpan − n×caseDim) / (n−1)
//     first case left/top edge = master edge (flush)
//     last  case right/bottom edge = master edge (flush)
//     all interior gaps equal
//   BOTH layers (0° and 90°) spread to the SAME master footprint,
//   so the outer walls of the unit load are perfectly uniform at
//   every layer regardless of orientation.
//   Entire load centred on pallet (equal margins all four sides).
// ═══════════════════════════════════════════════════════════════
// METRIC CALCULATION HELPERS
// ═══════════════════════════════════════════════════════════════

// Cubic Efficiency % = total case volume / (palW × palL × loadH) × 100
// Total height added by slip sheets (in inches, display unit)
function getSlipSheetH(){
  if(!ST.slipSheets || !ST.slipSheetLayers.length) return 0;
  // Each selected slip sheet layer adds one thickness
  const thickIn = (KBM_SETTINGS && KBM_SETTINGS.ssThick) ? KBM_SETTINGS.ssThick : 0.04;
  return ST.slipSheetLayers.length * thickIn;
}

function cubicEfficiency(pls, palW, palL, cH, HI, palH){
  if(!pls.length) return 0;
  const totalCaseVol = pls.reduce((s,p)=>s+p.w*p.l*cH,0) * HI;
  const loadH = palH + cH * HI;
  return loadH>0 ? r2(totalCaseVol / (palW * palL * loadH) * 100) : 0;
}

// Case Support % — engineering definition:
// Layer 1 (on pallet deck): 100% supported by definition.
// Higher layers: supported area = geometric overlap with cases directly below.
// Overall = Σ(supported area) / Σ(total bottom area) across ALL layers.
// Also returns minSupport = worst-case individual case support %.
function caseSupportPct(pls, palW, palL, edgeOff, HI, plsB){
  // Build array of layers: layer 0 = pallet deck (pls = Layer A or alternating A/B)
  // If only Layer A given (no HI), treat as single-layer stack on pallet.
  if(!pls || !pls.length) return {avg:100, min:100};
  const hi = HI || 1;

  // Build layer placements: alternate A/B if plsB provided
  const layerPls = [];
  for(let lay=0; lay<hi; lay++){
    layerPls.push((plsB && lay%2===1) ? plsB : pls);
  }

  // AABB overlap area between two cases
  const overlapArea = (a, b) => {
    const ox = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
    const oy = Math.max(0, Math.min(a.y+a.l, b.y+b.l) - Math.max(a.y, b.y));
    return ox * oy;
  };

  let totalArea = 0, totalSupported = 0, minSupport = 100;

  // Hash cache — at most two distinct layer arrays (A and B); build each
  // spatial hash once and reuse across all upper layers (exact results,
  // avoids O(n²) freeze for very small cases / very high counts)
  const _hashCache = new Map();
  const _getHash = (arr) => {
    let h = _hashCache.get(arr);
    if(!h){ h = _buildRectHash(arr); _hashCache.set(arr, h); }
    return h;
  };

  for(let lay=0; lay<hi; lay++){
    const layer = layerPls[lay];
    const below = lay>0 ? layerPls[lay-1] : null;
    const useHash = below && layer.length*below.length > 40000;
    const belowHash = useHash ? _getHash(below) : null;
    layer.forEach(c => {
      const bottom = c.w * c.l;
      totalArea += bottom;
      if(lay === 0){
        // Layer 1: pallet deck provides full support
        totalSupported += bottom;
        // (minSupport stays 100 for layer 1 cases)
      } else {
        // Higher layers: sum overlap with every case in the layer below
        let suppArea = 0;
        if(useHash){
          suppArea = _hashOverlapArea(belowHash, c);
        } else {
          below.forEach(b => { suppArea += overlapArea(c, b); });
        }
        // Cap at bottom area (no double-counting)
        suppArea = Math.min(suppArea, bottom);
        totalSupported += suppArea;
        const pct = bottom > 0 ? (suppArea / bottom * 100) : 100;
        if(pct < minSupport) minSupport = pct;
      }
    });
  }

  const avg = totalArea > 0 ? r2(totalSupported / totalArea * 100) : 100;
  return { avg: avg, min: r2(minSupport) };
}

// Stability % — 0–100 composite:
//   Interlock  45 × Q  where Q is MEASURED interlock quality (0–1): the
//              fraction of alternate-layer cases that genuinely bridge two
//              or more cases below. A column stack — or a "alternating"
//              pattern whose 180° turn is identical to itself — earns 0.
//   Support    35 × caseSupportPct/100
//   Centering  15 × weightDistScore/100
//   Overhang    5 when the load has no overhang
//   Gap deduction: up to −20 as the largest internal gap approaches half
//              of the smallest case dimension (gaps break bridging and
//              let cases walk in transit).
// interlock arg: pass a 0–1 quality fraction (preferred, from
// interlockQuality) or a boolean for legacy call sites.
function newStability(interlock, supportPct, centeringPct, ovW, ovL, gapFrac){
  const q = interlock === true ? 1
          : (interlock === false || interlock === undefined || interlock === null) ? 0
          : Math.max(0, Math.min(1, interlock));
  const interlockPts = 0.45 * q;
  const supportPts   = 0.35 * (supportPct/100);
  const centeringPts = 0.15 * (centeringPct/100);
  const overhangPts  = (Math.abs(ovW)<0.01 && Math.abs(ovL)<0.01) ? 0.05 : 0;
  let gapPen = 0;
  if(typeof gapFrac === 'number' && gapFrac > 0.1){
    gapPen = 0.20 * Math.min(1, (gapFrac - 0.1) / 0.4);
  }
  return r2(Math.max(0, Math.min(100, (interlockPts + supportPts + centeringPts + overhangPts - gapPen) * 100)));
}

// ═══════════════════════════════════════════════════════════════
// TIGHT / SPREAD DISTRIBUTION TRANSFORM
// Patterns are always GENERATED with the same canonical geometry; that is
// what the search, dedup, and ranking all operate on, so the pattern list
// is IDENTICAL whether the TIGHT toggle is on or off. This transform then
// repositions each finished layer in BOTH axes:
//   TIGHT ON  — every row's cases squeeze to touching (gap 0) with the
//     block centered, and the rows squeeze together vertically, also
//     centered: interior gaps close in both the length and width
//     directions, leaving all slack as outer margins.
//   TIGHT OFF — every row spreads across the FULL allowed width (first
//     case flush left, last flush right, equal gaps), and the rows spread
//     across the FULL allowed depth the same way.
//   Layouts where a tall case welds all rows into one rigid strip fall
//     back to per-COLUMN vertical distribution so both directions still
//     respond to the toggle.
//   The result stays symmetric about the pallet center (COG centered).
// Every pass is validated against the whole layer and reverted band-by-band
// if it would ever create an overlap, so the transform is always safe.
// Each pass is ALSO reverted if it would leave the layer less tidy than it
// started (see _misalignCount) — distribution may tighten or spread a layout
// but never knock cases off their shared row/column lines.

// Count near-miss alignments: same-size cases whose row (y) or column (x)
// start lines differ by a small amount (0.05"–2") — the "randomly placed"
// look. Exact alignment and purposeful offsets (> 2") don't count.
function _misalignCount(pls){
  let m=0;
  [['y','l'],['x','w']].forEach(([pos,size])=>{
    const groups=new Map();
    pls.forEach(p=>{const k=Math.round(p[size]*100);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p[pos]);});
    groups.forEach(v=>{
      v.sort((a,b)=>a-b);
      for(let i=1;i<v.length;i++){const d=v[i]-v[i-1]; if(d>0.05&&d<=2) m++;}
    });
  });
  return m;
}

function _distributeLayer(pls, pW, pL, tight){
  if(!pls || !pls.length) return null;
  const _OH=(ST.maxOverhang===''||ST.maxOverhang===null||ST.maxOverhang===undefined)?0:parseFloat(ST.maxOverhang)||0;
  const ohIn=ST.isMetric?_OH/25.4:_OH;
  const xLo=-ohIn, xHi=pW+ohIn, yLo=-ohIn, yHi=pL+ohIn;
  const targetW=xHi-xLo, targetL=yHi-yLo;
  if(targetW<=0||targetL<=0) return null;
  const rr=v=>Math.round(v*1e4)/1e4;
  const out=pls.map(p=>({...p}));

  // Bounds + overlap validation over the whole layer
  const ok=arr=>{
    for(const p of arr) if(p.x<xLo-0.02||p.y<yLo-0.02||p.x+p.w>xHi+0.02||p.y+p.l>yHi+0.02) return false;
    if(arr.length>250) return true;
    for(let i=0;i<arr.length;i++){const a=arr[i];
      for(let j=i+1;j<arr.length;j++){const b=arr[j];
        if(a.x+a.w-1e-4>b.x&&b.x+b.w-1e-4>a.x&&a.y+a.l-1e-4>b.y&&b.y+b.l-1e-4>a.y) return false;
      }
    }
    return true;
  };
  if(!ok(out)) return null;

  // Position a run of cases along one axis:
  //   tight  → cases touching (gap 0), block centered in the corridor
  //   spread → first flush at lo, last flush at hi, equal gaps between
  // sizes: case extents along the axis; returns array of positions.
  const runPositions=(sizes, lo, span)=>{
    const total=sizes.reduce((a,b)=>a+b,0), n=sizes.length;
    let gap, x;
    if(tight || total>=span-0.02 || n===1){
      gap=0; x=lo+(span-total)/2;
    } else {
      gap=(span-total)/(n-1); x=lo;
    }
    const posArr=[];
    sizes.forEach(sz=>{ posArr.push(rr(x)); x+=sz+gap; });
    return posArr;
  };

  // ── 1. Cluster cases into horizontal bands (rows) by y-start ─────
  const TOL=0.6;
  const byY=[...out].sort((a,b)=>a.y-b.y||a.x-b.x);
  const bands=[];
  byY.forEach(p=>{
    const b=bands.length?bands[bands.length-1]:null;
    if(b && p.y-b.y0<=TOL){ b.cases.push(p); }
    else bands.push({y0:p.y, cases:[p]});
  });

  // ── 2. ROW PASS (x direction) ─────────────────────────────────────
  // TIGHT: each row's cases squeeze together, block centered.
  // SPREAD: each row spans the full allowed width with equal gaps.
  // Each band is validated against the whole layer and reverted
  // individually (protects layouts where a tall case spans bands).
  const mis0=_misalignCount(out);
  const xBefore=out.map(p=>p.x);
  bands.forEach(b=>{
    const s=b.cases.sort((a,c)=>a.x-c.x);
    const orig=s.map(p=>p.x);
    const xs=runPositions(s.map(p=>p.w), xLo, targetW);
    s.forEach((p,i)=>{p.x=xs[i];});
    if(!ok(out)) s.forEach((p,i)=>{p.x=orig[i];});
  });
  // Tidiness guard: if the row pass knocked cases off shared column lines
  // (e.g. two side-by-side column groups whose row lines differ), undo it.
  if(_misalignCount(out)>mis0) out.forEach((p,i)=>{p.x=xBefore[i];});
  const mis1=_misalignCount(out);
  const yBefore=out.map(p=>p.y);

  // ── 3. BAND PASS (y direction) ────────────────────────────────────
  // Bands whose y-ranges overlap merge into one rigid strip (keeps
  // column-spanning cases intact). TIGHT: strips squeeze to touching,
  // centered. SPREAD: strips span the full depth with equal gaps.
  let strips=bands.map(b=>({
    y0:Math.min(...b.cases.map(p=>p.y)),
    y1:Math.max(...b.cases.map(p=>p.y+p.l)),
    cases:[...b.cases]}));
  strips.sort((a,b)=>a.y0-b.y0);
  const merged=[];
  strips.forEach(s=>{
    const m=merged.length?merged[merged.length-1]:null;
    if(m && s.y0<m.y1-0.02){ m.cases.push(...s.cases); m.y1=Math.max(m.y1,s.y1); }
    else merged.push({y0:s.y0,y1:s.y1,cases:[...s.cases]});
  });
  const m=merged.length;
  if(m>1 || bands.length===1){
    const origY=merged.map(s=>s.cases.map(p=>p.y));
    const ys=runPositions(merged.map(s=>s.y1-s.y0), yLo, targetL);
    merged.forEach((s,si)=>{
      const shift=ys[si]-s.y0;
      s.cases.forEach(p=>{p.y=rr(p.y+shift);});
    });
    if(!ok(out)) merged.forEach((s,si)=>s.cases.forEach((p,pi)=>{p.y=origY[si][pi];}));
  } else {
    // ── COLUMN FALLBACK ─────────────────────────────────────────────
    // Everything merged into ONE rigid strip (a tall case welds the rows
    // together — e.g. "4X-col Left"). Rigid strips can't open or close
    // interior vertical gaps, so distribute per COLUMN instead: cases
    // sharing an x-start line squeeze/spread vertically inside the full
    // corridor, each column validated and reverted independently.
    const cols=new Map();
    out.forEach(p=>{const k=Math.round(p.x*10)/10;if(!cols.has(k))cols.set(k,[]);cols.get(k).push(p);});
    cols.forEach(colArr=>{
      const s=colArr.sort((a,b)=>a.y-b.y);
      const orig=s.map(p=>p.y);
      const ys=runPositions(s.map(p=>p.l), yLo, targetL);
      s.forEach((p,i)=>{p.y=ys[i];});
      if(!ok(out)) s.forEach((p,i)=>{p.y=orig[i];});
    });
  }
  // Same tidiness guard for the vertical pass.
  if(_misalignCount(out)>mis1) out.forEach((p,i)=>{p.y=yBefore[i];});

  return ok(out)?out:null;
}

// Apply the TIGHT/SPREAD distribution to one pattern object and refresh its
// geometry-dependent metrics (support, stability, interlock, overhang).
// Cubic efficiency is footprint-based and unchanged. Saved/manual patterns
// are left untouched.
function _distributePattern(p, pW, pL){
  if(!p||!p.placements||!p.placements.length||p.multiCaseManual||p.saved) return p;
  const pls=_distributeLayer(p.placements,pW,pL,!!ST.tightMode);
  if(!pls) return p;
  // Alternate layer = the same spread layer turned 180° about the pallet
  // center (mirrors how the generator builds placementsB).
  const hadAlt=!!p.placementsB;
  const sameRef=p.placementsB===p.placements;
  const plsB=!hadAlt?null:(sameRef?pls:pls.map(q=>({...q,x:r2(pW-q.x-q.w),y:r2(pL-q.y-q.l)})));
  const mnX=Math.min(...pls.map(q=>q.x)),mxX=Math.max(...pls.map(q=>q.x+q.w));
  const mnY=Math.min(...pls.map(q=>q.y)),mxY=Math.max(...pls.map(q=>q.y+q.l));
  const _oxW=r2(((mxX-mnX)-pW)/2),_oxL=r2(((mxY-mnY)-pL)/2);
  const ohW=(pW<=pL)?_oxW:_oxL, ohL=(pW<=pL)?_oxL:_oxW;
  const supp=caseSupportPct(pls,pW,pL,0,1,plsB||pls);
  const cen=weightDistScore(pls,pW,pL);
  const ilq=(plsB&&!sameRef)?interlockQuality(pls,plsB):0;
  const stab=newStability(ilq,supp.avg,cen,ohW,ohL,_gapFracOf(pls));
  const il=plsB?r2(overlapRatio(pls,plsB)*100):0;
  return {...p,placements:pls,placementsB:plsB,ohW,ohL,
    caseSupportPct:supp.avg,minCaseSupport:supp.min,stability:stab,
    interlockPct:il,wdA:cen,wdB:cen,_maxGap:maxInternalGapG(pls),_ilq:ilq};
}

// ── Edge-offset wrapper ───────────────────────────────────────
// The edge offset resizes the build perimeter the cases are allowed to fill:
//   positive  -> perimeter EXPANDS beyond the pallet (overhang allowed)
//   negative  -> perimeter SHRINKS inside the pallet (inset / underhang)
//   zero      -> perimeter is exactly the pallet length x width
// Every pattern is built on that one resized perimeter and then centered on the
// real pallet, so all patterns down the list use the same perimeter and respond
// to the offset identically.
function buildPatterns(cW, cL, pW, pL){
  const _OH=(ST.maxOverhang===''||ST.maxOverhang===null||ST.maxOverhang===undefined)?0:parseFloat(ST.maxOverhang)||0;
  const _ohIn=ST.isMetric?_OH/25.4:_OH;
  const buildW=pW+2*_ohIn, buildL=pL+2*_ohIn;   // + expands, - shrinks
  const shift=-_ohIn;                            // re-center the build area on the pallet
  if(buildW<=0||buildL<=0) return [];
  const _saved=ST.maxOverhang;
  ST.maxOverhang='0';                            // distribute within the resized perimeter
  let pats;
  try { pats=_bpCore(cW, cL, buildW, buildL); }
  finally { ST.maxOverhang=_saved; }
  if(_ohIn!==0 && pats && pats.length){
    const realArea=pW*pL, rr=v=>Math.round(v*1e6)/1e6, r2v=v=>Math.round(v*100)/100;
    const sh=p2=>({...p2, x:rr(p2.x+shift), y:rr(p2.y+shift)});
    pats.forEach(p=>{
      p.placements=(p.placements||[]).map(sh);
      if(p.placementsB) p.placementsB=p.placementsB.map(sh);
      const pls=p.placements;
      if(pls.length){
        const mnx=Math.min(...pls.map(q=>q.x)), mxx=Math.max(...pls.map(q=>q.x+q.w));
        const mny=Math.min(...pls.map(q=>q.y)), mxy=Math.max(...pls.map(q=>q.y+q.l));
        const _oxW=r2v(((mxx-mnx)-pW)/2), _oxL=r2v(((mxy-mny)-pL)/2);   // + = overhang, - = inset
        p.ohW=(pW<=pL)?_oxW:_oxL;                // W = shorter pallet side
        p.ohL=(pW<=pL)?_oxL:_oxW;                // L = longer pallet side
        const caseArea=pls.reduce((s,q)=>s+q.w*q.l,0);
        p.cubicEff=r2v(caseArea/realArea*100);
        p.palUtilPct=p.cubicEff;
      }
      p.zoneW=pW; p.zoneL=pL;
    });
  }
  return pats;
}

function _bpCore(cW, cL, pW, pL){
  // ═══════════════════════════════════════════════════════════════════
  // BETSEL STACK PATTERN ENGINE v5
  // Exhaustive search: enumerates every structurally distinct row
  // sequence that fits within the pallet, maximising case count.
  //
  // X = 90° case (footprint cL×cW)   O = 0° case (footprint cW×cL)
  //
  // CENTERING:  left_margin == right_margin,  top_margin == bottom_margin
  // BILLBOARD:  outer faces flush with widest/tallest row extent
  //             interior gaps distributed evenly between cases
  // DEDUP:      canonical fingerprint catches exact + rot180 duplicates
  // ═══════════════════════════════════════════════════════════════════
  const OH=(ST.maxOverhang===''||ST.maxOverhang===null||ST.maxOverhang===undefined)?0:parseFloat(ST.maxOverhang)||0;
  const ohIn=ST.isMetric?OH/25.4:OH;
  const EPS=0.0001;
  const rp=v=>Math.round(v*1e6)/1e6;
  const r2=v=>Math.round(v*100)/100;
  const palArea=pW*pL;
  const maxW=pW+2*ohIn, maxL=pL+2*ohIn;

  // Case footprints
  const W0=cW, D0=cL;   // O=0°: width×depth
  const W9=cL, D9=cW;   // X=90°: width×depth
  const can0=W0<=maxW+EPS&&D0<=maxL+EPS;
  const can9=W9<=maxW+EPS&&D9<=maxL+EPS;
  if(!can0&&!can9) return [];

  // Max counts
  const mC0=can0?Math.floor((maxW+EPS)/W0):0;
  const mC9=can9?Math.floor((maxW+EPS)/W9):0;
  const mR0=can0?Math.floor((maxL+EPS)/D0):0;
  const mR9=can9?Math.floor((maxL+EPS)/D9):0;

  // Billboard targets — the "outer limits ALLOWED" are the pallet
  // dimensions themselves (plus any permitted overhang), not the
  // per-orientation maximum row/column extent. A mixed-orientation
  // pattern can legitimately use the full pallet depth even when no
  // single pure orientation reaches it, so the spread target must be
  // the pallet's true bounds — every row/column should be able to
  // reach these edges when its case count allows.
  const targetW=maxW;
  const targetL=maxL;
  // TIGHT PACKING: cases are placed flush against each other — no scattered
  // interior gaps. All leftover space consolidates into centered outer margins
  // (or the single purposeful zone gap in mixed-orientation layouts), so every
  // pattern can be built by hand exactly as drawn. MAXGAP=0 means the
  // distribution passes pack tight instead of inserting per-case gaps.
  // NOTE: generation ALWAYS runs tight — the TIGHT OFF spread is applied
  // afterwards by _spreadPattern() as a pure geometric transform, so the
  // pattern list (count, names, ranking) is identical in both modes.
  const MAXGAP=0;
  const DEDUP_TOL=1;   // positional tolerance when matching turned/mirrored duplicates
  const SNAP_TOL=2;    // cases misaligned by <= this snap to their neighbors' row/column line

  // ── Utilities ────────────────────────────────────────────────────
  const rot180=pls=>pls.map(p=>({...p,x:rp(pW-p.x-p.w),y:rp(pL-p.y-p.l)}));
  const flipX=pls=>pls.map(p=>({...p,x:rp(pW-p.x-p.w)}));  // left-right mirror
  const flipY=pls=>pls.map(p=>({...p,y:rp(pL-p.y-p.l)}));  // top-bottom mirror

  const validate=pls=>{
    const ohl=ohIn+EPS;
    for(const p of pls) if(p.x<-ohl||p.y<-ohl||p.x+p.w>pW+ohl||p.y+p.l>pL+ohl) return false;
    if(pls.length<=200){
      for(let i=0;i<pls.length;i++){const a=pls[i];
        for(let j=i+1;j<pls.length;j++){const b=pls[j];
          if(a.x+a.w-EPS>b.x&&b.x+b.w-EPS>a.x&&a.y+a.l-EPS>b.y&&b.y+b.l-EPS>a.y) return false;
        }
      }
      return true;
    }
    // Large layers: spatial-hash collision check (exact, ~O(n))
    const h=_buildRectHash(pls);
    for(const arr of h.map.values()){
      for(let i=0;i<arr.length;i++){const a=pls[arr[i]];
        for(let j=i+1;j<arr.length;j++){const b=pls[arr[j]];
          if(arr[i]===arr[j]) continue;
          if(a.x+a.w-EPS>b.x&&b.x+b.w-EPS>a.x&&a.y+a.l-EPS>b.y&&b.y+b.l-EPS>a.y) return false;
        }
      }
    }
    return true;
  };

  // Billboard spread: n cases of width w, spread to targetSpan
  // Outer cases pinned to edges, interior gaps distributed evenly
  const billboardSpread=(n,w,span)=>{
    if(n<=0) return [];
    const total=n*w;
    if(total>=span-EPS) return Array.from({length:n},(_,i)=>rp(i*w));
    if(n===1) return [rp((span-w)/2)];
    if(n===2) return [0,rp(span-w)];
    const gap=(span-total)/(n-1);
    return Array.from({length:n},(_,i)=>rp(i*(w+gap)));
  };

  // Build cases in a row at y, billboard-spread to targetW, centred on pallet
  const makeRow=(n,w,d,ori,y)=>{
    if(n<=0||y+d>maxL+EPS) return [];
    const rowSpan=Math.min(n*w,targetW);
    const xs=billboardSpread(n,w,rowSpan);
    const off=rp((pW-rowSpan)/2);
    return xs.map(x=>({x:rp(x+off),y:rp(y),w,l:d,ori}));
  };

  // Build a mixed row: nO O-cases then nX X-cases, all centred
  const makeMixedRow=(nO,nX,y)=>{
    if(y+Math.max(D0,D9)>maxL+EPS) return [];
    const w9block=nX*W9;
    // KEY RULE: spread O-cases across the FULL available O-zone (pW - X-zone)
    // so the combined block fills pW exactly and outer walls are flush on all sides.
    // This is what allows "fitting an extra case on the right by spreading the left ones".
    const w0avail=pW-w9block;        // O-cases spread to fill this width
    if(w0avail<nO*W0-EPS) return []; // O-cases don't even fit tight
    if(w9block>maxW+EPS) return [];
    const xs0=billboardSpread(nO,W0,w0avail); // spread O-cases across their zone
    const xs9=Array.from({length:nX},(_,i)=>rp(i*W9)); // X-cases tight in their zone
    // The combined block = w0avail + w9block = pW exactly (no margin needed)
    const off=rp((pW-(w0avail+w9block))/2); // should be ~0, but handles overhang
    const pls=[];
    xs0.forEach(x=>pls.push({x:rp(x+off),y:rp(y),w:W0,l:D0,ori:0}));
    xs9.forEach(x=>pls.push({x:rp(x+off+w0avail),y:rp(y),w:W9,l:D9,ori:90}));
    return pls;
  };

  // Mirror of makeMixedRow: X-cases spread across the left zone,
  // O-cases packed tight on the right. Used to create alternating-seam
  // ("checkerboard band") layers where consecutive rows swap which
  // orientation sits on which side — matching the reference catalog's
  // 2-row-alternating intra-row mixed patterns.
  const makeMixedRowSwap=(nO,nX,y)=>{
    if(y+Math.max(D0,D9)>maxL+EPS) return [];
    const w0block=nO*W0;
    const w9avail=pW-w0block;
    if(w9avail<nX*W9-EPS) return [];
    if(w0block>maxW+EPS) return [];
    const xs9=billboardSpread(nX,W9,w9avail);
    const xs0=Array.from({length:nO},(_,i)=>rp(i*W0));
    const off=rp((pW-(w9avail+w0block))/2);
    const pls=[];
    xs9.forEach(x=>pls.push({x:rp(x+off),y:rp(y),w:W9,l:D9,ori:90}));
    xs0.forEach(x=>pls.push({x:rp(x+off+w9avail),y:rp(y),w:W0,l:D0,ori:0}));
    return pls;
  };
  const recentre=pls=>{
    if(!pls.length) return pls;
    const mnX=Math.min(...pls.map(p=>p.x)),mxX=Math.max(...pls.map(p=>p.x+p.w));
    const mnY=Math.min(...pls.map(p=>p.y)),mxY=Math.max(...pls.map(p=>p.y+p.l));
    const dx=rp((pW-(mxX-mnX))/2-mnX),dy=rp((pL-(mxY-mnY))/2-mnY);
    if(Math.abs(dx)<EPS&&Math.abs(dy)<EPS) return pls;
    return pls.map(p=>({...p,x:rp(p.x+dx),y:rp(p.y+dy)}));
  };

  // Global billboard: make every row span [xRef0,xRef1], every col span [yRef0,yRef1]
  // ── Spread to PALLET TARGET extents (not the pattern's own bbox) ───
  // Every row's outer case faces should reach [xLo,xHi] = the pallet's
  // true achievable width (targetW), and every column's outer faces
  // should reach [yLo,yHi] = targetL. This is what makes the unit load
  // flush to the outer limits regardless of which row happens to be
  // widest in THIS particular pattern — the reference is the PALLET's
  // maximum, not the pattern's own current extent.
  //
  // Each pass (row-X, then column-Y) is independently validated and
  // reverted if it would create an overlap, so a failure in one pass
  // never discards the whole pattern.
  const billboardToTargets=(pls)=>{
    if(pls.length<1) return pls;
    const TOL=0.02;
    const xLo=rp((pW-targetW)/2), xHi=rp(xLo+targetW);
    const yLo=rp((pL-targetL)/2), yHi=rp(yLo+targetL);

    // ROW PASS: spread each row's cases across [xLo,xHi]
    const rowMap=new Map();
    pls.forEach(p=>{const k=rp(p.y);if(!rowMap.has(k))rowMap.set(k,[]);rowMap.get(k).push(p);});
    let stage1=[];
    rowMap.forEach(row=>{
      const s=[...row].sort((a,b)=>a.x-b.x);
      const curMin=Math.min(...s.map(p=>p.x)),curMax=Math.max(...s.map(p=>p.x+p.w));
      if(Math.abs(curMin-xLo)<TOL&&Math.abs(curMax-xHi)<TOL){s.forEach(p=>stage1.push(p));return;}
      const totalW=s.reduce((a,p)=>a+p.w,0),n=s.length;
      if(totalW>=targetW-TOL){
        const shift=xLo-curMin;
        s.forEach(p=>stage1.push({...p,x:rp(p.x+shift)}));
        return;
      }
      if(n===1){stage1.push({...s[0],x:rp(xLo+(targetW-s[0].w)/2)});return;}
      const gap=Math.min((targetW-totalW)/(n-1),MAXGAP);
      let x=rp(xLo+(targetW-(totalW+gap*(n-1)))/2);
      s.forEach((p,i)=>{stage1.push({...p,x:rp(x)});x=rp(x+p.w+(i<n-1?gap:0));});
    });
    if(!validate(stage1)) stage1=pls; // revert row pass if it broke validity

    // BAND PASS (Y-direction): treat each row (grouped by y) as a band
    // with depth = max case length in that band. Distribute the gap
    // BETWEEN bands (preserving each band's internal x-arrangement from
    // the row pass) so the overall pattern spans [yLo,yHi].
    //
    // This replaces a naive column-grouping approach: after the row pass
    // gives different rows different x-positions (billboard spreads each
    // row independently), grouping by x produces mostly single-case
    // "columns" whose individual centering would collapse all rows
    // toward the vertical centre and create overlaps. Spreading whole
    // BANDS instead preserves every row's internal layout exactly.
    const bandMap=new Map();
    stage1.forEach(p=>{const k=rp(p.y);if(!bandMap.has(k))bandMap.set(k,[]);bandMap.get(k).push(p);});
    const bands=[...bandMap.entries()]
      .sort((a,b)=>a[0]-b[0])
      .map(([y,cases])=>({y,depth:Math.max(...cases.map(c=>c.l)),cases}));
    const n=bands.length;
    const totalDepth=bands.reduce((s,b)=>s+b.depth,0);
    const curMin=bands[0].y, curMax=bands[n-1].y+bands[n-1].depth;
    let stage2;
    if(Math.abs(curMin-yLo)<TOL&&Math.abs(curMax-yHi)<TOL){
      stage2=stage1; // already flush
    } else if(totalDepth>=targetL-TOL){
      // No room to spread — shift whole stack to start at yLo
      const shift=yLo-curMin;
      stage2=stage1.map(p=>({...p,y:rp(p.y+shift)}));
    } else if(n===1){
      const shift=rp(yLo+(targetL-bands[0].depth)/2-bands[0].y);
      stage2=stage1.map(p=>({...p,y:rp(p.y+shift)}));
    } else {
      const gap=Math.min((targetL-totalDepth)/(n-1),MAXGAP);
      const bandShift=new Map();
      let curY=rp(yLo+(targetL-(totalDepth+gap*(n-1)))/2);
      bands.forEach((b,i)=>{
        bandShift.set(b.y, rp(curY-b.y));
        curY=rp(curY+b.depth+(i<n-1?gap:0));
      });
      stage2=stage1.map(p=>({...p,y:rp(p.y+bandShift.get(rp(p.y)))}));
    }
    if(!validate(stage2)) stage2=stage1; // revert band pass if it broke validity

    return stage2;
  };

  // ── Interlock quality check ──────────────────────────────────────
  // Rule: when interlocked (rot180 of layer B sits on layer A), every case
  // in layer B must have >= 50% of its footprint area supported by cases in A.
  // If any case in B has < 50% support, this pattern creates unstable pillars
  // when interlocked and should be penalised (not hidden, but scored lower).
  //
  // Practical shortcut: check the INTERNAL GAPS within any row.
  // If the gap between adjacent same-row cases > 50% of the SMALLER case's width,
  // a perpendicular case above could bridge the gap with < 50% support.
  const maxInternalGap=(pls)=>{
    const TOL=0.05;
    const rowMap=new Map();
    pls.forEach(p=>{const k=rp(p.y);if(!rowMap.has(k))rowMap.set(k,[]);rowMap.get(k).push(p);});
    let maxGap=0;
    rowMap.forEach(row=>{
      const s=[...row].sort((a,b)=>a.x-b.x);
      for(let i=1;i<s.length;i++) maxGap=Math.max(maxGap, s[i].x-(s[i-1].x+s[i-1].w));
    });
    const colMap=new Map();
    pls.forEach(p=>{const k=rp(p.x);if(!colMap.has(k))colMap.set(k,[]);colMap.get(k).push(p);});
    colMap.forEach(col=>{
      const s=[...col].sort((a,b)=>a.y-b.y);
      for(let i=1;i<s.length;i++) maxGap=Math.max(maxGap, s[i].y-(s[i-1].y+s[i-1].l));
    });
    return maxGap;
  };
  // The threshold: max internal gap must be < 50% of the smallest case dimension
  const smallestDim=Math.min(W0,D0,W9,D9);
  const MAX_GAP_OK=smallestDim*0.5; // 50% of smallest case dimension

  const scorePattern=pls=>{
    const n=pls.length;
    const area=pls.reduce((s,p)=>s+p.w*p.l,0);
    let conn=0;
    if(n<=300){
      pls.forEach(a=>{if(pls.some(b=>b!==a&&((Math.abs(a.x+a.w-b.x)<0.2||Math.abs(b.x+b.w-a.x)<0.2)&&(a.y<b.y+b.l-EPS&&b.y<a.y+a.l-EPS))||((Math.abs(a.y+a.l-b.y)<0.2||Math.abs(b.y+b.l-a.y)<0.2)&&(a.x<b.x+b.w-EPS&&b.x<a.x+a.w-EPS))))conn++;});
    } else {
      conn=n; // very high counts: dense grids — treat as fully connected
    }
    const mnX=Math.min(...pls.map(p=>p.x)),mxX=Math.max(...pls.map(p=>p.x+p.w));
    const mnY=Math.min(...pls.map(p=>p.y)),mxY=Math.max(...pls.map(p=>p.y+p.l));
    const bbox=(mxX-mnX)*(mxY-mnY);
    const gap=maxInternalGap(pls);
    // Penalise patterns with large internal gaps (poor interlock support)
    const gapPenalty=gap>MAX_GAP_OK?500*(gap/smallestDim):0;
    return 1000*n+150*(area/palArea)+200*(conn/n)-200*((bbox-area)/palArea)-gapPenalty;
  };

  // ── Pattern registry ─────────────────────────────────────────────
  const PATS=[];
  const seenFP=new Map();
  const seenGeo=[];      // accepted patterns' normalised geometry, for tolerant 180°-turn dedup
  const R=100;

  const fpOf=pls=>[...pls].sort((a,b)=>a.y!==b.y?a.y-b.y:a.x-b.x)
    .map(p=>Math.round(p.x*R)+'_'+Math.round(p.y*R)+'_'+Math.round(p.w*R)+'_'+Math.round(p.l*R)+'_'+p.ori).join('|');

  // ── Tolerant turn/mirror duplicate detection ────────────────────────
  // Two patterns are the same pallet just turned or flipped if, after sliding
  // both to a common corner, every case in one maps to a same-size case in a
  // turned/mirrored copy of the other. The auto-spread/gap-distribution passes
  // can nudge such patterns apart by up to MAXGAP, so the match allows that
  // much slack — but no more, so genuinely different layouts (brick vs inset,
  // different orientation counts, etc.) are kept.
  const _msKey=a=>a.map(p=>Math.min(p.w,p.l)+'-'+Math.max(p.w,p.l)).sort().join('|')+'#'+a.length;
  const _norm=a=>{const mx=Math.min(...a.map(p=>p.x)),my=Math.min(...a.map(p=>p.y));
    return a.map(p=>({x:p.x-mx,y:p.y-my,w:p.w,l:p.l}));};
  const _closeMatch=(A,B)=>{ // A,B normalised; true if a same-size bijection exists within DEDUP_TOL
    if(A.length!==B.length) return false;
    const used=new Array(B.length).fill(false);
    for(const pa of A){ let best=-1,bd=Infinity;
      for(let j=0;j<B.length;j++){ if(used[j]||B[j].w!==pa.w||B[j].l!==pa.l) continue;
        const d=Math.abs(B[j].x-pa.x)+Math.abs(B[j].y-pa.y); if(d<bd){bd=d;best=j;} }
      if(best<0||bd>DEDUP_TOL+EPS) return false; used[best]=true; }
    return true;
  };

  // Distribute every column of cases vertically within the space available to
  // it (bounded by the surrounding cases and the pallet edges), so cases flush
  // tight-packed (MAXGAP=0) and centered instead of clustering to one end.
  // This runs identically at every edge offset (offset patterns are built on a
  // resized pallet), so 0", positive, and negative all distribute the same way.
  const distributeFills=(pls,pW,pL)=>{
    if(pls.length<2) return pls;
    const cols=new Map();
    pls.forEach((p,i)=>{const key=Math.round(p.x*10)/10;if(!cols.has(key))cols.set(key,[]);cols.get(key).push({p,i});});
    const out=pls.map(p=>({...p}));
    cols.forEach(colArr=>{
      if(colArr.length<2) return;
      const idxSet=new Set(colArr.map(o=>o.i));
      const xs=Math.min(...colArr.map(o=>o.p.x)), xe=Math.max(...colArr.map(o=>o.p.x+o.p.w));
      const colTop=Math.min(...colArr.map(o=>o.p.y));
      const colBot=Math.max(...colArr.map(o=>o.p.y+o.p.l));
      let top=0, bot=pL;
      pls.forEach((q,qi)=>{
        if(idxSet.has(qi)) return;
        if(q.x<xe-0.05&&q.x+q.w>xs+0.05){
          if(q.y+q.l<=colTop+0.05) top=Math.max(top,q.y+q.l);
          else if(q.y>=colBot-0.05) bot=Math.min(bot,q.y);
        }
      });
      const sorted=colArr.slice().sort((a,b)=>a.p.y-b.p.y);
      const totalH=sorted.reduce((s,o)=>s+o.p.l,0);
      const slack=(bot-top)-totalH;
      if(slack<=0.05) return;
      const gap=Math.min(slack/(sorted.length-1),MAXGAP);
      let y=top+(slack-gap*(sorted.length-1))/2;
      sorted.forEach(o=>{out[o.i]={...out[o.i],y:rp(y)}; y+=o.p.l+gap;});
    });
    return out;
  };

  // Horizontal counterpart of distributeFills: distribute every row of cases
  // ACROSS the space available to it (bounded by surrounding cases and the
  // pallet edges), so leftover width splits into small, even, centered gaps
  // instead of accumulating as one empty strip on the left or right side.
  const distributeFillsX=(pls,pW,pL)=>{
    if(pls.length<2) return pls;
    const rows=new Map();
    pls.forEach((p,i)=>{const key=Math.round(p.y*10)/10;if(!rows.has(key))rows.set(key,[]);rows.get(key).push({p,i});});
    const out=pls.map(p=>({...p}));
    rows.forEach(rowArr=>{
      if(rowArr.length<2) return;
      const idxSet=new Set(rowArr.map(o=>o.i));
      const ys=Math.min(...rowArr.map(o=>o.p.y)), ye=Math.max(...rowArr.map(o=>o.p.y+o.p.l));
      const rowL=Math.min(...rowArr.map(o=>o.p.x));
      const rowR=Math.max(...rowArr.map(o=>o.p.x+o.p.w));
      let left=0, right=pW;
      pls.forEach((q,qi)=>{
        if(idxSet.has(qi)) return;
        if(q.y<ye-0.05&&q.y+q.l>ys+0.05){
          if(q.x+q.w<=rowL+0.05) left=Math.max(left,q.x+q.w);
          else if(q.x>=rowR-0.05) right=Math.min(right,q.x);
        }
      });
      const sorted=rowArr.slice().sort((a,b)=>a.p.x-b.p.x);
      const totalW=sorted.reduce((s,o)=>s+o.p.w,0);
      const slack=(right-left)-totalW;
      if(slack<=0.05) return;
      const gap=Math.min(slack/(sorted.length-1),MAXGAP);
      let x=left+(slack-gap*(sorted.length-1))/2;
      sorted.forEach(o=>{out[o.i]={...out[o.i],x:rp(x)}; x+=o.p.w+gap;});
    });
    return out;
  };

  // ── ALIGNMENT SNAP ──────────────────────────────────────────────
  // Kills the "one case randomly dropped an inch below its row" artifact.
  // Cases with the SAME length whose y-starts differ by <= SNAP_TOL are
  // snapped onto a common row line (the y shared by the most cases in the
  // cluster); same for x-starts of same-width cases (column lines). Genuinely
  // purposeful offsets (brick stagger = half a case) are far larger than
  // SNAP_TOL and untouched. Each cluster's snap is validated INDIVIDUALLY —
  // a snap that would create an overlap or breach the perimeter is reverted
  // without discarding the other clusters' fixes.
  const alignSnap=(pls)=>{
    if(pls.length<3||pls.length>250) return pls;
    let cur=pls.map(p=>({...p}));
    const snapAxis=(posKey,sizeKey)=>{
      const groups=new Map();  // same-size cases grouped, then clustered by coord
      cur.forEach((p,i)=>{
        const sk=Math.round(p[sizeKey]*100);
        if(!groups.has(sk)) groups.set(sk,[]);
        groups.get(sk).push({i, v:p[posKey]});
      });
      groups.forEach(list=>{
        if(list.length<2) return;
        list.sort((a,b)=>a.v-b.v);
        let cl=[list[0]];
        const flush=()=>{
          if(cl.length>=2){
            // dominant coordinate = value shared by the most members (2-decimal bins)
            const freq=new Map();
            cl.forEach(o=>{const k=Math.round(o.v*100);freq.set(k,(freq.get(k)||0)+1);});
            let bestK=null,bestN=-1;
            freq.forEach((n,k)=>{ if(n>bestN||(n===bestN&&(bestK===null||k<bestK))){bestN=n;bestK=k;} });
            const target=bestK/100;
            const trial=cur.map(p=>({...p}));
            let changed=false;
            cl.forEach(o=>{
              if(Math.abs(trial[o.i][posKey]-target)>EPS){ trial[o.i][posKey]=rp(target); changed=true; }
            });
            if(changed && validate(trial)) cur=trial;  // accept/reject THIS cluster only
          }
          cl=[];
        };
        for(let i=1;i<list.length;i++){
          if(list[i].v-cl[0].v<=SNAP_TOL+EPS) cl.push(list[i]);
          else { flush(); cl=[list[i]]; }
        }
        flush();
      });
    };
    // Repeat until stable: one row's snap is often blocked by a neighbouring
    // row that has not been snapped yet (e.g. two block-pattern header rows
    // offset by the same amount — the upper row can only move once the lower
    // one has). Each pass only ever applies validated snaps, so looping can
    // never create an overlap; the cap keeps it bounded.
    for(let pass=0;pass<6;pass++){
      const before=cur;
      snapAxis('y','l');   // row alignment (same-length cases)
      snapAxis('x','w');   // column alignment (same-width cases)
      if(cur===before) break;   // no cluster accepted this pass
    }
    return cur;
  };

  // ── SCATTER METRIC ──────────────────────────────────────────────
  // Counts distinct interior gap "seams" in a layout. A single consolidated
  // seam (e.g. the center void of a classical block pattern) is purposeful;
  // many small gaps sprinkled between cases are scatter — they add nothing,
  // let cases walk in transit, and make the pattern impractical to build by
  // hand. One seam crossing several rows is merged and counted ONCE (deduped
  // by its center position), so block patterns aren't over-penalised.
  const scatterCount=(pls)=>{
    if(pls.length<2) return 0;
    const seams=new Set();
    const scan=(posKey,sizeKey,ortKey,tag)=>{
      const bands=new Map();
      pls.forEach(p=>{const k=Math.round(p[ortKey]*10)/10;if(!bands.has(k))bands.set(k,[]);bands.get(k).push(p);});
      bands.forEach(b=>{
        const s=[...b].sort((a,q)=>a[posKey]-q[posKey]);
        for(let i=1;i<s.length;i++){
          const g=s[i][posKey]-(s[i-1][posKey]+s[i-1][sizeKey]);
          if(g>0.25){
            const c=s[i-1][posKey]+s[i-1][sizeKey]+g/2;
            seams.add(tag+(Math.round(c*2)/2));   // merge seams sharing a center line
          }
        }
      });
    };
    scan('x','w','y','x');   // gaps along rows (bands grouped by y)
    scan('y','l','x','y');   // gaps along columns (bands grouped by x)
    // Residual misalignment also counts as scatter: same-size cases whose
    // row/column lines differ by 0.25"–SNAP_TOL (offsets the snap pass could
    // not resolve without creating an overlap). Each unresolved cluster of
    // distinct lines adds one scatter unit.
    const misScan=(posKey,sizeKey,tag)=>{
      const groups=new Map();
      pls.forEach(p=>{const k=Math.round(p[sizeKey]*100);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p[posKey]);});
      groups.forEach(vals=>{
        if(vals.length<2) return;
        vals.sort((a,b)=>a-b);
        let seed=vals[0], lines=new Set([Math.round(vals[0]*4)]);   // quarter-inch bins: <0.25" offsets don't count
        for(let i=1;i<vals.length;i++){
          if(vals[i]-seed<=SNAP_TOL+EPS){ lines.add(Math.round(vals[i]*4)); }
          else {
            if(lines.size>1) seams.add(tag+'m'+seed);
            seed=vals[i]; lines=new Set([Math.round(vals[i]*4)]);
          }
        }
        if(lines.size>1) seams.add(tag+'m'+seed);
      });
    };
    misScan('y','l','x');
    misScan('x','w','y');
    return seams.size;
  };

  const addPat=(name,desc,rawPls,skipBillboard)=>{
    if(!rawPls||rawPls.length<1) return;
    const ohl=ohIn+EPS;
    let pls=rawPls.filter(p=>p.x>=-ohl&&p.y>=-ohl&&p.x+p.w<=pW+ohl&&p.y+p.l<=pL+ohl);
    if(pls.length<1||!validate(pls)) return;
    pls=recentre(pls);
    // Uniform grids — every case the same size and orientation (e.g. the pure
    // column stacks) — stay tight and centered. Spreading them would only
    // insert a gap between every case (the "spread grid" look we don't want).
    // Only mixed-orientation patterns get distributed, so their fill cases can
    // pack tight and centered, consolidating leftover space into clean margins.
    const uniform=pls.every(p=>p.w===pls[0].w&&p.l===pls[0].l);
    if(!skipBillboard && !uniform && pls.length<=250){
      // Best-effort billboard: pls is already valid here. If spreading
      // creates overlaps (common for multi-row-type patterns where rows
      // have different case widths), fall back to the pre-billboard
      // layout rather than discarding the whole pattern.
      const spread=recentre(billboardToTargets(pls));
      if(validate(spread)) pls=spread;

      // Align rows/columns BEFORE distribution so the exact-y/exact-x band
      // grouping inside the distribution passes catches every case.
      pls=alignSnap(pls);

      const dist=distributeFills(pls,pW,pL);
      if(validate(dist)) pls=dist;

      const distX=distributeFillsX(pls,pW,pL);
      if(validate(distX)) pls=recentre(distX);

      // Final tidy: snap any case distribution nudged off its row/column line.
      pls=recentre(alignSnap(pls));
    }
    if(!validate(pls)) return;
    const TI=pls.length; if(TI<1) return;
    // Fingerprint — catches exact duplicates and exact rot180 equivalents
    const k=fpOf(pls);
    const kr=fpOf(rot180(pls));
    if(seenFP.has(k)||seenFP.has(kr)) return;
    // Tolerant turn/mirror dedup — drop a pattern that is the same as one
    // already accepted once the pallet is turned 180° or mirrored left-right
    // or top-bottom (allowing positional jitter up to DEDUP_TOL).
    // flipX∘flipY == rot180, so these three cover the pallet's full symmetry.
    // Skipped for very large layers (O(n²) per comparison) — the exact
    // fingerprint dedup above still catches identical and rot-180 twins.
    if(pls.length<=250){
      const myMs=_msKey(pls);
      const myVariants=[_norm(rot180(pls)), _norm(flipX(pls)), _norm(flipY(pls))];
      for(const ent of seenGeo){
        if(ent.ms!==myMs) continue;
        if(myVariants.some(v=>_closeMatch(ent.norm,v))) return;
      }
      seenGeo.push({ms:myMs, norm:_norm(pls)});
    }
    seenFP.set(k,true);
    // Interlock: rot180, realigned to same bbox
    const rawB=rot180(pls);
    const mnXA=Math.min(...pls.map(p=>p.x)),mnYA=Math.min(...pls.map(p=>p.y));
    const mnXB=Math.min(...rawB.map(p=>p.x)),mnYB=Math.min(...rawB.map(p=>p.y));
    const plsB=rawB.map(p=>({...p,x:rp(p.x+mnXA-mnXB),y:rp(p.y+mnYA-mnYB)}));
    const ce=r2(pls.reduce((s,p)=>s+p.w*p.l,0)/palArea*100);
    const mnX=Math.min(...pls.map(p=>p.x)),mxX=Math.max(...pls.map(p=>p.x+p.w));
    const mnY=Math.min(...pls.map(p=>p.y)),mxY=Math.max(...pls.map(p=>p.y+p.l));
    const _oxW=r2(((mxX-mnX)-pW)/2),_oxL=r2(((mxY-mnY)-pL)/2);const ohW=(pW<=pL)?_oxW:_oxL,ohL=(pW<=pL)?_oxL:_oxW;
    const supp=caseSupportPct(pls,pW,pL,0,1,plsB);
    const cen=weightDistScore(pls,pW,pL);
    const ilq=interlockQuality(pls,plsB);
    const stab=newStability(ilq,supp.avg,cen,ohW,ohL,_gapFracOf(pls));
    const il=r2(overlapRatio(pls,plsB)*100);
    const scat=scatterCount(pls);
    PATS.push({
      name,desc:desc||name,orientDesc:'',
      placements:pls,placementsB:plsB,
      count:TI,TI,TI_B:TI,ohW,ohL,cubicEff:ce,palUtilPct:ce,
      caseSupportPct:supp.avg,minCaseSupport:supp.min,stability:stab,interlockPct:il,
      orisA:'',orisB:'',zoneW:pW,zoneL:pL,ohIn,
      wdA:cen,wdB:cen,masterW:r2(pW),masterL:r2(pL),
      _score:scorePattern(pls)-scat*100,   // tidy patterns outrank scattered ones at equal TI
      _maxGap:maxInternalGap(pls),_ilq:ilq,_scatter:scat,
    });
  };

  // ════════════════════════════════════════════════════════════════
  // EXHAUSTIVE ROW-SEQUENCE SEARCH
  // Enumerate every combination of row types that fits pL.
  // Row types: O-rows (depth D0), X-rows (depth D9), mixed rows (depth max(D0,D9))
  //
  // IMPORTANT: for small case footprints, mC0/mC9 can be large (8-12+),
  // which would create 100+ row types (every n from 1..mC × every mixed
  // nO/nX combo) and explode the DFS branching factor — the search would
  // hit its node cap after only 2-3 rows deep, far short of the 8-10 rows
  // needed to fill the pallet. This produced very FEW patterns for small
  // cases, the opposite of what's needed (small cases need the MOST
  // row-orientation variety, per the reference catalog).
  //
  // Fix: limit each orientation to its 2 most useful counts (full row,
  // and one-less-than-full — which billboard-spreads into a different
  // look), plus a handful of strategic mixed-row splits. This keeps the
  // branching factor near ~8-10 regardless of case size, so the DFS can
  // reach full pallet depth and register many distinct row-by-row
  // orientation sequences — exactly the "column stack, row by row turns"
  // variety shown in the reference image.
  // ════════════════════════════════════════════════════════════════

  const ROW_TYPES=[];  // {depth, cases_count, ori, build_fn(y)}

  if(can0){
    [mC0, mC0-1].forEach(n=>{
      if(n>=1){ROW_TYPES.push({depth:D0,n,ori:0,build:(y)=>makeRow(n,W0,D0,0,y)});}
    });
  }
  if(can9){
    [mC9, mC9-1].forEach(n=>{
      if(n>=1){ROW_TYPES.push({depth:D9,n,ori:9,build:(y)=>makeRow(n,W9,D9,90,y)});}
    });
  }
  // Mixed rows: a focused set of nX/nO splits (not the full cross-product)
  // Try nX = 1..min(mC9-1, 6) and the matching nO that fills the rest.
  if(can0&&can9&&Math.abs(D0-D9)>EPS){
    const mixDep=Math.max(D0,D9);
    const seenMix=new Set();
    const maxNX=Math.max(1,Math.min(mC9-1,6));
    for(let nX=1;nX<=maxNX;nX++){
      const nO=Math.floor((maxW-nX*W9+EPS)/W0);
      if(nO>=1&&nO<=mC0-1){
        const key=nO+'_'+nX;
        if(!seenMix.has(key)){
          seenMix.add(key);
          ROW_TYPES.push({depth:mixDep,n:nO+nX,ori:'mix',build:(y)=>makeMixedRow(nO,nX,y)});
        }
      }
    }
    // Also try the symmetric direction: nO=1..min(mC0-1,6), matching nX
    const maxNO=Math.max(1,Math.min(mC0-1,6));
    for(let nO=1;nO<=maxNO;nO++){
      const nX=Math.floor((maxW-nO*W0+EPS)/W9);
      if(nX>=1&&nX<=mC9-1){
        const key=nO+'_'+nX;
        if(!seenMix.has(key)){
          seenMix.add(key);
          ROW_TYPES.push({depth:mixDep,n:nO+nX,ori:'mix',build:(y)=>makeMixedRow(nO,nX,y)});
        }
      }
    }
  }

  // Track which row-type-sequence signatures we've already registered
  const seenRowSig=new Set();
  const MAX_PATS=400;     // cap on registered patterns
  // Very high case counts make each DFS node expensive (hundreds of
  // placements per row); reduce the node budget so total work stays flat.
  const _estCnt=Math.floor((maxW*maxL)/(W0*D0)+1e-9);
  const NODE_CAP=_estCnt>800?2500:_estCnt>250?8000:30000;
  let nodeVisits=0;

  // DFS over row sequences
  function buildLayer(yRemaining, rowsSoFar, totalN, plsSoFar){
    nodeVisits++;
    if(nodeVisits>NODE_CAP) return;
    if(PATS.length>MAX_PATS) return;
    // Register this layer if it has cases
    if(totalN>0 && plsSoFar.length>0){
      const sig=rowsSoFar.map(r=>r.ori+':'+r.n).join('|');
      if(!seenRowSig.has(sig)){
        seenRowSig.add(sig);
        const parts=[];let i=0;
        while(i<rowsSoFar.length){
          const rt=rowsSoFar[i];
          const oriLabel=rt.ori===0?'O':rt.ori===9?'X':rt.ori==='mix'?'MX':'?';
          let run=1;
          while(i+run<rowsSoFar.length&&rowsSoFar[i+run].ori===rt.ori&&rowsSoFar[i+run].n===rt.n) run++;
          parts.push(run>1?run+'×'+rt.n+oriLabel:rt.n+oriLabel);
          i+=run;
        }
        addPat(parts.join('+'), `Layer: ${parts.join('+')}`, [...plsSoFar]);
      }
    }
    if(yRemaining<Math.min(can0?D0:D9,can9?D9:D0)-EPS) return;
    // Sort row types: try highest case count first (maximise TI early)
    const ordered=[...ROW_TYPES].sort((a,b)=>b.n-a.n);
    for(const rt of ordered){
      if(rt.depth>yRemaining+EPS) continue;
      if(nodeVisits>NODE_CAP) break;
      if(PATS.length>MAX_PATS) break;
      const rowY=rp(plsSoFar.length>0?plsSoFar.reduce((m,p)=>Math.max(m,p.y+p.l),0):0);
      const rowCases=rt.build(rowY);
      if(!rowCases.length) continue;
      rowsSoFar.push(rt);
      plsSoFar.push(...rowCases);
      buildLayer(yRemaining-rt.depth, rowsSoFar, totalN+rt.n, plsSoFar);
      rowsSoFar.pop();
      plsSoFar.splice(plsSoFar.length-rowCases.length, rowCases.length);
    }
  }

  buildLayer(maxL, [], 0, []);

  // ════════════════════════════════════════════════════════════════
  // SECTION: BRICK BOND (special — not a row-sequence pattern)
  // ════════════════════════════════════════════════════════════════
  [[W0,D0,mC0,mR0,0],[W9,D9,mC9,mR9,9]].forEach(([w,d,nc,nr,ori])=>{
    if(nc<2||nr<2) return;
    const palOff=rp((pW-targetW)/2);
    const p=[];
    for(let r=0;r<nr;r++){
      const y=rp(r*d); if(y+d>maxL+EPS) break;
      const n=r%2===0?nc:nc-1;
      if(n<1) continue;
      billboardSpread(n,w,targetW).forEach(x=>{
        const px=rp(x+palOff);
        if(px>=-ohIn-EPS&&px+w<=pW+ohIn+EPS) p.push({x:px,y,w,l:d,ori:ori===9?90:0});
      });
    }
    const f=p.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
    if(f.length>=4) addPat(`Brick Bond ${ori===9?'X':'O'}`,`Brick bond — alternating ${nc}/${nc-1} cases per row, billboard flush.`,f,true);
  });

  // ════════════════════════════════════════════════════════════════
  // SECTION: PINWHEEL
  // ════════════════════════════════════════════════════════════════
  if(can0&&can9){
    const midW=Math.max(0,Math.floor((maxW-2*W9+EPS)/W0));
    if(midW>=1&&mR0>=3){
      const p=[],off=rp((pW-targetW)/2);
      billboardSpread(mC9,W9,targetW).forEach(x=>p.push({x:rp(x+off),y:0,w:W9,l:D9,ori:90}));
      let y=D9;
      for(let r=0;r<mR0-2;r++){
        if(y+D0>pL-D9+EPS) break;
        p.push({x:rp(off),y,w:W9,l:D0,ori:90});
        for(let c=0;c<midW;c++) p.push({x:rp(off+W9+c*W0),y,w:W0,l:D0,ori:0});
        p.push({x:rp(off+W9+midW*W0),y,w:W9,l:D0,ori:90});
        y=rp(y+D0);
      }
      const botY=rp(pL-D9);
      if(botY>D9) billboardSpread(mC9,W9,targetW).forEach(x=>p.push({x:rp(x+off),y:botY,w:W9,l:D9,ori:90}));
      const f=p.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
      if(f.length&&validate(f)) addPat('Pinwheel','X border rows + X side columns + O interior.',f,true);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // ORIENTATION-BUCKET ENGINE
  // Generates patterns for 11 orientation ratio buckets (100/0 → 0/100)
  // Each bucket × 5 placement strategies = 55 candidate generators.
  // Evaluates: case count, utilization, wall-flush, CoG, interlock.
  //
  // Orientation buckets: ratio of X(90°) to O(0°) cases
  //   0/100=pureO  10/90  20/80  30/70  40/60  50/50
  //   60/40  70/30  80/20  90/10  100/0=pureX
  //
  // Placement strategies per bucket:
  //   CLUSTERED    — all X-cases grouped together in one zone
  //   DISTRIBUTED  — X-cases spread evenly across all rows
  //   PERIMETER    — X-cases on outer rows/columns (wall-flush)
  //   CORE         — X-cases in the centre rows/columns
  //   CORNER       — X-cases concentrated in corner quadrants
  // ════════════════════════════════════════════════════════════════
  if(can0&&can9){
    // Total max cases for the pure-max orientation
    const maxTotal=Math.max(mC0*mR0, mC9*mR9);

    // ── Core builder: given a grid of (row, col) → ori assignments, build pls ──
    // nRows and nCols are determined per bucket to fit pallet.
    // We work on a rectangular grid and assign ori per cell.
    const buildGrid=(nR0,nC0,nR9,nC9,assignFn)=>{
      // assignFn(r, c, totalRows, totalCols, nR0, nC0, nR9, nC9) → 0 or 9
      // Builds a layer where rows alternate between O-band-height and X-band-height
      // Strategy: use the mixed-row approach — assign each row a dominant orientation
      // then fill with that orientation's case dimensions.
      // For grid-style: use uniform row height = D0 for 0° rows, D9 for 90° rows.
      // Group rows into bands: rows 0..nR9-1 = X-rows, nR9..nR9+nR0-1 = O-rows
      // Then apply the assignment function to determine ORDER of row types.
      const pls=[];
      // Determine row sequence from assignment
      const totalRows=nR0+nR9;
      const rowTypes=Array.from({length:totalRows},(_,r)=>assignFn(r,0,totalRows,0,nR0,0,nR9,0));
      let y=0;
      for(let r=0;r<totalRows;r++){
        const isX=rowTypes[r]===9;
        const w=isX?W9:W0, d=isX?D9:D0, n=isX?nC9:nC0, ori=isX?90:0;
        if(y+d>maxL+EPS) break;
        makeRow(n,w,d,ori,y).forEach(c=>pls.push(c));
        y=rp(y+d);
      }
      return pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
    };

    // ── Compute nR9/nR0 for a given X-ratio target ────────────────────
    // Given targetRatioX (0.0-1.0), find nR9 X-rows and nR0 O-rows that:
    //   1. Fit within pallet length
    //   2. Achieve approximately targetRatioX case fraction
    //   3. Maximize total case count (fill as much of the pallet depth
    //      as possible — critical for small case footprints where many
    //      rows fit and leaving depth unused would waste most of the
    //      pallet and starve pattern variety)
    const getBucketRowCounts=(targetRatioX)=>{
      if(targetRatioX<=0) return {nR9:0,nR0:mR0};
      if(targetRatioX>=1) return {nR9:mR9,nR0:0};
      const maxR9=Math.floor((maxL+EPS)/D9);
      const maxR0=Math.floor((maxL+EPS)/D0);
      let best={nR9:0,nR0:0,total:0,err:99,usedL:0};
      for(let r9=0;r9<=maxR9;r9++){
        const maxR0ForR9=Math.floor((maxL-r9*D9+EPS)/D0);
        if(maxR0ForR9<0) continue;
        for(let r0=0;r0<=maxR0ForR9;r0++){
          if(r9===0&&r0===0) continue;
          const total=r9*mC9+r0*mC0;
          if(total===0) continue;
          const actualRatio=(r9*mC9)/total;
          const err=Math.abs(actualRatio-targetRatioX);
          const usedL=r9*D9+r0*D0;
          // Prefer lower ratio-error; among near-ties prefer higher total
          // (fills more of the pallet); among ties in both prefer higher usedL
          if(err<best.err-1e-9 ||
            (Math.abs(err-best.err)<1e-9 && total>best.total) ||
            (Math.abs(err-best.err)<1e-9 && total===best.total && usedL>best.usedL)){
            best={nR9:r9,nR0:r0,total,err,usedL};
          }
        }
      }
      return {nR9:best.nR9,nR0:best.nR0};
    };

    // ── 5 placement strategy functions ────────────────────────────────
    // Each returns a row-ordering array (9=X-row, 0=O-row)

    const stratClustered=(nR9,nR0)=>{
      // All X-rows grouped together at top, O-rows below
      return [...Array(nR9).fill(9),...Array(nR0).fill(0)];
    };
    const stratClusteredBot=(nR9,nR0)=>{
      // All X-rows at bottom
      return [...Array(nR0).fill(0),...Array(nR9).fill(9)];
    };
    const stratDistributed=(nR9,nR0)=>{
      // Evenly interleave X-rows among O-rows
      const total=nR9+nR0; const rows=[];
      let x9=0,x0=0;
      for(let i=0;i<total;i++){
        const useX=x9/Math.max(nR9,1)<=x0/Math.max(nR0,1);
        if(useX&&x9<nR9){rows.push(9);x9++;}
        else if(x0<nR0){rows.push(0);x0++;}
        else{rows.push(9);x9++;}
      }
      return rows;
    };
    const stratPerimeter=(nR9,nR0)=>{
      // X-rows on outside (top+bottom), O-rows in middle
      const rows=[...Array(nR9+nR0).fill(0)];
      const half=Math.ceil(nR9/2);
      for(let i=0;i<half&&i<nR9+nR0;i++) rows[i]=9;
      for(let i=0;i<nR9-half&&i<nR9+nR0;i++) rows[nR9+nR0-1-i]=9;
      return rows;
    };
    const stratCore=(nR9,nR0)=>{
      // X-rows in middle, O-rows on outside
      const rows=[...Array(nR9+nR0).fill(0)];
      const mid=Math.floor((nR9+nR0)/2);
      const half=Math.ceil(nR9/2);
      for(let i=0;i<nR9;i++) rows[mid-half+i]=9;
      return rows;
    };
    const stratAlternating=(nR9,nR0)=>{
      // Strict X/O alternation starting with X
      const total=nR9+nR0; const rows=[];
      for(let i=0;i<total;i++) rows.push(i%2===0&&nR9>0?9:0);
      // Adjust to match exact counts
      const got9=rows.filter(r=>r===9).length;
      if(got9>nR9) for(let i=rows.length-1;i>=0&&rows.filter(r=>r===9).length>nR9;i--) if(rows[i]===9) rows[i]=0;
      if(got9<nR9) for(let i=0;i<rows.length&&rows.filter(r=>r===9).length<nR9;i++) if(rows[i]===0) rows[i]=9;
      return rows;
    };

    // ── Column-split bucket variants ───────────────────────────────────
    // For each bucket, also generate a column-split version:
    // nC9 columns of X on left, nC0 columns of O on right (or vice versa)
    const buildColBucket=(nR9,nR0,colStrategy)=>{
      // colStrategy: 'XLeft','XRight','XCenter','XEdge','alternate'
      const pls=[];
      const nC0b=Math.floor((maxW+EPS)/W0); // max O-cols in pallet width
      const nC9b=Math.floor((maxW+EPS)/W9); // max X-cols in pallet width

      if(colStrategy==='XLeft'){
        // Determine split: nXcols + nOcols to fill width
        const nXcols=Math.max(1,Math.round(nC9b*(nR9/(nR9+nR0||1))));
        const nOcols=Math.floor((maxW-nXcols*W9+EPS)/W0);
        if(nOcols<1) return [];
        const xsX=billboardSpread(nXcols,W9,nXcols*W9);
        const xsO=billboardSpread(nOcols,W0,nOcols*W0);
        const off=rp((pW-nXcols*W9-nOcols*W0)/2);
        for(let r=0;r<Math.max(mR9,mR0);r++){
          const yX=rp(r*D9),yO=rp(r*D0);
          if(yX+D9<=maxL+EPS) xsX.forEach(x=>pls.push({x:rp(x+off),y:yX,w:W9,l:D9,ori:90}));
          if(yO+D0<=maxL+EPS) xsO.forEach(x=>pls.push({x:rp(x+off+nXcols*W9),y:yO,w:W0,l:D0,ori:0}));
        }
      } else if(colStrategy==='XRight'){
        const nXcols=Math.max(1,Math.round(nC9b*(nR9/(nR9+nR0||1))));
        const nOcols=Math.floor((maxW-nXcols*W9+EPS)/W0);
        if(nOcols<1) return [];
        const xsX=billboardSpread(nXcols,W9,nXcols*W9);
        const xsO=billboardSpread(nOcols,W0,nOcols*W0);
        const off=rp((pW-nXcols*W9-nOcols*W0)/2);
        for(let r=0;r<Math.max(mR9,mR0);r++){
          const yO=rp(r*D0),yX=rp(r*D9);
          if(yO+D0<=maxL+EPS) xsO.forEach(x=>pls.push({x:rp(x+off),y:yO,w:W0,l:D0,ori:0}));
          if(yX+D9<=maxL+EPS) xsX.forEach(x=>pls.push({x:rp(x+off+nOcols*W0),y:yX,w:W9,l:D9,ori:90}));
        }
      } else if(colStrategy==='XCenter'){
        // O cols on sides, X cols in middle
        const nXcols=Math.max(1,Math.min(nC9b-2,Math.round(nC9b*0.4)));
        const nOside=Math.floor((maxW-nXcols*W9)/(2*W0));
        if(nOside<1) return [];
        const offX=rp((pW-nOside*W0-nXcols*W9-nOside*W0)/2);
        const xsOL=billboardSpread(nOside,W0,nOside*W0);
        const xsX=billboardSpread(nXcols,W9,nXcols*W9);
        const xsOR=billboardSpread(nOside,W0,nOside*W0);
        for(let r=0;r<Math.max(mR9,mR0);r++){
          const yO=rp(r*D0),yX=rp(r*D9);
          if(yO+D0<=maxL+EPS){
            xsOL.forEach(x=>pls.push({x:rp(x+offX),y:yO,w:W0,l:D0,ori:0}));
            xsOR.forEach(x=>pls.push({x:rp(x+offX+nOside*W0+nXcols*W9),y:yO,w:W0,l:D0,ori:0}));
          }
          if(yX+D9<=maxL+EPS) xsX.forEach(x=>pls.push({x:rp(x+offX+nOside*W0),y:yX,w:W9,l:D9,ori:90}));
        }
      }
      return pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
    };

    // ── 11 orientation buckets × 5+ strategies ────────────────────────
    const buckets=[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0];
    const bucketNames=['Pure O','10% X','20% X','30% X','40% X','50/50','60% X','70% X','80% X','90% X','Pure X'];

    buckets.forEach((xRatio,bi)=>{
      if(!can0&&xRatio<1) return;
      if(!can9&&xRatio>0) return;
      const {nR9,nR0}=getBucketRowCounts(xRatio);
      if(nR9===0&&xRatio>0) return;
      if(nR0===0&&xRatio<1) return;
      const bName=bucketNames[bi];

      // Row-ordering strategies
      const strategies=[
        {name:'Clustered',      rows:stratClustered(nR9,nR0)},
        {name:'Clustered-Bot',  rows:stratClusteredBot(nR9,nR0)},
        {name:'Distributed',    rows:stratDistributed(nR9,nR0)},
        {name:'Perimeter',      rows:stratPerimeter(nR9,nR0)},
        {name:'Core',           rows:stratCore(nR9,nR0)},
        {name:'Alternating',    rows:stratAlternating(nR9,nR0)},
      ];

      strategies.forEach(strat=>{
        if(nR9===0||nR0===0){
          // Pure bucket — still try clustered (only one option)
          if(strat.name!=='Clustered') return;
        }
        const pls=[];let y=0;
        for(const rowType of strat.rows){
          const isX=rowType===9;
          const w=isX?W9:W0,d=isX?D9:D0,n=isX?mC9:mC0,ori=isX?90:0;
          if(y+d>maxL+EPS) break;
          makeRow(n,w,d,ori,y).forEach(c=>pls.push(c));
          y=rp(y+d);
        }
        const f=pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
        if(f.length)
          addPat(`${bName} ${strat.name}`,
            `${bName} (${Math.round(xRatio*100)}% X / ${Math.round((1-xRatio)*100)}% O) — ${strat.name} placement.`,f);
      });

      // Column-split variants for middle buckets
      if(nR9>0&&nR0>0){
        ['XLeft','XRight','XCenter'].forEach(cs=>{
          const f=buildColBucket(nR9,nR0,cs);
          if(f.length)
            addPat(`${bName} ColSplit-${cs}`,
              `${bName} column split — X-cases ${cs}.`,f);
        });
      }
    });

    // ════════════════════════════════════════════════════════════════
    // COLUMN-SPLIT SWEEP (reference: Group B — progressive column splits)
    // For a "narrow band" of nN columns in one orientation and a "fill
    // band" of the OTHER orientation filling the remaining width, sweep
    // nN from 1 up to (max columns - 1), on both Left and Right sides.
    // Each band uses its OWN row count (rN/rF) since the two
    // orientations have different depths — independent column-blocks
    // side by side, each individually billboard-flush top-to-bottom.
    //
    // Run for BOTH narrowOri=90 (X-narrow-column, O fills) and
    // narrowOri=0 (O-narrow-column, X fills) — "each 90°/0° scenario
    // represented for X and O" per the reference.
    // ════════════════════════════════════════════════════════════════
    const colSplitSweep=(narrowOri)=>{
      const isXNarrow=narrowOri===90;
      const Wn=isXNarrow?W9:W0, Dn=isXNarrow?D9:D0;
      const Wf=isXNarrow?W0:W9, Df=isXNarrow?D0:D9;
      if(!(isXNarrow?can9:can0)||!(isXNarrow?can0:can9)) return;
      const maxNarrowCols=Math.floor((maxW+EPS)/Wn);
      for(let nN=1;nN<maxNarrowCols;nN++){
        const remW=maxW-nN*Wn;
        const nF=Math.floor((remW+EPS)/Wf);
        if(nF<1) continue;
        const rN=Math.floor((maxL+EPS)/Dn);
        const rF=Math.floor((maxL+EPS)/Df);
        if(rN<1||rF<1) continue;
        [['Left',0],['Right',1]].forEach(([side,pos])=>{
          const pls=[];
          const totalW=nN*Wn+nF*Wf;
          const off=rp((pW-totalW)/2);
          const xsN=billboardSpread(nN,Wn,nN*Wn);
          const xsF=billboardSpread(nF,Wf,nF*Wf);
          const narrowX0=pos===0?off:off+nF*Wf;
          const fillX0=pos===0?off+nN*Wn:off;
          for(let r=0;r<rN;r++){
            const y=rp(r*Dn); if(y+Dn>maxL+EPS) break;
            xsN.forEach(x=>pls.push({x:rp(x+narrowX0),y,w:Wn,l:Dn,ori:narrowOri}));
          }
          for(let r=0;r<rF;r++){
            const y=rp(r*Df); if(y+Df>maxL+EPS) break;
            xsF.forEach(x=>pls.push({x:rp(x+fillX0),y,w:Wf,l:Df,ori:isXNarrow?0:90}));
          }
          const f=pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
          if(f.length){
            const lbl=isXNarrow?'X':'O';
            addPat(`${nN}${lbl}-col ${side}`,
              `Column split — ${nN} ${lbl}-oriented column(s) on the ${side.toLowerCase()}, remaining width filled with ${isXNarrow?'O':'X'}-oriented columns.`,f);
          }
        });
      }
    };
    if(can9&&can0){ colSplitSweep(90); colSplitSweep(0); }

    // ════════════════════════════════════════════════════════════════
    // HEADER-ROW + COLUMN-SPLIT (reference: Group C — full-width header
    // row in one orientation, then a column-split block below filling
    // the remaining depth). Sweep both header orientations (X/O) and
    // both narrow-column orientations within the split, both sides.
    // ════════════════════════════════════════════════════════════════
    const headerColSplit=(headerOri)=>{
      const isXHeader=headerOri===90;
      if(!(isXHeader?can9:can0)) return;
      const Wh=isXHeader?W9:W0, Dh=isXHeader?D9:D0, nH=isXHeader?mC9:mC0;
      if(nH<1||Dh>maxL+EPS) return;
      const remL=maxL-Dh;
      if(remL<Math.min(D0,D9)-EPS) return;

      [0,90].forEach(narrowOri=>{
        const isXNarrow=narrowOri===90;
        const Wn=isXNarrow?W9:W0, Dn=isXNarrow?D9:D0;
        const Wf=isXNarrow?W0:W9, Df=isXNarrow?D0:D9;
        if(!(isXNarrow?can9:can0)||!(isXNarrow?can0:can9)) return;
        const maxNarrowCols=Math.floor((maxW+EPS)/Wn);
        for(let nN=1;nN<maxNarrowCols;nN++){
          const remW=maxW-nN*Wn;
          const nF=Math.floor((remW+EPS)/Wf);
          if(nF<1) continue;
          const rN=Math.floor((remL+EPS)/Dn);
          const rF=Math.floor((remL+EPS)/Df);
          if(rN<1||rF<1) continue;
          [['Left',0],['Right',1]].forEach(([side,pos])=>{
            const pls=[];
            // Header row spans full width
            const xsH=billboardSpread(nH,Wh,nH*Wh);
            const offH=rp((pW-nH*Wh)/2);
            xsH.forEach(x=>pls.push({x:rp(x+offH),y:0,w:Wh,l:Dh,ori:headerOri}));
            // Column-split block below the header
            const totalW=nN*Wn+nF*Wf;
            const off=rp((pW-totalW)/2);
            const xsN=billboardSpread(nN,Wn,nN*Wn);
            const xsF=billboardSpread(nF,Wf,nF*Wf);
            const narrowX0=pos===0?off:off+nF*Wf;
            const fillX0=pos===0?off+nN*Wn:off;
            for(let r=0;r<rN;r++){
              const y=rp(Dh+r*Dn); if(y+Dn>maxL+EPS) break;
              xsN.forEach(x=>pls.push({x:rp(x+narrowX0),y,w:Wn,l:Dn,ori:narrowOri}));
            }
            for(let r=0;r<rF;r++){
              const y=rp(Dh+r*Df); if(y+Df>maxL+EPS) break;
              xsF.forEach(x=>pls.push({x:rp(x+fillX0),y,w:Wf,l:Df,ori:isXNarrow?0:90}));
            }
            const f=pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
            if(f.length){
              const hLbl=isXHeader?'X':'O', nLbl=isXNarrow?'X':'O';
              addPat(`${hLbl}-Header + ${nN}${nLbl}-col ${side}`,
                `Full-width ${hLbl}-oriented header row, then a column split below — ${nN} ${nLbl}-oriented column(s) on the ${side.toLowerCase()}, remainder filled with ${isXNarrow?'O':'X'}-oriented columns.`,f);
            }
          });
        }
      });
    };
    if(can9) headerColSplit(90);
    if(can0) headerColSplit(0);

    {
      const cornerDepth=Math.min(2,mR9);  // how many X-rows at each corner
      if(cornerDepth>=1&&mR0>=2){
        const pls=[];let y=0;
        // Top X-band
        for(let r=0;r<cornerDepth;r++){
          if(y+D9>maxL+EPS) break;
          makeRow(mC9,W9,D9,90,y).forEach(c=>pls.push(c)); y=rp(y+D9);
        }
        // Middle O-band
        for(let r=0;r<mR0-cornerDepth*2;r++){
          if(y+D0>maxL+EPS) break;
          makeRow(mC0,W0,D0,0,y).forEach(c=>pls.push(c)); y=rp(y+D0);
        }
        // Bottom X-band
        for(let r=0;r<cornerDepth;r++){
          if(y+D9>maxL+EPS) break;
          makeRow(mC9,W9,D9,90,y).forEach(c=>pls.push(c)); y=rp(y+D9);
        }
        const f=pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
        if(f.length) addPat('Corner Accent','X-cases in top/bottom bands, O centre block.',f);
      }
    }

    // ── Checkerboard: alternating X/O by row AND by column position ──
    if(mC9>=2&&mR9>=2&&mC0>=2&&mR0>=2){
      const pls=[];let y=0;
      for(let r=0;r<mR9+mR0;r++){
        const isX=r%2===0;
        const w=isX?W9:W0,d=isX?D9:D0,n=isX?mC9:mC0,ori=isX?90:0;
        if(y+d>maxL+EPS) break;
        makeRow(n,w,d,ori,y).forEach(c=>pls.push(c)); y=rp(y+d);
      }
      const f=pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
      if(f.length) addPat('Checkerboard','Alternating X/O rows — maximum seam interruption.',f);
    }

    // ── HEADER + COLUMN-SPLIT ("Group C" reference pattern) ──────────
    // One full-width header row of orientation A, followed by a
    // column-split below it: nAccent columns of orientation A on the
    // left (stacked to fill the remaining depth) + the rest of the
    // width filled with orientation B columns. Generated for BOTH
    // header orientations (A=90° and A=0°) so every O/X combination
    // shown in the reference is represented, for every accent-column
    // count that fits.
    {
      const buildHeaderColSplit=(headerIs90,nAccent)=>{
        const hW=headerIs90?W9:W0, hD=headerIs90?D9:D0, hOri=headerIs90?90:0;
        const oW=headerIs90?W0:W9, oD=headerIs90?D0:D9, oOri=headerIs90?0:90;
        const mCh=headerIs90?mC9:mC0;
        if(nAccent<1||nAccent>=mCh) return [];
        const pls=[];
        // Header row spans full width at y=0
        makeRow(mCh,hW,hD,hOri,0).forEach(c=>pls.push(c));
        let y=hD;
        // Column-split below: nAccent columns of header-orientation (left),
        // remaining columns of the other orientation (right), each
        // stacked independently to fill the remaining depth.
        const accentSpan=nAccent*hW;
        const otherCols=Math.floor((maxW-accentSpan+EPS)/oW);
        if(otherCols<1) return [];
        const off=rp((pW-(accentSpan+otherCols*oW))/2);
        // Accent columns (header orientation), stacked at depth hD
        for(let r=0;r*hD+y<=maxL+EPS-hD+EPS;r++){
          const ry=rp(y+r*hD);
          if(ry+hD>maxL+EPS) break;
          for(let c=0;c<nAccent;c++) pls.push({x:rp(off+c*hW),y:ry,w:hW,l:hD,ori:hOri});
        }
        // Other columns (opposite orientation), stacked at depth oD
        for(let r=0;r*oD+y<=maxL+EPS-oD+EPS;r++){
          const ry=rp(y+r*oD);
          if(ry+oD>maxL+EPS) break;
          for(let c=0;c<otherCols;c++) pls.push({x:rp(off+accentSpan+c*oW),y:ry,w:oW,l:oD,ori:oOri});
        }
        return pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
      };
      [true,false].forEach(headerIs90=>{
        const mCh=headerIs90?mC9:mC0;
        const maxAccent=Math.max(1,Math.min(mCh-1,6));
        for(let nAccent=1;nAccent<=maxAccent;nAccent++){
          const f=buildHeaderColSplit(headerIs90,nAccent);
          if(f.length>=4){
            const hLabel=headerIs90?'X':'O', oLabel=headerIs90?'O':'X';
            addPat(`Header-${hLabel} ColSplit-${nAccent}${hLabel}`,
              `Full ${hLabel} header row + ${nAccent}-column ${hLabel} accent (left) / ${oLabel} fill (right) below.`,f);
          }
        }
      });
    }

    // ── ALTERNATING MIXED ROWS ("checkerboard density" variants) ─────
    // Generalises the reference's 2-row-alternating intra-row mixed
    // patterns (groups 2-4 of the checkerboard section): consecutive
    // rows swap which orientation occupies the left vs right side of
    // the row, for a range of nO/nX splits. Each split is generated in
    // BOTH starting orders (mix-first vs swap-first), which is the
    // orientation-swap equivalent for this pattern family.
    if(can0&&can9&&Math.abs(D0-D9)>EPS){
      const mixDep=Math.max(D0,D9);
      const splitsSeen=new Set();
      const splits=[];
      for(let nX=1;nX<=Math.max(1,Math.min(mC9-1,5));nX++){
        const nO=Math.floor((maxW-nX*W9+EPS)/W0);
        if(nO>=1&&nO<=mC0-1){
          const key=nO+'_'+nX;
          if(!splitsSeen.has(key)){splitsSeen.add(key);splits.push([nO,nX]);}
        }
      }
      for(let nO=1;nO<=Math.max(1,Math.min(mC0-1,5));nO++){
        const nX=Math.floor((maxW-nO*W0+EPS)/W9);
        if(nX>=1&&nX<=mC9-1){
          const key=nO+'_'+nX;
          if(!splitsSeen.has(key)){splitsSeen.add(key);splits.push([nO,nX]);}
        }
      }
      splits.forEach(([nO,nX])=>{
        [['MixFirst',makeMixedRow,makeMixedRowSwap],['SwapFirst',makeMixedRowSwap,makeMixedRow]].forEach(([label,buildA,buildB])=>{
          const pls=[];let y=0,r=0;
          while(y+mixDep<=maxL+EPS){
            const cases=(r%2===0?buildA:buildB)(nO,nX,y);
            if(!cases.length) break;
            cases.forEach(c=>pls.push(c));
            y=rp(y+mixDep); r++;
          }
          const f=pls.filter(p=>p.x>=-ohIn-EPS&&p.y>=-ohIn-EPS&&p.x+p.w<=pW+ohIn+EPS&&p.y+p.l<=pL+ohIn+EPS);
          if(f.length>=4){
            addPat(`Alt-Mix ${nO}O+${nX}X ${label}`,
              `Alternating mixed rows (${nO}O+${nX}X per row) — left/right orientation swaps each row for seam interruption.`,f);
          }
        });
      });
    }
  } // end orientation-bucket engine

  // ════════════════════════════════════════════════════════════════
  // 5-BLOCK / G4 GENERATOR  (raster-point sweep)
  // ────────────────────────────────────────────────────────────────
  // The pallet is partitioned into up to five rectangular blocks —
  // four corner blocks arranged pinwheel-fashion plus an optional
  // centre block — and each block is filled with its best uniform
  // single-orientation grid. This is the classical block-structure
  // approach to the Manufacturer's Pallet Loading Problem: for many
  // case/pallet combinations the best block pattern fits MORE cases
  // per layer than any row-sequence pattern can.
  //
  // Cases remain upright at all times — only 0°/90° plan rotation,
  // exactly like every other generator in this engine.
  //
  // Block boundaries are swept only over RASTER POINTS: x-coordinates
  // of the form a·W0 + b·W9 (and y-coordinates a·D0 + b·D9). Any
  // optimal block partition can be normalised to these points, so
  // nothing is lost and the sweep stays small and fast.
  // ════════════════════════════════════════════════════════════════
  if(can0&&can9){
    const rasterPts=(u,v,span)=>{
      const s=new Set([0,rp(span)]);
      for(let a=0;a*u<=span+EPS;a++)
        for(let b=0;a*u+b*v<=span+EPS;b++)
          s.add(rp(a*u+b*v));
      return [...s].sort((x,y)=>x-y);
    };
    const RX=rasterPts(W0,W9,maxW), RY=rasterPts(D0,D9,maxL);

    // Best uniform grid that fills a w×h block (memoised — the sweep
    // revisits the same block sizes thousands of times)
    const _gridMemo=new Map();
    const bestGrid=(w,h)=>{
      const key=Math.round(w*100)*100000+Math.round(h*100);
      const hit=_gridMemo.get(key);
      if(hit!==undefined) return hit;
      const c0=Math.floor((w+EPS)/W0), r0=Math.floor((h+EPS)/D0);
      const c9=Math.floor((w+EPS)/W9), r9=Math.floor((h+EPS)/D9);
      const n0=c0*r0, n9=c9*r9;
      const g=(n0<=0&&n9<=0)?null
        :(n9>n0?{n:n9,ori:90,cols:c9,rows:r9,cw:W9,cl:D9}
               :{n:n0,ori:0, cols:c0,rows:r0,cw:W0,cl:D0});
      _gridMemo.set(key,g);
      return g;
    };

    // Partition (x1<=x2, y1<=y2) → five block rects with outer-corner
    // anchors so the load stays flush at the pallet perimeter:
    //   B1 top-left · B2 top-right · B3 bottom-right · B4 bottom-left
    //   B5 centre (anchored centred)
    const blockRects=(x1,y1,x2,y2)=>[
      {x:0, y:0, w:x1,      h:y2,      ax:0,  ay:0  },
      {x:x1,y:0, w:maxW-x1, h:y1,      ax:1,  ay:0  },
      {x:x2,y:y1,w:maxW-x2, h:maxL-y1, ax:1,  ay:1  },
      {x:0, y:y2,w:x2,      h:maxL-y2, ax:0,  ay:1  },
      {x:x1,y:y1,w:x2-x1,   h:y2-y1,   ax:0.5,ay:0.5},
    ];

    // Phase 1 — arithmetic sweep of raster partitions, count only.
    // Candidates are bucketed by case count; only counts within 3 of
    // the running best are retained (400 per bucket max), so memory
    // and sort cost stay flat no matter how large the sweep is.
    //
    // For very small cases the raster sets get big enough that the
    // full 4-coordinate sweep would be slow, so the sweep switches to
    // the 180°-SYMMETRIC family (x2 = pW − x1, y2 = pL − y1 — the
    // classical pinwheel-of-blocks structure that covers the vast
    // majority of optimal block patterns) plus the shared-boundary
    // 4-block splits. Normal case sizes get the full exhaustive sweep.
    const byN=new Map();
    let curBest=0;
    const consider=(x1,y1,x2,y2)=>{
      if(x2<x1-EPS||y2<y1-EPS) return;
      let n=0, used=0;
      for(const r of blockRects(x1,y1,x2,y2)){
        if(r.w<EPS||r.h<EPS) continue;
        const g=bestGrid(r.w,r.h);
        if(g){n+=g.n;used++;}
      }
      if(n<1||used<2||n<curBest-3) return;
      if(n>curBest){
        curBest=n;
        for(const k of byN.keys()) if(k<curBest-3) byN.delete(k);
      }
      let arr=byN.get(n);
      if(!arr){arr=[];byN.set(n,arr);}
      if(arr.length<400) arr.push({x1,y1,x2,y2,n});
    };
    const SYM_ONLY=RX.length*RY.length>1600;
    if(SYM_ONLY){
      for(const x1 of RX){
        const x2=rp(maxW-x1);
        for(const y1 of RY) consider(x1,y1,x2,rp(maxL-y1));
      }
      for(const x1 of RX) for(const y1 of RY) consider(x1,y1,x1,y1);
    } else {
      for(let xi=0;xi<RX.length;xi++){
        const x1=RX[xi];
        for(let xj=xi;xj<RX.length;xj++){
          const x2=RX[xj];
          for(let yi=0;yi<RY.length;yi++){
            const y1=RY[yi];
            for(let yj=yi;yj<RY.length;yj++) consider(x1,y1,x2,RY[yj]);
          }
        }
      }
    }
    const cand=[...byN.entries()].sort((a,b)=>b[0]-a[0]).flatMap(e=>e[1]);

    // Phase 2 — build placements for the strongest candidates only
    const KEEP=Math.min(cand.length,80);
    let _bAccepted=0;
    for(let ci=0;ci<KEEP;ci++){
      const {x1,y1,x2,y2,n}=cand[ci];
      const pls=[];
      let blocksUsed=0;
      for(const r of blockRects(x1,y1,x2,y2)){
        if(r.w<EPS||r.h<EPS) continue;
        const g=bestGrid(r.w,r.h);
        if(!g) continue;
        blocksUsed++;
        const gw=g.cols*g.cw, gh=g.rows*g.cl;
        const ox=rp(r.x+(r.w-gw)*r.ax), oy=rp(r.y+(r.h-gh)*r.ay);
        for(let rr=0;rr<g.rows;rr++)
          for(let cc=0;cc<g.cols;cc++)
            pls.push({x:rp(ox+cc*g.cw),y:rp(oy+rr*g.cl),w:g.cw,l:g.cl,ori:g.ori});
      }
      if(pls.length!==n||blocksUsed<2) continue;
      const before=PATS.length;
      // NOTE: block patterns no longer skip the billboard/distribution pass.
      // Each block's grid is corner-anchored, so leftover space used to pile
      // up as one empty strip at a pallet edge (shifted, un-centered look).
      // Running the standard distribution — every pass validated and reverted
      // on any overlap — spreads that slack into small, even, centered gaps
      // and pulls outer case faces flush with the pallet perimeter on both
      // the length and width sides (billboarding).
      addPat(`5-Block ${pls.length}`,
        `Block pattern — pallet split into ${blocksUsed} rectangular blocks, each filled with its best upright single-orientation grid (raster-point block sweep).`,
        pls);
      if(PATS.length>before) _bAccepted++;
      if(_bAccepted>=40) break; // plenty of distinct block layouts kept
    }
  }

  // ════════════════════════════════════════════════════════════════
  // GAP-FILL OPTIMIZER  v2
  // ────────────────────────────────────────────────────────────────
  // Approach: for every pattern, compute a pixel-resolution occupancy
  // grid, then systematically try placing every case at every
  // grid-aligned X/Y position inside the pallet.  No shifting needed
  // for most cases — the grid catches all geometrically valid spots.
  //
  // Extra cases must be:
  //   • Non-overlapping with all existing cases
  //   • Within pallet bounds (+ overhang)
  //   • Valid orientation (0° or 90°)
  //
  // After filling, re-apply globalBillboard + recentre so the final
  // layer is still flush and centred.
  //
  // Both the original pattern AND the filled version are registered —
  // the original for engineers who want the clean version, the filled
  // version for maximum case count.
  // ════════════════════════════════════════════════════════════════
  {
    const ohl=ohIn+EPS;
    const PREC=1000; // round positions to 3 decimal places

    // Round to precision
    const rnd=v=>Math.round(v*PREC)/PREC;

    // Does rectangle (ax,ay,aw,al) overlap (bx,by,bw,bl)?
    const overlaps=(ax,ay,aw,al,bx,by,bw,bl)=>
      ax+aw-EPS>bx && bx+bw-EPS>ax && ay+al-EPS>by && by+bl-EPS>ay;

    // Can we place a case of (cw,cl) at (cx,cy) without overlapping pls?
    const canPlace=(pls,cx,cy,cw,cl)=>{
      if(cx<-ohl||cy<-ohl||cx+cw>pW+ohl||cy+cl>pL+ohl) return false;
      for(const p of pls) if(overlaps(cx,cy,cw,cl,p.x,p.y,p.w,p.l)) return false;
      return true;
    };

    // Greedily fill ALL free space in a placement set.
    // Tries every (x,y) at case-dimension step increments.
    // Tries 0° first, then 90°.  Keeps going until no more fit.
    const fillAll=(basePls)=>{
      let pls=[...basePls];
      // Collect all unique x/y anchor positions from existing cases + pallet edges
      // Use case dimensions as step size for the candidate grid
      const steps=[
        ...(can0?[{w:W0,l:D0,ori:0}]:[]),
        ...(can9?[{w:W9,l:D9,ori:90}]:[]),
      ];

      let added=true;
      while(added){
        added=false;
        for(const cas of steps){
          // Build candidate x positions: every existing case left/right edge + 0
          const xs=new Set([0]);
          const ys=new Set([0]);
          pls.forEach(p=>{xs.add(rnd(p.x));xs.add(rnd(p.x+p.w));});
          pls.forEach(p=>{ys.add(rnd(p.y));ys.add(rnd(p.y+p.l));});
          // Also try positions snapped to case-width grid from pallet edge
          for(let x=0;x<=pW+ohIn+EPS;x=rnd(x+cas.w)) xs.add(rnd(x));
          for(let y=0;y<=pL+ohIn+EPS;y=rnd(y+cas.l)) ys.add(rnd(y));

          const xArr=[...xs].sort((a,b)=>a-b);
          const yArr=[...ys].sort((a,b)=>a-b);

          // Try every (x,y) candidate position
          let bestX=null,bestY=null,bestScore=-1;
          for(const cy of yArr){
            for(const cx of xArr){
              if(!canPlace(pls,cx,cy,cas.w,cas.l)) continue;
              // Score: prefer positions that maximize adjacency with existing cases
              // (touching as many other cases as possible = more stable)
              let adj=0;
              pls.forEach(p=>{
                // Check if new case shares an edge with p
                if(Math.abs(cx+cas.w-p.x)<EPS+0.1||Math.abs(p.x+p.w-cx)<EPS+0.1)
                  if(cy<p.y+p.l-EPS&&cy+cas.l>p.y+EPS) adj++;
                if(Math.abs(cy+cas.l-p.y)<EPS+0.1||Math.abs(p.y+p.l-cy)<EPS+0.1)
                  if(cx<p.x+p.w-EPS&&cx+cas.w>p.x+EPS) adj++;
              });
              if(adj>bestScore){bestScore=adj;bestX=cx;bestY=cy;}
            }
          }

          if(bestX!==null){
            pls.push({x:rnd(bestX),y:rnd(bestY),w:cas.w,l:cas.l,ori:cas.ori});
            added=true;
          }
        }
      }
      return pls;
    };

    // Merge adjacent free cells to find large contiguous free rects
    // Returns merged list of {x,y,w,h}
    const findMergedFreeRects=(pls)=>{
      const mnX=Math.min(...pls.map(p=>p.x)), mxX=Math.max(...pls.map(p=>p.x+p.w));
      const mnY=Math.min(...pls.map(p=>p.y)), mxY=Math.max(...pls.map(p=>p.y+p.l));
      const xs=[...new Set([mnX,mxX,...pls.flatMap(p=>[p.x,p.x+p.w])])].sort((a,b)=>a-b);
      const ys=[...new Set([mnY,mxY,...pls.flatMap(p=>[p.y,p.y+p.l])])].sort((a,b)=>a-b);
      const cells=[];
      for(let xi=0;xi<xs.length-1;xi++) for(let yi=0;yi<ys.length-1;yi++){
        const rx=xs[xi],ry=ys[yi],rw=xs[xi+1]-xs[xi],rh=ys[yi+1]-ys[yi];
        if(rw<EPS||rh<EPS) continue;
        const occ=pls.some(p=>p.x<rx+rw-EPS&&p.x+p.w>rx+EPS&&p.y<ry+rh-EPS&&p.y+p.l>ry+EPS);
        if(!occ) cells.push({x:rx,y:ry,w:rw,h:rh,xi,yi});
      }
      return cells;
    };

    // Check if a pattern has meaningful free space (>= one case area)
    const minCaseArea=Math.min(W0*D0,W9*D9);
    const hasEnoughFreeSpace=(pls)=>{
      const mnX=Math.min(...pls.map(p=>p.x)), mxX=Math.max(...pls.map(p=>p.x+p.w));
      const mnY=Math.min(...pls.map(p=>p.y)), mxY=Math.max(...pls.map(p=>p.y+p.l));
      const bbox=(mxX-mnX)*(mxY-mnY);
      const caseArea=pls.reduce((s,p)=>s+p.w*p.l,0);
      return (bbox-caseArea)>=minCaseArea*0.8;
    };

    // Run gap-fill on every pattern
    const snapshot=[...PATS];
    for(const pat of snapshot){
      if(pat.placements.length>250) continue; // cell grid is O(n²) — skip very large layers
      if(!hasEnoughFreeSpace(pat.placements)) continue;

      // Try filling all free space
      const filled=fillAll([...pat.placements]);
      const gained=filled.length-pat.placements.length;
      if(gained<=0) continue;

      // Validate the filled layer
      if(!validate(filled)) continue;

      // IMPORTANT: do NOT apply globalBillboard after gap-fill.
      // The gap-fill places cases in interior voids — billboard would then
      // try to spread those rows to match the outer row widths, creating
      // overlaps with the newly inserted cases.
      // Just recentre to maintain equal margins.
      const finalPls=recentre(filled);
      if(!validate(finalPls)) continue;
      if(finalPls.length<=pat.placements.length) continue;

      addPat(
        pat.name+'★',
        `${pat.desc} — gap-filled: +${finalPls.length-pat.placements.length} case(s).`,
        finalPls
      );
    }
  }

  // ════════════════════════════════════════════════════════════════
  // DEDUP + SORT + CAP
  // Remove trivially small patterns, sort by TI then score, and cap
  // the final list to a manageable size for the UI. With the expanded
  // row-type search + billboard fallback, small case footprints can
  // generate 400-500+ structurally distinct patterns — far more than
  // a packaging engineer needs to scroll through. Cap at 120, which
  // still gives small cases 10x+ more variety than before while
  // keeping the list browsable.
  //
  // GUARANTEED PATTERNS: the two pure single-orientation "column stack"
  // patterns (all 0° / all 90°) represent the theoretical maximum case
  // count for that orientation and are baseline reference patterns every
  // packaging engineer expects to see. They are force-included even if
  // mixed-orientation patterns elsewhere achieve a higher overall TI and
  // would otherwise push them past the cap.
  // ════════════════════════════════════════════════════════════════
  const maxTI=PATS.reduce((m,p)=>Math.max(m,p.TI),0);
  // Keep patterns within a useful range (not too far below max TI)
  const minTI=Math.max(Math.ceil(maxTI*0.5), maxTI>12?6:maxTI>6?4:2);
  const filtered=PATS.filter(p=>p.TI>=minTI);

  // ── QUALITY GATE (quality over quantity) ─────────────────────────
  // A pattern whose largest internal gap exceeds half the smallest case
  // dimension is not usable in real transit: cases have room to walk,
  // and alternate layers cannot bridge the void (a case spanning such a
  // gap has under 50% support). These layouts look acceptable in 2D but
  // produce the loose, tippy stacks that are obvious in 3D — so they are
  // removed outright rather than merely ranked lower. Packaging
  // engineers should only be choosing among patterns they could
  // actually ship. Fallback: if a case/pallet combination leaves fewer
  // than 3 tight patterns, keep the least-gappy ones so the list is
  // never empty.
  const GATE=MAX_GAP_OK; // interlock-breaking gap threshold (50% of smallest case dimension); with tight packing (MAXGAP=0) any remaining gap is structural, so this alone decides shippability
  const MAX_SCATTER=2;   // at most 2 distinct interior seams — a purposeful block/zone void is fine; sprinkled random gaps are not
  const _tight=filtered.filter(p=>(p._maxGap||0)<=GATE+EPS && (p._scatter||0)<=MAX_SCATTER);
  const usable=_tight.length>=3 ? _tight
    : filtered.slice().sort((a,b)=>((a._scatter||0)-(b._scatter||0)) || ((a._maxGap||0)-(b._maxGap||0)))
        .slice(0,Math.min(filtered.length,3));
  usable.sort((a,b)=>b.TI!==a.TI?b.TI-a.TI:b._score-a._score);
  // Cap lowered from 120: a shorter list of shippable patterns beats a
  // long list padded with layouts nobody would run.
  const MAX_RESULTS=60;

  // Find the highest-TI pure-O and pure-X patterns from the FULL
  // (unfiltered) registry — these represent each orientation's true max.
  const bestPureO=PATS.reduce((best,p)=>
    (p.placements.every(c=>c.ori===0)&&(!best||p.TI>best.TI))?p:best, null);
  const bestPureX=PATS.reduce((best,p)=>
    (p.placements.every(c=>c.ori===90)&&(!best||p.TI>best.TI))?p:best, null);

  // Give the two guaranteed patterns clear, recognisable names
  if(bestPureO){
    bestPureO.name='100% Column Stack (0°)';
    bestPureO.desc=`All ${bestPureO.TI} cases at 0° — maximum case count for this orientation, flush perimeter, evenly distributed interior spacing.`;
  }
  if(bestPureX){
    bestPureX.name='100% Column Stack (90°)';
    bestPureX.desc=`All ${bestPureX.TI} cases at 90° — maximum case count for this orientation, flush perimeter, evenly distributed interior spacing.`;
  }

  // Build final list: take top (MAX_RESULTS - forced) from filtered,
  // excluding the forced patterns (to avoid duplicates), then append
  // the forced patterns. This guarantees both pure patterns survive
  // without the pop/push-ordering bug of removing each other.
  const forced=[bestPureO,bestPureX].filter(Boolean);
  const rest=usable.filter(p=>!forced.includes(p));
  const result=[...rest.slice(0,Math.max(0,MAX_RESULTS-forced.length)),...forced];

  result.sort((a,b)=>b.TI!==a.TI?b.TI-a.TI:b._score-a._score);

  // ── VISUAL DISTINCTNESS PASS ─────────────────────────────────────
  // Registration-time dedup (1" tolerance) catches exact and turned/
  // mirrored twins, but two patterns can still survive that differ only
  // by a case or two sliding a few inches — not a meaningfully different
  // option for an engineer. This final pass compares same-TI patterns
  // case-for-case (including 180°-turn and mirror equivalents) with a
  // coarser tolerance and keeps only the highest-ranked of each visual
  // family, so every row in the list is a visibly different layout.
  const VIS_TOL=4;   // inches — max per-case displacement that still reads as "the same pattern"
  const _visMatch=(A,B)=>{
    if(A.length!==B.length) return false;
    const used=new Array(B.length).fill(false);
    for(const pa of A){
      let best=-1,bd=Infinity;
      for(let j=0;j<B.length;j++){
        if(used[j]||Math.abs(B[j].w-pa.w)>0.01||Math.abs(B[j].l-pa.l)>0.01) continue;
        const d=Math.abs(B[j].x-pa.x)+Math.abs(B[j].y-pa.y);
        if(d<bd){bd=d;best=j;}
      }
      if(best<0||bd>VIS_TOL) return false;
      used[best]=true;
    }
    return true;
  };
  const distinct=[];
  for(const p of result){
    const isForced=forced.includes(p);
    let dupIdx=-1;
    if(p.placements.length<=120){
      const pn=_norm(p.placements);
      dupIdx=distinct.findIndex(q=>{
        if(q.TI!==p.TI||q.placements.length>120) return false;
        return [_norm(q.placements),_norm(rot180(q.placements)),_norm(flipX(q.placements)),_norm(flipY(q.placements))]
          .some(v=>_visMatch(pn,v));
      });
    }
    if(dupIdx<0){ distinct.push(p); }
    else if(isForced && !forced.includes(distinct[dupIdx])){
      distinct[dupIdx]=p;   // forced pure stacks always survive their visual family
    }
  }

  // ── RANKING: strictly by case count ──────────────────────────────
  // Highest cases-per-layer first, score as tiebreak. The two pure
  // column stacks are still guaranteed to be IN the list (forced above)
  // but rank by their own case count like every other pattern.
  const _final=distinct;
  const _ubound=Math.floor((maxW*maxL)/(W0*D0)+1e-9);
  _final.forEach(p=>{ p.maxPossible=_ubound; p.isOptimal=(p.TI>=_ubound); });
  return _final;
}
