'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="flex items-center justify-center space-x-2 rounded-full glassmorphic p-2 md:space-x-4"
      >
        {steps.map((step, stepIdx) => (
          <li key={step.title} className="flex-1">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-y-2 border-primary py-2 transition-colors md:flex-row md:gap-x-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                stepIdx < currentStep
                  ? 'border-primary'
                  : stepIdx === currentStep
                    ? 'border-primary'
                    : 'border-muted'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition',
                  stepIdx < currentStep
                    ? 'bg-primary'
                    : stepIdx === currentStep
                      ? 'border-2 border-primary bg-primary/20'
                      : 'border-2 border-border bg-card'
                )}
              >
                {stepIdx < currentStep ? (
                  <Check className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <span
                    className={cn(
                      'font-bold',
                      stepIdx === currentStep
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {stepIdx + 1}
                  </span>
                )}
              </span>
              <span className="text-center text-sm font-medium">
                <span
                  className={cn(
                    'hidden md:block',
                    stepIdx === currentStep
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </span>
            </div>
            {stepIdx !== steps.length - 1 ? (
              <div
                className={cn(
                  'absolute left-0 top-1/2 -mt-px h-0.5 w-full md:hidden',
                  stepIdx < currentStep ? 'bg-primary' : 'bg-border'
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
