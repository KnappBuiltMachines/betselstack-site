// lib/sustainability/library.js
// Data for the free Sustainability Library at /tools/sustainability-library.
//
// HOW TO MAINTAIN
// - Ratings are Betsel Stack's editorial ratings (1 = poor, 5 = strong) for
//   general U.S. guidance. They summarise the sources listed in SOURCES; they
//   are not a certification and not legal advice.
// - "h2r" is the How2Recycle designation a package of this type typically
//   gets in the U.S. Packages are assessed one by one, so a specific package
//   can differ (labels, inks, closures, size and colour all matter).
// - Update LAST_REVIEWED and the regulation "status" lines whenever a law
//   or a How2Recycle designation changes.

export const LAST_REVIEWED = "November 2026";

// How2Recycle designations (thresholds from how2recycle.info/labels).
export const H2R = {
  widely: {
    label: "Widely Recyclable",
    tone: "good",
    text: "At least 60% of Americans (50% of Canadians) can recycle it through curbside or drop-off programs.",
  },
  check: {
    label: "Check Locally",
    tone: "mid",
    text: "Fewer than 60% of Americans can recycle it. The label tells people to check their local program.",
  },
  dropoff: {
    label: "Store Drop-off",
    tone: "mid",
    text: "U.S. only. Clean polyethylene (PE) film can go to participating retail store film collection.",
  },
  notyet: {
    label: "Not Yet Recyclable",
    tone: "bad",
    text: "Fewer than 20% of Americans can recycle it, or it causes problems in sorting, reprocessing or end markets.",
  },
  varies: {
    label: "Varies by package",
    tone: "mid",
    text: "Depends on the exact format. Check the How2Recycle guidance or your local program.",
  },
  b2b: {
    label: "Commercial stream",
    tone: "good",
    text: "Transport packaging. It is usually recovered through business (back-of-store or DC) recycling, reuse or repair programs, not curbside.",
  },
};

export const RATING_KEYS = [
  { id: "recycle", label: "Recyclability", hint: "How readily it is collected and recycled in the U.S. today" },
  { id: "content", label: "Recycled content", hint: "How easily you can buy it with post-consumer or recycled content" },
  { id: "renew", label: "Renewable source", hint: "Made from renewable (plant or wood) feedstock" },
  { id: "reuse", label: "Reuse potential", hint: "Can it be reused, repaired or pooled before it is recycled?" },
];

export const CATEGORIES = [
  { id: "fiber", label: "Paper & fiber" },
  { id: "rigid", label: "Rigid plastics" },
  { id: "flex", label: "Flexible plastics" },
  { id: "metal", label: "Metals" },
  { id: "glass", label: "Glass" },
  { id: "bio", label: "Compostable & bio-based" },
  { id: "transport", label: "Pallets & unit load" },
];

// compost: "certified" | "possible" | "no"
export const MATERIALS = [
  // ── Paper & fiber ────────────────────────────────────────────────
  {
    id: "corrugated",
    name: "Corrugated board (OCC)",
    cat: "fiber",
    examples: "Shipping cases, trays, shrouds, display-ready packaging",
    h2r: "widely",
    ratings: { recycle: 5, content: 5, renew: 5, reuse: 3 },
    compost: "possible",
    summary:
      "The most widely recovered packaging material in the U.S. Old corrugated containers (OCC) have strong end markets, and new board is routinely made with recycled fiber.",
    tips: [
      "Size the case to the product. Void space adds board and cube on the pallet.",
      "Use repulpable/recyclable coatings in place of wax where you need moisture resistance.",
      "Specify board by performance (ECT) rather than adding plies by habit.",
    ],
    watch: [
      "Wax-impregnated and heavy plastic-laminated board are hard to recycle.",
      "Wet-strength resins can slow repulping.",
    ],
  },
  {
    id: "paperboard",
    name: "Paperboard folding cartons",
    cat: "fiber",
    examples: "Cereal boxes, sleeves, multipack carriers",
    h2r: "widely",
    ratings: { recycle: 5, content: 4, renew: 5, reuse: 1 },
    compost: "possible",
    summary:
      "Widely accepted in curbside programs. Recycled paperboard (CRB) is easy to source; food-contact items may need virgin or barrier-lined board.",
    tips: [
      "Keep windows, foil stamping and plastic laminations small or removable.",
      "Use water-based inks and coatings where possible.",
    ],
    watch: ["PFAS-based grease resistance is banned in food packaging in a growing number of states."],
  },
  {
    id: "molded-fiber",
    name: "Molded fiber / pulp",
    cat: "fiber",
    examples: "Egg cartons, end caps, cushioning trays, produce trays",
    h2r: "varies",
    ratings: { recycle: 3, content: 5, renew: 5, reuse: 2 },
    compost: "possible",
    summary:
      "Often made from 100% recycled paper and can replace foam cushioning. Recycling acceptance depends on the format and any barrier treatment.",
    tips: [
      "A good swap for EPS end caps and corner blocks in many cushioning applications.",
      "Confirm any grease or moisture barrier is PFAS-free.",
    ],
    watch: [
      "Food-service molded fiber has historically used PFAS; several state bans now apply.",
      "Compostable claims need certification (for example BPI) and must be qualified if composting access is limited.",
    ],
  },
  {
    id: "poly-coated",
    name: "Poly-coated paper & paper cups",
    cat: "fiber",
    examples: "Hot/cold cups, frozen food cartons, coated wraps",
    h2r: "varies",
    ratings: { recycle: 2, content: 2, renew: 4, reuse: 1 },
    compost: "no",
    summary:
      "The plastic coating needs special mills to separate, so access is limited in many areas.",
    tips: ["Look for aqueous or dispersion barrier coatings designed for repulping."],
    watch: ["Do not call coated paper compostable unless the finished item is certified."],
  },
  {
    id: "cartons",
    name: "Gable-top & aseptic cartons",
    cat: "fiber",
    examples: "Milk, juice, broth and soup cartons",
    h2r: "widely",
    ratings: { recycle: 3, content: 1, renew: 4, reuse: 1 },
    compost: "no",
    summary:
      "How2Recycle treats fiber cartons as Widely Recyclable, but actual recovery is lower than for corrugated because the paper, plastic and foil layers need separating.",
    tips: ["Fewer layers and tethered caps help sorting."],
    watch: ["Food-contact cartons generally need virgin fiber, so recycled content is low."],
  },
  {
    id: "kraft",
    name: "Kraft paper bags & paper void fill",
    cat: "fiber",
    examples: "Multiwall bags, crumpled kraft dunnage, paper wrap",
    h2r: "widely",
    ratings: { recycle: 5, content: 4, renew: 5, reuse: 2 },
    compost: "possible",
    summary: "Easy to recycle with corrugated or mixed paper and a common replacement for plastic void fill.",
    tips: ["Paper void fill is accepted in most curbside programs, unlike loose foam fill."],
    watch: ["Multiwall bags with plastic liners are harder to recycle."],
  },

  // ── Rigid plastics ───────────────────────────────────────────────
  {
    id: "pet-bottles",
    name: "PET bottles & jars (#1)",
    cat: "rigid",
    examples: "Beverage bottles, peanut butter jars, clear jars",
    h2r: "widely",
    ratings: { recycle: 5, content: 5, renew: 1, reuse: 1 },
    compost: "no",
    summary:
      "The most recycled plastic package. Food-grade recycled PET (rPET) is widely available, which helps meet state recycled-content laws.",
    tips: [
      "Clear or light-blue, unpigmented PET has the best value.",
      "Use labels, adhesives and closures that the APR Design Guide rates as compatible.",
    ],
    watch: [
      "PETG or PVC shrink sleeves and full-body metallized labels can make a PET bottle unrecyclable.",
      "New Jersey, California and other states set minimum post-consumer content for plastic beverage containers.",
    ],
  },
  {
    id: "pet-thermo",
    name: "PET thermoforms (#1)",
    cat: "rigid",
    examples: "Clamshells, berry containers, bakery domes, blister packs",
    h2r: "check",
    ratings: { recycle: 3, content: 4, renew: 1, reuse: 1 },
    compost: "no",
    summary:
      "Many programs accept them, but national access is below the 60% threshold for an unqualified recyclable claim.",
    tips: ["Use wash-off adhesives and avoid paper labels that tear into flakes."],
    watch: ["Treat recyclable claims for thermoforms as qualified claims unless you have current access data."],
  },
  {
    id: "hdpe",
    name: "HDPE bottles & jugs (#2)",
    cat: "rigid",
    examples: "Milk jugs, detergent and personal care bottles",
    h2r: "widely",
    ratings: { recycle: 5, content: 4, renew: 1, reuse: 1 },
    compost: "no",
    summary: "Strong curbside access and end markets. Natural (unpigmented) HDPE is the most valuable.",
    tips: ["Natural or white bottles recycle into more uses than dark colors."],
    watch: ["Other rigid HDPE formats (trays, thermoforms) can carry a different designation."],
  },
  {
    id: "pp",
    name: "PP tubs, cups & caps (#5)",
    cat: "rigid",
    examples: "Yogurt tubs, deli containers, cold-drink cups, closures",
    h2r: "widely",
    ratings: { recycle: 4, content: 2, renew: 1, reuse: 2 },
    compost: "no",
    summary:
      "Access improved enough for rigid PP containers to return to Widely Recyclable, and PP cups followed in 2026.",
    tips: ["Mono-material PP (tub, lid and label) sorts and recycles best."],
    watch: ["Food-grade recycled PP is still scarce, so recycled-content options are limited."],
  },
  {
    id: "ps-eps",
    name: "Polystyrene & EPS foam (#6)",
    cat: "rigid",
    examples: "Foam cushioning, foam trays, packing peanuts, rigid PS cups",
    h2r: "notyet",
    ratings: { recycle: 1, content: 1, renew: 1, reuse: 2 },
    compost: "no",
    summary:
      "Rarely accepted curbside. Several states ban EPS food-service ware, and New Jersey has banned polystyrene loose fill (packing peanuts) since January 2024.",
    tips: ["Molded fiber, corrugated inserts or recyclable PE foam can often replace EPS cushioning."],
    watch: ["Some retailers ask suppliers to avoid EPS unless there is no practical alternative."],
  },
  {
    id: "pvc",
    name: "PVC (#3)",
    cat: "rigid",
    examples: "Some blister packs, shrink sleeves, clamshells",
    h2r: "notyet",
    ratings: { recycle: 1, content: 1, renew: 1, reuse: 1 },
    compost: "no",
    summary: "Not collected in most programs and a contaminant in PET recycling.",
    tips: ["Switch PVC blisters and sleeves to PET, PP or paperboard designs."],
    watch: ["PVC components can disqualify an otherwise recyclable PET package."],
  },

  // ── Flexible plastics ────────────────────────────────────────────
  {
    id: "pe-film",
    name: "PE film (LDPE / LLDPE)",
    cat: "flex",
    examples: "Bags, case overwrap, bundling film, mailers, air pillows",
    h2r: "dropoff",
    ratings: { recycle: 3, content: 3, renew: 1, reuse: 1 },
    compost: "no",
    summary:
      "Clean, dry PE film can go to store drop-off in the U.S. It is not accepted in most curbside bins.",
    tips: [
      "Keep the film all-PE (no PET or nylon layers) and keep print light.",
      "Paper labels on film mailers should be removable.",
    ],
    watch: ["Store drop-off availability varies by retailer and region."],
  },
  {
    id: "laminates",
    name: "Multi-material laminates & pouches",
    cat: "flex",
    examples: "Snack bags, stand-up pouches, retort pouches, metallized wraps",
    h2r: "notyet",
    ratings: { recycle: 1, content: 1, renew: 1, reuse: 1 },
    compost: "no",
    summary: "Mixed layers (PET/PE, foil, nylon) can't be separated in today's systems.",
    tips: [
      "Ask suppliers for mono-material PE or PP structures designed for store drop-off.",
      "Light-weighting still reduces material even when recycling isn't possible.",
    ],
    watch: ["EU PPWR will require recyclable designs (grades A to C) from 2030."],
  },

  // ── Metals ───────────────────────────────────────────────────────
  {
    id: "aluminum",
    name: "Aluminum cans",
    cat: "metal",
    examples: "Beverage cans, aluminum bottles",
    h2r: "widely",
    ratings: { recycle: 5, content: 5, renew: 1, reuse: 1 },
    compost: "no",
    summary: "High-value material that recycles repeatedly without losing quality. Cans carry high recycled content.",
    tips: ["Shrink sleeves and full-body plastic labels can interfere with sorting."],
    watch: ["Aluminum aerosols and some foil formats carry a different designation."],
  },
  {
    id: "steel",
    name: "Steel (tin) cans",
    cat: "metal",
    examples: "Food cans, paint cans",
    h2r: "widely",
    ratings: { recycle: 5, content: 4, renew: 1, reuse: 1 },
    compost: "no",
    summary: "Magnetic separation makes steel cans easy to recover at sorting facilities.",
    tips: ["Empty, rinsed cans are accepted in most curbside programs."],
    watch: [],
  },
  {
    id: "aerosol",
    name: "Aerosol cans (aluminum & steel)",
    cat: "metal",
    examples: "Sprays, foams, cooking spray",
    h2r: "check",
    ratings: { recycle: 3, content: 4, renew: 1, reuse: 1 },
    compost: "no",
    summary: "How2Recycle moved aluminum and steel aerosols from Widely Recyclable to Check Locally in 2025.",
    tips: ["Instruct consumers to recycle only when empty."],
    watch: ["Some programs exclude aerosols for safety reasons."],
  },

  // ── Glass ────────────────────────────────────────────────────────
  {
    id: "glass",
    name: "Glass bottles & jars",
    cat: "glass",
    examples: "Beverage bottles, food jars",
    h2r: "widely",
    ratings: { recycle: 4, content: 4, renew: 1, reuse: 3 },
    compost: "no",
    summary:
      "Recyclable many times and made with recycled cullet, but heavy to ship. Some communities collect glass only at drop-off sites.",
    tips: ["Light-weighting bottles cuts freight weight on every pallet."],
    watch: ["Glass weight often makes the pallet weight-limited before it is height-limited."],
  },

  // ── Compostable & bio-based ──────────────────────────────────────
  {
    id: "compostable",
    name: "Certified compostable plastics (PLA, PHA)",
    cat: "bio",
    examples: "Compostable cups, food-service ware, produce bags",
    h2r: "notyet",
    ratings: { recycle: 1, content: 1, renew: 4, reuse: 1 },
    compost: "certified",
    summary:
      "Break down in industrial composting when certified to ASTM D6400 (or D6868 for coated paper). Access to composting that accepts packaging is limited.",
    tips: [
      "Use third-party certification (BPI in North America; TÜV OK compost or EN 13432 in Europe).",
      "Best suited to food-service settings with a composting program in place.",
    ],
    watch: [
      "Compostables can contaminate PET recycling because they look alike.",
      "Under the Green Guides, a compostable claim must be qualified if composting facilities aren't available to a substantial majority of people.",
    ],
  },
  {
    id: "biobased",
    name: "Bio-based “drop-in” plastics",
    cat: "bio",
    examples: "Sugarcane-based PE, plant-based PET",
    h2r: "varies",
    ratings: { recycle: 4, content: 2, renew: 4, reuse: 1 },
    compost: "no",
    summary:
      "Chemically the same as the fossil version, so they recycle in the same stream (bio-PE with PE, bio-PET with PET). They are not compostable.",
    tips: ["Claim the bio-based content percentage specifically, supported by testing."],
    watch: ["“Plant-based” does not mean compostable or biodegradable."],
  },

  // ── Pallets & unit load ──────────────────────────────────────────
  {
    id: "wood-stringer",
    name: "Wood stringer pallets (GMA / CBA style)",
    cat: "transport",
    examples: "48 × 40 in whitewood or recycled-wood pallets",
    h2r: "b2b",
    ratings: { recycle: 5, content: 4, renew: 5, reuse: 4 },
    compost: "no",
    summary:
      "Pallets are widely repaired, reused and recycled into new pallets, mulch or fuel. Recycled and “combo” pallets are common.",
    tips: [
      "Match pallet grade to the retailer's requirement. Many require Grade A for inbound loads.",
      "Export loads need ISPM 15 heat-treated (HT) and stamped wood.",
    ],
    watch: ["Several club and grocery retailers require block or pooled pallets instead of stringer pallets."],
  },
  {
    id: "pooled-block",
    name: "Pooled block pallets (CHEP, PECO)",
    cat: "transport",
    examples: "Rented 48 × 40 in block pallets",
    h2r: "b2b",
    ratings: { recycle: 5, content: 3, renew: 5, reuse: 5 },
    compost: "no",
    summary:
      "A share-and-reuse model. The pool operator collects, inspects and repairs pallets, so each pallet makes many trips.",
    tips: ["Often preferred or required by grocery and club retailers. Confirm which pool each retailer accepts."],
    watch: ["Pallet acceptance varies. Some programs reject specific pool pallets."],
  },
  {
    id: "plastic-pallet",
    name: "Plastic pallets (pooled or owned)",
    cat: "transport",
    examples: "iGPS pooled pallets, HDPE/PP closed-loop pallets",
    h2r: "b2b",
    ratings: { recycle: 4, content: 3, renew: 1, reuse: 5 },
    compost: "no",
    summary:
      "Long service life, consistent dimensions and lighter tare than wood block pallets. Usually reground into new pallets at end of life.",
    tips: ["Lighter tare can add product weight under a retailer's gross weight limit."],
    watch: ["Not every retailer or 3PL accepts plastic pallets."],
  },
  {
    id: "corrugated-pallet",
    name: "Corrugated & paper pallets",
    cat: "transport",
    examples: "One-way export or display pallets",
    h2r: "b2b",
    ratings: { recycle: 5, content: 5, renew: 5, reuse: 1 },
    compost: "no",
    summary: "Light and recyclable with corrugated, and exempt from ISPM 15 because they are not wood.",
    tips: ["Useful for light, one-way export loads."],
    watch: [
      "Limited load capacity and moisture resistance.",
      "Walmart's published standards do not accept corrugated pallets into its DCs.",
    ],
  },
  {
    id: "stretch-film",
    name: "Stretch film (LLDPE)",
    cat: "transport",
    examples: "Machine and hand pallet wrap",
    h2r: "b2b",
    ratings: { recycle: 3, content: 3, renew: 1, reuse: 1 },
    compost: "no",
    summary:
      "Clean stretch film is commonly baled and recycled in back-of-store and DC film programs. Thinner high-performance films use less material.",
    tips: [
      "Right-size the gauge and use pre-stretch carriages instead of more wraps.",
      "Clear film is easier to recycle than colored or black film.",
    ],
    watch: [
      "Some retailers prohibit colored or black wrap and limit the number of layers.",
      "Oregon's and California's EPR programs include most business-to-business packaging.",
    ],
  },
  {
    id: "strapping",
    name: "Strapping (PET, PP, steel)",
    cat: "transport",
    examples: "Unitizing straps, bale ties",
    h2r: "b2b",
    ratings: { recycle: 3, content: 5, renew: 1, reuse: 1 },
    compost: "no",
    summary: "PET strapping is commonly made from recycled PET bottles and can replace steel in many uses.",
    tips: ["Use strap only where stretch film alone can't hold the load."],
    watch: ["Some retailers do not allow metal bands on displays or require plastic straps."],
  },
  {
    id: "slip-sheets",
    name: "Slip sheets, tier sheets & corner boards",
    cat: "transport",
    examples: "Solid-fiber slip sheets, corrugated tier sheets, paper edge protectors",
    h2r: "b2b",
    ratings: { recycle: 5, content: 5, renew: 5, reuse: 2 },
    compost: "no",
    summary:
      "Fiber versions recycle with corrugated. Tier sheets stabilise shrink-wrapped layers; paper corner boards add stacking strength.",
    tips: ["Fiber tier sheets and corner boards keep the unit load in one recycling stream."],
    watch: ["Plastic slip or tier sheets often need retailer approval."],
  },
  {
    id: "void-fill",
    name: "Void fill: air pillows vs paper vs loose foam",
    cat: "transport",
    examples: "Inflatable PE pillows, paper dunnage, EPS peanuts",
    h2r: "varies",
    ratings: { recycle: 3, content: 3, renew: 3, reuse: 2 },
    compost: "no",
    summary:
      "Paper dunnage recycles curbside; PE air pillows go with film; EPS loose fill is rarely recyclable and banned in New Jersey.",
    tips: ["The most sustainable void fill is a right-sized case that needs none."],
    watch: ["Loose-fill polystyrene is banned for sale in New Jersey under the Recycled Content Law."],
  },
];

// ── Regulations & programs ──────────────────────────────────────────
// status tone: "inforce" | "phasing" | "paused" | "review"
export const REGULATIONS = [
  {
    id: "green-guides",
    region: "United States (federal)",
    name: "FTC Green Guides (16 CFR Part 260)",
    tone: "review",
    status: "In force (2012 edition). The FTC opened a review in December 2022; no revised Guides have been issued as of November 2026.",
    applies: "Any environmental marketing claim on packaging or products sold in the U.S.",
    keyPoints: [
      "Unqualified “recyclable” claims need recycling facilities available to a substantial majority (at least 60%) of consumers or communities where the item is sold.",
      "Avoid broad claims like “eco-friendly” or “green” without specific, qualified benefits.",
      "Compostable claims must be supported by evidence that the item breaks down in a timely way, and qualified if facilities are limited.",
      "Recycled content claims should state the percentage and separate pre- and post-consumer content where relevant.",
      "Certifications and seals must be qualified and from independent organizations, or the connection disclosed.",
    ],
    url: "https://www.ftc.gov/legal-library/browse/rules/guides-use-environmental-marketing-claims-green-guides",
    sourceLabel: "FTC – Green Guides",
  },
  {
    id: "sb343",
    region: "California",
    name: "SB 343 – Truth in Recycling (chasing arrows)",
    tone: "paused",
    status:
      "Enforcement blocked. A federal court issued a preliminary injunction on July 14, 2026, before the October 4, 2026 compliance date. The law itself has not been repealed.",
    applies: "Recyclability claims and the chasing-arrows symbol on products and packaging sold in California.",
    keyPoints: [
      "Would limit the chasing arrows and “recyclable” claims to materials that meet CalRecycle-based collection and sortation criteria.",
      "The injunction is not limited to the plaintiffs, so it currently covers all businesses.",
      "Keep substantiation files for any recyclability claim and watch the case for updates.",
    ],
    url: "https://calrecycle.ca.gov/wcs/sb343/",
    sourceLabel: "CalRecycle – SB 343",
  },
  {
    id: "state-epr",
    region: "7 U.S. states",
    name: "Packaging Extended Producer Responsibility (EPR)",
    tone: "phasing",
    status:
      "Enacted in Maine, Oregon, Colorado, California, Minnesota, Maryland and Washington. Oregon and Colorado are operating with producer fees; the others are in registration and planning stages.",
    applies: "Brand owners (producers) of packaging and paper products supplied into each state.",
    keyPoints: [
      "Producers join a Producer Responsibility Organization (PRO) and pay fees based on the packaging they supply.",
      "Fees are eco-modulated: hard-to-recycle materials pay more, so design choices change cost.",
      "Oregon and California include most business-to-business packaging (stretch film, strapping, corner boards); Colorado exempts most of it.",
      "California's SB 54 also sets 2032 targets: 25% plastic source reduction, 65% plastic recycling rate, and all covered packaging recyclable or compostable.",
      "Washington producers must join the PRO in 2026; non-members can't sell covered products there after March 2029.",
    ],
    url: "https://www.circularactionalliance.org/",
    sourceLabel: "Circular Action Alliance (PRO)",
  },
  {
    id: "nj-recycled",
    region: "New Jersey",
    name: "Recycled Content Law (P.L. 2021, c.391)",
    tone: "phasing",
    status:
      "In force since January 18, 2024 with step-ups. Rigid plastic containers move to 20% post-consumer content and plastic carryout bags to 40% in 2027, and the temporary exemption for food containers ends in January 2027.",
    applies: "Manufacturers of rigid plastic containers, plastic beverage containers, glass containers, carryout bags and trash bags sold in NJ.",
    keyPoints: [
      "Annual registration and compliance reporting with NJDEP.",
      "Rigid plastic container content rises by 10 points every three years until it reaches 50% (2036).",
      "Glass containers: 35% post-consumer content.",
      "Polystyrene loose fill (packing peanuts) can't be sold in NJ.",
    ],
    url: "https://www.nj.gov/dep/dshw/recycled-content/",
    sourceLabel: "NJDEP – Recycled Content",
  },
  {
    id: "pfas",
    region: "Multiple U.S. states",
    name: "PFAS in food packaging bans",
    tone: "phasing",
    status:
      "At least 16 states restrict intentionally added PFAS in consumer products, and food packaging is one of the most common categories. More bans start in 2027 (New Mexico) and 2028 (New Jersey).",
    applies: "Food packaging, especially paper, paperboard and molded-fiber items with grease or moisture barriers.",
    keyPoints: [
      "States with food packaging restrictions include California, Colorado, Connecticut, Illinois, Maine, Maryland, Minnesota, New York, Oregon, Rhode Island, Vermont and Washington.",
      "New Jersey's ban on intentionally added PFAS in paper-based food packaging starts in January 2028.",
      "Get supplier certifications and, where states use a total organic fluorine test, test data.",
    ],
    url: "https://www.saferstates.org/",
    sourceLabel: "Safer States – policy tracker",
  },
  {
    id: "tpch",
    region: "19 U.S. states",
    name: "Toxics in Packaging (TPCH model law)",
    tone: "inforce",
    status: "In force in 19 states that adopted the Toxics in Packaging Clearinghouse model legislation.",
    applies: "All packaging and packaging components sold in those states.",
    keyPoints: [
      "The combined total of lead, cadmium, mercury and hexavalent chromium must not exceed 100 ppm by weight.",
      "No intentional addition of those four heavy metals.",
      "Suppliers should provide a Certificate of Compliance.",
    ],
    url: "https://toxicsinpackaging.org/",
    sourceLabel: "Toxics in Packaging Clearinghouse",
  },
  {
    id: "ispm15",
    region: "International",
    name: "ISPM 15 – wood packaging for export",
    tone: "inforce",
    status: "In force in most countries for international shipments.",
    applies: "Solid wood pallets, crates and dunnage crossing borders.",
    keyPoints: [
      "Wood must be heat treated (HT) or fumigated and carry the IPPC mark.",
      "Plywood, OSB, plastic and corrugated pallets are exempt.",
    ],
    url: "https://www.ippc.int/en/core-activities/standards-setting/ispms/",
    sourceLabel: "IPPC – ISPM standards",
  },
  {
    id: "ppwr",
    region: "European Union",
    name: "Packaging and Packaging Waste Regulation (PPWR)",
    tone: "phasing",
    status:
      "Applies from August 12, 2026, with requirements phasing in through 2040. It replaces the previous EU packaging directive.",
    applies: "Packaging placed on the EU market, including packaging from U.S. exporters.",
    keyPoints: [
      "From August 12, 2026: PFAS limits in food-contact packaging, declarations of conformity and manufacturer identification.",
      "Design-for-recycling criteria and grades due by 2028; from 2030, packaging must reach recyclability grade A (≥95%), B (≥80%) or C (≥70%). From 2038, only A or B.",
      "Harmonised material labels from 2028 and minimum recycled content for plastic packaging from 2030.",
      "From 2030, an empty space ratio of no more than 50% for grouped, transport and e-commerce packaging.",
    ],
    url: "https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en",
    sourceLabel: "European Commission – Packaging waste",
  },
];

// ── Labels, certifications & standards ──────────────────────────────
export const STANDARDS = [
  {
    name: "How2Recycle",
    type: "On-pack recycling label",
    text: "Run by GreenBlue (Sustainable Packaging Coalition). Each component gets one of four designations based on collection access, sortation, reprocessing and end markets.",
    url: "https://how2recycle.info/",
  },
  {
    name: "APR Design® Guide for Plastics Recyclability",
    type: "Design guidance",
    text: "The Association of Plastic Recyclers' guidance on resins, labels, adhesives, inks and closures, with test protocols and recognition programs.",
    url: "https://plasticsrecycling.org/apr-design-guide/",
  },
  {
    name: "ASTM D6400 / D6868",
    type: "Compostability standards",
    text: "U.S. specifications for plastics (D6400) and plastic-coated paper (D6868) designed to compost in industrial facilities.",
    url: "https://www.astm.org/",
  },
  {
    name: "BPI Certification",
    type: "Compostability certification",
    text: "North America's main third-party certification for products that meet ASTM D6400 or D6868, including PFAS limits.",
    url: "https://bpiworld.org/",
  },
  {
    name: "TÜV OK compost / EN 13432",
    type: "Compostability (EU)",
    text: "European certification for industrial (OK compost INDUSTRIAL) and home (OK compost HOME) composting, based on EN 13432.",
    url: "https://www.tuv-at.be/",
  },
  {
    name: "FSC, SFI & PEFC",
    type: "Fiber sourcing",
    text: "Chain-of-custody certifications for paper and wood from responsibly managed forests and recycled sources (for example FSC Mix or FSC Recycled).",
    url: "https://fsc.org/",
  },
  {
    name: "Recycled content verification",
    type: "Claim verification",
    text: "Third-party verification such as SCS Recycled Content or UL 2809 supports percentage claims for pre- and post-consumer content.",
    url: "https://www.scsglobalservices.com/",
  },
  {
    name: "Resin Identification Code (ASTM D7611)",
    type: "Material marking",
    text: "The numbers 1 to 7 inside a solid triangle identify the resin. They are not a claim that the item is recyclable.",
    url: "https://www.astm.org/d7611_d7611m-21.html",
  },
];

// Claims cheat sheet based on the Green Guides.
export const CLAIMS = [
  {
    claim: "“Recyclable”",
    ok: "Recyclable where facilities exist for at least 60% of consumers; otherwise qualify it (“Check locally”).",
    avoid: "Putting the chasing arrows on a package that most people can't recycle.",
  },
  {
    claim: "“Made with recycled content”",
    ok: "“Box made with 70% post-consumer recycled fiber.” State the percentage and the component.",
    avoid: "“Recycled” with no percentage when only part of the package is recycled.",
  },
  {
    claim: "“Compostable”",
    ok: "“Commercially compostable. Certified to ASTM D6400. Facilities may not exist in your area.”",
    avoid: "“Compostable” alone when only industrial composting works and access is limited.",
  },
  {
    claim: "“Biodegradable / degradable”",
    ok: "Only with evidence it fully breaks down within one year after customary disposal.",
    avoid: "Using it for items that go to landfill, where little breaks down quickly.",
  },
  {
    claim: "“Eco-friendly” / “green”",
    ok: "Name the specific benefit: “30% less plastic than our previous bottle.”",
    avoid: "Broad, unqualified environmental benefit claims.",
  },
  {
    claim: "“Free of”",
    ok: "“PFAS-free” only if the item has no intentionally added PFAS and no more than trace amounts.",
    avoid: "Claiming “free of” a substance that was never used in that product category.",
  },
];

export const SOURCES = [
  { label: "FTC Green Guides (16 CFR 260)", url: "https://www.ftc.gov/legal-library/browse/rules/guides-use-environmental-marketing-claims-green-guides" },
  { label: "How2Recycle label designations", url: "https://how2recycle.info/labels" },
  { label: "APR Design Guide", url: "https://plasticsrecycling.org/apr-design-guide/" },
  { label: "CalRecycle SB 343", url: "https://calrecycle.ca.gov/wcs/sb343/" },
  { label: "NJDEP Recycled Content Law", url: "https://www.nj.gov/dep/dshw/recycled-content/" },
  { label: "Circular Action Alliance (EPR)", url: "https://www.circularactionalliance.org/" },
  { label: "Toxics in Packaging Clearinghouse", url: "https://toxicsinpackaging.org/" },
  { label: "European Commission – PPWR", url: "https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en" },
];
