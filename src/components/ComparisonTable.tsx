import React, { useEffect, useRef, useState } from "react";
import { Product, CategoryConfig } from "../types";

interface ComparisonTableProps {
  products: Product[];
  categoryConfig: CategoryConfig;
}

const brandAccentColors: Record<string, string> = {
  Apple:   "#1d1d1f",
  Google:  "#4285F4",
  Samsung: "#1428A0",
  Xiaomi:  "#FF6900",
};

const brandBgColors: Record<string, string> = {
  Apple:   "rgba(29,29,31,0.08)",
  Google:  "rgba(66,133,244,0.09)",
  Samsung: "rgba(20,40,160,0.09)",
  Xiaomi:  "rgba(255,105,0,0.09)",
};

const badgeColors: Record<string, { bg: string; color: string; border: string }> = {
  "Editor's Pick": { bg: "rgba(0,122,255,0.10)", color: "#007AFF", border: "rgba(0,122,255,0.20)" },
  "Best Value":    { bg: "rgba(52,199,89,0.10)",  color: "#34C759", border: "rgba(52,199,89,0.20)" },
  "New":           { bg: "rgba(255,149,0,0.10)",  color: "#FF9500", border: "rgba(255,149,0,0.20)" },
};

function highlightBestValue(
  values: (string | number | null)[],
  field: { key: string; higherIsBetter?: boolean; lowerIsBetter?: boolean }
): boolean[] {
  if (!field.higherIsBetter && !field.lowerIsBetter) return values.map(() => false);

  const nums = values.map((v) => {
    if (v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(/[^\d.-]/g, ""));
    return isNaN(n) ? null : n;
  });

  const valid = nums.filter((n): n is number => n !== null);
  if (valid.length < 2) return values.map(() => false);

  const best = field.higherIsBetter
    ? Math.max(...valid)
    : Math.min(...valid);

  return nums.map((n) => n === best);
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  products,
  categoryConfig,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    setVisibleRows(new Set());
    setHeaderVisible(false);
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, [products, categoryConfig]);

  useEffect(() => {
    if (!headerVisible) return;
    const timeout = setTimeout(() => {
      categoryConfig.specFields.forEach((_, index) => {
        setTimeout(() => {
          setVisibleRows((prev) => new Set([...prev, index]));
        }, index * 38);
      });
    }, 220);
    return () => clearTimeout(timeout);
  }, [headerVisible, categoryConfig]);

  const filled = products.filter(Boolean);

  return (
    <section
      className="comparison-section"
      aria-labelledby="comparison-heading"
      ref={tableRef}
    >
      <div className="comparison-section-header">
        <h2 id="comparison-heading" className="comparison-title">
          Comparison Results
        </h2>
        <p className="comparison-subtitle">
          {filled.length} {filled.length === 1 ? "product" : "products"} · {categoryConfig.specFields.length} specifications
        </p>
      </div>

      <div
        className="comparison-table-wrapper"
        role="region"
        aria-label="Product specifications comparison table"
        tabIndex={0}
      >
        <table
          className="comparison-table"
          aria-label={`Comparing ${filled.map((p) => p.name).join(", ")}`}
        >
          <thead>
            <tr>
              <th
                scope="col"
                className={`table-spec-header ${headerVisible ? "visible" : ""}`}
                aria-label="Specification name"
              >
                Specification
              </th>
              {filled.map((product, pIdx) => {
                const accentColor = brandAccentColors[product.brand] || "#888";
                const bgColor = brandBgColors[product.brand] || "rgba(0,0,0,0.05)";
                const badge = product.badge ? badgeColors[product.badge] : null;
                return (
                  <th
                    key={product.id}
                    scope="col"
                    className={`table-product-header ${headerVisible ? "visible" : ""}`}
                    style={{
                      transitionDelay: `${pIdx * 0.09}s`,
                      borderTop: `3px solid ${accentColor}`,
                      background: bgColor,
                    }}
                  >
                    <div className="product-header-content">
                      <span
                        className="product-header-brand"
                        style={{ color: accentColor }}
                      >
                        {product.brand}
                      </span>
                      <span className="product-header-name">{product.name}</span>
                      <span className="product-header-year">{product.year}</span>
                      {product.specs.price && (
                        <span
                          className="product-header-price"
                          aria-label={`Price: ${product.specs.price}`}
                        >
                          {product.specs.price as string}
                        </span>
                      )}
                      {badge && product.badge && (
                        <span
                          className="product-header-badge"
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `0.5px solid ${badge.border}`,
                          }}
                        >
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {categoryConfig.specFields.map((field, rowIdx) => {
              const values = filled.map((p) => p.specs[field.key] ?? null);
              const bestFlags = highlightBestValue(values, field);
              const isRowVisible = visibleRows.has(rowIdx);
              const isEven = rowIdx % 2 === 0;

              return (
                <tr
                  key={field.key}
                  className={`table-row ${isEven ? "even" : "odd"} ${isRowVisible ? "visible" : ""}`}
                  style={{ transitionDelay: `${rowIdx * 0.015}s` }}
                >
                  <th scope="row" className="table-spec-label">
                    {field.label}
                    {field.unit && (
                      <span className="spec-unit">({field.unit})</span>
                    )}
                  </th>
                  {values.map((value, vIdx) => {
                    const isBest = bestFlags[vIdx];
                    const displayValue =
                      value === null || value === "" ? "—" : String(value);
                    const isMissing = displayValue === "—";

                    return (
                      <td
                        key={`${field.key}-${vIdx}`}
                        className={[
                          "table-spec-value",
                          isBest ? "best-value" : "",
                          isMissing ? "missing-value" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-label={`${field.label} for ${filled[vIdx]?.name}: ${displayValue}`}
                      >
                        {isBest && !isMissing && (
                          <span className="best-badge" aria-label="Best value">
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 12 12"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M6 1L7.5 4.2L11 4.7L8.5 7.1L9.1 10.6L6 8.9L2.9 10.6L3.5 7.1L1 4.7L4.5 4.2z" />
                            </svg>
                          </span>
                        )}
                        <span className="value-text">{displayValue}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="table-legend" aria-label="Table legend">
        <span className="legend-item">
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6 1L7.5 4.2L11 4.7L8.5 7.1L9.1 10.6L6 8.9L2.9 10.6L3.5 7.1L1 4.7L4.5 4.2z" />
          </svg>
          Best value in category
        </span>
        <span className="legend-sep" aria-hidden="true">·</span>
        <span className="legend-item">— data not available</span>
      </p>
    </section>
  );
};

export default ComparisonTable;
