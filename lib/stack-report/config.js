// lib/stack-report/config.js
//
// Everything you'd want to tweak about The Stack Report lives here:
// the name, the tagline, which outside news sources feed the Industry Wire,
// and the keywords used to keep the Wire on-topic.
//
// To add a news source: add one object to WIRE_SOURCES. If a feed ever goes
// dead or starts erroring, the page simply skips it (check Vercel logs for
// "[wire]" lines to see which one).

export const REPORT = {
  name: "The Stack Report",
  path: "/stack-report",
  tagline: "Field notes on palletizing, packaging, and getting more product on every load.",
  description:
    "The Stack Report from Betsel Stack: articles on pallet patterns, Ti-Hi, case design, load stability and trailer utilization, plus a live wire of packaging and supply chain news.",
  // How often (seconds) the page rebuilds itself to pull fresh headlines and
  // release any scheduled posts. 3600 = hourly.
  refreshSeconds: 3600,
  author: "Betsel Stack",
};

// Outside sources for the Industry Wire.
//   filter: true  -> only keep headlines that match WIRE_KEYWORDS
//   filter: false -> the source is already on-topic, keep everything
//   max            -> most items to show from this source (keeps variety)
export const WIRE_SOURCES = [
  {
    name: "Packaging Dive",
    url: "https://www.packagingdive.com/feeds/news/",
    filter: false,
    max: 5,
  },
  {
    name: "Packaging Strategies",
    url: "https://www.packagingstrategies.com/rss/topic/3001-packaging-top-stories",
    filter: false,
    max: 4,
  },
  {
    name: "Supply Chain Dive",
    url: "https://www.supplychaindive.com/feeds/news/",
    filter: true,
    max: 4,
  },
  {
    name: "Manufacturing Dive",
    url: "https://www.manufacturingdive.com/feeds/news/",
    filter: true,
    max: 3,
  },
  // Google News searches pull stories from across the trade press that
  // mention exactly the things our users care about.
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=palletizing+OR+palletizer+OR+%22pallet+pattern%22+when:30d&hl=en-US&gl=US&ceid=US:en",
    filter: false,
    max: 5,
    useItemSource: true,
  },
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=%22corrugated%22+OR+%22unit+load%22+OR+%22stretch+wrap%22+when:30d&hl=en-US&gl=US&ceid=US:en",
    filter: true,
    max: 4,
    useItemSource: true,
  },
];

// A headline (or its summary) must contain at least one of these to pass a
// filtered source. Lowercase; partial words are fine ("palletiz" matches
// palletizing, palletizer, palletization).
export const WIRE_KEYWORDS = [
  "pallet",
  "palletiz",
  "packaging",
  "corrugat",
  "carton",
  "case pack",
  "unit load",
  "stretch wrap",
  "shrink wrap",
  "warehouse",
  "distribution center",
  "fulfillment",
  "truckload",
  "trailer",
  "freight",
  "load optimization",
  "end-of-line",
  "end of line",
  "robotic",
  "automation",
];

// Headlines containing any of these are dropped even if they match above.
export const WIRE_BLOCKLIST = ["sponsored", "webinar:", "podcast:", "obituary"];

// Total headlines shown on the page.
export const WIRE_LIMIT = 18;
