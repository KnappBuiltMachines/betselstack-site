// app/software/page.js
// =============================================================================
// Replaces the ENTIRE contents of app/software/page.js.
//
// BEFORE THIS WORKS:
//   1. The demo video lives at /public/betsel-software-tour.mp4 with poster
//      /public/betsel-software-tour-poster.jpg. The <video> below points there.
//   2. Your existing screenshots stay where they are (/screenshots/*.jpg).
//
// NAV + FOOTER: this file is just the page body. Your site nav and footer come
// from app/layout.js, so they are NOT in here — they'll still show up. If after
// deploying you find your nav/footer disappeared, it means your OLD page.js had
// them inline; send it over and I'll add them back. (Easy fix, low risk.)
//
// WHAT'S NEW: only the two blocks marked  /* NEW ... */  below — the demo video
// and the 4-step flow ribbon. Everything else is your current page content.
// =============================================================================

export const metadata = {
  title: 'Stack Software',
  description:
    'See the Pallet Pattern Creator in action: build a pattern, check it in 3D, load the trailer, and export a report. Try it free for 7 days.',
};

export default function SoftwarePage() {
  return (
    <div className="bs-sw">
      <style
        dangerouslySetInnerHTML={{
          __html: `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

.bs-sw{
  --bg:#0b0c0e;--panel:#141619;--panel-2:#1b1d21;--line:#26282c;
  --line-amber:rgba(251,169,15,.22);
  --amber:#fba90f;--amber-deep:#f3870a;--green:#51c16d;
  --text:#ededee;--muted:#8d9199;--muted-2:#6b6f77;
  --mono:'JetBrains Mono',ui-monospace,Menlo,monospace;
  --disp:'Space Grotesk',system-ui,sans-serif;
  --body:'Inter',system-ui,sans-serif;
  background:var(--bg);color:var(--text);font-family:var(--body);line-height:1.6;
}
.bs-sw *{box-sizing:border-box}
.bs-sw a{color:inherit;text-decoration:none}
.bs-sw img,.bs-sw video{display:block;max-width:100%}
.bs-sw .wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.bs-sw .eyebrow{font-family:var(--mono);font-size:12px;font-weight:500;
  letter-spacing:.3em;text-transform:uppercase;color:var(--amber)}

/* hero */
.bs-sw .hero{padding:72px 0 46px;text-align:center}
.bs-sw .hero h1{font-family:var(--disp);font-weight:700;font-size:clamp(32px,5.5vw,54px);
  line-height:1.04;letter-spacing:-.02em;margin:16px auto 0;max-width:16ch}
.bs-sw .hero .lede{margin:20px auto 0;max-width:62ch;color:var(--muted);font-size:16.5px}
.bs-sw .hero .lede + .lede{margin-top:14px}
.bs-sw .cta-row{display:flex;gap:13px;justify-content:center;flex-wrap:wrap;margin-top:30px}
.bs-sw .btn{font-family:var(--mono);font-weight:500;font-size:14px;letter-spacing:.04em;
  padding:13px 21px;border-radius:9px;cursor:pointer;transition:.18s;
  display:inline-flex;align-items:center;gap:8px;border:1px solid transparent}
.bs-sw .btn-primary{background:var(--amber);color:#1a1205;font-weight:700;
  box-shadow:0 10px 30px -12px rgba(251,169,15,.6)}
.bs-sw .btn-primary:hover{background:#ffb724;transform:translateY(-1px)}
.bs-sw .btn-ghost{border-color:var(--line);color:var(--text);background:var(--panel)}
.bs-sw .btn-ghost:hover{border-color:var(--muted);background:var(--panel-2)}

/* NEW: video showcase */
.bs-sw .show{padding:18px 0 12px}
.bs-sw .show .head{text-align:center;max-width:60ch;margin:0 auto}
.bs-sw .show h2{font-family:var(--disp);font-weight:700;font-size:clamp(24px,3.6vw,36px);
  letter-spacing:-.015em;margin:12px 0 0}
.bs-sw .show .head p{color:var(--muted);font-size:16px;margin:14px auto 0;max-width:54ch}
.bs-sw .monitor{margin:30px auto 0;max-width:960px;border:1px solid var(--line);
  border-radius:14px;overflow:hidden;background:var(--panel);
  box-shadow:0 40px 120px -45px rgba(0,0,0,.85), 0 0 0 1px rgba(251,169,15,.06)}
.bs-sw .chrome{display:flex;align-items:center;gap:8px;padding:11px 16px;
  border-bottom:1px solid var(--line);background:#101214}
.bs-sw .dot{width:11px;height:11px;border-radius:50%}
.bs-sw .dot.r{background:#ef5f56}.bs-sw .dot.y{background:#f5bf4f}.bs-sw .dot.g{background:#62c554}
.bs-sw .chrome .title{margin-left:10px;font-family:var(--mono);font-size:11.5px;
  letter-spacing:.14em;color:var(--muted-2)}
.bs-sw .monitor video{width:100%;display:block;background:#000}

/* NEW: 4-step flow ribbon */
.bs-sw .flow{list-style:none;margin:34px auto 0;padding:0;max-width:1000px;
  display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.bs-sw .flow li{background:var(--panel);border:1px solid var(--line);border-radius:13px;
  padding:22px 20px;position:relative}
.bs-sw .flow .n{font-family:var(--mono);font-weight:700;font-size:13px;color:var(--amber);
  display:flex;align-items:center;gap:10px}
.bs-sw .flow .n::after{content:"";flex:1;height:1px;background:var(--line-amber)}
.bs-sw .flow h3{font-family:var(--disp);font-weight:600;font-size:18px;margin:14px 0 0;
  letter-spacing:-.01em}
.bs-sw .flow p{color:var(--muted);font-size:14px;margin:7px 0 0}
.bs-sw .flow .arrow{position:absolute;top:50%;right:-12px;transform:translateY(-50%);
  color:#3a3d42;font-size:18px;z-index:2}
@media(max-width:880px){.bs-sw .flow{grid-template-columns:repeat(2,1fr)} .bs-sw .flow .arrow{display:none}}
@media(max-width:520px){.bs-sw .flow{grid-template-columns:1fr}}

/* section scaffolding */
.bs-sw .section{padding:80px 0}
.bs-sw .sec-head{text-align:center;max-width:58ch;margin:0 auto}
.bs-sw .sec-head h2{font-family:var(--disp);font-weight:700;font-size:clamp(26px,4vw,38px);
  letter-spacing:-.015em;margin:12px 0 0}
.bs-sw .sec-head p{color:var(--muted);font-size:16px;margin:14px auto 0;max-width:56ch}

/* toolkit grid */
.bs-sw .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:44px}
.bs-sw .card{background:var(--panel);border:1px solid var(--line);border-radius:13px;
  padding:24px;transition:.2s}
.bs-sw .card:hover{border-color:var(--line-amber);transform:translateY(-2px)}
.bs-sw .card h4{font-family:var(--disp);font-weight:600;font-size:18px;margin:0}
.bs-sw .card p{color:var(--muted);font-size:14.5px;margin:9px 0 0}
@media(max-width:820px){.bs-sw .grid{grid-template-columns:1fr}}

/* deep-dive alternating sections */
.bs-sw .deep{display:flex;flex-direction:column;gap:26px;margin-top:46px}
.bs-sw .dive{display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:center;
  background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:32px}
.bs-sw .dive:nth-child(even) .dive-copy{order:2}
.bs-sw .dive:nth-child(even) .dive-media{order:1}
.bs-sw .dive .tag{font-family:var(--mono);font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--amber)}
.bs-sw .dive h3{font-family:var(--disp);font-weight:600;font-size:22px;margin:13px 0 0;
  letter-spacing:-.01em}
.bs-sw .dive .body{color:var(--muted);margin:12px 0 0;font-size:15.5px}
.bs-sw .dive .why{margin:16px 0 0;padding:13px 15px;border-left:2px solid var(--amber);
  background:rgba(251,169,15,.05);border-radius:0 8px 8px 0;font-size:14.5px}
.bs-sw .dive .why b{color:var(--amber);font-weight:600}
.bs-sw .dive-media{border:1px solid var(--line);border-radius:11px;overflow:hidden;
  background:#0e0f11;min-height:160px;box-shadow:0 24px 60px -32px rgba(0,0,0,.8)}
.bs-sw .dive-media img{width:100%;display:block}
.bs-sw .dive.full{grid-template-columns:1fr;text-align:center}
.bs-sw .dive.full .why{display:inline-block;text-align:left}
@media(max-width:820px){
  .bs-sw .dive{grid-template-columns:1fr;gap:22px;padding:24px}
  .bs-sw .dive:nth-child(even) .dive-copy,.bs-sw .dive:nth-child(even) .dive-media{order:0}
}

/* desktop vs mobile */
.bs-sw .duo{display:grid;grid-template-columns:1.15fr 1fr;gap:16px;margin-top:44px}
.bs-sw .ver{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:28px}
.bs-sw .ver.full{border-color:var(--line-amber);
  background:radial-gradient(500px 220px at 0% 0%, rgba(251,169,15,.09), transparent 70%),var(--panel)}
.bs-sw .ver .badge{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;padding:5px 10px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}
.bs-sw .ver.full .badge{background:var(--amber);border-color:var(--amber);color:#1a1205;font-weight:700}
.bs-sw .ver h3{font-family:var(--disp);font-weight:600;font-size:22px;margin:16px 0 0;letter-spacing:-.01em}
.bs-sw .ver p{color:var(--muted);font-size:15px;margin:10px 0 0}
.bs-sw .ver ul{margin:16px 0 0;padding:0;list-style:none}
.bs-sw .ver li{position:relative;padding-left:22px;color:var(--text);font-size:14.5px;margin-top:9px}
.bs-sw .ver li::before{content:"";position:absolute;left:2px;top:.62em;width:8px;height:8px;border-radius:2px;
  background:var(--amber)}
.bs-sw .ver:not(.full) li::before{background:var(--muted-2)}
.bs-sw .duo-note{text-align:center;color:var(--muted-2);font-size:14px;margin:22px auto 0;max-width:60ch}
@media(max-width:820px){.bs-sw .duo{grid-template-columns:1fr}}

/* trial CTA */
.bs-sw .trial{margin:18px 0 90px;border-radius:20px;border:1px solid var(--line-amber);
  background:radial-gradient(600px 300px at 50% -20%, rgba(251,169,15,.15), transparent 70%),var(--panel);
  text-align:center;padding:60px 28px}
.bs-sw .trial h2{font-family:var(--disp);font-weight:700;font-size:clamp(26px,4vw,42px);
  letter-spacing:-.02em;margin:14px 0 0}
.bs-sw .trial p{color:var(--muted);font-size:16.5px;margin:16px auto 0;max-width:50ch}
.bs-sw .trial .cta-row{margin-top:28px}
        `,
        }}
      />

      <main>
        {/* HERO (your existing copy) */}
        <section className="hero">
          <div className="wrap">
            <div className="eyebrow">Betsel Stack™</div>
            <h1>The Pallet Pattern Creator</h1>
            <p className="lede">
              Powerful packaging engineering, made practical. Betsel Stack helps
              packaging engineers create pallet patterns quickly, with layer planning,
              3D load checks, trailer loading, and engineering reports in one focused
              tool.
            </p>
            <p className="lede">
              Betsel Stack™ goes far beyond traditional Ti-Hi calculations. Create
              uniform patterns from a single case size or mixed-case patterns with
              several, use full, half, or quarter pallets or any custom footprint, and
              plan trailer loads for 53′ reefers, 53′ dry vans, 48′ trailers, or custom
              dimensions, without lengthy onboarding or enterprise-level complexity.
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="/signup">Start 7-day free trial →</a>
              <a className="btn btn-ghost" href="#watch">Watch the demo</a>
            </div>
          </div>
        </section>

        {/* ============ NEW BLOCK 1: DEMO VIDEO ============ */}
        <section className="show" id="watch">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">See it run</div>
              <h2>From case size to finished report</h2>
              <p>
                Watch a real pallet get built, checked in 3D, loaded into a trailer, and
                exported as a report — press play for the full guided tour.
              </p>
            </div>
            <div className="monitor">
              <div className="chrome">
                <span className="dot r" /><span className="dot y" /><span className="dot g" />
                <span className="title">PALLET PATTERN BUILDER — LIVE SESSION</span>
              </div>
              <video
                src="/betsel-software-tour.mp4"
                poster="/betsel-software-tour-poster.jpg"
                controls
                preload="metadata"
                playsInline
              />
            </div>

            {/* ============ NEW BLOCK 2: SIMPLE 4-STEP FLOW ============ */}
            <ol className="flow">
              <li>
                <div className="n">01</div>
                <h3>Enter your sizes</h3>
                <p>Type in your case and pallet dimensions. Imperial or metric.</p>
                <span className="arrow">→</span>
              </li>
              <li>
                <div className="n">02</div>
                <h3>Pick a pattern</h3>
                <p>Layouts ranked by efficiency, support, and stability. Choose the best one.</p>
                <span className="arrow">→</span>
              </li>
              <li>
                <div className="n">03</div>
                <h3>Check the load</h3>
                <p>Spin it in 3D, then fill the trailer and confirm it&rsquo;s balanced.</p>
                <span className="arrow">→</span>
              </li>
              <li>
                <div className="n">04</div>
                <h3>Send the report</h3>
                <p>Export a custom, branded report in one click.</p>
              </li>
            </ol>
          </div>
        </section>
        {/* ============ END NEW BLOCKS ============ */}

        {/* IN THE TOOLKIT (your existing content) */}
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">In the toolkit</div>
              <h2>Focused by design. Powerful where it matters.</h2>
              <p>
                Every tool is grounded in how packaging is actually designed,
                manufactured, warehoused, and shipped. Nothing you won&rsquo;t use.
              </p>
            </div>
            <div className="grid">
              <div className="card"><h4>Deeper customization</h4><p>Build patterns the way your spec demands, not the way a template forces.</p></div>
              <div className="card"><h4>Standard &amp; custom pallets</h4><p>Full 48×40, half, and quarter pallets, or any custom footprint up to oversized.</p></div>
              <div className="card"><h4>Real-time 3D</h4><p>Inspect the load and pattern from any angle before production.</p></div>
              <div className="card"><h4>Overhang &amp; height limits</h4><p>Set a maximum load height and see length and width overhang for every pattern.</p></div>
              <div className="card"><h4>Case Size Calculator</h4><p>Size a case from its primary package, flute, and count, then compare it on the pallet.</p></div>
              <div className="card"><h4>Custom reports</h4><p>Branded reports, custom-generated to meet your company&rsquo;s standards.</p></div>
            </div>
          </div>
        </section>

        {/* INSIDE THE SOFTWARE (your existing deep-dive) */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">See it in action</div>
              <h2>Inside the software</h2>
              <p>
                A look at the actual tools your team uses every day — from the pattern
                engine to layer-by-layer build maps.
              </p>
            </div>

            <div className="deep">
              <article className="dive">
                <div className="dive-copy">
                  <span className="tag">Pattern Engine</span>
                  <h3>The best pattern for your case, first</h3>
                  <p className="body">
                    Enter your case and pallet dimensions and Betsel Stack instantly
                    generates ranked layouts — each scored by cubic efficiency, case
                    support, and stability. You start from the best option, not a blank
                    screen.
                  </p>
                  <div className="why">
                    <b>Gives you time back —</b> No repetitive Ti-Hi math or manual
                    layouts. See the most efficient, most stable pattern for your exact
                    case in seconds.
                  </div>
                </div>
                <div className="dive-media">
                  <img src="/screenshots/builder.jpg" alt="Ranked pallet patterns with the best layout first" />
                </div>
              </article>

              <article className="dive">
                <div className="dive-copy">
                  <span className="tag">Layer Planning</span>
                  <h3>Plan every layer, down to the case</h3>
                  <p className="body">
                    Step through the load one layer at a time — including alternating and
                    interlocked layers — with exact case placement, orientation, and
                    dimensions called out.
                  </p>
                  <div className="why">
                    <b>Simplifies complexity —</b> Gives your crew a clear, repeatable
                    build map, with fewer mistakes and less rework on the floor.
                  </div>
                </div>
                <div className="dive-media">
                  <img src="/screenshots/layers-2d.jpg" alt="Plan every layer, down to the case" />
                </div>
              </article>

              <article className="dive">
                <div className="dive-copy">
                  <span className="tag">Uniform &amp; Mixed Loads</span>
                  <h3>One case size or several</h3>
                  <p className="body">
                    Build a uniform pallet from a single case size, or combine different
                    case sizes on one pallet, layer by layer. Either way, see the finished
                    unit load rendered in full 3D.
                  </p>
                  <div className="why">
                    <b>Built for real-world packaging —</b> Build and document the load
                    that actually ships, whether it&rsquo;s one SKU or several.
                  </div>
                </div>
                <div className="dive-media">
                  <img src="/screenshots/mixed-3d.jpg" alt="3D view of a pallet built from more than one case size" />
                </div>
              </article>

              <article className="dive">
                <div className="dive-copy">
                  <span className="tag">Trailer Loading</span>
                  <h3>Fill the trailer, keep it balanced</h3>
                  <p className="body">
                    Plan how pallets fit a 53′ reefer, 53′ dry van, 48′ trailer, or custom
                    trailer — with
                    live pallet counts, column-and-row layout, and a center-of-mass
                    balance check.
                  </p>
                  <div className="why">
                    <b>Built for real-world packaging —</b> Maximize every trailer and
                    cut freight cost per unit shipped.
                  </div>
                </div>
                <div className="dive-media">
                  <img src="/screenshots/truck-load.jpg" alt="Fill the trailer, keep it balanced" />
                </div>
              </article>

              <article className="dive full">
                <div className="dive-copy">
                  <span className="tag">Professional Output</span>
                  <h3>Export custom engineering reports</h3>
                  <p className="body">
                    Compose a custom report from 3D renders, 2D layer diagrams, and case,
                    pallet, and truck stats — then export a polished, branded Pallet
                    Pattern Engineering Report with dimensions, cubic efficiency, support,
                    stability, weight breakdowns, and truck loading. Custom-generated to
                    meet your company&rsquo;s standards and ready to print, email, or save.
                  </p>
                  <div className="why">
                    <b>Gives you time back —</b> No retyping numbers into spreadsheets.
                    Look professional, keep specs on file, and give every job a
                    documented paper trail.
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* DESKTOP VS MOBILE */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">Desktop &amp; mobile</div>
              <h2>Build at your desk. Check it on the line.</h2>
              <p>
                The desktop version is the full Pallet Pattern Creator. The mobile
                version is a companion for quick looks at your pallet patterns, on
                the go or down at the manufacturing line.
              </p>
            </div>
            <div className="duo">
              <article className="ver full">
                <span className="badge">Full version</span>
                <h3>Desktop</h3>
                <p>Everything you need to engineer, document, and ship the load.</p>
                <ul>
                  <li>Ranked uniform and mixed-case pallet patterns</li>
                  <li>Layer editor, 3D load view, and interlock control</li>
                  <li>Case Size Calculator and pallet comparison</li>
                  <li>Trailer loading with a center-of-mass check</li>
                  <li>Branded report builder and PDF export</li>
                </ul>
              </article>
              <article className="ver">
                <span className="badge">Mobile companion</span>
                <h3>Mobile</h3>
                <p>Your saved work in your pocket, for quick reviews away from your desk.</p>
                <ul>
                  <li>Open the patterns and reports you saved to the cloud</li>
                  <li>See the layer in 2D, or rotate the full load in 3D</li>
                  <li>Compare column stack and interlock</li>
                  <li>Run a quick pattern for a single case size</li>
                </ul>
              </article>
            </div>
            <p className="duo-note">
              Both are included in every plan and run in your browser. Open the mobile
              version on your phone from your account page; nothing to install.
            </p>
          </div>
        </section>

        {/* TRIAL CTA (your existing content) */}
        <section className="section" style={{ padding: 0 }}>
          <div className="wrap">
            <div className="trial">
              <div className="eyebrow">Get started</div>
              <h2>Start your 7-day free trial</h2>
              <p>
                Full access to the Pallet Pattern Creator — no credit card, no install,
                no onboarding call. Add a card whenever you are ready to keep going.
              </p>
              <div className="cta-row">
                <a className="btn btn-primary" href="/signup">Start free trial</a>
                <a className="btn btn-ghost" href="/pricing">See pricing</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
