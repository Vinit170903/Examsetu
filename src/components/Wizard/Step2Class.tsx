import React from 'react';
import { CLASSES_LIST } from '../../data/ncertData';
import { School, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step2ClassProps {
  selectedClassId: string;
  allowedClasses: string[];
  onSelectClass: (classId: string, label: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2Class: React.FC<Step2ClassProps> = ({
  selectedClassId,
  allowedClasses,
  onSelectClass,
  onNext,
  onPrev,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
          <School className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Step 2 of 5</span>
          <h2 className="text-2xl font-bold text-slate-900">Select Class (Grade 1 to 12)</h2>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-6 ml-12">
        Select any class level from Class 1 through Class 12 to filter subject lists and chapters.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-8">
        {CLASSES_LIST.filter(cls => allowedClasses.length === 0 || allowedClasses.includes(cls.label)).map((cls) => {
          const isSelected = selectedClassId === cls.id;
          let levelTag = 'Primary';
          if (cls.gradeNumber >= 6 && cls.gradeNumber <= 8) levelTag = 'Middle';
          if (cls.gradeNumber >= 9 && cls.gradeNumber <= 10) levelTag = 'Secondary';
          if (cls.gradeNumber >= 11) levelTag = 'Sr. Sec.';

          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => onSelectClass(cls.id, cls.label)}
              className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-28 cursor-pointer relative ${isSelected
                ? 'border-amber-600 bg-amber-50/70 shadow-sm ring-2 ring-amber-600/20'
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100 hover:border-slate-300'
                }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{levelTag}</span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 block">{cls.label}</span>
                <span className="text-[11px] text-slate-500 font-medium">Grade {cls.gradeNumber}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-600/20"
        >
          <span>Continue to Subject</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
