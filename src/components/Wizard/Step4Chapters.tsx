import React, { useState, useEffect } from 'react';
import { getChaptersForClassAndSubject } from '../../data/ncertData';
import { ChapterConfig } from '../../types';
import { Layers, CheckSquare, Square, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

interface Step4ChaptersProps {
  classId: string;
  classNameDisplay: string;
  subject: string;
  selectedChapters: ChapterConfig[];
  onUpdateChapters: (chapters: ChapterConfig[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step4Chapters: React.FC<Step4ChaptersProps> = ({
  classId,
  classNameDisplay,
  subject,
  selectedChapters,
  onUpdateChapters,
  onNext,
  onPrev,
}) => {
  const allChapterTitles = getChaptersForClassAndSubject(classId, subject);

  // Initialize state with current selected or default to all selected with equal weights
  const [activeSelections, setActiveSelections] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (selectedChapters.length > 0) {
      selectedChapters.forEach((ch) => {
        map[ch.chapter_label] = true;
      });
    } else {
      // Default: all chapters selected
      allChapterTitles.forEach((ch) => {
        map[ch] = true;
      });
    }
    return map;
  });

  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (selectedChapters.length > 0) {
      selectedChapters.forEach((ch) => {
        map[ch.chapter_label] = ch.weight_percent;
      });
    }
    return map;
  });

  // Calculate and sync chapter objects whenever activeSelections or weights change
  useEffect(() => {
    const selectedList = Object.keys(activeSelections).filter((ch) => activeSelections[ch]);
    const count = selectedList.length;

    if (count === 0) {
      onUpdateChapters([]);
      return;
    }

    const equalWeight = Math.floor(100 / count);
    const remainder = 100 - equalWeight * count;

    const resultConfigs: ChapterConfig[] = selectedList.map((label, idx) => {
      // Use existing custom weight if set, otherwise auto equal split
      const autoWeight = equalWeight + (idx === 0 ? remainder : 0);
      const finalWeight = weights[label] !== undefined ? weights[label] : autoWeight;

      return {
        chapter_label: label,
        weight_percent: finalWeight,
      };
    });

    onUpdateChapters(resultConfigs);
  }, [activeSelections, weights]);

  const toggleChapter = (title: string) => {
    setActiveSelections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleSelectAll = () => {
    const map: Record<string, boolean> = {};
    allChapterTitles.forEach((title) => {
      map[title] = true;
    });
    setActiveSelections(map);
  };

  const handleDeselectAll = () => {
    setActiveSelections({});
  };

  const handleResetEqualWeights = () => {
    setWeights({});
  };

  const handleWeightChange = (title: string, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [title]: value,
    }));
  };

  const selectedCount = Object.values(activeSelections).filter(Boolean).length;
  const currentTotalWeight = selectedChapters.reduce((acc, c) => acc + (c.weight_percent || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Step 4 of 5</span>
            <h2 className="text-2xl font-bold text-slate-900">Select Chapters & Weightage</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl mb-6 text-xs text-slate-700">
        <div>
          Selected <strong>{selectedCount}</strong> of {allChapterTitles.length} chapters for{' '}
          <strong className="text-amber-700">{classNameDisplay} {subject}</strong>
        </div>
        {selectedCount > 1 && (
          <button
            type="button"
            onClick={handleResetEqualWeights}
            className="flex items-center gap-1.5 text-amber-600 hover:text-amber-800 font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Equal Split (100%)</span>
          </button>
        )}
      </div>

      {selectedCount === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium mb-6">
          ⚠️ Please select at least one chapter to continue.
        </div>
      )}

      {/* Chapters Checkboxes List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 mb-8">
        {allChapterTitles.map((title, idx) => {
          const isChecked = !!activeSelections[title];
          const currentConfig = selectedChapters.find((c) => c.chapter_label === title);
          const weight = currentConfig ? currentConfig.weight_percent : 0;

          return (
            <div
              key={title}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isChecked
                ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 opacity-70 hover:opacity-100'
                }`}
            >
              <label
                onClick={() => toggleChapter(title)}
                className="flex items-center gap-3 flex-1 cursor-pointer select-none"
              >
                <div className="shrink-0 text-amber-600">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 fill-amber-600 text-white" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
                    Ch {idx + 1}
                  </span>
                  <span className={`text-sm font-semibold ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                    {title}
                  </span>
                </div>
              </label>

              {isChecked && selectedCount > 1 && (
                <div className="flex items-center gap-2 pl-8 sm:pl-0">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Weight:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={weight}
                    onChange={(e) => handleWeightChange(title, parseInt(e.target.value, 10) || 0)}
                    className="w-16 px-2 py-1 text-xs font-bold text-right border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              )}
            </div>
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
          disabled={selectedCount === 0}
          onClick={onNext}
          className={`px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 transition-all shadow-md ${selectedCount > 0
            ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-amber-600/20'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
