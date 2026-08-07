import React, { useEffect } from 'react';
import { QuizSession } from '../../types';
import { useCountdown } from '../../hooks/useCountdown';
import { Trophy, Clock, ArrowRight, CheckCircle2, Users, Award, BarChart3, ChevronRight } from 'lucide-react';

interface LiveQuizScreenProps {
  session: QuizSession;
  onNextQuestion: () => void;
  onEndQuiz: () => void;
}

export const LiveQuizScreen: React.FC<LiveQuizScreenProps> = ({
  session,
  onNextQuestion,
  onEndQuiz,
}) => {
  const currentIdx = session.currentQuestionIndex;
  const currentQ = session.questions[currentIdx];
  const timerSeconds = session.timerSeconds || 30;

  const { secondsLeft, formattedTime, progressPercent, isWarning, reset } = useCountdown(
    timerSeconds,
    onNextQuestion,
    8
  );

  // Reset local countdown ring whenever current question changes
  useEffect(() => {
    reset(timerSeconds);
  }, [currentIdx, timerSeconds, reset]);

  if (!currentQ) {
    return (
      <div className="p-8 bg-white rounded-2xl border text-center">
        <p className="text-slate-600">No question available.</p>
        <button onClick={onEndQuiz} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl">
          End Quiz
        </button>
      </div>
    );
  }

  const totalStudents = session.students.length;

  // Calculate live answer tallies for options A, B, C, D
  const optionTallies: { [opt: string]: number } = {};
  currentQ.options.forEach((opt) => (optionTallies[opt] = 0));

  let answeredCount = 0;
  session.students.forEach((student) => {
    const ans = student.answers.find((a) => a.questionIndex === currentIdx);
    if (ans) {
      answeredCount += 1;
      if (optionTallies[ans.selected] !== undefined) {
        optionTallies[ans.selected] += 1;
      }
    }
  });

  // Sort leaderboard
  const sortedStudents = [...session.students].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Session Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-mono font-bold text-sm rounded-lg">
            Question {currentIdx + 1} of {session.questions.length}
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Chapter: <strong className="text-slate-800">{currentQ.chapter_label}</strong>
          </span>
        </div>

        {/* Live Timer Ring & Response Counter */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-slate-700">Responses:</span>
            <span className="font-mono font-bold text-sm text-amber-600">
              {answeredCount} / {totalStudents}
            </span>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" className="text-slate-200" fill="transparent" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray="100"
                  strokeDashoffset={100 - progressPercent}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${isWarning ? 'text-rose-500 animate-pulse' : 'text-amber-600'}`}
                  fill="transparent"
                />
              </svg>
              <span className={`absolute font-mono font-bold text-xs ${isWarning ? 'text-rose-600' : 'text-slate-800'}`}>
                {secondsLeft}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Seconds Left</span>
          </div>

          <button
            onClick={currentIdx + 1 < session.questions.length ? onNextQuestion : onEndQuiz}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentIdx + 1 < session.questions.length ? 'Next Question' : 'View Results'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left: Question & Option Tallies */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span className="uppercase font-semibold tracking-wider text-amber-600">Multiple Choice Question</span>
              <span>{currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}</span>
            </div>

            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 leading-snug">
              {currentQ.text}
            </h2>

            {/* Option Tallies */}
            <div className="mt-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                Live Answer Distribution
              </p>

              {currentQ.options.map((optionText, oIdx) => {
                const count = optionTallies[optionText] || 0;
                const percent = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
                const isCorrect = optionText === currentQ.correct_answer;
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={oIdx}
                    className={`p-4 rounded-xl border transition-all ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {optionLetters[oIdx] || oIdx + 1}
                        </span>
                        <span className={`text-sm font-medium ${isCorrect ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                          {optionText}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCorrect && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Correct
                          </span>
                        )}
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {count} <span className="text-xs text-slate-500 font-normal">({percent}%)</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Tally */}
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCorrect ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Live Leaderboard
              </h3>
              <span className="text-xs text-slate-500 font-mono">Real-time</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {sortedStudents.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No student scores yet.</p>
              ) : (
                sortedStudents.map((student, rankIdx) => {
                  const isTop3 = rankIdx < 3;
                  const rankColors = [
                    'bg-amber-100 text-amber-800 border-amber-300',
                    'bg-slate-200 text-slate-800 border-slate-300',
                    'bg-amber-700/20 text-amber-900 border-amber-500/30',
                  ];

                  return (
                    <div
                      key={student.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isTop3 ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full font-extrabold text-xs flex items-center justify-center border ${
                            isTop3 ? rankColors[rankIdx] : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          #{rankIdx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{student.name}</p>
                          <p className="text-[10px] text-slate-500">ID: {student.studentId}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-amber-700">
                          {student.score} pts
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={onEndQuiz}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Finish Quiz Early
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
