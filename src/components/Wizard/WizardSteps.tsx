import React from 'react';
import { Languages, School, BookOpen, Layers, Sliders } from 'lucide-react';

interface WizardStepsProps {
  currentStepIndex: number; // 0 to 4
  onSelectStep: (index: number) => void;
  maxReachedStep: number;
}

const STEPS = [
  { id: 1, label: 'Medium', icon: Languages, desc: 'English / Hindi' },
  { id: 2, label: 'Class', icon: School, desc: 'Class 1 to 12' },
  { id: 3, label: 'Subject', icon: BookOpen, desc: 'NCERT Subjects' },
  { id: 4, label: 'Chapters', icon: Layers, desc: 'Chapter & Weight' },
  { id: 5, label: 'Settings', icon: Sliders, desc: 'Questions & Roster' },
];

export const WizardSteps: React.FC<WizardStepsProps> = ({
  currentStepIndex,
  onSelectStep,
  maxReachedStep,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs mb-6">
      <nav aria-label="Progress">
        <ol className="grid grid-cols-5 gap-2 sm:gap-3">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const isSelectable = idx <= maxReachedStep;

            return (
              <li key={step.id} className="relative">
                <button
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => isSelectable && onSelectStep(idx)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 border ${
                    isActive
                      ? 'bg-amber-50/80 border-amber-600 text-amber-900 shadow-xs ring-1 ring-amber-600'
                      : isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 text-slate-800 hover:bg-emerald-50 cursor-pointer'
                      : isSelectable
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer'
                      : 'bg-slate-50/60 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs sm:text-sm ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className="hidden sm:block overflow-hidden">
                    <p className="text-xs font-bold truncate leading-tight">{step.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{step.desc}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
