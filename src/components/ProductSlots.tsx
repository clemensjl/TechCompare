import React, { useCallback, useRef, useState } from "react";
import { Category, Product, Slot } from "../types";
import { brandColorVar } from "../utils/brand";
import BrandModelPicker from "./BrandModelPicker";

interface ProductSlotsProps {
  slots: Slot[];
  category: Category;
  onProductSelect: (slotId: number, product: Product) => void;
  onProductRemove: (slotId: number) => void;
}

const ProductSlots: React.FC<ProductSlotsProps> = ({
  slots,
  category,
  onProductSelect,
  onProductRemove,
}) => {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  // Focus has to come back to the control that opened the dialog (WCAG 2.4.3).
  const triggerRef = useRef<HTMLElement | null>(null);

  const filledProductIds = slots
    .filter((s) => s.product !== null)
    .map((s) => s.product!.id);

  const openPicker = useCallback(
    (slotId: number, event: React.MouseEvent<HTMLButtonElement>) => {
      triggerRef.current = event.currentTarget;
      setActiveSlot(slotId);
    },
    []
  );

  const closePicker = useCallback(() => {
    setActiveSlot(null);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (activeSlot !== null) onProductSelect(activeSlot, product);
      setActiveSlot(null);
      triggerRef.current?.focus();
      triggerRef.current = null;
    },
    [activeSlot, onProductSelect]
  );

  const filledCount = filledProductIds.length;

  return (
    <>
      <section className="step-section fade-in-up" aria-labelledby="slots-heading">
        <div className="step-header">
          <h2 id="slots-heading" className="step-title">
            Fill the slots
          </h2>
          <p className="step-subtitle">
            Choose a {category.toLowerCase()} model for each slot. The comparison
            appears once two slots are filled.
          </p>
        </div>

        <div
          className="slots-grid"
          style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))` }}
          role="group"
          aria-labelledby="slots-heading"
        >
          {slots.map((slot, index) => {
            const product = slot.product;
            return (
              <div
                key={slot.id}
                className={`slot-card ${product ? "filled" : "empty"}`}
              >
                {!product ? (
                  <button
                    type="button"
                    className="slot-empty-btn"
                    onClick={(e) => openPicker(slot.id, e)}
                  >
                    <span className="slot-empty-icon" aria-hidden="true">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    <span className="slot-empty-label">Add product</span>
                    <span className="slot-number">Slot {index + 1}</span>
                  </button>
                ) : (
                  <div className="slot-filled-content">
                    <button
                      type="button"
                      className="slot-remove-btn"
                      onClick={() => onProductRemove(slot.id)}
                      aria-label={`Remove ${product.name} from slot ${index + 1}`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>

                    <span
                      className="brand-badge"
                      style={{ color: brandColorVar(product.brand) }}
                    >
                      <span
                        className="brand-dot"
                        style={{ background: "currentColor" }}
                        aria-hidden="true"
                      />
                      {product.brand}
                    </span>

                    <h3 className="slot-product-name">{product.name}</h3>
                    <span className="slot-product-meta">
                      {product.year}
                      {product.specs.price ? ` · ${product.specs.price}` : ""}
                    </span>

                    <button
                      type="button"
                      className="slot-change-btn"
                      onClick={(e) => openPicker(slot.id, e)}
                      aria-label={`Change the product in slot ${index + 1}, currently ${product.name}`}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* One small live region, so a change announces a sentence rather than
            the whole comparison table. */}
        <p className="slots-hint" role="status">
          {filledCount < 2
            ? `${filledCount} of ${slots.length} slots filled. Fill at least two to compare.`
            : `${filledCount} of ${slots.length} slots filled. Comparison is below.`}
        </p>
      </section>

      {activeSlot !== null && (
        <BrandModelPicker
          category={category}
          onSelect={handleProductSelect}
          onClose={closePicker}
          existingProductIds={filledProductIds}
        />
      )}
    </>
  );
};

export default ProductSlots;
