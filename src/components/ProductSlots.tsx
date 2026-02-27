import React from "react";
import { Slot, Product, Category } from "../types";
import BrandModelPicker from "./BrandModelPicker";

interface ProductSlotsProps {
  slots: Slot[];
  category: Category;
  onProductSelect: (slotId: number, product: Product) => void;
  onProductRemove: (slotId: number) => void;
}

const BrandBadge: React.FC<{ brand: string }> = ({ brand }) => {
  const colors: Record<string, string> = {
    Apple: "#555",
    Google: "#4285F4",
    Samsung: "#1428A0",
    Xiaomi: "#FF6900",
  };
  return (
    <span
      className="brand-badge"
      style={{ backgroundColor: colors[brand] || "#888" }}
      aria-label={`Brand: ${brand}`}
    >
      {brand}
    </span>
  );
};

const ProductSlots: React.FC<ProductSlotsProps> = ({
  slots,
  category,
  onProductSelect,
  onProductRemove,
}) => {
  const [activeSlot, setActiveSlot] = React.useState<number | null>(null);

  const filledProductIds = slots
    .filter((s) => s.product !== null)
    .map((s) => s.product!.id);

  const handleSlotClick = (slotId: number) => {
    setActiveSlot(slotId);
  };

  const handlePickerClose = () => {
    setActiveSlot(null);
  };

  const handleProductSelect = (product: Product) => {
    if (activeSlot !== null) {
      onProductSelect(activeSlot, product);
      setActiveSlot(null);
    }
  };

  return (
    <>
      <section
        className="step-section fade-in-up"
        aria-labelledby="slots-heading"
      >
        <div className="step-header">
          <h2 id="slots-heading" className="step-title">
            Select Products
          </h2>
          <p className="step-subtitle">
            Click each slot to choose a product for comparison
          </p>
        </div>

        <div
          className="slots-grid"
          style={{
            gridTemplateColumns: `repeat(${slots.length}, 1fr)`,
          }}
          role="group"
          aria-label="Product comparison slots"
        >
          {slots.map((slot, index) => {
            const isEmpty = slot.product === null;
            return (
              <div
                key={slot.id}
                className={`slot-card ${isEmpty ? "empty" : "filled"}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {isEmpty ? (
                  <button
                    className="slot-empty-btn"
                    onClick={() => handleSlotClick(slot.id)}
                    aria-label={`Slot ${index + 1}: Click to select a product`}
                  >
                    <div className="slot-empty-icon" aria-hidden="true">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <span className="slot-empty-label">Add Product</span>
                    <span className="slot-number">Slot {index + 1}</span>
                  </button>
                ) : (
                  <div className="slot-filled-content" aria-label={`Slot ${index + 1}: ${slot.product!.name}`}>
                    <button
                      className="slot-remove-btn"
                      onClick={() => onProductRemove(slot.id)}
                      aria-label={`Remove ${slot.product!.name} from slot ${index + 1}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <div className="slot-product-icon" aria-hidden="true">
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" />
                      </svg>
                    </div>
                    <BrandBadge brand={slot.product!.brand} />
                    <h3 className="slot-product-name">{slot.product!.name}</h3>
                    <span className="slot-product-year">{slot.product!.year}</span>
                    <button
                      className="slot-change-btn"
                      onClick={() => handleSlotClick(slot.id)}
                      aria-label={`Change product in slot ${index + 1}`}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filledProductIds.length < 2 && (
          <p className="slots-hint" role="status" aria-live="polite">
            Fill at least 2 slots to see the comparison table below
          </p>
        )}
      </section>

      {activeSlot !== null && (
        <BrandModelPicker
          category={category}
          onSelect={handleProductSelect}
          onClose={handlePickerClose}
          existingProductIds={filledProductIds}
        />
      )}
    </>
  );
};

export default ProductSlots;
