import React, { useState, useCallback, useRef, useEffect } from "react";
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

  const filledSlots = slots.filter((s) => s.product !== null);
  const filledProducts = filledSlots.map((s) => s.product!);
  const categoryConfig = selectedCategory ? getCategoryConfig(selectedCategory) : undefined;

  const transition = (fn: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      fn();
      setIsTransitioning(false);
    }, 220);
  };

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category);
    setProductCount(null);
    setSlots([]);
    transition(() => setStep(2));
  }, []);

  const handleCountSelect = useCallback((count: number) => {
    setProductCount(count);
    setSlots(createSlots(count));
    transition(() => setStep(3));
  }, []);

  const handleProductSelect = useCallback((slotId: number, product: Product) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, product } : slot
      )
    );
  }, []);

  const handleProductRemove = useCallback((slotId: number) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, product: null } : slot
      )
    );
  }, []);

  const goToStep = (target: 1 | 2 | 3) => {
    if (target < step) {
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
    }
  };

  useEffect(() => {
    if (filledProducts.length >= 2 && comparisonRef.current) {
      const timer = setTimeout(() => {
        comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [filledProducts.length]);

  return (
    <div className="app-root" aria-label="Product Comparison Tool">
      <header className="app-header" role="banner">
        <div className="header-content">
          <div className="header-brand">
            <div className="header-logo" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div className="header-title-group">
              <h1 className="header-title">SpecMatch</h1>
              <span className="header-tagline">Device Comparison</span>
            </div>
          </div>
          <nav className="header-breadcrumb" aria-label="Breadcrumb navigation">
            <ol className="breadcrumb-list">
              <li>
                <button
                  className={`breadcrumb-item ${step >= 1 ? "active" : ""} ${step === 1 ? "current" : ""}`}
                  onClick={() => goToStep(1)}
                  aria-current={step === 1 ? "page" : undefined}
                  aria-label="Go to category selection"
                >
                  {selectedCategory || "Category"}
                </button>
              </li>
              {step >= 2 && (
                <>
                  <li className="breadcrumb-sep" aria-hidden="true">/</li>
                  <li>
                    <button
                      className={`breadcrumb-item ${step >= 2 ? "active" : ""} ${step === 2 ? "current" : ""}`}
                      onClick={() => goToStep(2)}
                      aria-current={step === 2 ? "page" : undefined}
                      aria-label="Go to product count selection"
                    >
                      {productCount ? `${productCount} Products` : "Products"}
                    </button>
                  </li>
                </>
              )}
              {step >= 3 && (
                <>
                  <li className="breadcrumb-sep" aria-hidden="true">/</li>
                  <li>
                    <span className="breadcrumb-item current" aria-current="page">
                      Compare
                    </span>
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </header>

      <main className="app-main" id="main-content" role="main">
        <div className="main-inner">
          <div className="step-indicator-wrapper">
            <StepIndicator
              currentStep={step}
              totalSteps={3}
              labels={STEP_LABELS}
            />
          </div>

          <div
            className={`step-content ${isTransitioning ? "transitioning" : ""}`}
          >
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

          {step === 3 && filledProducts.length >= 2 && categoryConfig && (
            <div
              ref={comparisonRef}
              className="comparison-wrapper fade-in-up"
              aria-live="polite"
              aria-label="Comparison table updated"
            >
              <ComparisonTable
                products={filledProducts}
                categoryConfig={categoryConfig}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer" role="contentinfo">
        <p className="footer-text">
          SpecMatch — All specifications are for informational purposes only. 
          Prices and specs may vary by region and may change over time.
        </p>
      </footer>
    </div>
  );
};

export default App;
