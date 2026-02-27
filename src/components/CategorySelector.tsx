import React from "react";
import { Category, CategoryConfig } from "../types";

interface CategorySelectorProps {
  categories: CategoryConfig[];
  selected: Category | null;
  onSelect: (category: Category) => void;
}

const CategoryIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const icons: Record<string, React.ReactNode> = {
    smartphone: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" />
      </svg>
    ),
    tablet: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" />
      </svg>
    ),
    watch: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <polyline points="12 9 12 12 13.5 13.5" />
        <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" />
      </svg>
    ),
    laptop: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
      </svg>
    ),
    earbuds: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  };

  return <>{icons[icon] || null}</>;
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
          Choose a Category
        </h2>
        <p className="step-subtitle">
          Select the type of product you want to compare
        </p>
      </div>
      <div className="category-grid" role="listbox" aria-label="Product categories">
        {categories.map((cat, index) => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              role="option"
              aria-selected={isSelected}
              className={`category-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelect(cat.id)}
              style={{ animationDelay: `${index * 0.07}s` }}
            >
              <div className="category-icon">
                <CategoryIcon icon={cat.icon} />
              </div>
              <span className="category-label">{cat.label}</span>
              {isSelected && (
                <span className="category-check" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
                    <path d="M4 8L6.5 10.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
