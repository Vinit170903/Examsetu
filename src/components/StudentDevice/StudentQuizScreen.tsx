import React, { useState, useEffect, useRef } from 'react';
import { QuizSession, Student, StudentAnswer } from '../../types';
import { useCountdown } from '../../hooks/useCountdown';
import { Check, X, Clock, Award, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface StudentQuizScreenProps {
  session: QuizSession;
  student: Student;
  onSubmitAnswer: (questionIndex: number, selectedOption: string, timeSpentMs: number) => void;
}

export const StudentQuizScreen: React.FC<StudentQuizScreenProps> = ({
  session,
  student,
  onSubmitAnswer,
}) => {
  const currentIdx = session.currentQuestionIndex;
  const currentQ = session.questions[currentIdx];
  const timerSeconds = session.timerSeconds || 30;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  // Check if student already submitted answer for this question
  const existingAnswer = student.answers?.find((a) => a.questionIndex === currentIdx);

  useEffect(() => {
    if (existingAnswer) {
      setSelectedOption(existingAnswer.selected);
      setIsSubmitted(true);
    } else {
      setSelectedOption(null);
      setIsSubmitted(false);
      startTimeRef.current = Date.now();
    }
  }, [currentIdx, existingAnswer]);

  const handleExpire = () => {
    if (!isSubmitted && !selectedOption && currentQ) {
      // Auto-submit empty/timeout if expired
      setIsSubmitted(true);
    }
  };

  const { secondsLeft, progressPercent, isWarning, reset } = useCountdown(
    timerSeconds,
    handleExpire,
    8
  );

  useEffect(() => {
    reset(timerSeconds);
    startTimeRef.current = Date.now();
  }, [currentIdx, timerSeconds, reset]);

  if (!currentQ) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border">
        <p className="text-slate-600">Waiting for next question...</p>
      </div>
    );
  }

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return; // locked once picked
    setSelectedOption(opt);
    setIsSubmitted(true);
    const timeSpentMs = Date.now() - startTimeRef.current;
    onSubmitAnswer(currentIdx, opt, timeSpentMs);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];
  const isCorrect = selectedOption === currentQ.correct_answer;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
      {/* Top Status Bar: Question Number & Circular Timer */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Question {currentIdx + 1} of {session.questions.length}
          </span>
          <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
            {currentQ.chapter_label}
          </p>
        </div>

        {/* Circular Countdown Ring Timer */}
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-200"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="120"
                strokeDashoffset={120 - (progressPercent / 100) * 120}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  isWarning ? 'text-rose-500 animate-pulse' : 'text-amber-600'
                }`}
                fill="transparent"
              />
            </svg>
            <span
              className={`absolute font-mono font-extrabold text-sm ${
                isWarning ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {secondsLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-4">
        <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 leading-snug">
          {currentQ.text}
        </h2>

        {/* 4 Large Tappable Options */}
        <div className="space-y-3 pt-2">
          {currentQ.options.map((optionText, oIdx) => {
            const letter = optionLetters[oIdx] || String(oIdx + 1);
            const isThisSelected = selectedOption === optionText;
            const isThisCorrect = optionText === currentQ.correct_answer;

            let buttonStyle = 'bg-slate-50 border-slate-200/90 text-slate-800 hover:border-amber-400 hover:bg-amber-50/50';

            if (isSubmitted) {
              if (isThisSelected) {
                if (isThisCorrect) {
                  buttonStyle = 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-md scale-[1.01]';
                } else {
                  buttonStyle = 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300 shadow-md';
                }
              } else if (isThisCorrect) {
                buttonStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
              } else {
                buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={oIdx}
                disabled={isSubmitted}
                onClick={() => handleSelectOption(optionText)}
                className={`w-full p-4 rounded-2xl border-2 font-medium text-left transition-all duration-200 flex items-center justify-between gap-3 text-base cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-xl font-display font-extrabold text-sm flex items-center justify-center shrink-0 ${
                      isSubmitted && isThisSelected
                        ? 'bg-white/20 text-white'
                        : isSubmitted && isThisCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="leading-snug">{optionText}</span>
                </div>

                {isSubmitted && isThisSelected && (
                  <div className="shrink-0 p-1 bg-white/20 rounded-full">
                    {isThisCorrect ? (
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    ) : (
                      <X className="w-5 h-5 text-white stroke-[3]" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Notice */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 animate-fade-in ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <p className="font-display font-bold">
                {isCorrect ? 'Correct Answer! +10 Points' : 'Incorrect Choice'}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                {isCorrect
                  ? 'Great job! Locked in for leaderboard.'
                  : `Correct answer was: ${currentQ.correct_answer}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
