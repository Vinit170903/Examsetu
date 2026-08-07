import React from 'react';
import { QuizSession } from '../../types';
import { Trophy, Download, RotateCcw, Award, CheckCircle2, XCircle, Users, BarChart } from 'lucide-react';

interface ResultsScreenProps {
  session: QuizSession;
  onRestart: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ session, onRestart }) => {
  const sortedStudents = [...session.students].sort((a, b) => b.score - a.score);
  const totalQuestions = session.questions.length;

  // Calculate overall class metrics
  let totalClassCorrect = 0;
  let totalClassAnswers = 0;

  sortedStudents.forEach((student) => {
    student.answers.forEach((ans) => {
      totalClassAnswers += 1;
      if (ans.correct) totalClassCorrect += 1;
    });
  });

  const classAccuracy = totalClassAnswers > 0 ? Math.round((totalClassCorrect / totalClassAnswers) * 100) : 0;

  const exportCSV = () => {
    const headers = ['Rank', 'Student Name', 'Student ID', 'Score (pts)', 'Correct Answers', 'Total Questions', 'Accuracy (%)'];
    const rows = sortedStudents.map((student, idx) => {
      const correctCount = student.answers.filter((a) => a.correct).length;
      const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      return [
        idx + 1,
        `"${student.name}"`,
        `"${student.studentId}"`,
        student.score,
        correctCount,
        totalQuestions,
        `${accuracy}%`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VidyaSetu_Quiz_Results_${session.joinCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#4F3FE0] to-[#8B5CF6] rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-white/10 rounded-xl">
              <Trophy className="w-6 h-6 text-amber-300" />
            </span>
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-100">Classroom Quiz Complete</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            Live Quiz Results & Leaderboard
          </h1>
          <p className="text-sm text-amber-100 mt-1">
            Session Code <strong className="font-mono text-white">{session.joinCode}</strong> • {session.config?.subject || 'Science'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-white text-amber-700 font-bold text-xs rounded-xl hover:bg-amber-50 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onRestart}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Participants</p>
            <p className="font-display font-extrabold text-2xl text-slate-900 mt-0.5">{sortedStudents.length} Students</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Average Class Accuracy</p>
            <p className="font-display font-extrabold text-2xl text-emerald-600 mt-0.5">{classAccuracy}%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Top Scorer</p>
            <p className="font-display font-bold text-lg text-slate-900 truncate mt-0.5">
              {sortedStudents[0] ? sortedStudents[0].name : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Full Leaderboard
          </h3>
          <span className="text-xs text-slate-500 font-medium">Sorted by total points</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Student ID</th>
                <th className="py-3.5 px-6 text-center">Score</th>
                <th className="py-3.5 px-6 text-center">Accuracy</th>
                <th className="py-3.5 px-6 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {sortedStudents.map((student, idx) => {
                const correctCount = student.answers.filter((a) => a.correct).length;
                const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
                const isWinner = idx === 0;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isWinner ? 'bg-amber-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-full font-extrabold text-xs flex items-center justify-center ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-700/30 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {student.name}
                        {isWinner && <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{student.studentId}</td>

                    <td className="py-4 px-6 text-center font-mono font-extrabold text-amber-700 text-base">
                      {student.score} pts
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          accuracy >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : accuracy >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {accuracy}% ({correctCount}/{totalQuestions})
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden ml-auto">
                        <div
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
