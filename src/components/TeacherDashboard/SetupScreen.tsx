import React, { useState } from 'react';
import { PaperConfig, ChapterConfig } from '../../types';
import { BookOpen, Layers, Sliders, CheckCircle2, AlertCircle, Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react';

interface SetupScreenProps {
  initialConfig?: PaperConfig;
  onStartGeneration: (config: PaperConfig) => void;
  isGenerating?: boolean;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  initialConfig,
  onStartGeneration,
  isGenerating = false,
}) => {
  const [subject, setSubject] = useState(initialConfig?.subject || 'Science');
  const [ncertClass, setNcertClass] = useState(initialConfig?.ncert_class || 'class-9');
  const [kbName, setKbName] = useState(initialConfig?.kb_name || 'ncert-class-9-science');
  const [sectionId, setSectionId] = useState(initialConfig?.section_id || 'A');
  const [count, setCount] = useState(initialConfig?.count || 5);

  const [chapters, setChapters] = useState<ChapterConfig[]>(
    initialConfig?.chapters && initialConfig.chapters.length > 0
      ? initialConfig.chapters
      : [
          { chapter_label: 'Cell - The Building Block of Life', weight_percent: 50 },
          { chapter_label: 'Tissues', weight_percent: 30 },
          { chapter_label: 'Diversity in Living Organisms', weight_percent: 20 },
        ]
  );

  const totalWeight = chapters.reduce((sum, ch) => sum + (Number(ch.weight_percent) || 0), 0);
  const isValidWeight = totalWeight === 100;

  const handleWeightChange = (index: number, val: number) => {
    const next = [...chapters];
    next[index].weight_percent = Math.max(0, Math.min(100, val));
    setChapters(next);
  };

  const handleLabelChange = (index: number, label: string) => {
    const next = [...chapters];
    next[index].chapter_label = label;
    setChapters(next);
  };

  const addChapter = () => {
    setChapters([
      ...chapters,
      { chapter_label: `New Chapter ${chapters.length + 1}`, weight_percent: 0 },
    ]);
  };

  const removeChapter = (index: number) => {
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const autoBalance = () => {
    if (chapters.length === 0) return;
    const equalVal = Math.floor(100 / chapters.length);
    const remainder = 100 - equalVal * chapters.length;

    const next = chapters.map((ch, idx) => ({
      ...ch,
      weight_percent: idx === 0 ? equalVal + remainder : equalVal,
    }));
    setChapters(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidWeight) return;

    onStartGeneration({
      subject,
      ncert_class: ncertClass,
      kb_name: kbName,
      section_id: sectionId,
      count: Number(count),
      chapters,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900">Live Quiz Setup</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure topic distribution, chapter weights, and question count for real-time classroom competition.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-violet-500/10 text-amber-700 font-semibold text-xs rounded-full border border-amber-200/50">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Kahoot-Style Live Quiz
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Row 1: Subject, Class, Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Social Science">Social Science</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              NCERT Class
            </label>
            <select
              value={ncertClass}
              onChange={(e) => {
                setNcertClass(e.target.value);
                setKbName(`ncert-${e.target.value}-${subject.toLowerCase()}`);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            >
              <option value="class-9">Class 9</option>
              <option value="class-10">Class 10</option>
              <option value="class-8">Class 8</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Section & KB
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                placeholder="Section (A)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <input
                type="text"
                value={kbName}
                onChange={(e) => setKbName(e.target.value)}
                placeholder="KB Name"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Question Count Slider */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Number of Questions
            </label>
            <span className="px-3 py-1 bg-amber-600 text-white font-bold text-sm rounded-lg font-mono">
              {count} Questions
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={15}
            step={1}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>3 MCQs (Quick Warmup)</span>
            <span>5 MCQs (Standard)</span>
            <span>10 MCQs (Class Test)</span>
            <span>15 MCQs (Full Quiz)</span>
          </div>
        </div>

        {/* Chapter Weights Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                Chapters & Weight Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Sum of chapter weights must equal exactly 100%.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={autoBalance}
                className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
              >
                Auto-Balance (100%)
              </button>
              <button
                type="button"
                onClick={addChapter}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Chapter
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {chapters.map((ch, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={ch.chapter_label}
                  onChange={(e) => handleLabelChange(idx, e.target.value)}
                  placeholder="Chapter Label"
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center gap-2 w-36">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={ch.weight_percent}
                    onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                    className="w-16 px-2.5 py-1.5 text-sm font-bold text-right border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-slate-500">% weight</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeChapter(idx)}
                  disabled={chapters.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Weight Sum Indicator */}
          <div
            className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border ${
              isValidWeight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {isValidWeight ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {isValidWeight
                  ? 'Chapter weight distribution totals exactly 100%.'
                  : `Total weight is currently ${totalWeight}%. Please adjust so it equals 100%.`}
              </span>
            </div>
            <span className="font-mono font-bold text-sm">{totalWeight}% / 100%</span>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={!isValidWeight || isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-[#4F3FE0] to-[#8B5CF6] hover:from-amber-700 hover:to-violet-700 text-white font-display font-bold text-base rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{isGenerating ? 'Connecting & Generating...' : 'Generate Live Quiz'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
