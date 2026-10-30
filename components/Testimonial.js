// components/Testimonial.js
// "From the field" review card for the Betsel Stack home page.
// Styled by app/home.css (tm- classes). Server-component safe.
//
// To add attribution later, pass props from page.js:
//   <Testimonial name="Dave R." company="Produce Processing Co." />

const DEFAULT_QUOTE =
  "Betsel Stack feels like it was built by a packaging engineer for packaging engineers. " +
  "The software is incredibly easy to use, and it helps me answer palletization questions in " +
  "minutes instead of hours. I’ve been able to quickly test ideas, compare options, and make " +
  "better decisions without spending time building spreadsheets or hand calculations.";

function Stars({ rating = 5 }) {
  return (
    <div className="tm-stars" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" width="22" height="22" aria-hidden="true" className={i < rating ? "" : "tm-off"}>
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonial({
  quote = DEFAULT_QUOTE,
  name = "",
  role = "Packaging Engineer",
  company = "",
  rating = 5,
}) {
  const initials = (name || role)
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="hm-section tm" aria-labelledby="tm-title">
      <div className="container">
        <div className="hm-head hm-head--center">
          <p className="hm-tag" id="tm-title">From the field</p>
          <h2 className="hm-h2">
            Questions that took hours.
            <span className="hm-dim">Answered in minutes.</span>
          </h2>
        </div>
        <figure className="tm-card">
          <svg className="tm-mark" viewBox="0 0 48 36" aria-hidden="true">
            <path d="M0 36V22C0 9.6 6.6 2.2 18 0l2 5.4C13.4 7.6 10.4 11.6 10 18h9v18H0Zm28 0V22C28 9.6 34.6 2.2 46 0l2 5.4C41.4 7.6 38.4 11.6 38 18h9v18H28Z" fill="currentColor" />
          </svg>
          <Stars rating={rating} />
          <blockquote className="tm-quote">{quote}</blockquote>
          <figcaption className="tm-by">
            <span className="tm-avatar" aria-hidden="true">{initials}</span>
            <span>
              {name && <b>{name}</b>}
              <span className={name ? "tm-role" : "tm-role tm-role--solo"}>
                {[role, company].filter(Boolean).join(", ")}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
