import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepsProps {
  currentStepIndex: number; // 0 to 4
  type?: 'quiz' | 'poll';
  onSelectStep?: (stepIndex: number) => void;
}

export const WizardSteps: React.FC<WizardStepsProps> = ({
  currentStepIndex,
  type = 'quiz',
  onSelectStep,
}) => {
  const WIZARD_STEPS = [
    { step: 1, title: 'Language', subtitle: 'English' },
    { step: 2, title: 'Class', subtitle: 'NCERT Class 9' },
    { step: 3, title: 'Subject', subtitle: 'Science' },
    { step: 4, title: 'Chapters', subtitle: '3 Selected (100%)' },
    { step: 5, title: 'Settings', subtitle: `Live ${type === 'poll' ? 'Poll' : 'Quiz'}` },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs mb-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-3 flex items-center justify-between">
        <span>Question Paper Generation Wizard</span>
        <span className="text-slate-400 font-normal">Step {currentStepIndex + 1} of 5</span>
      </div>

      <div className="relative flex items-center justify-between max-w-4xl mx-auto px-2">
        {/* Connecting line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-[#4F3FE0] to-[#8B5CF6] transition-all duration-300 -z-0"
          style={{
            width: `${(currentStepIndex / (WIZARD_STEPS.length - 1)) * 90}%`,
          }}
        />

        {WIZARD_STEPS.map((stepItem, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={stepItem.step}
              onClick={() => onSelectStep && onSelectStep(index)}
              className={`relative z-10 flex flex-col items-center group cursor-pointer ${
                index > currentStepIndex ? 'opacity-70' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-200 border-2 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#4F3FE0] to-[#8B5CF6] border-transparent text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white border-[#4F3FE0] text-[#4F3FE0] ring-4 ring-amber-100 shadow-md scale-110'
                    : 'bg-white border-slate-300 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : stepItem.step}
              </div>

              <div className="text-center mt-2">
                <p
                  className={`text-xs font-semibold transition-colors ${
                    isCurrent ? 'text-amber-700 font-bold' : isCompleted ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {stepItem.title}
                </p>
                <p className="text-[10px] text-slate-500 hidden md:block mt-0.5">{stepItem.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
