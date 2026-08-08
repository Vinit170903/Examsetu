import React, { useState, useMemo } from 'react';
import { QuizConfig, Question, Student, StudentReport, ClassQuizReport } from '../types';
import { CheckCircle2, RotateCcw, BarChart3, List, ChevronLeft, ChevronRight, Users, LayoutList, FileText, Save, Download, Trash2, Trophy } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface QuizCompleteScreenProps {
  config: QuizConfig;
  questions: Question[];
  results: Record<number, string>[];
  students: Student[];
  studentReports: Record<string, StudentReport[]>;
  setStudentReports: React.Dispatch<React.SetStateAction<Record<string, StudentReport[]>>>;
  setClassReports: React.Dispatch<React.SetStateAction<ClassQuizReport[]>>;
  onRestart: () => void;
  isSavedView?: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
  'bg-emerald-100 text-emerald-700 border-emerald-200', // A: Greenish
  'bg-amber-100 text-amber-700 border-amber-200',     // B: Yellowish
  'bg-blue-100 text-blue-700 border-blue-200',        // C: Blueish
  'bg-purple-100 text-purple-700 border-purple-200'   // D: Purplish
];

const OPTION_BAR_COLORS = [
  'bg-emerald-400',
  'bg-amber-400',
  'bg-blue-600', // Deeper blue for contrast
  'bg-purple-300'
];

export const QuizCompleteScreen: React.FC<QuizCompleteScreenProps> = ({
  config,
  questions,
  results,
  students,
  studentReports,
  setStudentReports,
  setClassReports,
  onRestart,
  isSavedView = false,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'answer_key' | 'student'>('overview');
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [selectedRoll, setSelectedRoll] = useState(1);

  // Process actual student data for the report
  const reportData = useMemo(() => {
    const data = [];
    let totalCorrect = 0;
    let totalResponses = 0;
    const rosterSize = config.rollCount || 30;

    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const q = questions[qIdx];
      const correctIdx = q.options.indexOf(q.correct_answer) !== -1 ? q.options.indexOf(q.correct_answer) : 0;

      const qResult = results[qIdx] || {};
      const studentResponses: (number | null)[] = [];
      const optionCounts = [0, 0, 0, 0];
      let correctCount = 0;

      for (let roll = 1; roll <= rosterSize; roll++) {
        const answer = qResult[roll];
        let pickedIdx: number | null = null;

        if (answer === 'A') pickedIdx = 0;
        else if (answer === 'B') pickedIdx = 1;
        else if (answer === 'C') pickedIdx = 2;
        else if (answer === 'D') pickedIdx = 3;

        studentResponses.push(pickedIdx);

        if (pickedIdx !== null) {
          totalResponses++;
          optionCounts[pickedIdx]++;
          if (pickedIdx === correctIdx) {
            correctCount++;
            totalCorrect++;
          }
        }
      }

      data.push({
        studentResponses,
        optionCounts,
        correctCount,
        totalResponded: studentResponses.filter(r => r !== null).length
      });
    }

    const overallAccuracy = totalResponses > 0 ? Math.round((totalCorrect / totalResponses) * 100) : 0;

    return { data, overallAccuracy, totalResponses, rosterSize };
  }, [questions, results, config.rollCount]);

  const studentReportData = useMemo(() => {
    const students: Record<number, {
      correct: number,
      incorrect: number,
      unattempted: number,
      responses: { qIdx: number, picked: string | null, isCorrect: boolean, correctLetter: string }[]
    }> = {};

    const rosterSize = config.rollCount || 30;

    for (let r = 1; r <= rosterSize; r++) {
      students[r] = { correct: 0, incorrect: 0, unattempted: 0, responses: [] };
    }

    questions.forEach((q, qIdx) => {
      const qResult = results[qIdx] || {};
      const correctIdx = q.options.indexOf(q.correct_answer) !== -1 ? q.options.indexOf(q.correct_answer) : 0;
      const correctLetter = OPTION_LABELS[correctIdx] || 'A';

      for (let roll = 1; roll <= rosterSize; roll++) {
        const answer = qResult[roll];

        let isCorrect = false;
        if (answer) {
          if (answer === correctLetter) {
            isCorrect = true;
            students[roll].correct++;
          } else {
            students[roll].incorrect++;
          }
        } else {
          students[roll].unattempted++;
        }

        students[roll].responses.push({
          qIdx,
          picked: answer || null,
          isCorrect,
          correctLetter
        });
      }
    });

    return students;
  }, [questions, results, config.rollCount]);

  const sentimentStats = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let total = 0;

    questions.forEach((q, idx) => {
      const stats = reportData.data[idx];
      const pollType = q.pollType || 'single_choice';

      if (pollType === 'yes_no') {
        positive += stats.optionCounts[0] || 0;
        negative += stats.optionCounts[1] || 0;
        total += (stats.optionCounts[0] || 0) + (stats.optionCounts[1] || 0);
      } else if (pollType === 'rating') {
        positive += (stats.optionCounts[0] || 0) + (stats.optionCounts[1] || 0);
        neutral += (stats.optionCounts[2] || 0);
        negative += (stats.optionCounts[3] || 0) + (stats.optionCounts[4] || 0);
        total += stats.totalResponded;
      } else if (pollType === 'emoji') {
        positive += stats.optionCounts[0] || 0;
        neutral += stats.optionCounts[1] || 0;
        negative += (stats.optionCounts[2] || 0) + (stats.optionCounts[3] || 0);
        total += stats.totalResponded;
      }
    });

    if (total === 0) return { positive: 0, neutral: 0, negative: 0, text: 'No Data', posPct: 0, neuPct: 0, negPct: 0 };

    const posPct = Math.round((positive / total) * 100);
    const neuPct = Math.round((neutral / total) * 100);
    let negPct = 100 - posPct - neuPct;
    if (negPct < 0) negPct = 0;

    let text = 'Neutral';
    if (posPct > 50) text = 'Mostly Positive';
    else if (negPct > 50) text = 'Mostly Negative';
    else if (posPct > negPct) text = 'Leaning Positive';
    else if (negPct > posPct) text = 'Leaning Negative';

    return { positive, neutral, negative, text, posPct, neuPct, negPct };
  }, [questions, reportData.data]);

  const activeQuestion = questions[activeQIdx];
  const activeStats = reportData.data[activeQIdx];

  const findStudentByRoll = (rollNo: number) => {
    return students.find(s => {
      const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
      const cNormalized = config.classId.toLowerCase().replace('-', ' ').trim();
      return s.rollNo === rollNo && sNormalized === cNormalized;
    });
  };

  const topRankers = useMemo(() => {
    const rankers = [];
    const regStudents = students.filter(s => {
      const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
      const cNormalized = (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim();
      return sNormalized === cNormalized;
    });

    regStudents.forEach(student => {
      const sData = studentReportData[student.rollNo];
      if (sData && sData.correct > 0) {
        rankers.push({
          student,
          rollNo: student.rollNo,
          correct: sData.correct
        });
      }
    });
    return rankers.sort((a, b) => b.correct - a.correct).slice(0, 3);
  }, [studentReportData, students, config.classNameDisplay, config.classId]);

  const handleSaveReport = (rollNo: number) => {
    const student = findStudentByRoll(rollNo);
    if (!student) {
      showToast(`Student with Roll ${rollNo} not found in the registered roster for ${config.classNameDisplay}!`, 'error');
      return;
    }

    const sData = studentReportData[rollNo];

    const newReport: StudentReport = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
      quizName: config.quizName || 'Untitled Quiz',
      date: Date.now(),
      totalQuestions: questions.length,
      correct: sData.correct,
      incorrect: sData.incorrect,
      unattempted: sData.unattempted,
      accuracy: Math.round((sData.correct / questions.length) * 100),
      responses: sData.responses.map((r, i) => ({
        questionText: questions[i].text,
        correctAnswer: questions[i].correct_answer,
        picked: r.picked,
        isCorrect: r.isCorrect
      }))
    };

    setStudentReports(prev => {
      const existing = prev[student.macId] || [];
      return {
        ...prev,
        [student.macId]: [newReport, ...existing]
      };
    });

    showToast(`Report for ${student.name} (Roll ${rollNo}) saved to Student Dashboard!`, 'success');
  };

  const handleSaveAllReports = () => {
    let savedCount = 0;

    setStudentReports(prev => {
      const next = { ...prev };

      for (let rollNo = 1; rollNo <= (config.rollCount || 30); rollNo++) {
        const student = findStudentByRoll(rollNo);
        if (!student) continue;

        const sData = studentReportData[rollNo];
        const newReport: StudentReport = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
          quizName: config.quizName || 'Untitled Quiz',
          date: Date.now(),
          totalQuestions: questions.length,
          correct: sData.correct,
          incorrect: sData.incorrect,
          unattempted: sData.unattempted,
          accuracy: Math.round((sData.correct / questions.length) * 100),
          responses: sData.responses.map((r, i) => ({
            questionText: questions[i].text,
            correctAnswer: questions[i].correct_answer,
            picked: r.picked,
            isCorrect: r.isCorrect
          }))
        };

        const existing = next[student.macId] || [];
        next[student.macId] = [newReport, ...existing];
        savedCount++;
      }
      return next;
    });

    if (savedCount > 0) {
      showToast(`Successfully saved reports for ${savedCount} registered students to their Dashboard!`, 'success');
    } else {
      showToast("No registered students found in this class to save reports for.", 'error');
    }
  };

  const handleSaveClassReport = () => {
    const participationRate = reportData.rosterSize > 0 ? Math.round((reportData.totalResponses / (reportData.rosterSize * questions.length)) * 100) : 0;

    const newClassReport: ClassQuizReport = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
      quizId: config.quizName,
      quizName: config.quizName || 'Untitled Quiz',
      classId: config.classId,
      classNameDisplay: config.classNameDisplay,
      subject: config.subjectDisplay || config.subject,
      date: Date.now(),
      totalQuestions: questions.length,
      participationRate: participationRate,
      classAccuracy: reportData.overallAccuracy,
      type: config.type,
      pollData: config.type === 'poll' ? questions.map((q, idx) => ({
        text: q.text,
        pollType: q.pollType || 'single_choice',
        options: q.options,
        optionCounts: reportData.data[idx].optionCounts,
        totalResponded: reportData.data[idx].totalResponded,
        timerSeconds: config.timerSeconds
      })) : undefined,
      studentPerformances: [],
      config,
      questions,
      results
    };

    for (let rollNo = 1; rollNo <= (config.rollCount || 30); rollNo++) {
      const student = findStudentByRoll(rollNo);
      const sData = studentReportData[rollNo];

      newClassReport.studentPerformances.push({
        macId: student ? student.macId : 'unregistered',
        rollNo: rollNo,
        name: student ? student.name : 'Unregistered',
        accuracy: Math.round((sData.correct / questions.length) * 100),
        correct: sData.correct,
        incorrect: sData.incorrect,
        unattempted: sData.unattempted,
      });
    }

    setClassReports(prev => [newClassReport, ...prev]);
    showToast('Class Performance Report saved to Quizzes & Reports successfully!', 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-300">

      {/* Header */}
      <div className="bg-white rounded-t-3xl border-x border-t border-slate-200 p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{config.type === 'poll' ? 'Poll Complete' : 'Quiz Complete'}</h1>
            <p className="text-slate-500 text-sm font-medium">
              {config.classNameDisplay} • {config.subjectDisplay || config.subject}
            </p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 print:hidden"
        >
          <RotateCcw className="w-4 h-4" />
          Done / Exit
        </button>
      </div>

      {/* Tabs */}
      {!isSavedView && (
        <div className="bg-white border-x border-b border-slate-200 px-6 pt-2 pb-0 flex gap-6 shadow-sm z-10 relative overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 font-bold text-sm border-b-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <LayoutList className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-4 px-2 font-bold text-sm border-b-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'questions' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <BarChart3 className="w-4 h-4" /> Question Breakdown
          </button>
          {config.type !== 'poll' && (
            <button
              onClick={() => setActiveTab('answer_key')}
              className={`pb-4 px-2 font-bold text-sm border-b-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'answer_key' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <FileText className="w-4 h-4" /> Answer Key
            </button>
          )}
          {config.type !== 'poll' && (
            <button
              onClick={() => setActiveTab('student')}
              className={`pb-4 px-2 font-bold text-sm border-b-4 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'student' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              <Users className="w-4 h-4" /> Student Breakdown
            </button>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-6 flex-1">
        {activeTab === 'overview' && config.type === 'poll' && (
          <div className="flex flex-col gap-8">
            {/* Poll Overview Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Overall Participation */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Overall Participation
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke="#10B981" strokeWidth="12"
                          strokeDasharray={`${(reportData.totalResponses / (questions.length * reportData.rosterSize)) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-extrabold text-slate-800">{Math.round((reportData.totalResponses / (questions.length * reportData.rosterSize)) * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-slate-800">{Math.round(reportData.totalResponses / questions.length)} / {reportData.rosterSize}</div>
                      <div className="text-sm font-medium text-slate-500">students responded</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Polls */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <List className="w-4 h-4" /> Total Polls
                </h3>
                <div className="text-4xl font-extrabold text-slate-800 mb-2">{questions.length}</div>
                <div className="text-sm font-medium text-slate-500">
                  {Object.entries(questions.reduce((acc, q) => {
                    const t = q.pollType || 'single_choice';
                    acc[t] = (acc[t] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).map(([k, v]) => `${v} ${k.replace('_', '-')}`).join(' • ')}
                </div>
              </div>

              {/* Class Sentiment */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="text-sm leading-none">😃</span> Class Sentiment
                </h3>
                <div className={`text-xl font-extrabold mb-4 ${sentimentStats.text.includes('Positive') ? 'text-emerald-600' : sentimentStats.text.includes('Negative') ? 'text-rose-600' : 'text-amber-500'}`}>
                  {sentimentStats.text}
                </div>
                <div className="flex h-3 rounded-full overflow-hidden mb-2 bg-slate-100">
                  <div className="bg-emerald-500 transition-all" style={{ width: `${sentimentStats.posPct}%` }}></div>
                  <div className="bg-amber-400 transition-all" style={{ width: `${sentimentStats.neuPct}%` }}></div>
                  <div className="bg-rose-500 transition-all" style={{ width: `${sentimentStats.negPct}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-emerald-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Positive {sentimentStats.posPct}%</span>
                  <span className="text-amber-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Neutral {sentimentStats.neuPct}%</span>
                  <span className="text-rose-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Negative {sentimentStats.negPct}%</span>
                </div>
              </div>

              {/* Save Report */}
              <div
                onClick={handleSaveClassReport}
                className="bg-gradient-to-br from-amber-600 to-indigo-600 p-6 rounded-2xl border-0 shadow-sm flex flex-col justify-center items-center h-full text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Save className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white mb-1">Save Class Report</h3>
                <p className="text-[10px] text-white/80 font-medium">Save complete overview to Dashboard</p>
              </div>
            </div>

            {/* Poll By Poll Breakdown */}
            <div className="mt-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Poll-By-Poll Breakdown — Each chart matches its poll type
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((q, idx) => {
                  const stats = reportData.data[idx];
                  const pollType = q.pollType || 'single_choice';
                  const totalR = stats.totalResponded || 0;

                  return (
                    <div key={idx} className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col ${pollType === 'word_cloud' ? 'md:col-span-2' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4">
                          <h4 className="font-bold text-slate-800 text-lg mb-2">{q.text}</h4>
                          <p className="text-xs font-medium text-slate-500">
                            {totalR} responses • {config.timerSeconds > 0 ? `${config.timerSeconds}s duration` : 'No time limit'}
                          </p>
                        </div>
                        <div className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-amber-100">
                          {pollType === 'single_choice' && <CheckCircle2 className="w-3 h-3" />}
                          {pollType === 'yes_no' && <span className="text-sm leading-none">👍</span>}
                          {pollType === 'rating' && <span className="text-sm leading-none">⭐</span>}
                          {pollType === 'emoji' && <span className="text-sm leading-none">😃</span>}
                          {pollType === 'word_cloud' && <List className="w-3 h-3" />}
                          {pollType.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-end mt-4">
                        {pollType === 'single_choice' && (
                          <div className="space-y-3">
                            {q.options.map((opt, oIdx) => {
                              const count = stats.optionCounts[oIdx] || 0;
                              const pct = reportData.rosterSize > 0 ? Math.round((count / reportData.rosterSize) * 100) : 0;
                              return (
                                <div key={oIdx} className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${['bg-amber-500', 'bg-indigo-500', 'bg-teal-500', 'bg-purple-500', 'bg-rose-500'][oIdx % 5]}`}>
                                    {OPTION_LABELS[oIdx]}
                                  </div>
                                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${['bg-amber-500', 'bg-indigo-500', 'bg-teal-500', 'bg-purple-500', 'bg-rose-500'][oIdx % 5]}`} style={{ width: `${pct}%` }}></div>
                                  </div>
                                  <div className="w-8 text-right text-xs font-bold text-slate-600">{pct}%</div>
                                  {opt && !['Option A', 'Option B', 'Option C', 'Option D'].includes(opt) && (
                                    <div className="w-1/3 truncate text-xs text-slate-500 font-medium" title={opt}>{opt}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {pollType === 'yes_no' && (
                          <div className="flex items-center justify-center gap-12 py-4">
                            <div className="relative w-32 h-32">
                              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {(() => {
                                  const yesCount = stats.optionCounts[0] || 0;
                                  const noCount = stats.optionCounts[1] || 0;
                                  const yesPct = reportData.rosterSize > 0 ? yesCount / reportData.rosterSize : 0;
                                  const totalPct = reportData.rosterSize > 0 ? (yesCount + noCount) / reportData.rosterSize : 0;
                                  return (
                                    <>
                                      <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="16" />
                                      {reportData.rosterSize > 0 && (
                                        <>
                                          <circle cx="50" cy="50" r="40" fill="none" stroke="#E11D48" strokeWidth="16" strokeDasharray={`${totalPct * 251.2} 251.2`} />
                                          <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="16" strokeDasharray={`${yesPct * 251.2} 251.2`} />
                                        </>
                                      )}
                                    </>
                                  );
                                })()}
                              </svg>
                            </div>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-bold text-slate-700 w-16 truncate" title={q.options[0]}>{q.options[0] || 'Yes'}</span>
                                <span className="text-sm font-bold text-slate-500 w-8">{reportData.rosterSize > 0 ? Math.round(((stats.optionCounts[0] || 0) / reportData.rosterSize) * 100) : 0}%</span>
                                <span className="text-xs font-medium text-slate-400">• {stats.optionCounts[0] || 0} votes</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-rose-600"></div>
                                <span className="text-sm font-bold text-slate-700 w-16 truncate" title={q.options[1]}>{q.options[1] || 'No'}</span>
                                <span className="text-sm font-bold text-slate-500 w-8">{reportData.rosterSize > 0 ? Math.round(((stats.optionCounts[1] || 0) / reportData.rosterSize) * 100) : 0}%</span>
                                <span className="text-xs font-medium text-slate-400">• {stats.optionCounts[1] || 0} votes</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {pollType === 'rating' && (
                          <div className="space-y-3">
                            {q.options.map((opt, i) => {
                              const count = stats.optionCounts[i] || 0;
                              const pct = reportData.rosterSize > 0 ? Math.round((count / reportData.rosterSize) * 100) : 0;
                              return (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="w-32 flex items-center justify-end text-xs font-bold text-slate-600 truncate" title={opt}>
                                    {opt}
                                  </div>
                                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 transition-all" style={{ width: `${pct}%` }}></div>
                                  </div>
                                  <div className="w-8 text-right text-xs font-bold text-slate-600">{count}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {pollType === 'emoji' && (
                          <div className="flex items-end justify-between h-40 px-2 sm:px-8 pb-2">
                            {q.options.map((opt, i) => {
                              const count = stats.optionCounts[i] || 0;
                              const pct = reportData.rosterSize > 0 ? Math.round((count / reportData.rosterSize) * 100) : 0;
                              const colors = ['bg-emerald-600', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-600', 'bg-teal-500'];
                              return (
                                <div key={i} className="flex flex-col items-center gap-3">
                                  <span className="text-3xl" title={opt}>{opt}</span>
                                  <div className={`w-8 rounded-t-lg ${colors[i % colors.length]} flex items-end justify-center pb-2 transition-all`} style={{ height: `${Math.max(12, pct * 1.2)}px`, minHeight: '24px' }}></div>
                                  <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {pollType === 'word_cloud' && (
                          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 py-8">
                            {q.options.map((opt, i) => {
                              const count = stats.optionCounts[i] || 0;
                              const colors = ['text-indigo-600', 'text-teal-600', 'text-amber-500', 'text-purple-400', 'text-emerald-700', 'text-slate-500', 'text-blue-600', 'text-rose-600'];

                              let sizeClass = 'text-lg';
                              if (reportData.rosterSize > 0) {
                                const pct = (count / reportData.rosterSize) * 100;
                                if (pct > 40) sizeClass = 'text-5xl';
                                else if (pct > 25) sizeClass = 'text-4xl';
                                else if (pct > 15) sizeClass = 'text-3xl';
                                else if (pct > 5) sizeClass = 'text-2xl';
                                else if (pct === 0) return null;
                              }

                              return (
                                <span key={i} className={`font-bold ${sizeClass} ${colors[i % colors.length]} transition-all hover:scale-110 cursor-default`} title={`${count} votes`}>{opt}</span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && config.type !== 'poll' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Class Accuracy */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex items-center justify-center flex-col text-center">
                <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-6">Class Accuracy</h2>
                <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#10B981" strokeWidth="12"
                      strokeDasharray={`${(reportData.overallAccuracy / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-slate-800">{reportData.overallAccuracy}%</span>
                  </div>
                </div>
                <p className="text-slate-600 mt-6 max-w-md font-medium text-sm lg:text-base">
                  {reportData.overallAccuracy > 70 ? 'Great job! The class performed well overall.' : 'The class might need to review this topic.'}
                </p>
              </div>

              {/* Leaderboard */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-5 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Top Rankers</h2>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Most Correct Answers</p>
                  </div>
                </div>

                {topRankers.length > 0 ? (
                  <div className="flex flex-col gap-3 flex-1">
                    {topRankers.map((ranker, idx) => (
                      <div key={ranker.rollNo} className={`relative flex items-center gap-3 p-3 rounded-2xl border ${idx === 0 ? 'bg-amber-50 border-amber-200' : idx === 1 ? 'bg-slate-50 border-slate-200' : 'bg-orange-50/50 border-orange-100'}`}>
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl shrink-0">
                          {ranker.student.avatar || '🎓'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 text-sm truncate" title={ranker.student.name}>{ranker.student.name}</div>
                          <div className="text-[10px] font-medium text-slate-500">Roll No: {ranker.rollNo}</div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 pr-2">
                          <span className="text-lg font-extrabold text-slate-800 leading-none">{ranker.correct}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Correct</span>
                        </div>

                        {/* Badge / Rank indicator */}
                        <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-orange-400'}`}>
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-4">
                    <Trophy className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400">No Rankers Yet</p>
                    <p className="text-xs text-slate-400">No correct answers found</p>
                  </div>
                )}
              </div>

              {/* Stats & Save */}
              <div className="flex flex-col gap-6">
                <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                      <List className="w-4 h-4" />
                      <span className="font-bold uppercase tracking-wider text-xs">Questions</span>
                    </div>
                    <span className="text-3xl font-extrabold text-slate-800">{questions.length}</span>
                  </div>
                </div>

                <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-bold uppercase tracking-wider text-xs">Participation</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-800">
                        {Object.values(studentReportData).filter(s => s.correct + s.incorrect > 0).length}
                      </span>
                    </div>
                  </div>
                </div>

                {!isSavedView && (
                  <div
                    onClick={handleSaveClassReport}
                    className="bg-gradient-to-r from-amber-500 to-purple-600 p-5 lg:p-6 rounded-3xl border border-amber-400 shadow-sm flex flex-col justify-center items-center h-full text-center hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group min-h-[120px]"
                  >
                    <div className="w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Save className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm">Save Class Report</h3>
                  </div>
                )}
              </div>
            </div>

            {/* Deeper Insights Section */}
            <div className="mt-8 mb-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Deeper Insights — Additional Charts</h3>

              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Score Distribution */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex-1 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-800">Score Distribution</h4>
                  <p className="text-xs text-slate-500 mb-6">How many students scored in each range</p>

                  <div className="flex-1 flex items-end justify-between px-2 sm:px-6 h-40">
                    {(() => {
                      const scoreBuckets = [0, 0, 0, 0, 0];
                      const regStudents = students.filter(s => {
                        const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
                        const cNormalized = (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim();
                        return sNormalized === cNormalized;
                      });

                      regStudents.forEach(s => {
                        const sData = studentReportData[s.rollNo];
                        if (sData) {
                          const accuracy = (sData.correct / questions.length) * 100;
                          if (accuracy <= 20) scoreBuckets[0]++;
                          else if (accuracy <= 40) scoreBuckets[1]++;
                          else if (accuracy <= 60) scoreBuckets[2]++;
                          else if (accuracy <= 80) scoreBuckets[3]++;
                          else scoreBuckets[4]++;
                        } else {
                          scoreBuckets[0]++;
                        }
                      });

                      const maxCount = Math.max(...scoreBuckets, 1);
                      const labels = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
                      const colors = ['bg-[#C24127]', 'bg-[#D16447]', 'bg-[#DE9A3E]', 'bg-[#4EA75F]', 'bg-[#347A46]'];

                      return scoreBuckets.map((count, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 w-10">
                          <span className="text-xs font-bold text-slate-700">{count}</span>
                          <div
                            className={`w-full rounded-t-lg ${colors[i]} transition-all duration-500`}
                            style={{ height: `${Math.max(4, (count / maxCount) * 100)}%`, minHeight: '4px' }}
                          ></div>
                          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{labels[i]}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Response Breakdown */}
                <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex-1 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-800">Response Breakdown</h4>
                  <p className="text-xs text-slate-500 mb-8">All answers submitted across the class</p>

                  <div className="flex-1 flex flex-col justify-center">
                    {(() => {
                      let tCorrect = 0, tIncorrect = 0, tUnattempted = 0;
                      const regStudents = students.filter(s => s.classId.toLowerCase().replace('-', ' ').trim() === (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim());

                      regStudents.forEach(s => {
                        const sData = studentReportData[s.rollNo];
                        if (sData) {
                          tCorrect += sData.correct;
                          tIncorrect += sData.incorrect;
                          tUnattempted += sData.unattempted;
                        } else {
                          tUnattempted += questions.length;
                        }
                      });

                      const tAns = questions.length * Math.max(1, regStudents.length);
                      const pCor = (tCorrect / tAns) * 100;
                      const pInc = (tIncorrect / tAns) * 100;
                      const pUna = (tUnattempted / tAns) * 100;

                      return (
                        <>
                          <div className="flex h-8 w-full rounded-lg overflow-hidden mb-4 shadow-sm">
                            <div className="bg-[#347A46] flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500" style={{ width: `${pCor}%` }}>{pCor > 5 ? `${Math.round(pCor)}%` : ''}</div>
                            <div className="bg-[#C24127] flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500" style={{ width: `${pInc}%` }}>{pInc > 5 ? `${Math.round(pInc)}%` : ''}</div>
                            <div className="bg-[#E4DCC8] flex items-center justify-center text-[10px] font-bold text-slate-600 transition-all duration-500" style={{ width: `${pUna}%` }}>{pUna > 5 ? `${Math.round(pUna)}%` : ''}</div>
                          </div>
                          <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><div className="w-3 h-3 rounded bg-[#347A46]"></div> Correct</div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><div className="w-3 h-3 rounded bg-[#C24127]"></div> Incorrect</div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><div className="w-3 h-3 rounded bg-[#E4DCC8]"></div> Unattempted</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Question-wise Accuracy */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm mb-6">
                <h4 className="text-lg font-bold text-slate-800">Question-wise Accuracy</h4>
                <p className="text-xs text-slate-500 mb-6">Which questions were easiest / hardest for the class</p>

                <div className="space-y-4">
                  {(() => {
                    const regStudents = students.filter(s => s.classId.toLowerCase().replace('-', ' ').trim() === (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim());

                    return questions.map((q, idx) => {
                      let qCorrect = 0;
                      regStudents.forEach(s => {
                        const sData = studentReportData[s.rollNo];
                        if (sData && sData.responses[idx]?.isCorrect) {
                          qCorrect++;
                        }
                      });

                      const accuracy = regStudents.length > 0 ? (qCorrect / regStudents.length) * 100 : 0;
                      const barColor = accuracy >= 60 ? 'bg-[#347A46]' : accuracy >= 30 ? 'bg-[#DE9A3E]' : 'bg-[#C24127]';

                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="w-6 text-sm font-bold text-slate-600">Q{idx + 1}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${accuracy}%` }}></div>
                          </div>
                          <span className="w-10 text-right text-xs font-bold text-slate-500">{Math.round(accuracy)}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Class Performance Heatmap */}
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800">Class Performance Heatmap</h4>
                <p className="text-xs text-slate-500 mb-6">Every registered roll number, color-coded by accuracy</p>

                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const regStudents = students.filter(s => s.classId.toLowerCase().replace('-', ' ').trim() === (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim()).sort((a, b) => a.rollNo - b.rollNo);

                    return regStudents.map(student => {
                      const sData = studentReportData[student.rollNo];
                      const accuracy = sData ? Math.round((sData.correct / questions.length) * 100) : 0;

                      let bgColor = 'bg-[#C24127]';
                      if (accuracy > 80) bgColor = 'bg-[#347A46]';
                      else if (accuracy > 60) bgColor = 'bg-[#4EA75F]';
                      else if (accuracy > 40) bgColor = 'bg-[#DE9A3E]';
                      else if (accuracy > 20) bgColor = 'bg-[#D77C57]';
                      else if (accuracy > 0) bgColor = 'bg-[#D16447]';

                      return (
                        <div key={student.rollNo} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center text-white ${bgColor} transition-transform hover:scale-105 cursor-default`} title={`${student.name} (Roll: ${student.rollNo}) - ${accuracy}%`}>
                          <span className="text-sm font-bold leading-none mb-1">{student.rollNo}</span>
                          <span className="text-[9px] font-bold opacity-80">{accuracy}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Student Results Table */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm mt-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Student Results
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 font-bold">Roll No</th>
                      <th className="py-3 px-4 font-bold">Name</th>
                      <th className="py-3 px-4 font-bold text-emerald-600">Correct</th>
                      <th className="py-3 px-4 font-bold text-rose-600">Incorrect</th>
                      <th className="py-3 px-4 font-bold text-slate-400">Unattempted</th>
                      <th className="py-3 px-4 font-bold text-indigo-600">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => {
                      const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
                      const cNormalized = (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim();
                      return sNormalized === cNormalized;
                    }).sort((a, b) => {
                      const aData = studentReportData[a.rollNo];
                      const bData = studentReportData[b.rollNo];
                      const aCorrect = aData ? aData.correct : 0;
                      const bCorrect = bData ? bData.correct : 0;

                      if (bCorrect !== aCorrect) {
                        return bCorrect - aCorrect;
                      }
                      return a.rollNo - b.rollNo;
                    }).map(student => {
                      const sData = studentReportData[student.rollNo];
                      if (!sData) return null;
                      const accuracy = Math.round((sData.correct / questions.length) * 100);
                      return (
                        <tr key={student.macId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-700">{student.rollNo}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] shrink-0">{student.avatar || '🎓'}</div>
                            <span className="truncate">{student.name}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{sData.correct}</td>
                          <td className="py-3 px-4 font-bold text-rose-600">{sData.incorrect}</td>
                          <td className="py-3 px-4 font-bold text-slate-400">{sData.unattempted}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' : accuracy >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                              {accuracy}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'questions' && activeQuestion && (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left Side: Question and Bars */}
            <div className="flex-1 space-y-6">

              {/* Pagination */}
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setActiveQIdx(Math.max(0, activeQIdx - 1))}
                  disabled={activeQIdx === 0}
                  className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-bold text-slate-700">
                  Question {activeQIdx + 1} of {questions.length}
                </div>
                <button
                  onClick={() => setActiveQIdx(Math.min(questions.length - 1, activeQIdx + 1))}
                  disabled={activeQIdx === questions.length - 1}
                  className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Question Text */}
              <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl">
                <span className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-3 block">Question {activeQIdx + 1}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
                  {activeQuestion.text}
                </h3>
              </div>

              {/* Live Responses Chart */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                {(() => {
                  const regStudents = students.filter(s => {
                    const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
                    const cNormalized = (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim();
                    return sNormalized === cNormalized;
                  });
                  return (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Live Responses</h4>
                        <span className="text-xs font-bold text-slate-400">{activeStats.totalResponded} of {regStudents.length} responded</span>
                      </div>

                      <div className="space-y-4">
                        {activeQuestion.options.map((opt, optIdx) => {
                          const count = activeStats.optionCounts[optIdx];
                          const percentage = regStudents.length > 0 ? Math.round((count / regStudents.length) * 100) : 0;
                          const isCorrect = optIdx === activeQuestion.options.indexOf(activeQuestion.correct_answer);

                          return (
                            <div key={optIdx} className="flex items-center gap-4">
                              <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-xl border ${OPTION_COLORS[optIdx % OPTION_COLORS.length]}`}>
                                {OPTION_LABELS[optIdx]}
                              </div>
                              <div className="flex-1 relative h-12 bg-slate-50 rounded-xl flex items-center px-4 overflow-hidden">
                                {/* Progress Bar */}
                                <div
                                  className={`absolute left-0 top-0 bottom-0 ${OPTION_BAR_COLORS[optIdx % OPTION_BAR_COLORS.length]} opacity-20`}
                                  style={{ width: `${percentage}%` }}
                                />
                                {/* Text (Optional, keeping it clean, maybe just the bar) */}
                              </div>
                              <div className="w-16 text-right shrink-0 flex items-center justify-end gap-2">
                                <span className="font-bold text-slate-700">{percentage}%</span>
                                {isCorrect && config.type !== 'poll' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Right Side: Participation List */}
            <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[600px]">
              {(() => {
                const regStudents = students.filter(s => {
                  const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
                  const cNormalized = (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim();
                  return sNormalized === cNormalized;
                }).sort((a, b) => a.rollNo - b.rollNo);

                return (
                  <>
                    <div className="mb-4">
                      <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Participation</h4>
                      <div className="text-xl font-bold text-slate-800 mt-1">
                        {activeStats.totalResponded} / {regStudents.length} <span className="text-sm font-medium text-slate-500">responded</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                      {regStudents.map(student => {
                        const roll = student.rollNo;
                        const responseIdx = activeStats.studentResponses[roll - 1];
                        const isNoResponse = responseIdx === null || responseIdx === undefined;
                        const isCorrect = responseIdx === activeQuestion.options.indexOf(activeQuestion.correct_answer);

                        let colorClass = 'text-slate-300';
                        let label = 'no response';

                        if (!isNoResponse) {
                          label = OPTION_LABELS[responseIdx];
                          colorClass = config.type === 'poll' ? 'text-slate-600 font-bold' : (isCorrect ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold');
                        }

                        return (
                          <div key={roll} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 shrink-0 rounded-full ${isNoResponse ? 'bg-slate-200' : (config.type === 'poll' ? 'bg-amber-400' : (isCorrect ? 'bg-emerald-400' : 'bg-rose-400'))}`} />
                              <span className="text-sm font-medium text-slate-700 truncate w-32" title={`${roll} ${student.name}`}>
                                {roll} {student.name}
                              </span>
                            </div>
                            <span className={`text-xs ${colorClass}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        )}

        {activeTab === 'answer_key' && (
          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-600" />
              Complete Answer Key
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0 shadow-sm">
                      {idx + 1}
                    </div>
                    <p className="font-semibold text-slate-700 leading-snug">{q.text}</p>
                  </div>
                  <div className="flex flex-col gap-2 pl-12">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correct_answer === opt;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isCorrect
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 ring-1 ring-emerald-500/20 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 opacity-60'
                            }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {OPTION_LABELS[optIdx]}
                          </div>
                          <span className={`text-sm ${isCorrect ? 'font-semibold' : 'font-medium'}`}>
                            {opt}
                          </span>
                          {isCorrect && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Correct <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'student' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Roster List */}
            <div className="w-full lg:w-64 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-slate-700">Select Student</h3>
                {!isSavedView && (
                  <button
                    onClick={handleSaveAllReports}
                    className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-200 transition-colors"
                    title="Save all reports to dashboards"
                  >
                    Save All
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {(() => {
                  const regStudents = students.filter(s => {
                    const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
                    const cNormalized = (config.classNameDisplay || config.classId).toLowerCase().replace('-', ' ').trim();
                    return sNormalized === cNormalized;
                  }).sort((a, b) => a.rollNo - b.rollNo);

                  return regStudents.map(student => {
                    const roll = student.rollNo;
                    const sData = studentReportData[roll];
                    const totalAns = sData ? sData.correct + sData.incorrect : 0;
                    return (
                      <button
                        key={roll}
                        onClick={() => setSelectedRoll(roll)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${selectedRoll === roll ? 'bg-amber-50 text-amber-700' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        <span>{roll} {student.name}</span>
                        {totalAns > 0 && sData ? (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${sData.correct > sData.incorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {Math.round((sData.correct / questions.length) * 100)}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">0%</span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Right Details */}
            <div className="flex-1 flex flex-col gap-6">

              {/* Header Action Bar */}
              <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    {selectedRoll}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Roll {selectedRoll}</h3>
                    <p className="text-xs font-medium text-slate-500">
                      {findStudentByRoll(selectedRoll)?.name || 'Unregistered'}
                    </p>
                  </div>
                </div>
                {!isSavedView && (
                  <button
                    onClick={() => handleSaveReport(selectedRoll)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Report
                  </button>
                )}
              </div>

              {/* Performance Graph & Stats */}
              <div className="flex flex-col md:flex-row gap-6">

                {/* Graphical Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-w-[280px]">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Performance Graph</h4>
                  <div className="relative flex items-center justify-center">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center shadow-inner"
                      style={{
                        background: `conic-gradient(
                          #10B981 0% ${(studentReportData[selectedRoll].correct / questions.length) * 100}%, 
                          #F43F5E ${(studentReportData[selectedRoll].correct / questions.length) * 100}% ${((studentReportData[selectedRoll].correct + studentReportData[selectedRoll].incorrect) / questions.length) * 100}%, 
                          #E2E8F0 ${((studentReportData[selectedRoll].correct + studentReportData[selectedRoll].incorrect) / questions.length) * 100}% 100%
                        )`
                      }}
                    >
                      <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                        <span className="text-2xl font-extrabold text-slate-800">
                          {Math.round((studentReportData[selectedRoll].correct / questions.length) * 100)}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Correct</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Wrong</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Skip</div>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Attempted<br />(Correct)</span>
                    <span className="text-4xl font-extrabold text-emerald-700">{studentReportData[selectedRoll].correct}</span>
                  </div>
                  <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">Attempted<br />(Wrong)</span>
                    <span className="text-4xl font-extrabold text-rose-600">{studentReportData[selectedRoll].incorrect}</span>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center col-span-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Unattempted (Skipped)</span>
                    <span className="text-3xl font-extrabold text-slate-700">{studentReportData[selectedRoll].unattempted}</span>
                  </div>
                </div>
              </div>

              {/* Question List */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col flex-1 h-[420px]">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <List className="w-5 h-5 text-amber-500" />
                  Question Breakdown for {selectedRoll} {findStudentByRoll(selectedRoll)?.name || '(Unregistered)'}
                </h3>
                <div className="overflow-y-auto pr-4 custom-scrollbar space-y-4">
                  {studentReportData[selectedRoll].responses.map((resp, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-slate-400 shrink-0 shadow-sm border border-slate-200">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700 line-clamp-2 mb-2">{questions[i].text}</p>
                        <div className="flex items-center gap-4 text-xs font-medium">
                          <span className="text-slate-500">
                            Correct: <strong className="text-emerald-600">{resp.correctLetter}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          {resp.picked ? (
                            <span className={resp.isCorrect ? 'text-emerald-600 flex items-center gap-1' : 'text-rose-600 flex items-center gap-1'}>
                              Picked: <strong>{resp.picked}</strong>
                              {resp.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : ' (Wrong)'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No Response</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
