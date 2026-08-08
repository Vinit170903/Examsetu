import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question, QuizConfig, Student } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useCountdown } from '../hooks/useCountdown';
import { Users, Play, Pause, SkipForward, RotateCcw, AlertTriangle, Sparkles, CheckCircle2, Usb, Unplug, Image as ImageIcon } from 'lucide-react';
import { useGlobalWebSerial } from '../hooks/WebSerialProvider';
import { StudentManageScreen } from './StudentManageScreen';

interface LiveQuizScreenProps {
  config: QuizConfig;
  questions: Question[];
  students: Student[];
  allowedClasses: string[];
  isFallback?: boolean;
  fallbackError?: string | null;
  onFinishQuiz: (results: Record<number, string>[]) => void;
  onSaveStudent: (student: Student) => void;
}

export const LiveQuizScreen: React.FC<LiveQuizScreenProps> = ({
  config,
  questions,
  isFallback,
  fallbackError,
  onFinishQuiz,
  students,
  allowedClasses,
  onSaveStudent,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [quizResults, setQuizResults] = useState<Record<number, string>[]>([]);
  const [showPollResults, setShowPollResults] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const { isConnected, connect, disconnect, clickLog, resetAnswered } = useGlobalWebSerial();
  const { showToast } = useToast();
  const lastProcessedClickTimestamp = useRef<number>(0);

  // Notify when an unregistered clicker tries to answer
  useEffect(() => {
    if (clickLog.length === 0) return;
    const latestClick = clickLog[0];
    
    if (latestClick.timestamp <= lastProcessedClickTimestamp.current) return;
    lastProcessedClickTimestamp.current = latestClick.timestamp;

    let student = undefined;
    if (latestClick.macId) {
      student = students.find(s => s.macId === latestClick.macId && s.classId === config.classNameDisplay);
    } else if (latestClick.rollNum !== undefined) {
      student = students.find(s => s.rollNo === latestClick.rollNum && s.classId === config.classNameDisplay);
    } else if (latestClick.name) {
      student = students.find(s => s.name.toLowerCase() === latestClick.name.toLowerCase() && s.classId === config.classNameDisplay);
    }

    if (!student) {
      showToast(`Roll ${latestClick.rollNum !== undefined ? latestClick.rollNum : 'Unknown'} has no student registered in ${config.classNameDisplay}!`, 'warning');
    }
  }, [clickLog, students, config.classId, showToast]);

  // Compute which actual roll numbers have answered for this question
  const answeredRolls = new Set(
    clickLog.map(click => {
      let student = undefined;
      if (click.macId) {
        student = students.find(s => s.macId === click.macId && s.classId === config.classNameDisplay);
      } else if (click.rollNum !== undefined) {
        student = students.find(s => s.rollNo === click.rollNum && s.classId === config.classNameDisplay);
      } else if (click.name) {
        student = students.find(s => s.name.toLowerCase() === click.name.toLowerCase() && s.classId === config.classNameDisplay);
      }
      return student ? student.rollNo : undefined;
    }).filter((r): r is number => r !== undefined)
  );

  const currentQuestion = questions[currentIndex] || {
    id: 'Q1',
    text: 'Loading question data...',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: '',
    chapter_label: config.chapters[0]?.chapter_label || 'General',
    marks: 1,
  };

  const totalQuestions = questions.length;

  const handleNextQuestion = useCallback(() => {
    // Build current answers from clickLog to ensure accurate MAC->Roll mapping
    const currentAnswers: Record<number, string> = {};

    clickLog.forEach(click => {
      let rollNo = undefined;
      
      let student = undefined;
      if (click.macId) {
        student = students.find(s => s.macId === click.macId && s.classId === config.classNameDisplay);
      } else if (click.rollNum !== undefined) {
        student = students.find(s => s.rollNo === click.rollNum && s.classId === config.classNameDisplay);
      } else if (click.name) {
        student = students.find(s => s.name.toLowerCase() === click.name.toLowerCase() && s.classId === config.classNameDisplay);
      }
      
      if (student) {
        rollNo = student.rollNo;
      }

      if (rollNo !== undefined) {
        currentAnswers[rollNo] = click.answer;
      }
    });

    const nextResults = [...quizResults, currentAnswers];
    
    setQuizResults(nextResults);
    resetAnswered();
    setShowPollResults(false);

    if (currentIndex + 1 >= totalQuestions) {
      onFinishQuiz(nextResults);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions, onFinishQuiz, resetAnswered, clickLog, quizResults, students, config.type, showPollResults]);

  const handlePrevQuestion = () => {
    resetAnswered();
    setShowPollResults(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Dynamic timer with auto-advance on expiration
  const timerLimit = config.timerSeconds || 30;
  const { secondsLeft, isActive, resetTimer, pauseTimer, resumeTimer } = useCountdown(timerLimit, handleNextQuestion);

  // Reset timer whenever question index changes
  useEffect(() => {
    resetTimer(timerLimit);
  }, [currentIndex, resetTimer, timerLimit]);

  // Roll number roster array from registered students
  const classStudentsForRoster = students.filter(s => s.classId.toLowerCase().replace('-', ' ').trim() === config.classNameDisplay.toLowerCase().replace('-', ' ').trim());
  const rosterRollNumbers = classStudentsForRoster.map(s => s.rollNo).sort((a, b) => a - b);

  // Calculate poll results if showing (always show for live polls)
  const isLivePoll = config.type === 'poll' && config.showLiveResults !== false;
  const shouldShowBars = showPollResults || isLivePoll;

  const pollCounts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
  let totalPollVotes = 0;
  if (shouldShowBars) {
    clickLog.forEach(click => {
      if (click.answer && (click.answer === 'A' || click.answer === 'B' || click.answer === 'C' || click.answer === 'D')) {
        pollCounts[click.answer]++;
        totalPollVotes++;
      }
    });
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-[32px] items-start font-['Inter'] bg-[#FBF7EE] text-[#14213D] w-full min-h-[calc(100vh-80px)] rounded-[24px] p-[32px] sm:p-[40px] shadow-sm">
      {/* Fallback Banner Notice if WebSocket was offline */}
      {isFallback && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-medium w-full mb-4 col-span-full">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Sample NCERT Questions Active:</strong> {fallbackError || 'Using offline fallback dataset'}
            </span>
          </div>
        </div>
      )}

      {/* LEFT PANEL: Roll Number Roster */}
      <aside className="w-full lg:w-[320px] bg-white rounded-[16px] p-[26px_24px] shrink-0 shadow-[0_14px_34px_-18px_rgba(20,33,61,0.16)]">
        <div className="flex items-center justify-between mb-[4px]">
          <h3 className="font-['Space_Grotesk'] text-[14px] tracking-[0.02em] font-bold">
            {config.type === 'poll' ? 'Live Responses' : 'Classroom Register'}
          </h3>
          <button
            onClick={isConnected ? disconnect : connect}
            className={`font-['IBM_Plex_Mono'] text-[10.5px] font-semibold px-[9px] py-[5px] rounded-[16px] cursor-pointer transition-colors ${isConnected
                ? 'text-[#2F7A52] bg-[#2F7A52]/10 border border-[#2F7A52]/25'
                : 'text-[#4C5FD5] bg-[#4C5FD5]/10 border border-[#4C5FD5]/25'
              }`}
          >
            {isConnected ? '✓ Connected' : '⚡ Connect'}
          </button>
        </div>
        <div className="text-[11.5px] text-[#8A8272] my-[10px] pb-[14px] border-b border-dashed border-[#E4DCC8]">
          {config.type === 'poll' ? 'Green = student ne respond kar diya hai' : `Registered students in ${config.classNameDisplay} · ${rosterRollNumbers.length} roll numbers`}
        </div>

        {config.isAnonymous ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center border-2 border-dashed border-[#E4DCC8] rounded-xl bg-slate-50/50">
            <Users className="w-10 h-10 text-slate-300 mb-3" />
            <h4 className="text-slate-600 font-bold mb-1">Anonymous Mode</h4>
            <p className="text-slate-400 text-xs">Roll numbers are hidden.</p>
            <div className="mt-4 text-2xl font-black text-indigo-600">{answeredRolls.size} / {config.rollCount || 0}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Responses</div>
          </div>
        ) : (!config.rollCount || rosterRollNumbers.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center border-2 border-dashed border-amber-200 rounded-xl bg-amber-50">
            <Users className="w-10 h-10 text-amber-300 mb-3" />
            <h4 className="text-amber-800 font-bold mb-1">Undefined Students</h4>
            <p className="text-amber-600/70 text-xs mb-4 px-4">No students are assigned for this class yet. Please add students to see their rolls here.</p>
            <button
              onClick={() => setShowAddStudent(true)}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2"
            >
              + Add Student
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[8px] max-h-[400px] overflow-y-auto">
            {rosterRollNumbers.map((roll) => {
              const hasAnswered = answeredRolls.has(roll);
              return (
                <div
                  key={roll}
                  className={`font-['IBM_Plex_Mono'] text-center border rounded-[8px] py-[9px] text-[12px] font-semibold transition-all ${hasAnswered
                      ? config.type === 'poll' ? 'border-[#2F7A52] bg-[#2F7A52]/10 text-[#2F7A52]' : 'border-[#E29B2A] bg-[#E29B2A]/10 text-[#E29B2A]'
                      : 'border-[#E4DCC8] bg-[#FBF7EE] text-[#2A3B63]'
                    }`}
                >
                  <small className={`block text-[8.5px] font-medium tracking-[0.04em] ${hasAnswered ? (config.type === 'poll' ? 'text-[#2F7A52]' : 'text-[#E29B2A]') : 'text-[#8A8272]'}`}>ROLL</small>
                  {roll}
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* RIGHT PANEL: Main Question */}
      <main className="flex-1 min-w-0">
        <div className="bg-white rounded-[20px] p-[36px_40px] relative shadow-[0_20px_50px_-24px_rgba(20,33,61,0.2)]">

          <div className="absolute w-[26px] h-[26px] bg-[#FBF7EE] rounded-full top-[80px] -left-[13px]" />
          <div className="absolute w-[26px] h-[26px] bg-[#FBF7EE] rounded-full top-[80px] -right-[13px]" />

          <div className="flex items-center justify-between mb-[22px]">
            <div className="flex items-center gap-[12px] flex-wrap">
              {config.type === 'poll' ? (
                <div className="font-['IBM_Plex_Mono'] text-[11.5px] font-semibold bg-[#14213D] text-[#FBF7EE] px-[12px] py-[6px] rounded-[20px] tracking-[0.03em] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE POLL
                </div>
              ) : (
                <div className="font-['IBM_Plex_Mono'] text-[11.5px] font-semibold bg-[#14213D] text-[#FBF7EE] px-[12px] py-[6px] rounded-[20px] tracking-[0.03em]">
                  QUESTION {currentIndex + 1} OF {totalQuestions}
                </div>
              )}
              <div>
                {config.type === 'poll' ? (
                  <div className="text-[13.5px] text-[#8A8272] font-medium">
                    {config.classNameDisplay} · {config.subject} · {answeredRolls.size} responses so far
                  </div>
                ) : (
                  <>
                    <div className="text-[13.5px] text-[#2A3B63] font-medium">{currentQuestion.chapter_label || 'NCERT Chapter'}</div>
                    <span className="text-[12px] text-[#8A8272] block mt-[2px]">{config.classNameDisplay} · {config.subject} ({config.medium})</span>
                  </>
                )}
              </div>
            </div>

            <div className="w-[58px] h-[58px] rounded-full relative shrink-0 cursor-pointer" onClick={isActive ? pauseTimer : resumeTimer}>
              <svg width="58" height="58" viewBox="0 0 58 58" className="-rotate-90">
                <circle cx="29" cy="29" r="25" stroke="#E4DCC8" strokeWidth="5" fill="none" />
                <circle
                  cx="29" cy="29" r="25" stroke="#E29B2A" strokeWidth="5" fill="none"
                  strokeDasharray="157" strokeDashoffset={showPollResults ? 157 : 157 - (157 * secondsLeft) / timerLimit} strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-['IBM_Plex_Mono'] font-semibold text-[15px] text-[#14213D]">
                {showPollResults ? '0s' : `${secondsLeft}s`}
              </div>
            </div>
          </div>

          {currentQuestion.imageUrl && config.creationMode === 'custom' ? (
            <div className="flex flex-col lg:flex-row gap-6 mb-[28px]">
              <div className="relative w-full lg:w-[280px] shrink-0 bg-white border border-[#E4DCC8] rounded-[16px] p-2 flex items-center justify-center min-h-[160px] overflow-hidden">
                <img src={currentQuestion.imageUrl} alt="Question Media" className="max-w-full max-h-[220px] object-contain rounded-[12px]" />
                <div className="absolute bottom-2 left-2 bg-[#14213D]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                  <ImageIcon className="w-3.5 h-3.5" /> Teacher-uploaded image
                </div>
              </div>
              <div className="flex-1 bg-[#14213D] text-white font-['Space_Grotesk'] text-[20px] font-semibold leading-relaxed rounded-[16px] p-[28px_30px] shadow-[0_10px_20px_-10px_rgba(20,33,61,0.5)] flex items-center">
                {currentQuestion.text}
              </div>
            </div>
          ) : currentQuestion.imageUrl ? (
            <div className="mb-[28px]">
               <div className="mb-4">
                 <img src={currentQuestion.imageUrl} alt="Question Media" className="max-h-[220px] rounded-[12px]" />
               </div>
               <div className="font-['Space_Grotesk'] text-[20px] font-semibold leading-relaxed text-[#14213D] bg-[#FBF7EE] border border-[#E4DCC8] rounded-[14px] p-[28px_30px]">
                 {currentQuestion.text}
               </div>
            </div>
          ) : (
            <div className="font-['Space_Grotesk'] text-[20px] font-semibold leading-relaxed text-[#14213D] bg-[#FBF7EE] border border-[#E4DCC8] rounded-[14px] p-[28px_30px] mb-[28px]">
              {currentQuestion.text}
            </div>
          )}

          <div className="flex flex-col gap-[12px] mb-[30px]">
            {(currentQuestion.options || []).map((opt, optIdx) => {
              const optionLetter = String.fromCharCode(65 + optIdx) as 'A'|'B'|'C'|'D';
              let hoverBorder = 'hover:border-[#E4DCC8]';
              let bubbleBg = 'bg-[#14213D]';

              if (optIdx === 0) { bubbleBg = 'bg-[#E29B2A]'; hoverBorder = 'hover:border-[#E29B2A]'; }
              if (optIdx === 1) { bubbleBg = 'bg-[#4C5FD5]'; hoverBorder = 'hover:border-[#4C5FD5]'; }
              if (optIdx === 2) { bubbleBg = 'bg-[#2A9D8F]'; hoverBorder = 'hover:border-[#2A9D8F]'; }
              if (optIdx === 3) { bubbleBg = 'bg-[#8B5FA3]'; hoverBorder = 'hover:border-[#8B5FA3]'; }

              const votes = pollCounts[optionLetter] || 0;
              const percent = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;

              return (
                <div key={optIdx} className="relative w-full">
                  <div className={`flex items-center gap-[16px] border-[1.5px] border-[#E4DCC8] rounded-[12px] p-[14px_18px] cursor-pointer transition-all ${!shouldShowBars ? hoverBorder + ' hover:translate-x-[3px]' : 'border-transparent'} group relative z-10 ${shouldShowBars ? '' : 'bg-white/40'}`}>
                    <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-['Space_Grotesk'] font-bold text-[15px] text-white shrink-0 z-20 ${bubbleBg}`}>
                      {optionLetter}
                    </div>
                    <div className="text-[14.5px] text-[#14213D] font-medium flex-1 z-20">
                      {opt}
                      {currentQuestion.optionImages?.[optIdx] && (
                        <div className="mt-3">
                          <img src={currentQuestion.optionImages[optIdx]} alt={`Option ${optionLetter}`} className="max-h-[120px] object-contain rounded-lg shadow-sm border border-[#E4DCC8]" />
                        </div>
                      )}
                      {shouldShowBars && (
                        <div className="text-[11px] text-[#8A8272] mt-[2px]">{votes} votes</div>
                      )}
                    </div>
                    {shouldShowBars && (
                      <div className="font-['IBM_Plex_Mono'] font-bold text-[14px] text-[#14213D] z-20">
                        {percent}%
                      </div>
                    )}
                  </div>
                  {shouldShowBars && (
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-[12px] opacity-20 z-0 ${bubbleBg}`} 
                      style={{ width: `${percent}%`, transition: 'width 0.3s ease-in-out' }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-[22px] border-t border-dashed border-[#E4DCC8]">
            <button
              disabled={currentIndex === 0}
              onClick={handlePrevQuestion}
              className="font-['Inter'] text-[13.5px] font-semibold text-[#8A8272] bg-transparent border-none cursor-pointer transition-colors hover:text-[#14213D] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous Question
            </button>
            <div className="flex gap-[10px]">
              <button
                onClick={() => onFinishQuiz([...quizResults, {}])}
                className="font-['Inter'] text-[13.5px] font-semibold px-[20px] py-[11px] rounded-[9px] border-[1.5px] border-[#E4DCC8] bg-white text-[#2A3B63] cursor-pointer transition-all hover:bg-[#FBF7EE] hover:border-[#8A8272]"
              >
                {config.type === 'poll' ? 'End Poll Session' : 'End Quiz'}
              </button>
              <button
                onClick={handleNextQuestion}
                className="font-['Space_Grotesk'] font-bold text-[14px] px-[22px] py-[11px] rounded-[9px] border-none bg-[#E29B2A] text-[#14213D] cursor-pointer shadow-[0_10px_22px_-10px_rgba(226,155,42,0.6)] transition-all hover:-translate-y-[1px] hover:shadow-[0_12px_24px_-10px_rgba(226,155,42,0.8)]"
              >
                {config.type === 'poll' ? (currentIndex + 1 >= totalQuestions ? 'Finish Poll ▶' : 'Next Poll ▶') : (currentIndex + 1 >= totalQuestions ? `Finish Quiz ▶` : `Next Question ▶`)}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="overflow-y-auto">
              <StudentManageScreen
                students={students}
                allowedClasses={allowedClasses}
                initialClassId={config.classId}
                onSaveStudent={(s) => {
                  onSaveStudent(s);
                  // Update rollCount dynamically if we're not anonymous
                  if (!config.isAnonymous) {
                    const classStudentsCount = students.filter(p => p.classId === config.classId).length + 1; // +1 for the newly added student (optimistic update)
                    config.rollCount = classStudentsCount;
                  }
                }}
                onBack={() => setShowAddStudent(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
