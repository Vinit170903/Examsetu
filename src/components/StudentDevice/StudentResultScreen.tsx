import React, { useEffect } from 'react';
import { QuizSession, Student } from '../../types';
import confetti from 'canvas-confetti';
import { Trophy, Award, CheckCircle2, XCircle, RotateCcw, ChevronDown, Check, X } from 'lucide-react';

interface StudentResultScreenProps {
  session: QuizSession;
  student: Student;
  onExit: () => void;
}

export const StudentResultScreen: React.FC<StudentResultScreenProps> = ({
  session,
  student,
  onExit,
}) => {
  const totalQuestions = session.questions.length;
  const answers = student.answers || [];
  const correctCount = answers.filter((a) => a.correct).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Rank among classmates
  const sortedStudents = [...session.students].sort((a, b) => b.score - a.score);
  const rank = sortedStudents.findIndex((s) => s.studentId === student.studentId) + 1;

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F3FE0', '#8B5CF6', '#10B981', '#F59E0B'],
      });
    } catch (e) {
      // ignore if canvas canvas-confetti unavailable
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Result Hero Banner */}
      <div className="bg-gradient-to-tr from-[#4F3FE0] via-amber-600 to-[#8B5CF6] rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl space-y-4">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-9 h-9 text-amber-300" />
        </div>

        <div>
          <span className="px-3 py-1 bg-white/20 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded-full">
            Quiz Completed
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-2">
            {student.score} <span className="text-lg font-normal text-amber-200">Points</span>
          </h1>
          <p className="text-xs text-amber-100 mt-1">
            Student: <strong>{student.name}</strong> (ID: {student.studentId})
          </p>
        </div>

        {/* Badges Row */}
        <div className="grid grid-cols-2 gap-3 pt-2 max-w-xs mx-auto">
          <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200 font-semibold">Rank</p>
            <p className="font-display font-extrabold text-xl text-white">#{rank || 1}</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
            <p className="text-[10px] uppercase tracking-wider text-amber-200 font-semibold">Accuracy</p>
            <p className="font-display font-extrabold text-xl text-white">{accuracy}%</p>
          </div>
        </div>
      </div>

      {/* Itemized Question Review List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
          Question Review ({correctCount} / {totalQuestions} Correct)
        </h3>

        <div className="space-y-3">
          {session.questions.map((q, idx) => {
            const studentAns = answers.find((a) => a.questionIndex === idx);
            const isCorrect = studentAns?.correct ?? false;
            const selectedText = studentAns?.selected || 'Not answered';

            return (
              <div
                key={q.id || idx}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  isCorrect
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Q{idx + 1}. {q.text}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold shrink-0 text-[10px] uppercase flex items-center gap-1 ${
                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="space-y-1 pt-1 font-medium">
                  <p className="text-slate-700">
                    <span className="text-slate-500">Your Answer:</span>{' '}
                    <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                      {selectedText}
                    </strong>
                  </p>
                  {!isCorrect && (
                    <p className="text-slate-700">
                      <span className="text-slate-500">Correct Answer:</span>{' '}
                      <strong className="text-emerald-700">{q.correct_answer}</strong>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onExit}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-sm rounded-2xl shadow-md transition-colors cursor-pointer text-center"
      >
        Join Another Quiz Session
      </button>
    </div>
  );
};
