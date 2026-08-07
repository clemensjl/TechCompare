import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  labels,
}) => {
  return (
    <nav aria-label="Progress">
      <ol className="step-indicator">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const state = isCompleted ? "completed" : isActive ? "active" : "upcoming";

          return (
            <React.Fragment key={stepNum}>
              <li
                className="step-item"
                aria-current={isActive ? "step" : undefined}
              >
                <span className={`step-circle ${state}`} aria-hidden="true">
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 7.2 5.5 10.2 11.5 3.8" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </span>
                <span className={`step-label${isActive ? " active" : ""}`}>
                  {labels[index]}
                </span>
                <span className="visually-hidden">
                  {`Step ${stepNum} of ${totalSteps}, ${
                    isCompleted ? "completed" : isActive ? "current step" : "not started"
                  }`}
                </span>
              </li>
              {index < totalSteps - 1 && (
                <li
                  className={`step-connector${isCompleted ? " completed" : ""}`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
