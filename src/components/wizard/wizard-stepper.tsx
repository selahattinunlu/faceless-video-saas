'use client';

import { WizardStep } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, Edit, Palette, Sparkles, Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

const STEPS: { id: WizardStep; label: string; icon: React.ElementType }[] = [
  { id: 'input', label: 'Input', icon: FileText },
  { id: 'scenes', label: 'Edit Scenes', icon: Edit },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'generating', label: 'Generate', icon: Sparkles },
];

const STEP_ORDER: WizardStep[] = ['input', 'scenes', 'style', 'generating'];

export function WizardStepper({ currentStep, onStepClick }: WizardStepperProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && index < currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 transition-colors',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-default'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground/50'
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4',
                    index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
