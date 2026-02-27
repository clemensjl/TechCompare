import React from "react";

interface ProductCountSelectorProps {
  selected: number | null;
  onSelect: (count: number) => void;
}

const counts = [
  { value: 2, label: "2 Products", description: "Head-to-head comparison" },
  { value: 3, label: "3 Products", description: "Three-way comparison" },
  { value: 4, label: "4 Products", description: "Full market overview" },
];

const ProductCountSelector: React.FC<ProductCountSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <section className="step-section fade-in-up" aria-labelledby="count-heading">
      <div className="step-header">
        <h2 id="count-heading" className="step-title">
          Number of Products
        </h2>
        <p className="step-subtitle">
          How many products would you like to compare?
        </p>
      </div>
      <div className="count-grid" role="listbox" aria-label="Number of products to compare">
        {counts.map(({ value, label, description }, index) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              role="option"
              aria-selected={isSelected}
              className={`count-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelect(value)}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="count-number" aria-hidden="true">
                {value}
              </div>
              <div className="count-text">
                <span className="count-label">{label}</span>
                <span className="count-description">{description}</span>
              </div>
              {isSelected && (
                <div className="count-selected-indicator" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ProductCountSelector;
