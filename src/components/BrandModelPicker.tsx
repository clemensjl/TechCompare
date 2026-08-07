import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Brand, Product } from "../types";
import { getProductsByBrandAndCategory } from "../data/products";
import { BRANDS, brandColorVar } from "../utils/brand";

interface BrandModelPickerProps {
  category: string;
  onSelect: (product: Product) => void;
  onClose: () => void;
  existingProductIds: string[];
}

const BrandLogo: React.FC<{ brand: Brand }> = ({ brand }) => {
  const logos: Record<Brand, React.ReactNode> = {
    Apple: (
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    ),
    Google: (
      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
    ),
    Samsung: (
      <path d="M19.125 0H4.875C2.182 0 0 2.182 0 4.875v14.25C0 21.818 2.182 24 4.875 24h14.25C21.818 24 24 21.818 24 19.125V4.875C24 2.182 21.818 0 19.125 0zM12 18.75c-3.722 0-6.75-3.028-6.75-6.75S8.278 5.25 12 5.25s6.75 3.028 6.75 6.75-3.028 6.75-6.75 6.75zm0-11.25c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5z" />
    ),
    Xiaomi: (
      <path d="M6.665 5.999A2.668 2.668 0 0 0 4 8.666v6.667a2.667 2.667 0 1 0 5.333 0V8.666A2.668 2.668 0 0 0 6.665 6zm10.666 0a2.668 2.668 0 0 0-2.666 2.667v6.667a2.667 2.667 0 1 0 5.332 0V8.666a2.668 2.668 0 0 0-2.666-2.667zm-5.333 0A2.668 2.668 0 0 0 9.333 8.666v6.667a2.667 2.667 0 1 0 5.333 0V8.666A2.668 2.668 0 0 0 11.998 6z" />
    ),
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {logos[brand]}
    </svg>
  );
};

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const BrandModelPicker: React.FC<BrandModelPickerProps> = ({
  category,
  onSelect,
  onClose,
  existingProductIds,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const requestClose = useCallback(() => {
    setIsVisible(false);
    window.setTimeout(onClose, 180);
  }, [onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsVisible(true);
      closeRef.current?.focus();
    });

    /**
     * Escape closes, Tab is trapped inside the dialog. Without the trap,
     * keyboard users tab straight out into the page behind the overlay.
     */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (!nodes.length) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [requestClose]);

  const handleProductSelect = (product: Product) => {
    setIsVisible(false);
    window.setTimeout(() => onSelect(product), 150);
  };

  const availableProducts = selectedBrand
    ? getProductsByBrandAndCategory(selectedBrand, category)
    : [];

  // Brands with stock first, so the picker never opens on a wall of dead ends.
  const brandsByAvailability = [...BRANDS].sort(
    (a, b) =>
      getProductsByBrandAndCategory(b, category).length -
      getProductsByBrandAndCategory(a, category).length
  );

  return (
    <div
      className={`modal-overlay${isVisible ? " visible" : ""}`}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        ref={panelRef}
        className={`modal-panel${isVisible ? " visible" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-header">
          <div className="modal-title-row">
            {selectedBrand && (
              <button
                type="button"
                className="modal-back-btn"
                onClick={() => setSelectedBrand(null)}
                aria-label="Back to brand selection"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <h2 id={titleId} className="modal-title">
              {selectedBrand ? `${selectedBrand} ${category}` : `Select a brand`}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="modal-close-btn"
            onClick={requestClose}
            aria-label="Close product picker"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {!selectedBrand ? (
            <div className="brand-grid">
              {brandsByAvailability.map((brand) => {
                const count = getProductsByBrandAndCategory(brand, category).length;
                const color = brandColorVar(brand);

                return (
                  <button
                    key={brand}
                    type="button"
                    disabled={count === 0}
                    className="brand-card"
                    onClick={() => setSelectedBrand(brand)}
                  >
                    <span className="brand-logo" style={{ color }}>
                      <BrandLogo brand={brand} />
                    </span>
                    <span className="brand-text">
                      <span className="brand-name">{brand}</span>
                      <span className="brand-count">
                        {count === 0
                          ? `No ${category.toLowerCase()}`
                          : `${count} model${count > 1 ? "s" : ""}`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <ul className="model-list">
              {availableProducts.map((product) => {
                const isAlreadyAdded = existingProductIds.includes(product.id);
                const color = brandColorVar(product.brand);

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      disabled={isAlreadyAdded}
                      className="model-card"
                      style={{ width: "100%" }}
                      onClick={() => handleProductSelect(product)}
                    >
                      <span className="model-info">
                        <span className="model-brand-badge" style={{ color }}>
                          <BrandLogo brand={product.brand} />
                        </span>
                        <span className="model-text">
                          <span className="model-name">{product.name}</span>
                          <span className="model-meta">
                            <span>{product.year}</span>
                            {typeof product.score === "number" && (
                              <span>Score {product.score}</span>
                            )}
                            {product.badge && (
                              <span className="model-badge-tag">{product.badge}</span>
                            )}
                          </span>
                        </span>
                      </span>

                      {isAlreadyAdded ? (
                        <span className="model-added-tag">Added</span>
                      ) : (
                        product.specs.price && (
                          <span className="model-price">
                            {String(product.specs.price)}
                          </span>
                        )
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandModelPicker;
