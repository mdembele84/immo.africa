import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';

interface Step {
  name: string;
  path: string;
}

const steps: Step[] = [
  { name: 'Informations Personnelles', path: '/purchase/personal' },
  { name: 'Informations Professionnelles', path: '/purchase/professional' },
  { name: 'Résidence', path: '/purchase/residency' },
  { name: 'Vérification KYC', path: '/purchase/kyc' }
];

interface PurchaseStepsProps {
  kycStatus: 'not_started' | 'in_progress' | 'verified';
}

export function PurchaseSteps({ kycStatus }: PurchaseStepsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentStepIndex = steps.findIndex(step => step.path === location.pathname);

  const isStepDisabled = (stepPath: string) => {
    if (kycStatus === 'in_progress' || kycStatus === 'verified') {
      return true;
    }
    const stepIndex = steps.findIndex(step => step.path === stepPath);
    return stepIndex > currentStepIndex + 1;
  };

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, index) => {
          const isCurrent = location.pathname === step.path;
          const isCompleted = index < currentStepIndex;
          const disabled = isStepDisabled(step.path);

          return (
            <li key={step.name} className="md:flex-1">
              <button
                onClick={() => !disabled && navigate(step.path)}
                disabled={disabled}
                className={`group flex w-full items-center ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                <span className="flex items-center px-6 py-2 text-sm font-medium">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 mr-4">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    ) : isCurrent ? (
                      <Circle className="h-4 w-4 text-blue-600 fill-current" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}