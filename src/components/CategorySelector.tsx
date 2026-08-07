import React from "react";
import { Category, CategoryConfig } from "../types";
import { getProductsByCategory } from "../data/products";

interface CategorySelectorProps {
  categories: CategoryConfig[];
  selected: Category | null;
  onSelect: (category: Category) => void;
}

const ICON_PROPS = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const CategoryIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const icons: Record<string, React.ReactNode> = {
    smartphone: (
      <svg {...ICON_PROPS}>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
      </svg>
    ),
    tablet: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
      </svg>
    ),
    watch: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="6" />
        <polyline points="12 9.5 12 12 13.5 13.5" />
        <path d="M15.9 17.6l-.3 3a1.6 1.6 0 0 1-1.6 1.4h-4a1.6 1.6 0 0 1-1.6-1.4l-.3-3M8.1 6.4l.3-3A1.6 1.6 0 0 1 10 2h4a1.6 1.6 0 0 1 1.6 1.4l.3 3" />
      </svg>
    ),
    laptop: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="5" width="16" height="11" rx="1.5" />
        <path d="M2 19h20" />
      </svg>
    ),
    earbuds: (
      <svg {...ICON_PROPS}>
        <path d="M4 17v-5a8 8 0 0 1 16 0v5" />
        <path d="M20 18.5a2 2 0 0 1-2 2h-.5a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5H20zM4 18.5a2 2 0 0 0 2 2h.5A1.5 1.5 0 0 0 8 19v-3a1.5 1.5 0 0 0-1.5-1.5H4z" />
      </svg>
    ),
    monitor: (
      <svg {...ICON_PROPS}>
        <rect x="2" y="4" width="20" height="13" rx="1.5" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    smarthome: (
      <svg {...ICON_PROPS}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
        <path d="M9.5 15a3.5 3.5 0 0 1 5 0M11.4 17.6a1 1 0 0 1 1.2 0" />
      </svg>
    ),
  };

  return <>{icons[icon] ?? null}</>;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selected,
  onSelect,
}) => {
  return (
    <section className="step-section fade-in-up" aria-labelledby="category-heading">
      <div className="step-header">
        <h2 id="category-heading" className="step-title">
          What are you comparing?
        </h2>
        <p className="step-subtitle">
          Pick a category to see every model we hold specifications for.
        </p>
      </div>

      <div className="category-grid" role="group" aria-labelledby="category-heading">
        {categories.map((cat) => {
          const isSelected = selected === cat.id;
          const count = getProductsByCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isSelected}
              className={`category-card${isSelected ? " selected" : ""}`}
              onClick={() => onSelect(cat.id)}
            >
              <span className="category-icon">
                <CategoryIcon icon={cat.icon} />
              </span>
              <span className="category-text">
                <span className="category-label">{cat.label}</span>
                <span className="category-count">
                  {count} models · {cat.specFields.length} specs
                </span>
              </span>
              {isSelected && (
                <span className="category-check" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySelector;
