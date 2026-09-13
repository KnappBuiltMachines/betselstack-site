import Link from "next/link";

export const metadata = {
  title: "Pallet Pattern FAQ | Betsel Stack",
  description:
    "Answers to common questions about pallet patterns, Ti-Hi, mixed-case loads, trailer cube utilization, and browser-based pallet pattern software.",
};

// Single source of truth: the page copy and the FAQPage schema are both
// generated from this array, so they can never drift apart.
const GROUPS = [
  {
    heading: "Pallet patterns and palletization",
    eyebrow: "The fundamentals",
    items: [
      {
        q: "How do you calculate how many cases fit on a pallet?",
        a: [
          "Start with the pallet footprint and the case footprint, then divide the usable pallet area by the case area to find the theoretical maximum cases per layer. That number is an upper bound, not an answer \u2014 real layouts rarely reach it, because cases are rigid rectangles that leave unusable gaps.",
          "The practical calculation depends on how cases are oriented and arranged. A single case size can be placed lengthwise or crosswise, and layers can be built as column stacks, block patterns, brick patterns, or pinwheels \u2014 each producing a different count and a different stability profile. Overhang allowance, layer interlocking, and the maximum load height your operation permits all change the result.",
          "Because the combinations multiply quickly, the reliable method is to generate every viable arrangement and rank them, rather than working a single layout by hand. Betsel Stack produces dozens of ranked patterns from your case and pallet dimensions in seconds.",
        ],
      },
      {
        q: "What is Ti-Hi, and why is it not enough on its own?",
        a: [
          "Ti-Hi is shorthand for two numbers: Ti is the count of cases in one layer (a tier), and Hi is the number of layers stacked on the pallet. Multiplying them gives total cases per pallet, which is why Ti-Hi appears on most spec sheets and purchase orders.",
          "The limitation is that Ti-Hi describes a quantity, not a layout. Two patterns with identical Ti-Hi values can behave completely differently on a trailer \u2014 one interlocked and stable, the other a column stack that shifts in transit. Ti-Hi also assumes every layer is the same and every case shares one orientation, so it cannot describe interlocked layers, mixed orientations, or multi-SKU loads at all.",
          "For specification and ordering, Ti-Hi remains the right shorthand. For engineering the load, you need the actual pattern behind it.",
        ],
      },
      {
        q: "What are the standard pallet sizes used in North America?",
        a: [
          "The 48 x 40 inch GMA pallet is the dominant standard in North American grocery and consumer goods, and it is the footprint most case dimensions are designed around. It is typically a stringer or block pallet roughly 5 to 6 inches tall.",
          "Other footprints appear in specific industries: 42 x 42 inches in paint and telecommunications, 48 x 48 inches for drums, 44 x 44 inches in chemicals, and 36 x 36 inches in beverage. European operations commonly use the 1200 x 800 mm EUR pallet, which does not share the GMA footprint and produces different pattern math entirely.",
          "Custom and non-standard footprints are common in agricultural packing and specialized processing, where the pallet is chosen to suit the product rather than the other way around.",
        ],
      },
      {
        q: "How does pallet overhang affect load stability?",
        a: [
          "Overhang occurs when cases extend past the edge of the pallet deck. It is tempting because it raises cases per layer, but the cost is borne by the case below: corrugated boxes carry compression load almost entirely at their vertical corners, and a case whose corner is unsupported loses a large share of its stacking strength.",
          "Published compression testing consistently shows that even modest overhang produces a substantial reduction in stacking strength, with the loss growing sharply as overhang increases. The practical consequence is crushed bottom layers, leaning loads, and product damage claims that outweigh the extra cases gained.",
          "Some overhang is acceptable in many operations, but it should be a deliberate engineering decision with a known margin \u2014 not an accident of the pattern you happened to pick.",
        ],
      },
      {
        q: "What is a mixed-case pallet, and when do you need one?",
        a: [
          "A mixed-case pallet carries more than one case size or SKU on a single unit load, rather than a uniform stack of identical cases. It is the normal state of affairs in distribution center replenishment, store-level orders, retail-ready displays, and any operation shipping smaller quantities of many products.",
          "Mixed loads are considerably harder to plan than single-SKU loads, because case footprints differ, layers no longer repeat, and weight distribution and crush protection have to be managed across the stack \u2014 heavier and stronger cases low, lighter and more fragile cases high.",
          "Most legacy palletization tools handle single-SKU loads well and mixed loads poorly. Betsel Stack builds mixed-case loads layer by layer with different case sizes on the same pallet.",
        ],
      },
      {
        q: "How do you optimize pallet loads for trailer cube utilization?",
        a: [
          "Trailer utilization is decided by the pallet pattern, not by the loading crew. Freight is paid by the trailer, so an unused cubic foot is a cost whether or not anything occupies it \u2014 which means the pattern that maximizes cases per pallet is not always the pattern that maximizes cases per trailer.",
          "A standard 53-foot dry van holds 26 GMA pallets floor-loaded in a single tier, or 52 when loads are double-stacked. Working backward from those figures often reveals that a slightly shorter or narrower unit load ships more product per trailer than a taller one that cannot be double-stacked.",
          "The productive approach is to evaluate pattern and trailer fit together rather than in sequence. Betsel Stack models 53-foot reefers, dry vans, and custom trailer dimensions with live pallet counts and a balance check.",
        ],
      },
    ],
  },
  {
    heading: "Choosing pallet pattern software",
    eyebrow: "Comparisons",
    items: [
      {
        q: "What are the alternatives to TOPS Pro?",
        a: [
          "TOPS Pro is a long-established desktop palletization package, installed locally and licensed per workstation. It is capable software with a deep feature set, and for many large packaging departments it is the incumbent.",
          "Teams typically look for an alternative on cost, on the licensing and installation burden, or because they need access from more than one machine. Browser-based tools have become the common substitute, since they remove installation entirely and are reachable from any workstation.",
          "Betsel Stack is a browser-based alternative at $29 per month, with a 7-day free trial that does not require a credit card. It generates ranked pattern sets, supports mixed-case loads, renders loads in real-time 3D, and produces branded PDF reports.",
        ],
      },
      {
        q: "What are the alternatives to Cube-IQ?",
        a: [
          "Cube-IQ is a load-planning and container optimization package aimed at container and trailer loading as much as at pallet building, and it is likewise traditionally installed as desktop software.",
          "Buyers evaluating alternatives should be clear about which problem they are actually solving. If the need is container stuffing across many order lines, that is a load-planning problem. If the need is designing the unit load itself \u2014 case orientation, layer patterns, stability, overhang, reports \u2014 that is a palletization problem, and a pattern-focused tool will fit better.",
          "Betsel Stack focuses on the unit load: pattern generation, layer-by-layer planning, mixed-case builds, and trailer fit for the pallets it produces.",
        ],
      },
      {
        q: "Is there pallet pattern software that runs in a browser?",
        a: [
          "Yes. Betsel Stack runs entirely in the browser with nothing to install, no license key to manage, and no IT ticket to raise. Signing in from any machine gives you the same saved patterns, settings, and reports.",
          "This matters more than it sounds for engineers who move between a desk, a plant floor terminal, and a customer site. Desktop-licensed palletization software ties the tool to one workstation; browser-based software does not.",
        ],
      },
      {
        q: "Is there a free pallet pattern generator?",
        a: [
          "Free online pallet calculators exist and are genuinely useful for a quick cases-per-layer estimate on a single standard case. They generally stop there \u2014 no mixed-case loads, no custom pallet construction, no saved work, no stability assessment, and no report you can hand to a customer or put in a spec package.",
          "For one-off arithmetic, a free calculator is fine. For work that has to be defended, reproduced, and documented, it is not.",
          "Betsel Stack offers a 7-day free trial with full access and no credit card required, which is the practical way to find out whether a full tool is warranted.",
        ],
      },
    ],
  },
  {
    heading: "Using Betsel Stack",
    eyebrow: "The product",
    items: [
      {
        q: "What does Betsel Stack cost?",
        a: [
          "Betsel Stack is $29 per month, or $279 per year when paid annually \u2014 a 20 percent saving against the monthly rate. Both plans include full access to the Pallet Pattern Creator.",
          "Monthly subscriptions can be cancelled at any time. Annual prepayment is non-refundable, so the monthly plan is the lower-risk starting point if you are still evaluating.",
        ],
      },
      {
        q: "Is there a free trial, and does it require a credit card?",
        a: [
          "Yes, and no. The trial runs 7 days with full access to the software, and no credit card is required to start it. You add payment details only if you decide to continue.",
        ],
      },
      {
        q: "Do I need to install anything?",
        a: [
          "No. Betsel Stack runs entirely in the browser. There is nothing to download, install, or update, and no local license to administer.",
        ],
      },
      {
        q: "What can I export from Betsel Stack?",
        a: [
          "Patterns and load plans export as PDF reports, which can be branded and configured to match your company's documentation standards \u2014 suitable for spec packages, customer submissions, and floor instructions.",
          "Additional export formats, including spreadsheet output, are under consideration and available on request. If a specific format would make Betsel Stack fit your workflow, write to team@betselstack.com.",
        ],
      },
      {
        q: "Are there limits on pallet size or the number of case sizes in a load?",
        a: [
          "No. Pallet dimensions are fully configurable, from quarter pallets through oversized custom footprints, including deck board layout, stringer placement, and spacing. There is no fixed ceiling on the number of case sizes that can be combined in a mixed-case load.",
        ],
      },
      {
        q: "Who is Betsel Stack built for?",
        a: [
          "Packaging engineers and the teams around them \u2014 food and agricultural processing, co-packing, consumer goods manufacturing, distribution centers, and logistics groups who need to answer palletization questions accurately and document the answer.",
          "It was built by people working in packaging, automation, warehousing, and transportation, which is why it is organized around the questions those roles actually have to answer rather than around a generic optimization engine.",
        ],
      },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a.join(" "),
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* INTRO */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Questions &amp; answers</p>
          <h1 className="section-title" style={{ maxWidth: "28ch" }}>
            Pallet patterns, answered
          </h1>
          <p className="lead" style={{ maxWidth: "62ch" }}>
            Common questions about palletization, pattern design, and the
            software itself &mdash; from the basics of Ti-Hi through mixed-case
            loads and trailer cube utilization.
          </p>
        </div>
      </section>

      {/* GROUPS */}
      {GROUPS.map((group) => (
        <section
          className="section"
          style={{ paddingTop: 0 }}
          key={group.heading}
        >
          <div className="container">
            <p className="eyebrow">{group.eyebrow}</p>
            <h2 className="section-title">{group.heading}</h2>
            <div style={{ marginTop: 36, maxWidth: "68ch" }}>
              {group.items.map((item) => (
                <article
                  key={item.q}
                  style={{
                    paddingBottom: 36,
                    marginBottom: 36,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: 14 }}>{item.q}</h3>
                  {item.a.map((para, i) => (
                    <p
                      key={i}
                      style={{
                        marginTop: i === 0 ? 0 : 14,
                        marginBottom: 0,
                        lineHeight: 1.65,
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <p
              className="eyebrow"
              style={{ justifyContent: "center", display: "flex" }}
            >
              Still have a question
            </p>
            <h2>Try it against your own case dimensions</h2>
            <p>
              Seven days of full access, no credit card required. Or write to
              team@betselstack.com and ask directly.
            </p>
            <div className="cta-actions">
              <Link href="/signup" className="btn btn--primary">
                Start free trial
              </Link>
              <Link href="/software" className="btn btn--ghost">
                See the software
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
