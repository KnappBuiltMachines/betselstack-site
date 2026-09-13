// components/Testimonial.js
// Single-testimonial section for the Betsel Stack home page.
// Uses the site's shared classes (section / container / eyebrow) so it
// inherits the global palette and spacing. Server-component safe.
//
// To add attribution later, pass props from page.js:
//   <Testimonial name="Dave R." company="Produce Processing Co." />

const DEFAULT_QUOTE =
  "Betsel Stack feels like it was built by a packaging engineer for packaging engineers. " +
  "The software is incredibly easy to use, and it helps me answer palletization questions in " +
  "minutes instead of hours. I\u2019ve been able to quickly test ideas, compare options, and make " +
  "better decisions without spending time building spreadsheets or hand calculations.";

export default function Testimonial({
  quote = DEFAULT_QUOTE,
  name = "",
  role = "Packaging Engineer",
  company = "",
  style = {},
}) {
  const credit = [name, role, company].filter(Boolean).join(", ");

  return (
    <section className="section" style={style}>
      <div className="container">
        <p className="eyebrow">From the field</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "8px minmax(0, 46rem)",
            gap: 28,
            alignItems: "start",
            marginTop: 28,
          }}
        >
          {/* Stacked segments echo the layers of a pallet build.
              `accent` sets the brand color; currentColor picks it up. */}
          <div
            className="accent"
            aria-hidden="true"
            style={{
              alignSelf: "stretch",
              minHeight: "8rem",
              borderRadius: 1,
              backgroundImage:
                "repeating-linear-gradient(to bottom, currentColor 0, currentColor 14px, transparent 14px, transparent 20px)",
            }}
          />
          <figure style={{ margin: 0 }}>
            <blockquote
              style={{
                margin: 0,
                fontSize: "clamp(1.1rem, 1.5vw + 0.8rem, 1.45rem)",
                lineHeight: 1.62,
                letterSpacing: "-0.005em",
              }}
            >
              {quote}
            </blockquote>
            <figcaption
              style={{
                marginTop: 24,
                fontSize: "0.95rem",
                lineHeight: 1.5,
                opacity: 0.7,
              }}
            >
              {credit}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
