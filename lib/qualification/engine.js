// lib/qualification/engine.js
// Rules engine for the Qualification Plan Creator.
//
//   buildPlan(inputs)          -> content snapshot { risk, tests, safetyFactor, ... }
//   composeDocument(plan)      -> { header, sections[] } used by BOTH the on-screen
//                                 document and the PDF exporter, so they always match.
//
// Pure functions, no I/O — safe to run in the browser (live preview) and on the
// server (when the plan is saved).

export const ENGINE_VERSION = "1.1";

// ---------------------------------------------------------------------------
// Option lists (shared by the wizard and the document so labels never drift)
// ---------------------------------------------------------------------------
export const OPTIONS = {
  changeType: [
    ["new", "New packaging design"],
    ["design", "Design change to existing packaging"],
    ["material", "Material substitution / downgauge"],
    ["supplier", "New or second-source supplier"],
    ["distribution", "New distribution route or channel"],
    ["minor", "Minor change (graphics, print, label)"],
  ],
  productCategory: [
    ["produce", "Fresh produce"],
    ["food", "Packaged food"],
    ["beverage", "Beverage"],
    ["pharma", "Pharmaceutical / medical"],
    ["electronics", "Electronics"],
    ["consumer", "Consumer goods"],
    ["industrial", "Industrial / parts"],
    ["chemical", "Chemical"],
    ["other", "Other"],
  ],
  fragility: [
    ["low", "Low — robust product"],
    ["medium", "Medium — some damage potential"],
    ["high", "High — fragile / sensitive"],
  ],
  unitValue: [
    ["low", "Low"],
    ["medium", "Medium"],
    ["high", "High"],
  ],
  channel: [
    ["ftl", "Full truckload (unitized pallets)"],
    ["ltl", "LTL / less-than-truckload"],
    ["parcel", "Small parcel (UPS / FedEx / USPS)"],
    ["ecommerce", "E-commerce direct to consumer"],
    ["mixed", "Mixed — pallet and parcel"],
    ["export", "Export / ocean container"],
  ],
  temperature: [
    ["ambient", "Ambient (controlled)"],
    ["refrigerated", "Refrigerated (approx. 0–7 °C)"],
    ["frozen", "Frozen (−18 °C or colder)"],
    ["uncontrolled", "Uncontrolled / seasonal extremes"],
  ],
  humidity: [
    ["normal", "Normal"],
    ["high", "High (humid, cold-chain condensation, wet)"],
  ],
  handlingTouches: [
    ["few", "Few (1–3 handlings)"],
    ["moderate", "Moderate (4–8 handlings)"],
    ["many", "Many (9+ / hub-and-spoke)"],
  ],
  damageHistory: [
    ["none", "None known"],
    ["some", "Some damage reported"],
    ["significant", "Significant / recurring damage"],
  ],
  materialLevel: [
    ["primary", "Primary"],
    ["secondary", "Secondary"],
    ["tertiary", "Tertiary / shipper"],
    ["unitload", "Unit load"],
  ],
  materialType: [
    ["corrugated", "Corrugated"],
    ["paperboard", "Paperboard / folding carton"],
    ["rigid_plastic", "Rigid plastic"],
    ["flexible_film", "Flexible film / pouch / bag"],
    ["stretch_film", "Stretch / shrink film"],
    ["pallet", "Pallet"],
    ["cushioning", "Cushioning / dunnage"],
    ["tape_adhesive", "Tape / adhesive / strapping"],
    ["aluminum_can", "Aluminum / metal can"],
    ["glass", "Glass bottle / jar"],
    ["closure", "Closure / cap / lid"],
    ["glass_metal", "Glass / metal (other)"],
    ["label", "Label"],
    ["other", "Other"],
  ],
};

export const label = (list, key) =>
  (OPTIONS[list] || []).find(([k]) => k === key)?.[1] || key || "—";

export const STATUS_LABELS = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  completed: "Completed",
  obsolete: "Obsolete",
};

export const RESULT_OPTIONS = ["Pass", "Fail", "Conditional", "N/A"];

export const OUTCOME_LABELS = {
  qualified: "Qualified",
  conditional: "Conditionally qualified",
  not_qualified: "Not qualified",
};

export const DEFAULT_APPROVERS = [
  { id: "eng", role: "Packaging Engineering", name: "" },
  { id: "qa", role: "Quality Assurance", name: "" },
  { id: "ops", role: "Operations / Customer", name: "" },
];

export function approversOf(inputs) {
  const a = Array.isArray(inputs?.approvers) ? inputs.approvers.filter((x) => x && x.id && (x.role || "").trim()) : [];
  return a.length ? a : DEFAULT_APPROVERS;
}

export function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
}

// ---------------------------------------------------------------------------
// Defaults for a brand-new plan
// ---------------------------------------------------------------------------
export function emptyInputs() {
  return {
    title: "",
    customer: "",
    productName: "",
    sku: "",
    preparedBy: "",
    company: "",
    changeType: "new",
    palletPatternRef: "",

    productCategory: "consumer",
    productDescription: "",
    caseWeightLb: "",
    caseL: "",
    caseW: "",
    caseH: "",
    fragility: "medium",
    unitValue: "medium",
    foodContact: false,
    hazmat: false,
    liquid: false,
    perishable: false,

    materials: [
      { level: "primary", type: "flexible_film", component: "", spec: "", supplier: "" },
      { level: "tertiary", type: "corrugated", component: "Shipping case", spec: "", supplier: "" },
      { level: "unitload", type: "pallet", component: "Pallet", spec: "48 × 40 in GMA", supplier: "" },
      { level: "unitload", type: "stretch_film", component: "Stretch wrap", spec: "", supplier: "" },
    ],

    channel: "ftl",
    retailerRequirement: "",
    temperature: "ambient",
    humidity: "normal",
    handlingTouches: "moderate",
    stackHeightPallets: 2,
    storageWeeks: 4,
    transitDays: 3,
    damageHistory: "none",

    background: "",
    objectives: "",
    scopeNotes: "",
    outOfScope: "",

    excludedTests: [],
    customTests: [],

    // Line trials
    excludedLineTrials: [],
    lineTrialDetails: {}, // { [id]: { line, speed, runQty } }
    customLineTrials: [], // [{ name, line, speed, runQty, measures, acceptance }]

    approvers: DEFAULT_APPROVERS.map((a) => ({ ...a })),
  };
}

// ---------------------------------------------------------------------------
// Risk assessment — transparent points system shown in the document
// ---------------------------------------------------------------------------
const num = (v, d = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
};

export function assessRisk(i) {
  const f = [];
  const add = (factor, value, points) => f.push({ factor, value, points });

  add("Product fragility", label("fragility", i.fragility), { low: 0, medium: 3, high: 6 }[i.fragility] ?? 3);
  add("Product value", label("unitValue", i.unitValue), { low: 0, medium: 1, high: 3 }[i.unitValue] ?? 1);
  add("Change type", label("changeType", i.changeType),
    { minor: 0, supplier: 1, material: 2, distribution: 2, design: 3, new: 4 }[i.changeType] ?? 2);
  add("Distribution channel", label("channel", i.channel),
    { ftl: 1, ltl: 3, mixed: 3, parcel: 4, export: 4, ecommerce: 5 }[i.channel] ?? 3);
  add("Handling", label("handlingTouches", i.handlingTouches),
    { few: 0, moderate: 1, many: 2 }[i.handlingTouches] ?? 1);

  let climate = { ambient: 0, refrigerated: 2, frozen: 3, uncontrolled: 3 }[i.temperature] ?? 0;
  if (i.humidity === "high") climate += 2;
  add("Climate exposure",
    `${label("temperature", i.temperature)}${i.humidity === "high" ? ", high humidity" : ""}`, climate);

  const stack = num(i.stackHeightPallets, 1);
  const weeks = num(i.storageWeeks, 0);
  let stackPts = stack <= 1 ? 0 : stack === 2 ? 1 : stack === 3 ? 2 : 3;
  stackPts += weeks > 12 ? 2 : weeks > 4 ? 1 : 0;
  add("Stacking & storage", `${stack} pallet(s) high, ${weeks} wk storage`, stackPts);

  add("Damage history", label("damageHistory", i.damageHistory),
    { none: 0, some: 2, significant: 4 }[i.damageHistory] ?? 0);

  const reg = [];
  let regPts = 0;
  if (i.hazmat) { reg.push("hazardous material"); regPts += 4; }
  if (i.productCategory === "pharma") { reg.push("pharma / medical"); regPts += 3; }
  if (i.liquid) { reg.push("liquid"); regPts += 2; }
  if (i.foodContact) { reg.push("food contact"); regPts += 1; }
  add("Regulatory / product type", reg.length ? reg.join(", ") : "None flagged", regPts);

  const score = f.reduce((s, x) => s + x.points, 0);
  let level = score >= 20 ? "High" : score >= 10 ? "Medium" : "Low";
  const overrides = [];
  if (i.hazmat && level !== "High") { level = "High"; overrides.push("Hazardous material sets the minimum risk level to High."); }
  if (i.damageHistory === "significant" && level === "Low") { level = "Medium"; overrides.push("Significant damage history sets the minimum risk level to Medium."); }

  return { score, max: 44, level, factors: f, overrides };
}

// Recommended compression safety factor for BCT (common industry guideline)
function safetyFactor(i) {
  let sf = 3;
  const reasons = ["Base factor 3.0 for ambient, short-term storage"];
  if (i.humidity === "high" || i.temperature === "refrigerated") { sf += 1; reasons.push("+1.0 humidity / refrigerated moisture"); }
  if (i.temperature === "frozen") { sf += 1; reasons.push("+1.0 frozen storage / thaw cycles"); }
  if (num(i.storageWeeks) > 4) { sf += 0.5; reasons.push("+0.5 storage longer than 4 weeks"); }
  if (num(i.storageWeeks) > 12) { sf += 0.5; reasons.push("+0.5 storage longer than 12 weeks"); }
  if (i.channel === "export") { sf += 0.5; reasons.push("+0.5 export / extended transit"); }
  return { value: Math.min(sf, 6), reasons };
}

// ---------------------------------------------------------------------------
// Testing recommendations
// ---------------------------------------------------------------------------
const SAMPLES = {
  material: { Low: "3", Medium: "5", High: "10" },
  sim: { Low: "1–3", Medium: "3", High: "5" },
  comp: { Low: "5", Medium: "10", High: "10–20" },
};

export function recommendTests(i, risk) {
  const L = risk.level;
  const t = [];
  const push = (o) => t.push({ priority: "Required", ...o });
  const types = new Set((i.materials || []).map((m) => m.type));
  const weight = num(i.caseWeightLb, 0);
  const stack = num(i.stackHeightPallets, 1);
  const weeks = num(i.storageWeeks, 0);
  const lowRiskShortcut = L === "Low" && ["minor", "supplier"].includes(i.changeType);
  const assurance = L === "High" ? "Assurance Level I" : L === "Medium" ? "Assurance Level II" : "Assurance Level III";

  // --- Conditioning -------------------------------------------------------
  const cond = ["Standard atmosphere 23 °C / 50 % RH"];
  if (i.humidity === "high" || i.temperature === "uncontrolled" || i.channel === "export") cond.push("tropical 38 °C / 85 % RH");
  if (i.temperature === "refrigerated") cond.push("refrigerated 5 °C / 85 % RH");
  if (i.temperature === "frozen") cond.push("frozen −18 °C");
  push({
    id: "cond", category: "Conditioning", name: "Pre-test conditioning",
    standard: "ASTM D4332", purpose: `Condition samples to ${cond.join("; ")} before testing (minimum 72 h or per standard).`,
    samples: "All test samples",
  });

  // --- Materials ----------------------------------------------------------
  if (types.has("corrugated")) {
    push({ id: "ect", category: "Materials", name: "Edge crush test (ECT)", standard: "TAPPI T 839",
      purpose: "Verify board meets specified ECT rating from supplier.", samples: SAMPLES.material[L] });
    if (i.humidity === "high" || ["refrigerated", "frozen"].includes(i.temperature) || i.productCategory === "produce")
      push({ id: "cobb", category: "Materials", name: "Water absorptiveness (Cobb)", standard: "TAPPI T 441",
        purpose: "Confirm moisture resistance of liner / coatings for wet or cold-chain environments.", samples: SAMPLES.material[L] });
  }
  if (types.has("aluminum_can")) {
    push({ id: "canstr", category: "Materials", name: "Can axial load & dome reversal", standard: "Can supplier specification",
      purpose: "Verify can body axial (column) strength for filling, seaming and stacking, and dome reversal pressure for pressurized products.",
      samples: SAMPLES.comp[L], priority: ["new", "design", "material", "supplier"].includes(i.changeType) ? "Required" : "Recommended" });
  }
  if (types.has("flexible_film")) {
    push({ id: "seal", category: "Materials", name: "Seal strength", standard: "ASTM F88",
      purpose: "Verify seal strength of flexible primary package.", samples: SAMPLES.material[L] });
  }
  if (types.has("stretch_film")) {
    push({ id: "film", category: "Materials", name: "Stretch film performance", standard: "ASTM D4649",
      purpose: "Confirm film gauge, pre-stretch and containment force are suitable for the unit load.",
      samples: "Per film spec", priority: L === "High" ? "Required" : "Recommended" });
  }
  if (types.has("pallet")) {
    push({ id: "pallet", category: "Materials", name: "Pallet performance", standard: "ASTM D1185",
      purpose: "Verify pallet strength / stiffness for the unit load (or obtain supplier certification).",
      samples: "Per standard", priority: "Recommended" });
  }
  if (i.foodContact) {
    push({ id: "fda", category: "Materials", name: "Food-contact compliance documentation", standard: "21 CFR 174–178",
      purpose: "Obtain supplier letters of guarantee / compliance for all food-contact materials.", samples: "Docs on file" });
  }

  // --- Compression / stacking --------------------------------------------
  if (stack >= 2 || weeks > 0) {
    push({ id: "bct", category: "Compression", name: "Box compression test (BCT)", standard: "ASTM D642",
      purpose: "Measure compression strength of the loaded shipper; result must meet the required BCT in the Test Sequence section.",
      samples: SAMPLES.comp[L] });
  }
  if (weeks > 4 && L !== "Low") {
    push({ id: "creep", category: "Compression", name: "Compression under constant load", standard: "ASTM D4577",
      purpose: "Verify the shipper sustains warehouse stacking load for the storage duration.",
      samples: SAMPLES.sim[L], priority: L === "High" ? "Required" : "Recommended" });
  }

  // --- Distribution simulation -------------------------------------------
  const parcelish = ["parcel", "ecommerce", "mixed"].includes(i.channel);
  const palletish = ["ftl", "ltl", "mixed", "export"].includes(i.channel);

  if (lowRiskShortcut) {
    push({ id: "ista2a", category: "Distribution", name: "Partial simulation test", standard: "ISTA 2A",
      purpose: "Low-risk change — partial simulation (atmospheric conditioning, vibration, shock) to confirm equivalency to current packaging.",
      samples: SAMPLES.sim[L] });
  } else {
    if (parcelish) {
      if (/amazon/i.test(i.retailerRequirement || "")) {
        push({ id: "ista6a", category: "Distribution", name: "Amazon packaging certification", standard: "ISTA 6-Amazon.com-SIOC",
          purpose: "Required for Ships-in-Own-Container certification to Amazon.", samples: "Per standard" });
      }
      if (weight === 0 || weight <= 150) {
        push({ id: "ista3a", category: "Distribution", name: "Parcel delivery system simulation", standard: "ISTA 3A",
          purpose: "General simulation of single-package parcel shipment (≤ 150 lb / 70 kg).", samples: SAMPLES.sim[L] });
      } else {
        push({ id: "ista3b", category: "Distribution", name: "LTL simulation (heavy package)", standard: "ISTA 3B",
          purpose: "Package exceeds parcel weight limits — simulate LTL handling.", samples: SAMPLES.sim[L] });
      }
    }
    if (i.channel === "ltl") {
      push({ id: "ista3b", category: "Distribution", name: "LTL shipment simulation", standard: "ISTA 3B",
        purpose: "Simulate less-than-truckload handling, forklift impacts, and transport.", samples: SAMPLES.sim[L] });
    }
    if (["ftl", "mixed", "export"].includes(i.channel)) {
      push({ id: "ista3e", category: "Distribution", name: "Unitized load simulation", standard: "ISTA 3E",
        purpose: "Simulate full-truckload shipment of a unitized load of identical product.", samples: SAMPLES.sim[L] });
    }
    push({ id: "d4169", category: "Distribution", name: "Performance testing of shipping units", standard: `ASTM D4169 — ${assurance}`,
      purpose: "Alternate / supplementary method: choose the distribution cycle matching the shipping route.",
      samples: SAMPLES.sim[L], priority: L === "High" || i.channel === "export" ? "Required" : "Recommended" });
  }

  if (palletish && !lowRiskShortcut) {
    push({ id: "unitload", category: "Distribution", name: "Unit load handling", standard: "ASTM D6179 / ASTM D6055",
      purpose: "Rough and mechanical handling of the unitized load (forklift, clamp, drop/rotational edge).",
      samples: SAMPLES.sim[L], priority: L === "Low" ? "Recommended" : "Required" });
  }

  if (i.fragility === "high" || L === "High") {
    push({ id: "vib", category: "Distribution", name: "Random vibration", standard: "ASTM D4728",
      purpose: "Stand-alone vibration test to expose product-to-package resonance (abrasion, loosening).",
      samples: SAMPLES.sim[L], priority: i.fragility === "high" ? "Required" : "Recommended" });
  }
  if (parcelish && i.fragility !== "low") {
    push({ id: "drop", category: "Distribution", name: "Free-fall drop", standard: "ASTM D5276",
      purpose: "Confirm package protects product from handling drops at the expected heights.",
      samples: SAMPLES.sim[L], priority: "Recommended" });
  }
  if (i.fragility === "high" && ["new", "design"].includes(i.changeType)) {
    push({ id: "fragility", category: "Product", name: "Product shock fragility", standard: "ASTM D3332",
      purpose: "Determine product critical acceleration to size cushioning.", samples: "Per standard", priority: "Recommended" });
  }

  // --- Climate / special --------------------------------------------------
  if ((i.perishable || i.productCategory === "pharma") && ["parcel", "ecommerce"].includes(i.channel)) {
    push({ id: "thermal", category: "Climate", name: "Thermal performance (insulated shipper)", standard: "ISTA 7D",
      purpose: "Verify insulated packaging maintains product temperature over the shipping duration.", samples: "Per standard" });
  } else if (i.temperature !== "ambient" || i.humidity === "high") {
    push({ id: "cyclic", category: "Climate", name: "Climatic cycling", standard: "ASTM D4332 (cyclic)",
      purpose: "Expose packaging to temperature / humidity cycling expected in distribution, then repeat compression check.",
      samples: SAMPLES.sim[L], priority: L === "Low" ? "Recommended" : "Required" });
  }
  if (i.liquid) {
    push({ id: "leak", category: "Product", name: "Leakage of closures", standard: "ASTM D5094",
      purpose: "Confirm no leakage from liquid containers after distribution testing.", samples: SAMPLES.material[L] });
  }
  if (i.hazmat) {
    push({ id: "un", category: "Regulatory", name: "UN performance-oriented packaging tests", standard: "49 CFR 178, Subpart M",
      purpose: "Drop, stacking, leakproofness and hydrostatic tests as applicable — performed by a qualified lab.",
      samples: "Per regulation" });
  }

  // --- Field trial --------------------------------------------------------
  if (L !== "Low") {
    push({ id: "field", category: "Validation", name: "Controlled field trial shipment", standard: "Internal",
      purpose: "Ship trial loads through the actual route and inspect on arrival.", samples: L === "High" ? "3 loads" : "1–2 loads",
      priority: L === "High" ? "Required" : "Recommended" });
  }

  // De-dupe by id (e.g., mixed channel can add ista3b twice)
  const seen = new Set();
  return t.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
}

// ---------------------------------------------------------------------------
// Line trials — production-line runs to prove the packaging runs on equipment
// ---------------------------------------------------------------------------
const LINE_TRIALS = [
  { id: "lt-can", when: ["aluminum_can"], name: "Can filling & double-seam trial",
    line: "Can filler / seamer",
    measures: "Line speed vs. target; jams and stoppages; double-seam teardown (thickness, width, overlap, body/cover hook) per can supplier spec; dents and body damage rate; fill level; conveyor and depalletizer handling.",
    acceptance: "Seam dimensions within supplier spec on every teardown; efficiency and reject rate no worse than current baseline; no packaging-caused stoppages." },
  { id: "lt-glass", when: ["glass", "closure"], name: "Fill & capping trial",
    line: "Filler / capper",
    measures: "Line speed; breakage and scuffing rate; closure application and removal torque; seal / leak check; conveyor handling.",
    acceptance: "Torque within closure spec; no leakers; breakage rate no worse than baseline." },
  { id: "lt-flex", when: ["flexible_film"], name: "Form / fill / seal or bagging trial",
    line: "FFS / bagger",
    measures: "Seal integrity (visual + seal strength samples); film tracking and registration; speed; reject rate; film breaks.",
    acceptance: "Seal strength meets spec; reject rate and speed no worse than baseline." },
  { id: "lt-rigid", when: ["rigid_plastic"], name: "Container fill & close trial",
    line: "Denester / filler / lidder",
    measures: "Denesting; closing or lidding; cracking or deformation; speed; reject rate.",
    acceptance: "Containers denest, fill and close at target speed with no cracking beyond baseline." },
  { id: "lt-case", when: ["corrugated"], name: "Case erecting & packing trial",
    line: "Case erector / packer / sealer",
    measures: "Case erect, fold and glue/tape bond; squareness; packer jams; seal quality; case count accuracy.",
    acceptance: "Cases run at target speed with no packaging-caused jams beyond baseline; bonds hold." },
  { id: "lt-carton", when: ["paperboard"], name: "Cartoning trial",
    line: "Cartoner",
    measures: "Carton pick and erect; flap closing / glue; jams; speed; reject rate.",
    acceptance: "Efficiency and reject rate no worse than baseline." },
  { id: "lt-label", when: ["label"], name: "Labeling & coding trial",
    line: "Labeler / coder",
    measures: "Label placement and adhesion; skew and wrinkles; date-code legibility; barcode scan grade.",
    acceptance: "Placement within tolerance; barcode grade meets customer requirement; codes legible." },
  { id: "lt-pallet", when: ["stretch_film", "pallet"], name: "Palletizing & stretch-wrap trial",
    line: "Palletizer / stretch wrapper",
    measures: "Pattern build vs. specified pallet pattern; layer squareness; wrap containment and film breaks; label placement on unit load.",
    acceptance: "Unit loads built to the specified pattern; wraps without film breaks; loads stable for handling." },
];

export function recommendLineTrials(i) {
  if (i.changeType === "distribution") return [];
  const types = new Set((i.materials || []).map((m) => m.type));
  return LINE_TRIALS.filter((t) => {
    if (!t.when.some((w) => types.has(w))) return false;
    // A can end is seamed on the can line, not capped — only glass / non-can closures get a capping trial
    if (t.id === "lt-glass" && !types.has("glass") && types.has("aluminum_can")) return false;
    if (i.changeType === "minor") return t.id === "lt-label";
    return true;
  }).map(({ when, ...t }) => ({ ...t, runQty: "", speed: "" }));
}

// ---------------------------------------------------------------------------
// buildPlan — snapshot stored in qualification_plans.content
// ---------------------------------------------------------------------------
export function buildPlan(inputs) {
  const i = { ...emptyInputs(), ...(inputs || {}) };
  const risk = assessRisk(i);
  const recommended = recommendTests(i, risk);
  const excluded = new Set(i.excludedTests || []);
  const custom = (i.customTests || [])
    .filter((c) => c && c.name)
    .map((c, n) => ({
      id: `custom-${n}`, category: "Custom", name: c.name, standard: c.standard || "—",
      purpose: c.purpose || "", samples: c.samples || "—", priority: c.priority || "Required",
    }));
  const tests = [...recommended.filter((x) => !excluded.has(x.id)), ...custom];

  const ltDetails = i.lineTrialDetails || {};
  const ltExcluded = new Set(i.excludedLineTrials || []);
  const lineTrialsRecommended = recommendLineTrials(i).map((t) => ({ ...t, ...(ltDetails[t.id] || {}) }));
  const lineTrials = [
    ...lineTrialsRecommended.filter((t) => !ltExcluded.has(t.id)),
    ...(i.customLineTrials || [])
      .filter((c) => c && c.name)
      .map((c, n) => ({
        id: `custom-lt-${n}`, name: c.name, line: c.line || "", speed: c.speed || "", runQty: c.runQty || "",
        measures: c.measures || "", acceptance: c.acceptance || "",
      })),
  ];

  return {
    engineVersion: ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    risk,
    safetyFactor: safetyFactor(i),
    recommended, // full list (so the wizard can show excluded ones)
    tests,
    lineTrialsRecommended,
    lineTrials,
  };
}

// ---------------------------------------------------------------------------
// composeDocument — generic section model for HTML + PDF rendering.
// Blocks: { type: "p", text } | { type: "list", items } |
//         { type: "table", columns:[{label,w}], rows:[[...]] } |
//         { type: "kv", rows:[[k,v]] } | { type: "note", text }
// ---------------------------------------------------------------------------
const clean = (s) => (s || "").toString().trim();
const paras = (s) => clean(s).split(/\n{2,}|\r\n\r\n/).map((x) => x.trim()).filter(Boolean);
const lines = (s) => clean(s).split(/\n/).map((x) => x.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

const BACKGROUND_LEAD = {
  new: "A new packaging system is being introduced and has no prior distribution history.",
  design: "The existing packaging design is being changed; performance must be shown equal to or better than the current design.",
  material: "A packaging material is being substituted or downgauged; the change must not reduce protective performance.",
  supplier: "A new or second-source supplier is being qualified for an existing packaging component.",
  distribution: "The product will move through a new distribution route or channel not covered by prior qualification.",
  minor: "A minor change (graphics, print, or labeling) is being made with no intended effect on structural performance.",
};

export function composeDocument(plan) {
  const i = { ...emptyInputs(), ...(plan.inputs || {}) };
  const c = plan.content && plan.content.risk ? plan.content : buildPlan(i);
  const risk = c.risk;
  const product = clean(i.productName) || "the product";
  const sku = clean(i.sku);
  const dims = [i.caseL, i.caseW, i.caseH].every((v) => num(v) > 0)
    ? `${num(i.caseL)} × ${num(i.caseW)} × ${num(i.caseH)} in` : "—";

  const header = {
    planNumber: plan.plan_number || "QP-(assigned on save)",
    revision: plan.revision || "A",
    status: STATUS_LABELS[plan.status] || "Draft",
    title: clean(i.title) || `Qualification Plan — ${product}`,
    date: new Date(plan.updated_at || plan.created_at || Date.now()).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    }),
    kv: [
      ["Plan No.", plan.plan_number || "Assigned on save"],
      ["Revision", plan.revision || "A"],
      ["Status", STATUS_LABELS[plan.status] || "Draft"],
      ["Risk level", `${risk.level} (${risk.score} pts)`],
      ["Customer", clean(i.customer) || "—"],
      ["Product", clean(i.productName) || "—"],
      ["SKU / Item", sku || "—"],
      ["Prepared by", [clean(i.preparedBy), clean(i.company)].filter(Boolean).join(", ") || "—"],
      ...(plan.approved_at ? [["Approved", fmtDateTime(plan.approved_at)]] : []),
      ...(plan.results?.conclusion?.outcome ? [["Outcome", OUTCOME_LABELS[plan.results.conclusion.outcome] || ""]] : []),
    ],
  };

  const S = [];
  let n = 0;
  const sec = (title, blocks) => S.push({ num: ++n, title, blocks: blocks.filter(Boolean) });

  // 1 Purpose
  sec("Purpose", [
    { type: "p", text:
      `This plan defines the testing and acceptance criteria required to qualify the packaging system for ${product}` +
      `${sku ? ` (${sku})` : ""}${clean(i.customer) ? ` for ${clean(i.customer).replace(/\.+$/, "")}` : ""}. ` +
      `Successful completion demonstrates that the packaging protects the product through the intended distribution environment.` },
    ...lines(i.objectives).length ? [{ type: "list", items: lines(i.objectives) }] : [],
  ]);

  // 2 Scope
  const inScope = [
    `Packaging components listed in Section 5 for ${product}.`,
    `Distribution via ${label("channel", i.channel).toLowerCase()}${i.temperature !== "ambient" ? `, ${label("temperature", i.temperature).toLowerCase()}` : ""}.`,
    `Warehouse stacking up to ${num(i.stackHeightPallets, 1)} pallet(s) high for up to ${num(i.storageWeeks, 0)} week(s).`,
    (c.lineTrials || []).length ? "Production-line trials listed in the Line Trials section." : null,
    ...lines(i.scopeNotes),
  ].filter(Boolean);
  const outScope = lines(i.outOfScope).length ? lines(i.outOfScope) : [
    "Product formulation, shelf-life, and sensory testing.",
    (c.lineTrials || []).length ? null : "Packaging line / machinability trials.",
    "Distribution channels not listed above.",
  ].filter(Boolean);
  sec("Scope", [
    { type: "p", text: "In scope:" }, { type: "list", items: inScope },
    { type: "p", text: "Out of scope:" }, { type: "list", items: outScope },
  ]);

  // 3 Background
  sec("Background", [
    { type: "p", text: `${label("changeType", i.changeType)}. ${BACKGROUND_LEAD[i.changeType] || ""}` },
    ...paras(i.background).map((t) => ({ type: "p", text: t })),
    i.damageHistory !== "none" ? { type: "p", text: `Damage history: ${label("damageHistory", i.damageHistory)}.` } : null,
  ]);

  // 4 Product description
  const flags = [i.foodContact && "Food contact", i.perishable && "Perishable", i.liquid && "Liquid", i.hazmat && "Hazardous material"].filter(Boolean);
  sec("Product Description", [
    paras(i.productDescription).length ? { type: "p", text: paras(i.productDescription).join(" ") } : null,
    { type: "kv", rows: [
      ["Category", label("productCategory", i.productCategory)],
      ["Packed case weight", num(i.caseWeightLb) ? `${num(i.caseWeightLb)} lb` : "—"],
      ["Case dimensions (L × W × H)", dims],
      ["Fragility", label("fragility", i.fragility)],
      ["Unit value", label("unitValue", i.unitValue)],
      ["Special attributes", flags.length ? flags.join(", ") : "None"],
    ] },
  ]);

  // 5 Packaging materials
  const mats = (i.materials || []).filter((m) => clean(m.component) || clean(m.spec) || m.type);
  sec("Packaging Materials", [
    mats.length ? { type: "table",
      columns: [{ label: "#", w: 6 }, { label: "Level", w: 14 }, { label: "Component", w: 22 }, { label: "Material", w: 18 }, { label: "Specification", w: 24 }, { label: "Supplier", w: 16 }],
      rows: mats.map((m, k) => [String(k + 1), label("materialLevel", m.level), clean(m.component) || "—", label("materialType", m.type), clean(m.spec) || "—", clean(m.supplier) || "—"]),
    } : { type: "p", text: "No packaging materials listed." },
    clean(i.palletPatternRef) ? { type: "p", text: `Pallet pattern reference: ${clean(i.palletPatternRef)}` } : null,
  ]);

  // 6 Distribution environment
  sec("Distribution Environment", [
    { type: "kv", rows: [
      ["Channel", label("channel", i.channel)],
      ["Customer / retailer requirement", clean(i.retailerRequirement) || "None specified"],
      ["Temperature", label("temperature", i.temperature)],
      ["Humidity", label("humidity", i.humidity)],
      ["Handling", label("handlingTouches", i.handlingTouches)],
      ["Transit time", `${num(i.transitDays, 0)} day(s)`],
      ["Warehouse stack height", `${num(i.stackHeightPallets, 1)} pallet(s)`],
      ["Storage duration", `${num(i.storageWeeks, 0)} week(s)`],
    ] },
  ]);

  // 7 Risk assessment
  sec("Risk Assessment", [
    { type: "p", text: `Overall risk level: ${risk.level} — ${risk.score} of ${risk.max} points. ` +
      "Low: 0–9, Medium: 10–19, High: 20+. The risk level sets test severity, sample sizes, and whether a field trial is required." },
    { type: "table",
      columns: [{ label: "Risk factor", w: 30 }, { label: "Input", w: 55 }, { label: "Points", w: 15 }],
      rows: risk.factors.map((f) => [f.factor, f.value, String(f.points)]) },
    ...risk.overrides.map((o) => ({ type: "note", text: o })),
  ]);

  const lineTrials = Array.isArray(c.lineTrials) ? c.lineTrials : [];
  const testNo = {};

  // Testing recommendations
  const testSec = n + 1;
  c.tests.forEach((t, k) => (testNo[t.id] = `${testSec}.${k + 1}`));
  sec("Testing Recommendations", [
    { type: "table",
      columns: [{ label: "#", w: 6 }, { label: "Test", w: 20 }, { label: "Standard", w: 17 }, { label: "Purpose", w: 31 }, { label: "Samples", w: 12 }, { label: "Priority", w: 14 }],
      rows: c.tests.map((t) => [testNo[t.id], t.name, t.standard, t.purpose, t.samples, t.priority]) },
    { type: "note", text: "Sample sizes are recommended minimums; where a referenced standard or customer requires more, the larger number applies. Always use the current revision of each standard." },
  ]);

  // Line trials (production equipment runs)
  if (lineTrials.length) {
    const ltSec = n + 1;
    lineTrials.forEach((t, k) => (testNo[t.id] = `${ltSec}.${k + 1}`));
    sec("Line Trials", [
      { type: "p", text: "Production-line trials confirm the packaging runs on the actual equipment at target speed. Samples produced during these trials should be used for the lab and distribution tests where practical." },
      { type: "table",
        columns: [{ label: "#", w: 6 }, { label: "Trial", w: 18 }, { label: "Line / equipment", w: 15 }, { label: "Speed / run size", w: 13 }, { label: "Measure", w: 26 }, { label: "Acceptance", w: 22 }],
        rows: lineTrials.map((t) => [
          testNo[t.id], t.name, clean(t.line) || "—",
          [clean(t.speed) && `${clean(t.speed)}`, clean(t.runQty) && `Run: ${clean(t.runQty)}`].filter(Boolean).join("; ") || "Target / TBD",
          t.measures || "—", t.acceptance || "—",
        ]) },
    ]);
  }

  // Test sequence
  const order = ["Materials", "Conditioning", "Compression", "Climate", "Distribution", "Product", "Regulatory", "Custom", "Validation"];
  const seq = [
    ...c.tests.filter((t) => t.category === "Materials").map((t) => `${t.name} (${t.standard})`),
    ...lineTrials.map((t) => `${t.name} — line trial; produce test samples`),
    ...order.slice(1).flatMap((cat) => c.tests.filter((t) => t.category === cat).map((t) => `${t.name} (${t.standard})`)),
  ];
  const sf = c.safetyFactor;
  sec("Test Sequence & Compression Requirement", [
    { type: "list", ordered: true, items: seq },
    c.tests.some((t) => t.id === "bct") ? { type: "p", text:
      `Required BCT = load on the bottom shipper × safety factor ${sf.value.toFixed(1)}. ` +
      `Load on bottom shipper = (cases stacked above it, including pallets stacked in storage) × packed case weight` +
      `${num(i.caseWeightLb) ? ` (${num(i.caseWeightLb)} lb)` : ""}.` } : null,
    c.tests.some((t) => t.id === "bct") ? { type: "list", items: sf.reasons } : null,
  ]);

  // Acceptance criteria
  sec("Acceptance Criteria", [
    { type: "list", items: [
      "No product damage that would prevent sale or use (inspect 100 % of product units in test samples).",
      "Primary package integrity maintained — no punctures, seal failures, or leaks.",
      "Shipper remains intact and able to be handled safely; no crushing that contacts product.",
      c.tests.some((t) => t.id === "bct") ? `Measured BCT (mean − 2σ recommended) meets or exceeds the required BCT using safety factor ${sf.value.toFixed(1)}.` : null,
      ["ftl", "ltl", "mixed", "export"].includes(i.channel) ? "Unit load arrives stable and contained; no cases fallen or displaced beyond the pallet edge." : null,
      "Labels and barcodes remain legible and scannable.",
      lineTrials.length ? "Line trials meet the acceptance listed for each trial; line efficiency and reject rate no worse than the current packaging baseline." : null,
      i.hazmat ? "All UN performance tests passed as required for the packaging's UN mark." : null,
      i.foodContact ? "Compliance documentation on file for every food-contact component." : null,
      risk.level !== "Low" ? "Field trial loads arrive with no damage beyond current-packaging baseline." : null,
    ].filter(Boolean) },
  ]);

  // Deliverables
  sec("Deliverables & Records", [
    { type: "list", items: [
      `Test report for each test in Section ${testSec} (method, conditions, equipment, raw data, photos).`,
      lineTrials.length ? "Line trial report for each trial (speeds, stoppages, rejects, measurements, observations)." : null,
      "Completed packaging specification for every component in Section 5.",
      "Summary of results against acceptance criteria with pass / fail conclusion.",
      "Approved revision of this plan with signatures below.",
    ].filter(Boolean) },
  ]);

  // Approvals — filled in electronically as each approver signs
  const approvals = Array.isArray(plan.approvals) ? plan.approvals : [];
  sec("Approvals", [
    { type: "table", signature: true,
      columns: [{ label: "Role", w: 24 }, { label: "Name", w: 22 }, { label: "Signature", w: 32 }, { label: "Date", w: 22 }],
      rows: approversOf(i).map((a) => {
        const sig = approvals.find((x) => x.approverId === a.id);
        return sig
          ? [a.role, sig.name, `Electronically signed${sig.email ? ` (${sig.email})` : ""}`, fmtDateTime(sig.signedAt)]
          : [a.role, clean(a.name), "", ""];
      }) },
    approvals.length
      ? { type: "note", text: "Electronic signatures are recorded by Betsel Stack with the signer's name, the account used, and a server timestamp. Signing indicates approval of this revision of the plan." }
      : null,
  ]);

  // Results — recorded after approval
  const R = plan.results && typeof plan.results === "object" ? plan.results : {};
  const rTests = R.tests || {};
  const items = [...c.tests, ...lineTrials];
  const recorded = items.filter((t) => rTests[t.id] && (rTests[t.id].result || clean(rTests[t.id].value)));
  if (recorded.length || R.conclusion) {
    sec("Results Summary", [
      { type: "table",
        columns: [{ label: "#", w: 7 }, { label: "Test / trial", w: 23 }, { label: "Result", w: 11 }, { label: "Date", w: 13 }, { label: "Measured / observed", w: 32 }, { label: "By", w: 14 }],
        rows: items.map((t) => {
          const r = rTests[t.id] || {};
          return [testNo[t.id] || "—", t.name, r.result || "Pending", r.date || "—", clean(r.value) || "—", clean(r.by) || "—"];
        }) },
    ]);
  }
  if (R.conclusion && R.conclusion.outcome) {
    const k = R.conclusion;
    sec("Qualification Conclusion", [
      { type: "kv", rows: [
        ["Outcome", OUTCOME_LABELS[k.outcome] || k.outcome],
        ["Completed by", [clean(k.name), k.email ? `(${k.email})` : ""].filter(Boolean).join(" ") || "—"],
        ["Completed", fmtDateTime(k.at) || "—"],
      ] },
      ...paras(k.notes).map((t) => ({ type: "p", text: t })),
    ]);
  }

  // Revision history
  const hist = Array.isArray(plan.rev_history) && plan.rev_history.length
    ? plan.rev_history
    : [{ rev: plan.revision || "A", date: header.date, by: clean(i.preparedBy), note: "Initial release" }];
  sec("Revision History", [
    { type: "table",
      columns: [{ label: "Rev", w: 10 }, { label: "Date", w: 20 }, { label: "By", w: 25 }, { label: "Description", w: 45 }],
      rows: hist.map((h) => [h.rev, h.date, h.by || "—", h.note || "—"]) },
  ]);

  return { header, sections: S };
}

export function nextRevision(rev) {
  // A..Z, then AA, AB, ...
  const s = (rev || "A").toUpperCase().replace(/[^A-Z]/g, "") || "A";
  const chars = s.split("");
  let k = chars.length - 1;
  while (k >= 0) {
    if (chars[k] !== "Z") { chars[k] = String.fromCharCode(chars[k].charCodeAt(0) + 1); return chars.join(""); }
    chars[k] = "A"; k--;
  }
  return "A" + chars.join("");
}
