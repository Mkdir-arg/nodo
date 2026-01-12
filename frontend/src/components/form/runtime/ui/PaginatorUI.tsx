import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  completed?: boolean;
}

interface PaginatorUIProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavButtons?: boolean;
}

export const PaginatorUI: React.FC<PaginatorUIProps> = ({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  showNavButtons = true,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="w-full">
      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.completed || index < currentStep;
          const isClickable = index < currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepChange(index)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                    ${isActive 
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900' 
                      : isCompleted
                        ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </button>
                <span className={`
                  mt-2 text-xs font-medium text-center
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-2 mb-6
                  ${index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Navigation buttons */}
      {showNavButtons && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Paso {currentStep + 1} de {steps.length}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={isLastStep}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
