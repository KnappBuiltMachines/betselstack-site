"use client";
// Renders a qualification plan document (from composeDocument) as HTML "paper".
// The PDF exporter draws from the exact same section model.

function Block({ b, secNum }) {
  if (b.type === "p") return <p className="qp-p">{b.text}</p>;
  if (b.type === "note") return <p className="qp-note">{b.text}</p>;
  if (b.type === "list") {
    const Tag = b.ordered ? "ol" : "ul";
    return (
      <Tag className="qp-list">
        {b.items.map((it, k) => (
          <li key={k}>{it}</li>
        ))}
      </Tag>
    );
  }
  if (b.type === "kv") {
    return (
      <table className="qp-kv">
        <tbody>
          {b.rows.map(([k, v]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (b.type === "table") {
    return (
      <div className="qp-table-wrap">
        <table className={`qp-table ${b.signature ? "qp-table--sign" : ""}`}>
          <thead>
            <tr>
              {b.columns.map((c) => (
                <th key={c.label} style={{ width: `${c.w}%` }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, k) => (
              <tr key={`${secNum}-${k}`}>
                {r.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

export default function DocumentView({ doc }) {
  const { header, sections } = doc;
  return (
    <article className="qp-paper">
      <header className="qp-paper__head">
        <div>
          <div className="qp-paper__eyebrow">Packaging Qualification Plan</div>
          <h1 className="qp-paper__title">{header.title}</h1>
        </div>
        <div className="qp-paper__id">
          <div className="qp-paper__num">{header.planNumber}</div>
          <div>Rev {header.revision} &middot; {header.date}</div>
        </div>
      </header>

      <table className="qp-kv qp-kv--grid">
        <tbody>
          {Array.from({ length: Math.ceil(header.kv.length / 2) }).map((_, r) => (
            <tr key={r}>
              {header.kv.slice(r * 2, r * 2 + 2).map(([k, v]) => (
                <FragmentKV key={k} k={k} v={v} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {sections.map((s) => (
        <section key={s.num} className="qp-sec">
          <h2>
            <span>{s.num}.</span> {s.title}
          </h2>
          {s.blocks.map((b, k) => (
            <Block key={k} b={b} secNum={s.num} />
          ))}
        </section>
      ))}
    </article>
  );
}

function FragmentKV({ k, v }) {
  return (
    <>
      <th>{k}</th>
      <td>{v}</td>
    </>
  );
}
