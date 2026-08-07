import React from "react";

interface ProductCountSelectorProps {
  selected: number | null;
  onSelect: (count: number) => void;
}

const counts = [
  { value: 2, label: "Two products", description: "Head to head, widest columns" },
  { value: 3, label: "Three products", description: "The usual shortlist" },
  { value: 4, label: "Four products", description: "Full field, scrolls sideways" },
];

const ProductCountSelector: React.FC<ProductCountSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <section className="step-section fade-in-up" aria-labelledby="count-heading">
      <div className="step-header">
        <h2 id="count-heading" className="step-title">
          How many side by side?
        </h2>
        <p className="step-subtitle">
          Fewer columns means more room per specification. You can change this
          later from the breadcrumb.
        </p>
      </div>

      <div className="count-grid" role="group" aria-labelledby="count-heading">
        {counts.map(({ value, label, description }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              className={`count-card${isSelected ? " selected" : ""}`}
              onClick={() => onSelect(value)}
            >
              <span className="count-number" aria-hidden="true">
                {value}
              </span>
              <span className="count-text">
                <span className="count-label">{label}</span>
                <span className="count-description">{description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ProductCountSelector;
