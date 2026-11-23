// components/tools/IsoDiagrams.js
// Isometric SVG drawings for the free Case Size Calculator:
//   UnitDiagram  — the single unit (box or cylinder) with L / W / H or DIA / H labeled
//   CaseDiagram  — the case with units arranged inside and the outside dims labeled
// Geometry is passed in inches; label text is passed in already formatted.

// Dimension colors, shared with the input labels on the calculator.
export const DIM_COLORS = { L: "#fdb410", W: "#5aa9ff", H: "#5ec97a" };

const C = Math.cos(Math.PI / 6);
const S = 0.5;
// Isometric projection: +x runs down-right, +y runs down-left, +z is up.
const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];

// Fit a list of projected points into a viewBox and return a mapper.
function fitter(points, vw, vh, pad) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const bw = Math.max(maxX - minX, 1e-6);
  const bh = Math.max(maxY - minY, 1e-6);
  const k = Math.min((vw - 2 * pad) / bw, (vh - 2 * pad) / bh);
  const ox = (vw - bw * k) / 2;
  const oy = (vh - bh * k) / 2;
  return { k, m: ([x, y]) => [ox + (x - minX) * k, oy + (y - minY) * k] };
}

const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ");

// The three visible faces of a box, in projected (unscaled) coords.
function boxFaces(x0, y0, z0, x1, y1, z1) {
  return {
    top: [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)],
    right: [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)],
    front: [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)],
  };
}

// A vertical cylinder as an outline path + top ellipse, in projected coords.
// A circle of radius r in the floor plane projects to an ellipse with
// semi-axes r·√2·cos30 (wide) and r·√2·sin30 (tall).
function cylShape(cx, cy, z0, z1, r) {
  const rx = r * Math.SQRT2 * C;
  const ry = r * Math.SQRT2 * S;
  const [bx, by] = P(cx, cy, z0);
  const [tx, ty] = P(cx, cy, z1);
  return { rx, ry, bx, by, tx, ty };
}

// Dimension label: colored edge + text pushed away from the drawing's center.
function DimLabel({ a, b, color, text, center, push = 20 }) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  let nx = mx - center[0];
  let ny = my - center[1];
  const len = Math.hypot(nx, ny) || 1;
  nx /= len;
  ny /= len;
  const lx = mx + nx * push;
  const ly = my + ny * push;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1={mx} y1={my} x2={mx + nx * (push - 9)} y2={my + ny * (push - 9)} stroke={color} strokeWidth="1" opacity=".6" />
      <text
        x={lx}
        y={ly}
        fill={color}
        fontSize="13"
        fontWeight="600"
        textAnchor={nx > 0.35 ? "start" : nx < -0.35 ? "end" : "middle"}
        dominantBaseline="middle"
        fontFamily="var(--body)"
      >
        {text}
      </text>
    </g>
  );
}

const FACE = { top: "#2a3038", right: "#1f242b", front: "#181c21" };
const UNIT = { top: "#5b4a1e", right: "#3f3416", front: "#4b3d19", stroke: "#fdb410" };

// ───────────────────────── Single unit ─────────────────────────
export function UnitDiagram({ pkgType, L, W, H, labels, title = "Your unit" }) {
  const VW = 340, VH = 260, PAD = 46;
  const ok = pkgType === "cylinder" ? L > 0 && H > 0 : L > 0 && W > 0 && H > 0;
  if (!ok) {
    return (
      <figure className="iso-fig iso-fig--empty" aria-label={title}>
        <p>Enter your unit dimensions to see it drawn here.</p>
      </figure>
    );
  }

  if (pkgType === "cylinder") {
    const r = L / 2;
    const s = cylShape(r, r, 0, H, r);
    const raw = [
      [s.bx - s.rx, s.by], [s.bx + s.rx, s.by + s.ry],
      [s.tx - s.rx, s.ty - s.ry], [s.tx + s.rx, s.ty],
    ];
    const { k, m } = fitter(raw, VW, VH, PAD);
    const [bx, by] = m([s.bx, s.by]);
    const [tx, ty] = m([s.tx, s.ty]);
    const rx = s.rx * k, ry = s.ry * k;
    const center = [(bx + tx) / 2, (by + ty) / 2];
    const body = `M${tx - rx},${ty} L${bx - rx},${by} A${rx},${ry} 0 0 0 ${bx + rx},${by} L${tx + rx},${ty} Z`;
    return (
      <figure className="iso-fig" aria-label={`${title}: cylinder, ${labels.L} diameter by ${labels.H} tall`}>
        <svg viewBox={`0 0 ${VW} ${VH}`} role="img">
          <path d={body} fill={UNIT.front} stroke={UNIT.stroke} strokeWidth="1.2" />
          <ellipse cx={tx} cy={ty} rx={rx} ry={ry} fill={UNIT.top} stroke={UNIT.stroke} strokeWidth="1.2" />
          <DimLabel a={[tx - rx, ty]} b={[tx + rx, ty]} color={DIM_COLORS.L} text={`DIA ${labels.L}`} center={[tx, ty + 40]} push={ry + 18} />
          <DimLabel a={[bx + rx, by]} b={[tx + rx, ty]} color={DIM_COLORS.H} text={`H ${labels.H}`} center={center} />
        </svg>
        <figcaption>{title}</figcaption>
      </figure>
    );
  }

  const f = boxFaces(0, 0, 0, L, W, H);
  const raw = [...f.top, ...f.right, ...f.front];
  const { m } = fitter(raw, VW, VH, PAD);
  const map = (poly) => poly.map(m);
  const top = map(f.top), right = map(f.right), front = map(f.front);
  const center = m(P(L / 2, W / 2, H / 2));
  return (
    <figure className="iso-fig" aria-label={`${title}: box, ${labels.L} long, ${labels.W} wide, ${labels.H} tall`}>
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img">
        <polygon points={pts(front)} fill={UNIT.front} stroke={UNIT.stroke} strokeWidth="1.2" />
        <polygon points={pts(right)} fill={UNIT.right} stroke={UNIT.stroke} strokeWidth="1.2" />
        <polygon points={pts(top)} fill={UNIT.top} stroke={UNIT.stroke} strokeWidth="1.2" />
        <DimLabel a={m(P(0, W, 0))} b={m(P(L, W, 0))} color={DIM_COLORS.L} text={`L ${labels.L}`} center={center} />
        <DimLabel a={m(P(L, 0, 0))} b={m(P(L, W, 0))} color={DIM_COLORS.W} text={`W ${labels.W}`} center={center} />
        <DimLabel a={m(P(0, W, 0))} b={m(P(0, W, H))} color={DIM_COLORS.H} text={`H ${labels.H}`} center={center} />
      </svg>
      <figcaption>{title}</figcaption>
    </figure>
  );
}

// ───────────────────────── Case with units inside ─────────────────────────
const MAX_DRAWN = 400;

export function CaseDiagram({ pkgType, row, uH, labels }) {
  const VW = 420, VH = 320, PAD = 52;
  if (!row) {
    return (
      <figure className="iso-fig iso-fig--empty">
        <p>Pick a case option to see the units arranged inside it.</p>
      </figure>
    );
  }
  const { a, b, nz, dx, dy, odL: L, odW: W, odH: H } = row;
  const total = a * b * nz;
  // Center the unit block inside the case.
  const x0 = (L - a * dx) / 2;
  const y0 = (W - b * dy) / 2;
  const z0 = Math.max(0, (H - nz * uH) / 2);

  const corners = [
    P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0),
    P(0, 0, H), P(L, 0, H), P(L, W, H), P(0, W, H),
  ];
  const { k, m } = fitter(corners, VW, VH, PAD);
  const center = m(P(L / 2, W / 2, H / 2));

  // Painter's order: back to front (x + y), bottom to top.
  const cells = [];
  if (total <= MAX_DRAWN) {
    for (let z = 0; z < nz; z++)
      for (let i = 0; i < a; i++)
        for (let j = 0; j < b; j++) cells.push([i, j, z]);
    cells.sort((p, q) => p[0] + p[1] - (q[0] + q[1]) || p[2] - q[2] || p[0] - q[0]);
  }

  const units = cells.map(([i, j, z]) => {
    const ux = x0 + i * dx, uy = y0 + j * dy, uz = z0 + z * uH;
    const id = `${i}-${j}-${z}`;
    if (pkgType === "cylinder") {
      const r = dx / 2;
      const s = cylShape(ux + r, uy + r, uz, uz + uH, r);
      const [bx, by] = m([s.bx, s.by]);
      const [tx, ty] = m([s.tx, s.ty]);
      const rx = s.rx * k, ry = s.ry * k;
      const d = `M${tx - rx},${ty} L${bx - rx},${by} A${rx},${ry} 0 0 0 ${bx + rx},${by} L${tx + rx},${ty} Z`;
      return (
        <g key={id}>
          <path d={d} fill={UNIT.front} stroke={UNIT.stroke} strokeWidth=".7" />
          <ellipse cx={tx} cy={ty} rx={rx} ry={ry} fill={UNIT.top} stroke={UNIT.stroke} strokeWidth=".7" />
        </g>
      );
    }
    const f = boxFaces(ux, uy, uz, ux + dx, uy + dy, uz + uH);
    return (
      <g key={id}>
        <polygon points={pts(f.front.map(m))} fill={UNIT.front} stroke={UNIT.stroke} strokeWidth=".7" />
        <polygon points={pts(f.right.map(m))} fill={UNIT.right} stroke={UNIT.stroke} strokeWidth=".7" />
        <polygon points={pts(f.top.map(m))} fill={UNIT.top} stroke={UNIT.stroke} strokeWidth=".7" />
      </g>
    );
  });

  // Case: back walls and floor shaded, front edges drawn over the units.
  const c = corners.map(m);
  const floor = [c[0], c[1], c[2], c[3]];
  const backL = [c[0], c[1], c[5], c[4]];
  const backW = [c[0], c[3], c[7], c[4]];
  const line = (p, q, extra = {}) => (
    <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#c7ccd2" strokeWidth="1.4" {...extra} />
  );

  return (
    <figure
      className="iso-fig"
      aria-label={`Case ${labels.L} by ${labels.W} by ${labels.H} outside, holding ${a} by ${b} by ${nz} units`}
    >
      <svg viewBox={`0 0 ${VW} ${VH}`} role="img">
        <polygon points={pts(floor)} fill={FACE.front} />
        <polygon points={pts(backL)} fill={FACE.right} opacity=".75" />
        <polygon points={pts(backW)} fill={FACE.top} opacity=".55" />
        {line(c[0], c[1], { strokeDasharray: "4 4", opacity: 0.5 })}
        {line(c[0], c[3], { strokeDasharray: "4 4", opacity: 0.5 })}
        {line(c[0], c[4], { strokeDasharray: "4 4", opacity: 0.5 })}
        {units}
        {total > MAX_DRAWN && (
          <text x={center[0]} y={center[1]} fill="#9aa1ab" fontSize="13" textAnchor="middle">
            {total} units (too many to draw)
          </text>
        )}
        {line(c[1], c[2])}
        {line(c[2], c[3])}
        {line(c[4], c[5])}
        {line(c[5], c[6])}
        {line(c[6], c[7])}
        {line(c[7], c[4])}
        {line(c[1], c[5])}
        {line(c[2], c[6])}
        {line(c[3], c[7])}
        <DimLabel a={c[3]} b={c[2]} color={DIM_COLORS.L} text={`L ${labels.L}`} center={center} />
        <DimLabel a={c[1]} b={c[2]} color={DIM_COLORS.W} text={`W ${labels.W}`} center={center} />
        <DimLabel a={c[3]} b={c[7]} color={DIM_COLORS.H} text={`H ${labels.H}`} center={center} />
      </svg>
      <figcaption>
        Case outside dimensions &middot; {a} &times; {b} &times; {nz} = {total} units
      </figcaption>
    </figure>
  );
}
