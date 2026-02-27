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
    <nav
      aria-label="Progress steps"
      className="step-indicator"
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isUpcoming = stepNum > currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div className="step-item">
              <div
                className={`step-circle ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${isUpcoming ? "upcoming" : ""}`}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${stepNum}: ${labels[index]} - ${isCompleted ? "completed" : isActive ? "current" : "upcoming"}`}
              >
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7L5.5 10.5L12 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>
              <span className={`step-label ${isActive ? "active" : ""}`}>
                {labels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`step-connector ${isCompleted ? "completed" : ""}`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default StepIndicator;
