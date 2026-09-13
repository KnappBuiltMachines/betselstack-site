// components/Testimonial.js
// Single-testimonial section for the Betsel Stack home page.
// Server-component safe (no hooks, no browser APIs) — drop it into app/page.js.
//
// To change the quote or attribution, edit the defaults below or pass props:
//   <Testimonial quote="..." name="Jane Doe" role="Packaging Engineer" company="Acme Foods" />

const DEFAULT_QUOTE =
  "Betsel Stack feels like it was built by a packaging engineer for packaging engineers. " +
  "The software is incredibly easy to use, and it helps me answer palletization questions in " +
  "minutes instead of hours. I've been able to quickly test ideas, compare options, and make " +
  "better decisions without spending time building spreadsheets or hand calculations.";

const styles = `
.bs-testimonial {
  --bs-t-accent: var(--accent, #7aa7d9);
  --bs-t-text: var(--text, #e8eaed);
  --bs-t-muted: var(--muted, #9aa3ad);
  padding: 5.5rem 1.5rem;
}

.bs-testimonial__inner {
  max-width: 46rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 2rem;
  align-items: start;
}

/* Stacked segments echo the layers of a pallet build. */
.bs-testimonial__rule {
  height: 100%;
  min-height: 9rem;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--bs-t-accent) 0,
    var(--bs-t-accent) 14px,
    transparent 14px,
    transparent 20px
  );
  opacity: 0.85;
  border-radius: 1px;
}

.bs-testimonial__quote {
  margin: 0;
  color: var(--bs-t-text);
  font-size: clamp(1.15rem, 1.6vw + 0.85rem, 1.5rem);
  line-height: 1.62;
  letter-spacing: -0.005em;
  text-wrap: pretty;
}

.bs-testimonial__attribution {
  margin: 1.75rem 0 0;
  color: var(--bs-t-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  font-style: normal;
}

.bs-testimonial__name {
  color: var(--bs-t-text);
  font-weight: 600;
}

@media (max-width: 640px) {
  .bs-testimonial {
    padding: 3.5rem 1.25rem;
  }
  .bs-testimonial__inner {
    grid-template-columns: 6px 1fr;
    gap: 1.25rem;
  }
  .bs-testimonial__rule {
    min-height: 0;
  }
}
`;

export default function Testimonial({
  quote = DEFAULT_QUOTE,
  name = "",
  role = "Packaging Engineer",
  company = "",
}) {
  const credit = [name, role, company].filter(Boolean);

  return (
    <section className="bs-testimonial" aria-label="Customer testimonial">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="bs-testimonial__inner">
        <div className="bs-testimonial__rule" aria-hidden="true" />
        <figure style={{ margin: 0 }}>
          <blockquote className="bs-testimonial__quote">{quote}</blockquote>
          <figcaption className="bs-testimonial__attribution">
            {name ? <span className="bs-testimonial__name">{name}</span> : null}
            {name && credit.length > 1 ? ", " : null}
            {credit.filter((c) => c !== name).join(", ")}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
