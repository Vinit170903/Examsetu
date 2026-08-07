import React from 'react';
import { Medium } from '../../types';
import { Languages, ArrowRight } from 'lucide-react';

interface Step1MediumProps {
  selectedMedium: Medium;
  onSelectMedium: (medium: Medium) => void;
  onNext: () => void;
}

export const Step1Medium: React.FC<Step1MediumProps> = ({
  selectedMedium,
  onSelectMedium,
  onNext,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
          <Languages className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Step 1 of 5</span>
          <h2 className="text-2xl font-bold text-slate-900">Select Medium of Instruction</h2>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-8 ml-12">
        Choose the language medium for generating the live classroom quiz paper.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <button
          type="button"
          onClick={() => onSelectMedium('English')}
          className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-40 cursor-pointer ${
            selectedMedium === 'English'
              ? 'border-amber-600 bg-amber-50/50 shadow-md shadow-amber-100 ring-2 ring-amber-600/20'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-2xl font-bold text-amber-700">English</span>
            {selectedMedium === 'English' && (
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Questions, option choices, and NCERT references formatted in English medium.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectMedium('Hindi')}
          className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-40 cursor-pointer ${
            selectedMedium === 'Hindi'
              ? 'border-amber-600 bg-amber-50/50 shadow-md shadow-amber-100 ring-2 ring-amber-600/20'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-2xl font-bold text-amber-700">हिन्दी (Hindi)</span>
            {selectedMedium === 'Hindi' && (
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            प्रश्नावली तथा विकल्प हिन्दी माध्यम में तैयार किए जाएंगे।
          </p>
        </button>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-600/20"
        >
          <span>Continue to Class Selection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
