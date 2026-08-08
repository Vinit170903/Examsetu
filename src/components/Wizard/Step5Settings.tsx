import React, { useState } from 'react';
import { QuizConfig } from '../../types';
import { Sliders, Sparkles, ArrowLeft, Play, Loader2 } from 'lucide-react';

interface Step5SettingsProps {
  initialConfig: QuizConfig;
  isGenerating: boolean;
  onStartQuiz: (config: QuizConfig) => void;
  onPrev: () => void;
}

export const Step5Settings: React.FC<Step5SettingsProps> = ({
  initialConfig,
  isGenerating,
  onStartQuiz,
  onPrev,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(initialConfig.questionCount || 10);
  const [rollCount, setRollCount] = useState<number>(initialConfig.rollCount || 30);
  const [timerSeconds, setTimerSeconds] = useState<number>(initialConfig.timerSeconds || 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCount = Math.max(1, questionCount || 10);
    const finalRolls = Math.max(1, rollCount || 30);
    const finalTimer = Math.max(5, timerSeconds || 30);

    onStartQuiz({
      ...initialConfig,
      questionCount: finalCount,
      rollCount: finalRolls,
      timerSeconds: finalTimer,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Step 5 of 5</span>
          <h2 className="text-2xl font-bold text-slate-900">{initialConfig.type === 'poll' ? 'Poll' : 'Quiz'} Settings & Classroom Roster</h2>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-8 ml-12">
        Specify how many questions to generate and the total number of students in your classroom roster.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {/* Input 1: Question Count */}
        {initialConfig.creationMode !== 'custom' && (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              Number of Questions to Generate
            </label>
            <p className="text-xs text-slate-500">
              Type any number of questions (e.g., 5, 10, 15, or 20) to stream live from NCERT.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="number"
                min="1"
                max="100"
                required
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10) || 1)}
                className="w-32 px-4 py-2.5 bg-white border border-slate-300 font-mono font-bold text-lg text-amber-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
              />
              <span className="text-sm font-semibold text-slate-600">Questions</span>
            </div>
          </div>
        )}

        {/* Input 2: Total Roll Numbers */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Total Roll Numbers in Class
          </label>
          <p className="text-xs text-slate-500">
            Defines the classroom reference grid (Roll No. 1 to N) displayed alongside the questions.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="number"
              min="1"
              max="120"
              required
              value={rollCount}
              onChange={(e) => setRollCount(parseInt(e.target.value, 10) || 1)}
              className="w-32 px-4 py-2.5 bg-white border border-slate-300 font-mono font-bold text-lg text-amber-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
            />
            <span className="text-sm font-semibold text-slate-600">Students (Roll 1 to {rollCount || 30})</span>
          </div>
        </div>

        {/* Input 3: Question Timer */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Question Timer (Seconds)
          </label>
          <p className="text-xs text-slate-500">
            Set the countdown timer limit for each question before it auto-advances. (Default: 30 seconds)
          </p>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="number"
              min="5"
              max="300"
              required
              value={timerSeconds}
              onChange={(e) => setTimerSeconds(parseInt(e.target.value, 10) || 5)}
              className="w-32 px-4 py-2.5 bg-white border border-slate-300 font-mono font-bold text-lg text-amber-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
            />
            <span className="text-sm font-semibold text-slate-600">Seconds</span>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
          <div>
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-600 block mb-0.5">Configuration Summary</span>
            <span>
              <strong>{initialConfig.classNameDisplay} ({initialConfig.medium})</strong> • {initialConfig.subject} • {initialConfig.chapters.length} Chapter(s)
            </span>
          </div>
          <div className="font-bold text-amber-700 bg-white px-3 py-1.5 rounded-lg border border-amber-100">
            {initialConfig.creationMode !== 'custom' ? `${questionCount} Questions • ` : ''}Roster 1–{rollCount}
          </div>
        </div>

        <div className="flex justify-between border-t border-slate-100 pt-6">
          <button
            type="button"
            disabled={isGenerating}
            onClick={onPrev}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={isGenerating}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-amber-600/30 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting & Generating...</span>
              </>
            ) : initialConfig.creationMode === 'custom' ? (
              <>
                <Sparkles className="w-5 h-5 fill-white/20" />
                <span>Start Building Custom Quiz</span>
                <Play className="w-4 h-4 fill-white" />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white/20" />
                <span>Generate & Start Live {initialConfig.type === 'poll' ? 'Poll' : 'Quiz'}</span>
                <Play className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
