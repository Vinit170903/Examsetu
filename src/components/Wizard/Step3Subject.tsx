import React from 'react';
import { getSubjectsForClass } from '../../data/ncertData';
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step3SubjectProps {
  classId: string;
  classNameDisplay: string;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step3Subject: React.FC<Step3SubjectProps> = ({
  classId,
  classNameDisplay,
  selectedSubject,
  onSelectSubject,
  onNext,
  onPrev,
}) => {
  const subjects = getSubjectsForClass(classId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Step 3 of 5</span>
          <h2 className="text-2xl font-bold text-slate-900">Select Subject for {classNameDisplay}</h2>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-6 ml-12">
        Showing NCERT curriculum subjects mapped specifically for <strong className="text-slate-800">{classNameDisplay}</strong>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {subjects.map((subj) => {
          const isSelected = selectedSubject === subj;
          return (
            <button
              key={subj}
              type="button"
              onClick={() => onSelectSubject(subj)}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-h-[80px] cursor-pointer ${
                isSelected
                  ? 'border-amber-600 bg-amber-50/70 shadow-sm ring-2 ring-amber-600/20'
                  : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span className="font-bold text-base text-slate-900 pr-2">{subj}</span>
              {isSelected ? (
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </span>
              ) : (
                <span className="text-slate-300 group-hover:text-slate-400">→</span>
              )}
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
          <span>Continue to Chapters</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
