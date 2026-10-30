// components/StoryArt.js
// Illustrations for the home page "How it works" scroll story.
// Plain SVG/HTML, no client code, themed with the tokens in globals.css.
//
//   <CaseInputArt />  step 1: case + pallet entry (mirrors the builder inputs)
//   <TruckArt />      step 5: the loaded truck on the road
//   <WarehouseArt />  step 6: the distribution center
//
// Steps 5 and 6 switch to a real photo automatically when you add
//   /public/story/truck-photo.jpg  and  /public/story/warehouse-photo.jpg
// (see app/page.js).

// ---------- step 1: case + pallet entry ----------
export function CaseInputArt() {
  return (
    <div className="sa-input" role="img" aria-label="Case dimensions 12 by 9 by 6.5 inches entered on a 48 by 40 inch pallet">
      <svg className="sa-box" viewBox="0 0 236 178" aria-hidden="true">
        {/* isometric case */}
        <path d="M110 30 L190 66 L110 102 L30 66 Z" fill="var(--amber-soft)" />
        <path d="M30 66 L110 102 L110 150 L30 114 Z" fill="var(--amber)" />
        <path d="M190 66 L110 102 L110 150 L190 114 Z" fill="var(--amber-deep)" />
        <path d="M70 48 L150 84" stroke="rgba(0,0,0,.18)" strokeWidth="5" />
        {/* dimension callouts, just outside each edge */}
        <g stroke="var(--silver)" strokeWidth="1.4" fill="none" opacity=".7">
          <path d="M24 124 L104 160" /><path d="M116 160 L196 124" /><path d="M200 66 L200 114" />
        </g>
        <g fill="var(--text)" fontFamily="var(--display)" fontSize="14" fontWeight="600">
          <text x="44" y="164">12″</text>
          <text x="164" y="164">9″</text>
          <text x="206" y="95">6.5″</text>
        </g>
      </svg>

      <div className="sa-panel">
        <p className="sa-label">Case A</p>
        <div className="sa-row">
          <span><em>L (in)</em><b>12</b></span>
          <span><em>W (in)</em><b>9</b></span>
          <span><em>H (in)</em><b>6.5<i className="sa-caret" /></b></span>
        </div>
        <p className="sa-label">Pallet</p>
        <div className="sa-row sa-row--2">
          <span><em>Size</em><b>48 × 40</b></span>
          <span><em>Max height</em><b>52 in</b></span>
        </div>
        <div className="sa-go">Generate patterns</div>
      </div>
    </div>
  );
}

// ---------- step 5: loaded truck ----------
function PalletStack({ x }) {
  // one pallet: deck + 4 rows of cases, drawn in the trailer cutaway
  const rows = [0, 1, 2, 3];
  return (
    <g>
      <rect x={x} y="282" width="50" height="7" fill="#9a6a2a" />
      <rect x={x + 3} y="289" width="6" height="5" fill="#7a5220" />
      <rect x={x + 22} y="289" width="6" height="5" fill="#7a5220" />
      <rect x={x + 41} y="289" width="6" height="5" fill="#7a5220" />
      {rows.map((r) => (
        <g key={r}>
          <rect x={x} y={258 - r * 26} width="24" height="24" rx="1.5" fill={r % 2 ? "#2f7fb8" : "#3a8fcc"} />
          <rect x={x + 26} y={258 - r * 26} width="24" height="24" rx="1.5" fill={r % 2 ? "#3a8fcc" : "#2f7fb8"} />
        </g>
      ))}
    </g>
  );
}

export function TruckArt() {
  const stacks = [62, 120, 178, 236, 294, 352];
  return (
    <svg className="sa-scene" viewBox="0 -60 640 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A loaded tractor-trailer on the road with full pallets inside">
      <defs>
        <linearGradient id="saSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#151a20" />
          <stop offset="1" stopColor="#0d0f12" />
        </linearGradient>
      </defs>
      <rect y="-60" width="640" height="520" fill="url(#saSky)" />
      {/* skyline + road */}
      <path d="M0 300 L0 250 L40 250 L40 230 L80 230 L80 262 L130 262 L130 240 L170 240 L170 300 Z M470 300 L470 236 L520 236 L520 220 L560 220 L560 248 L640 248 L640 300 Z" fill="#141820" />
      <rect y="330" width="640" height="130" fill="#101317" />
      <g stroke="var(--amber)" strokeWidth="4" opacity=".5">
        <path d="M10 368 H70" /><path d="M120 368 H180" /><path d="M230 368 H290" /><path d="M340 368 H400" /><path d="M450 368 H510" /><path d="M560 368 H620" />
      </g>
      {/* speed lines */}
      <g stroke="var(--silver)" strokeWidth="2" strokeLinecap="round" opacity=".25">
        <path d="M6 190 H34" /><path d="M0 222 H26" /><path d="M10 254 H40" />
      </g>

      {/* trailer body with cutaway */}
      <rect x="44" y="140" width="380" height="166" rx="6" fill="#1b2027" stroke="#2c333d" strokeWidth="2" />
      <rect x="54" y="150" width="360" height="146" rx="3" fill="#0f1216" />
      {stacks.map((x) => <PalletStack key={x} x={x} />)}
      <rect x="44" y="300" width="380" height="8" fill="var(--amber)" />
      {/* tractor */}
      <path d="M432 214 H510 L548 246 H584 Q596 246 596 258 V306 H432 Z" fill="#232a33" stroke="#323b46" strokeWidth="2" />
      <path d="M512 222 L540 246 H496 V222 Z" fill="#3b5266" opacity=".9" />
      <rect x="432" y="296" width="164" height="10" fill="var(--amber)" />
      <rect x="584" y="262" width="12" height="8" rx="2" fill="#ffe6a3" />
      <rect x="440" y="168" width="10" height="48" rx="3" fill="#323b46" />
      {/* wheels */}
      {[96, 150, 470, 548].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="318" r="20" fill="#08090b" stroke="#2a3038" strokeWidth="3" />
          <circle cx={cx} cy="318" r="7" fill="#5b636e" />
        </g>
      ))}
      {/* count tag */}
      <g transform="translate(150 106)">
        <rect width="168" height="26" rx="13" fill="rgba(253,180,16,.12)" stroke="rgba(253,180,16,.45)" />
        <text x="84" y="17.5" textAnchor="middle" fill="var(--amber-soft)" fontFamily="var(--display)" fontSize="13" fontWeight="600">
          26 pallets · 3,094 cases
        </text>
      </g>
    </svg>
  );
}

// ---------- step 6: distribution center ----------
export function WarehouseArt() {
  const racks = [0, 1, 2];
  const bays = [0, 1, 2, 3];
  return (
    <svg className="sa-scene" viewBox="0 -60 640 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A distribution center with pallets stored in racking and a trailer at the dock">
      <rect y="-60" width="640" height="520" fill="#0d0f12" />
      {/* building shell */}
      <path d="M40 120 L320 56 L600 120 V340 H40 Z" fill="#151a20" stroke="#2a313b" strokeWidth="2" />
      <rect y="340" width="640" height="120" fill="#101317" />
      {/* racking cutaway */}
      <rect x="70" y="128" width="330" height="208" fill="#0f1216" />
      {racks.map((r) => (
        <g key={r}>
          <rect x="74" y={194 + r * 64} width="322" height="5" fill="var(--amber-deep)" />
          {bays.map((b) => (
            <g key={b} transform={`translate(${86 + b * 78} ${150 + r * 64})`}>
              <rect y="38" width="58" height="6" fill="#9a6a2a" />
              <rect width="27" height="18" rx="1.5" fill="#3a8fcc" />
              <rect x="29" width="27" height="18" rx="1.5" fill="#2f7fb8" />
              <rect y="20" width="27" height="17" rx="1.5" fill="#2f7fb8" />
              <rect x="29" y="20" width="27" height="17" rx="1.5" fill="#3a8fcc" />
            </g>
          ))}
        </g>
      ))}
      {[74, 152, 230, 308, 392].map((x) => <rect key={x} x={x} y="134" width="4" height="202" fill="#5b636e" />)}
      {/* forklift carrying a pallet */}
      <g transform="translate(410 268)">
        <rect x="0" y="40" width="40" height="6" fill="#9a6a2a" />
        <rect x="0" y="12" width="19" height="27" rx="1.5" fill="#3a8fcc" />
        <rect x="21" y="12" width="19" height="27" rx="1.5" fill="#2f7fb8" />
        <rect x="42" y="0" width="5" height="58" fill="#5b636e" />
        <path d="M48 22 H74 L84 40 V60 H48 Z" fill="var(--amber)" />
        <path d="M52 6 H72 V22 H52 Z" fill="none" stroke="#5b636e" strokeWidth="3" />
        <circle cx="58" cy="62" r="8" fill="#08090b" stroke="#2a3038" strokeWidth="2" />
        <circle cx="78" cy="62" r="8" fill="#08090b" stroke="#2a3038" strokeWidth="2" />
      </g>
      {/* dock doors + trailer */}
      <rect x="512" y="206" width="70" height="104" fill="#0a0c0f" stroke="#2a313b" strokeWidth="2" />
      <rect x="520" y="226" width="54" height="84" fill="#1b2027" stroke="var(--amber)" strokeWidth="2" />
      <path d="M547 226 V310" stroke="var(--amber)" strokeWidth="1.5" />
      <rect x="506" y="310" width="82" height="12" fill="#2a313b" />
      <g fill="var(--amber)" opacity=".85">
        <rect x="514" y="196" width="10" height="5" rx="2" /><rect x="570" y="196" width="10" height="5" rx="2" />
      </g>
      {/* label */}
      <g transform="translate(206 86)">
        <rect width="228" height="26" rx="13" fill="rgba(126,226,161,.1)" stroke="rgba(126,226,161,.45)" />
        <text x="114" y="17.5" textAnchor="middle" fill="#7ee2a1" fontFamily="var(--display)" fontSize="13" fontWeight="600">
          ✓ Received · stored · on the shelf
        </text>
      </g>
    </svg>
  );
}
