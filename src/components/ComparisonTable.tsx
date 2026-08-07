import React, { useEffect, useMemo, useState } from "react";
import { CategoryConfig, Product, SpecField, SpecValue } from "../types";
import { brandColorVar } from "../utils/brand";

interface ComparisonTableProps {
  products: Product[];
  categoryConfig: CategoryConfig;
}

/** First number in a spec value, or null when there is nothing to rank. */
function toNumber(value: SpecValue): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isNaN(n) ? null : n;
}

/**
 * Flags the best cell(s) in one spec row.
 *
 * A row only produces winners when it is rankable AND the values actually
 * differ. Flagging every cell when all four products score the same is noise,
 * not information, so that case returns no winners at all.
 */
export function findBestValues(values: SpecValue[], field: SpecField): boolean[] {
  const none = values.map(() => false);
  if (!field.higherIsBetter && !field.lowerIsBetter) return none;

  const numbers = values.map(toNumber);
  const present = numbers.filter((n): n is number => n !== null);
  if (present.length < 2) return none;

  const best = field.higherIsBetter ? Math.max(...present) : Math.min(...present);
  const worst = field.higherIsBetter ? Math.min(...present) : Math.max(...present);
  if (best === worst) return none;

  return numbers.map((n) => n !== null && n === best);
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  products,
  categoryConfig,
}) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const raf = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, [products, categoryConfig]);

  const { specFields, specGroups } = categoryConfig;

  /** Winner flags per spec row, plus a per-product tally of rows won. */
  const { flagsByKey, wins, rankableRows } = useMemo(() => {
    const flagsByKey = new Map<string, boolean[]>();
    const wins = products.map(() => 0);
    let rankableRows = 0;

    for (const field of specFields) {
      const values = products.map((p) => p.specs[field.key] ?? null);
      const flags = findBestValues(values, field);
      flagsByKey.set(field.key, flags);
      if (flags.some(Boolean)) {
        rankableRows++;
        flags.forEach((isBest, i) => {
          if (isBest) wins[i]++;
        });
      }
    }
    return { flagsByKey, wins, rankableRows };
  }, [products, specFields]);

  const maxWins = Math.max(...wins, 0);
  const leaders = products.filter((_, i) => wins[i] === maxWins && maxWins > 0);
  const verdict =
    leaders.length === 1
      ? `${leaders[0].name} takes the most measurable wins.`
      : leaders.length > 1 && leaders.length < products.length
        ? `${leaders.map((p) => p.name).join(" and ")} tie on measurable wins.`
        : null;

  /** Spec rows in display order, with group headings interleaved. */
  const rows = useMemo(() => {
    const byKey = new Map(specFields.map((f) => [f.key, f]));
    const out: Array<
      { kind: "group"; label: string } | { kind: "spec"; field: SpecField }
    > = [];

    if (specGroups?.length) {
      const seen = new Set<string>();
      for (const group of specGroups) {
        const fields = group.keys
          .map((k) => byKey.get(k))
          .filter((f): f is SpecField => Boolean(f));
        if (!fields.length) continue;
        out.push({ kind: "group", label: group.label });
        for (const field of fields) {
          out.push({ kind: "spec", field });
          seen.add(field.key);
        }
      }
      // Any field not covered by a group still has to show up.
      const leftovers = specFields.filter((f) => !seen.has(f.key));
      if (leftovers.length) {
        out.push({ kind: "group", label: "Other" });
        leftovers.forEach((field) => out.push({ kind: "spec", field }));
      }
      return out;
    }

    return specFields.map((field) => ({ kind: "spec" as const, field }));
  }, [specFields, specGroups]);

  return (
    <section className="comparison-section" aria-labelledby="comparison-heading">
      <div className="comparison-section-header">
        <h2 id="comparison-heading" className="comparison-title">
          Comparison Results
        </h2>
        <p className="comparison-subtitle">
          {products.length} products · {specFields.length} specifications ·{" "}
          {rankableRows} scored
        </p>
      </div>

      {verdict && (
        <p className="verdict">
          <span className="verdict-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12.5h12M4.5 12.5V7l3 2 1-5.5 2.5 4 2.5-1.5v6.5" />
            </svg>
          </span>
          <span className="verdict-text">
            <strong>{verdict}</strong>
            <span className="verdict-note">
              Scored on the {rankableRows} specification
              {rankableRows === 1 ? "" : "s"} that can be ranked numerically. The
              rest are listed for reference.
            </span>
          </span>
        </p>
      )}

      {/*
        tabIndex makes the scroll container reachable by keyboard so arrow keys
        can pan the table. role/aria-label give it a name in the a11y tree.
      */}
      <div
        className="comparison-table-wrapper"
        role="region"
        aria-label="Specification comparison table, scrolls horizontally"
        tabIndex={0}
      >
        <table className="comparison-table">
          <caption className="visually-hidden">
            {categoryConfig.label} specifications for{" "}
            {products.map((p) => p.name).join(", ")}. Cells marked "best" hold
            the strongest value in their row.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="table-spec-header">
                Specification
              </th>
              {products.map((product, i) => {
                const winRatio = rankableRows ? (wins[i] / rankableRows) * 100 : 0;
                const isLeader = maxWins > 0 && wins[i] === maxWins;
                return (
                  <th
                    key={product.id}
                    scope="col"
                    className={`table-product-header${revealed ? " visible" : ""}`}
                    style={{
                      // Brand colour is data encoding, applied via a variable so
                      // the same token drives border, label and dot.
                      ["--brand-color" as string]: brandColorVar(product.brand),
                      transitionDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="product-header-content">
                      <span className="product-header-brand">
                        <span
                          className="brand-dot"
                          style={{ background: "currentColor" }}
                          aria-hidden="true"
                        />
                        {product.brand}
                      </span>
                      <span className="product-header-name">{product.name}</span>
                      <span className="product-header-meta">
                        <span>{product.year}</span>
                        {typeof product.score === "number" && (
                          <span>Score {product.score}</span>
                        )}
                      </span>
                      {product.specs.price && (
                        <span className="product-header-price">
                          {String(product.specs.price)}
                        </span>
                      )}
                      {product.badge && (
                        <span className="product-header-badge">{product.badge}</span>
                      )}
                      {rankableRows > 0 && (
                        <span className="win-tally">
                          <span className="win-bar" aria-hidden="true">
                            <span
                              className="win-bar-fill"
                              style={{ width: `${winRatio}%` }}
                            />
                          </span>
                          <span
                            className={`win-count${isLeader ? " leader" : ""}`}
                          >
                            {wins[i]}/{rankableRows} best
                          </span>
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              if (row.kind === "group") {
                return (
                  <tr key={`group-${row.label}`} className="spec-group-row">
                    <th scope="colgroup" colSpan={1}>
                      {row.label}
                    </th>
                    <td colSpan={products.length} />
                  </tr>
                );
              }

              const { field } = row;
              const flags = flagsByKey.get(field.key) ?? [];

              return (
                <tr
                  key={field.key}
                  className={`table-row${revealed ? " visible" : ""}`}
                  style={{ transitionDelay: `${Math.min(rowIdx, 24) * 16}ms` }}
                >
                  <th scope="row" className="table-spec-label">
                    {field.label}
                    {field.unit && <span className="spec-unit">{field.unit}</span>}
                  </th>
                  {products.map((product, i) => {
                    const raw = product.specs[field.key] ?? null;
                    const isMissing = raw === null || raw === "";
                    const isBest = Boolean(flags[i]) && !isMissing;

                    return (
                      <td
                        key={`${field.key}-${product.id}`}
                        className={[
                          "table-spec-value",
                          field.isNumeric ? "numeric" : "",
                          isBest ? "best-value" : "",
                          isMissing ? "missing-value" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span className="value-text">
                          {isMissing ? "Not available" : String(raw)}
                        </span>
                        {isBest && (
                          // Text label, not colour alone (WCAG 1.4.1)
                          <span className="best-flag">Best</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="table-legend">
        <span className="legend-item">
          <span className="legend-swatch" aria-hidden="true" />
          Best value in that row
        </span>
        <span className="legend-item">
          Rows where every product scores the same are left unmarked
        </span>
      </p>
    </section>
  );
};

export default ComparisonTable;
