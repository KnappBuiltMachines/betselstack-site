// components/showcase/render3d.js
// Small canvas renderer for the home page showcase (Nov 2026).
// Draws the sample load from the 12pk Eggs report:
//   case 9.5 x 8 x 5 in, 48 x 40 x 5.5 in pallet,
//   100% Column Stack (90 deg): 5 x 5 = 25 per layer, 9 layers = 225 cases.
// No libraries. Units are inches.
//
//   drawScene3D(ctx, w, h, { yaw, pitch, alpha })  - 3D view, like the app viewport
//   drawLayer2D(ctx, w, h, { alpha })              - single-layer top view
//
// The load is one solid block, so only its outer case faces are drawn and
// back faces are culled; that is enough for correct hidden-surface results.

export const SAMPLE = {
  caseL: 9.5,
  caseW: 8,
  caseH: 5,
  palL: 48,
  palW: 40,
  deck: 5.5,
  cols: 5, // along pallet length (5 x 9.5 = 47.5)
  rows: 5, // along pallet width  (5 x 8   = 40)
  layers: 9,
};

const S = SAMPLE;
const LOAD_L = S.cols * S.caseL;
const LOAD_W = S.rows * S.caseW;
const LOAD_H = S.layers * S.caseH;
const OX = (S.palL - LOAD_L) / 2; // centered on the pallet
const OY = (S.palW - LOAD_W) / 2;
const CENTER = [S.palL / 2, S.palW / 2, (S.deck + LOAD_H) / 2 + 2];

/* ------------------------------------------------------------------
   geometry, built once
------------------------------------------------------------------- */
// face: { p: [[x,y,z] x4], n: [nx,ny,nz], kind }
function boxFaces(x, y, z, dx, dy, dz, kind, which) {
  const X = x + dx, Y = y + dy, Z = z + dz;
  const all = {
    top: { p: [[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], n: [0, 0, 1] },
    bottom: { p: [[x, y, z], [x, Y, z], [X, Y, z], [X, y, z]], n: [0, 0, -1] },
    xmin: { p: [[x, y, z], [x, y, Z], [x, Y, Z], [x, Y, z]], n: [-1, 0, 0] },
    xmax: { p: [[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], n: [1, 0, 0] },
    ymin: { p: [[x, y, z], [X, y, z], [X, y, Z], [x, y, Z]], n: [0, -1, 0] },
    ymax: { p: [[x, Y, z], [x, Y, Z], [X, Y, Z], [X, Y, z]], n: [0, 1, 0] },
  };
  return (which || Object.keys(all)).map((k) => ({ ...all[k], kind }));
}

function buildPallet() {
  const parts = [];
  // three stringers (runners) along the length, deck boards on top, base boards below
  const rh = 3.5;
  const bot = 0.75;
  [0, S.palW / 2 - 1.75, S.palW - 3.5].forEach((y) => parts.push(boxFaces(0, y, bot, S.palL, 3.5, rh, "wood")));
  // bottom boards
  [0, S.palL / 2 - 2.75, S.palL - 5.5].forEach((x) => parts.push(boxFaces(x, 0, 0, 5.5, S.palW, bot, "woodDark")));
  // top deck boards (seven, running across the width)
  const n = 7, bw = 5.5;
  const gap = (S.palL - n * bw) / (n - 1);
  for (let i = 0; i < n; i++) parts.push(boxFaces(i * (bw + gap), 0, bot + rh, bw, S.palW, S.deck - bot - rh, "wood"));
  return parts;
}

function buildLoad() {
  const faces = [];
  for (let k = 0; k < S.layers; k++) {
    const z = S.deck + k * S.caseH;
    for (let i = 0; i < S.cols; i++) {
      for (let j = 0; j < S.rows; j++) {
        const x = OX + i * S.caseL;
        const y = OY + j * S.caseW;
        const which = [];
        if (k === S.layers - 1) which.push("top");
        if (i === 0) which.push("xmin");
        if (i === S.cols - 1) which.push("xmax");
        if (j === 0) which.push("ymin");
        if (j === S.rows - 1) which.push("ymax");
        if (which.length) faces.push(...boxFaces(x, y, z, S.caseL, S.caseW, S.caseH, "case", which));
      }
    }
  }
  return faces;
}

const PALLET = buildPallet();
const LOAD = buildLoad();

/* ------------------------------------------------------------------
   camera
------------------------------------------------------------------- */
const F = 640; // perspective distance (in)

function makeCam(yawDeg, pitchDeg, w, h) {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const scale = Math.min(w / 760, h / 600) * 5.7;
  const ox = w / 2;
  const oy = h / 2 + h * 0.02;
  // world -> camera space [x, up, depth]
  const toCam = ([x, y, z]) => {
    const px = x - CENTER[0], py = y - CENTER[1], pz = z - CENTER[2];
    const x1 = px * cy - py * sy;
    const y1 = px * sy + py * cy;
    return [x1, pz * cp + y1 * sp, y1 * cp - pz * sp];
  };
  const dirCam = ([x, y, z]) => {
    const x1 = x * cy - y * sy;
    const y1 = x * sy + y * cy;
    return [x1, z * cp + y1 * sp, y1 * cp - z * sp];
  };
  const project = (c) => {
    const s = F / (F + c[2]);
    return [ox + c[0] * s * scale, oy - c[1] * s * scale];
  };
  return { toCam, dirCam, project };
}

const LIGHT = norm([-0.45, -0.6, 0.85]);
function norm(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return v.map((n) => n / l);
}

const PALETTE = {
  case: [58, 120, 216],
  wood: [196, 140, 62],
  woodDark: [150, 104, 44],
};

function shade(kind, n) {
  const base = PALETTE[kind];
  const d = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
  const k = 0.62 + 0.42 * d;
  return `rgb(${Math.min(255, base[0] * k) | 0},${Math.min(255, base[1] * k) | 0},${Math.min(255, base[2] * k) | 0})`;
}

function drawFaces(ctx, cam, faces, sort, lineW) {
  const list = [];
  for (const f of faces) {
    const cs = f.p.map(cam.toCam);
    const n = cam.dirCam(f.n);
    const cx = (cs[0][0] + cs[2][0]) / 2;
    const cu = (cs[0][1] + cs[2][1]) / 2;
    const cd = (cs[0][2] + cs[2][2]) / 2;
    // view vector from camera (at depth -F) to face center
    if (n[0] * cx + n[1] * cu + n[2] * (cd + F) >= 0) continue;
    list.push({ f, cs, d: cd });
  }
  if (sort) list.sort((a, b) => b.d - a.d);
  for (const { f, cs } of list) {
    ctx.beginPath();
    cs.forEach((c, i) => {
      const [x, y] = cam.project(c);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = shade(f.kind, f.n);
    ctx.fill();
    ctx.strokeStyle = f.kind === "case" ? "rgba(12,24,48,.92)" : "rgba(70,44,14,.55)";
    ctx.lineWidth = lineW;
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------
   3D view (app-style light viewport)
------------------------------------------------------------------- */
export function drawScene3D(ctx, w, h, { yaw = -35, pitch = 30, alpha = 1, background = true } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const cam = makeCam(yaw, pitch, w, h);
  const k = Math.min(w / 760, h / 600);

  if (background) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#eef1f4");
    g.addColorStop(1, "#dfe3e8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // ground grid
    ctx.strokeStyle = "rgba(120,130,145,.28)";
    ctx.lineWidth = Math.max(0.6, k * 0.9);
    const R = 132, step = 12;
    for (let v = -R; v <= R; v += step) {
      line(ctx, cam, [CENTER[0] + v, CENTER[1] - R, 0], [CENTER[0] + v, CENTER[1] + R, 0]);
      line(ctx, cam, [CENTER[0] - R, CENTER[1] + v, 0], [CENTER[0] + R, CENTER[1] + v, 0]);
    }
  }

  // round shadow disc, like the app
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const [x, y] = cam.project(cam.toCam([CENTER[0] + Math.cos(a) * 40, CENTER[1] + Math.sin(a) * 40, 0]));
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.fillStyle = "rgba(90,100,115,.2)";
  ctx.fill();

  const lw = Math.max(0.7, k * 1.15);
  PALLET.forEach((part) => drawFaces(ctx, cam, part, true, lw * 0.8));
  drawFaces(ctx, cam, LOAD, false, lw);
  ctx.restore();
}

function line(ctx, cam, a, b) {
  const pa = cam.project(cam.toCam(a));
  const pb = cam.project(cam.toCam(b));
  ctx.beginPath();
  ctx.moveTo(pa[0], pa[1]);
  ctx.lineTo(pb[0], pb[1]);
  ctx.stroke();
}

/* ------------------------------------------------------------------
   2D layer view (matches the report's layer diagram)
------------------------------------------------------------------- */
export function drawLayer2D(ctx, w, h, { alpha = 1, background = true, compact = false } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (background) {
    ctx.fillStyle = "#f4f6f8";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(120,130,145,.16)";
    ctx.lineWidth = 1;
    const g = Math.max(14, Math.min(w, h) / 22);
    for (let x = (w / 2) % g; x < w; x += g) seg(ctx, x, 0, x, h);
    for (let y = (h / 2) % g; y < h; y += g) seg(ctx, 0, y, w, y);
  }
  const pad = compact ? 0.16 : 0.2;
  const sc = Math.min((w * (1 - pad * 2)) / S.palL, (h * (1 - pad * 2)) / S.palW);
  const PW = S.palL * sc, PH = S.palW * sc;
  const x0 = (w - PW) / 2 + (compact ? sc * 2 : sc * 2.5);
  const y0 = (h - PH) / 2 + (compact ? sc * 2 : sc * 2.5);

  // pallet outline
  ctx.fillStyle = "rgba(196,140,62,.22)";
  ctx.fillRect(x0, y0, PW, PH);
  ctx.strokeStyle = "rgba(150,104,44,.8)";
  ctx.lineWidth = Math.max(1, sc * 0.2);
  ctx.strokeRect(x0, y0, PW, PH);

  // cases
  const fs = Math.max(7, sc * 2.25);
  ctx.font = `700 ${fs}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < S.cols; i++) {
    for (let j = 0; j < S.rows; j++) {
      const x = x0 + (OX + i * S.caseL) * sc;
      const y = y0 + (OY + j * S.caseW) * sc;
      const cw = S.caseL * sc, ch = S.caseW * sc;
      const g = ctx.createLinearGradient(x, y, x, y + ch);
      g.addColorStop(0, "#3f73c4");
      g.addColorStop(1, "#2b579e");
      ctx.fillStyle = g;
      ctx.fillRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
      ctx.strokeStyle = "#16294d";
      ctx.lineWidth = Math.max(1, sc * 0.18);
      ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
      ctx.fillStyle = "#fff";
      ctx.fillText("9.5×8", x + cw / 2, y + ch / 2 + 0.5);
    }
  }

  // dimension lines
  ctx.strokeStyle = "#3b4350";
  ctx.fillStyle = "#3b4350";
  ctx.lineWidth = Math.max(1, sc * 0.16);
  const off = sc * 2.6;
  dimH(ctx, x0, x0 + PW, y0 - off, sc);
  dimV(ctx, y0, y0 + PH, x0 - off, sc);
  ctx.font = `700 ${Math.max(8, sc * 2.1)}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = "bottom";
  ctx.fillText('L: 48"', x0 + PW / 2, y0 - off - sc * 0.6);
  ctx.save();
  ctx.translate(x0 - off - sc * 0.8, y0 + PH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('W: 40"', 0, 0);
  ctx.restore();
  ctx.restore();
}

function seg(ctx, a, b, c, d) {
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
}
function dimH(ctx, xa, xb, y, sc) {
  seg(ctx, xa, y, xb, y);
  arrow(ctx, xa, y, 1, 0, sc);
  arrow(ctx, xb, y, -1, 0, sc);
}
function dimV(ctx, ya, yb, x, sc) {
  seg(ctx, x, ya, x, yb);
  arrow(ctx, x, ya, 0, 1, sc);
  arrow(ctx, x, yb, 0, -1, sc);
}
function arrow(ctx, x, y, dx, dy, sc) {
  const a = sc * 1.1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx * a - dy * a * 0.5, y + dy * a - dx * a * 0.5);
  ctx.lineTo(x + dx * a + dy * a * 0.5, y + dy * a + dx * a * 0.5);
  ctx.closePath();
  ctx.fill();
}
