import React, { useCallback, useEffect, useRef, useState } from "react";
import { Category, Product, Slot } from "./types";
import { categoryConfigs, getCategoryConfig } from "./data/products";
import StepIndicator from "./components/StepIndicator";
import CategorySelector from "./components/CategorySelector";
import ProductCountSelector from "./components/ProductCountSelector";
import ProductSlots from "./components/ProductSlots";
import ComparisonTable from "./components/ComparisonTable";

const STEP_LABELS = ["Category", "Products", "Compare"];

function createSlots(count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, product: null }));
}

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const filledProducts = slots
    .filter((s) => s.product !== null)
    .map((s) => s.product!);
  const categoryConfig = selectedCategory
    ? getCategoryConfig(selectedCategory)
    : undefined;

  const transition = useCallback((fn: () => void) => {
    setIsTransitioning(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      fn();
      setIsTransitioning(false);
    }, 160);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const handleCategorySelect = useCallback(
    (category: Category) => {
      setSelectedCategory(category);
      setProductCount(null);
      setSlots([]);
      transition(() => setStep(2));
    },
    [transition]
  );

  const handleCountSelect = useCallback(
    (count: number) => {
      setProductCount(count);
      setSlots(createSlots(count));
      transition(() => setStep(3));
    },
    [transition]
  );

  const handleProductSelect = useCallback((slotId: number, product: Product) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, product } : slot))
    );
  }, []);

  const handleProductRemove = useCallback((slotId: number) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, product: null } : slot))
    );
  }, []);

  const goToStep = useCallback(
    (target: 1 | 2 | 3) => {
      if (target >= step) return;
      transition(() => {
        setStep(target);
        if (target === 1) {
          setSelectedCategory(null);
          setProductCount(null);
          setSlots([]);
        } else if (target === 2) {
          setProductCount(null);
          setSlots([]);
        }
      });
    },
    [step, transition]
  );

  // Scrolling to the results is a convenience, not a requirement, so it is
  // skipped for users who asked for reduced motion.
  useEffect(() => {
    if (filledProducts.length < 2 || !comparisonRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [filledProducts.length]);

  const showComparison =
    step === 3 && filledProducts.length >= 2 && Boolean(categoryConfig);

  return (
    <div className="app-root">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="header-logo" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h6v16H4zM14 4h6v9h-6z" />
              </svg>
            </span>
            <span className="header-title-group">
              <span className="header-title">SpecMatch</span>
              <span className="header-tagline">Side by side device specs</span>
            </span>
          </div>

          <nav className="header-breadcrumb" aria-label="Comparison steps">
            <ol className="breadcrumb-list">
              <li>
                <button
                  type="button"
                  className={`breadcrumb-item${step >= 1 ? " active" : ""}${step === 1 ? " current" : ""}`}
                  onClick={() => goToStep(1)}
                  disabled={step === 1}
                  aria-current={step === 1 ? "step" : undefined}
                >
                  {selectedCategory ?? "Category"}
                </button>
              </li>
              {step >= 2 && (
                <>
                  <li className="breadcrumb-sep" aria-hidden="true">
                    /
                  </li>
                  <li>
                    <button
                      type="button"
                      className={`breadcrumb-item active${step === 2 ? " current" : ""}`}
                      onClick={() => goToStep(2)}
                      disabled={step === 2}
                      aria-current={step === 2 ? "step" : undefined}
                    >
                      {productCount ? `${productCount} products` : "Products"}
                    </button>
                  </li>
                </>
              )}
              {step >= 3 && (
                <>
                  <li className="breadcrumb-sep" aria-hidden="true">
                    /
                  </li>
                  <li>
                    <span className="breadcrumb-item current" aria-current="step">
                      Compare
                    </span>
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </header>

      <main className="app-main" id="main-content">
        <div className="main-inner">
          <div className="step-indicator-wrapper">
            <StepIndicator currentStep={step} totalSteps={3} labels={STEP_LABELS} />
          </div>

          <div className={`step-content${isTransitioning ? " transitioning" : ""}`}>
            {step === 1 && (
              <CategorySelector
                categories={categoryConfigs}
                selected={selectedCategory}
                onSelect={handleCategorySelect}
              />
            )}

            {step === 2 && (
              <ProductCountSelector
                selected={productCount}
                onSelect={handleCountSelect}
              />
            )}

            {step === 3 && selectedCategory && (
              <ProductSlots
                slots={slots}
                category={selectedCategory}
                onProductSelect={handleProductSelect}
                onProductRemove={handleProductRemove}
              />
            )}
          </div>

          {showComparison && categoryConfig && (
            <div ref={comparisonRef} className="comparison-wrapper fade-in-up">
              <ComparisonTable
                products={filledProducts}
                categoryConfig={categoryConfig}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p className="footer-text">
          SpecMatch lists manufacturer specifications for reference only. Prices,
          availability and hardware revisions vary by region and change over time.
          Always confirm against the manufacturer before buying.
        </p>
      </footer>
    </div>
  );
};

export default App;
