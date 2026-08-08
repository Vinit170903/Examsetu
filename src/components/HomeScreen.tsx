import React, { useState } from 'react';
import { Plus, Folder, Users, BarChart3, Clock, ChevronRight, CalendarCheck } from 'lucide-react';
import { AppScreen, SavedQuiz } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onStartWizard: (name: string, type: 'quiz' | 'poll') => void;
  onStartCustomQuiz?: (name: string) => void;
  onPlayQuiz: (quiz: SavedQuiz) => void;
  savedQuizzes?: SavedQuiz[];
  savedPolls?: SavedQuiz[];
  userName?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onStartWizard, onStartCustomQuiz, onPlayQuiz, savedQuizzes = [], savedPolls = [], userName = 'Teacher' }) => {
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [createType, setCreateType] = useState<'quiz' | 'poll'>('quiz');
  const [quizMode, setQuizMode] = useState<'ai' | 'custom'>('ai');

  const handleStartQuizClick = () => {
    setShowNamePrompt(true);
  };

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizName.trim()) {
      if (createType === 'poll') {
        onStartWizard(quizName.trim(), 'poll');
      } else {
        if (quizMode === 'custom') {
          onStartCustomQuiz?.(quizName.trim());
        } else {
          onStartWizard(quizName.trim(), 'quiz');
        }
      }
      setShowNamePrompt(false);
      setQuizName('');
      setCreateType('quiz');
      setQuizMode('ai');
    }
  };

  // Get greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const recentContent = [...savedQuizzes, ...savedPolls]
    .sort((a, b) => (b.lastPlayedAt || b.createdAt) - (a.lastPlayedAt || a.createdAt))
    .slice(0, 3);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col p-4 sm:p-8">

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-2">{greeting}, {userName}</h1>
        <p className="text-slate-500 font-medium">Manage your classes and content</p>
      </div>

      {/* Colorful Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full mb-12">
        {/* Card 1: Create Content */}
        <button
          onClick={handleStartQuizClick}
          className="group text-left flex flex-col justify-between bg-[#A8F0C6] p-6 rounded-[2rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[220px]"
        >
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-4 text-[#15803D]">
              <Plus className="w-6 h-6" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold text-[#065F46] mb-2">Create</h2>
            <p className="text-[#166534] text-sm leading-snug">Generate a new interactive AI quiz or poll from a prompt or textbook data.</p>
          </div>
          <div className="font-bold text-[#065F46] flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
            Start <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Card 2: Saved Quizzes */}
        <button
          onClick={() => onNavigate('saved_quizzes')}
          className="group text-left flex flex-col justify-between bg-[#FDE68A] p-6 rounded-[2rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[220px]"
        >
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-4 text-[#D97706]">
              <Folder className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-[#92400E] mb-2">Saved Content</h2>
            <p className="text-[#B45309] text-sm leading-snug">View your saved quizzes and polls, and launch live interactive sessions.</p>
          </div>
          <div className="font-bold text-[#92400E] flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
            Open <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Card 3: Manage Students */}
        <button
          onClick={() => setShowManageModal(true)}
          className="group text-left flex flex-col justify-between bg-[#DDD6FE] p-6 rounded-[2rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[220px]"
        >
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-4 text-[#7C3AED]">
              <Users className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-[#5B21B6] mb-2">Manage Students</h2>
            <p className="text-[#6D28D9] text-sm leading-snug">Pair ESP32 clickers, edit student rosters, and manage classes.</p>
          </div>
          <div className="font-bold text-[#5B21B6] flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
            Manage <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        {/* Card 4: Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="group text-left flex flex-col justify-between bg-[#BFDBFE] p-6 rounded-[2rem] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 min-h-[220px]"
        >
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-4 text-[#2563EB]">
              <BarChart3 className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-[#1E40AF] mb-2">Reports</h2>
            <p className="text-[#1D4ED8] text-sm leading-snug">View detailed performance insights and student analytics.</p>
          </div>
          <div className="font-bold text-[#1E40AF] flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
            View <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentContent.length === 0 ? (
            <div className="col-span-full p-8 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Clock className="w-10 h-10 mb-2 opacity-50" />
              <p>No recent activity. Create a quiz or poll to get started!</p>
            </div>
          ) : (
            recentContent.map((item) => (
              <button
                key={item.id}
                onClick={() => onPlayQuiz(item)}
                className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all text-left"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between items-center">
                  <span>{item.config.type === 'poll' ? 'POLL' : 'QUIZ'} • {item.config.classNameDisplay || `Class ${item.config.classId?.replace('class-', '')}`} {item.config.subjectDisplay || item.config.subject}</span>
                  {item.config.creationMode === 'custom' && (
                    <span className="text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">CUSTOM</span>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1 truncate">{item.config.quizName || 'Untitled'}</h4>
                <div className="text-sm font-medium text-slate-500 mb-4">{item.questions.length} questions</div>

                <div className="text-xs font-semibold text-emerald-600">
                  Ready to play
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Creation Hub Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Create Content</h3>
            <p className="text-slate-500 mb-6">Choose what type of content you want to create.</p>

            <form onSubmit={handleStartSubmit}>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setCreateType('quiz')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${createType === 'quiz' ? 'border-[#A8F0C6] bg-[#A8F0C6]/20 text-[#065F46]' : 'border-slate-200 text-slate-500 hover:border-[#A8F0C6]'}`}
                >
                  Create Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setCreateType('poll')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${createType === 'poll' ? 'border-[#FBCFE8] bg-[#FBCFE8]/20 text-[#831843]' : 'border-slate-200 text-slate-500 hover:border-[#FBCFE8]'}`}
                >
                  Create Poll
                </button>
              </div>

              {createType === 'quiz' && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setQuizMode('custom')}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${quizMode === 'custom' ? 'border-amber-400 bg-amber-50' : 'border-slate-100 bg-slate-50 hover:border-amber-200'}`}
                  >
                    <div className="text-xl mb-1 text-amber-500">✍️</div>
                    <h4 className="font-bold text-slate-800 text-sm">Custom Quiz</h4>
                    <p className="text-xs text-slate-500 mt-1">Manual Builder</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizMode('ai')}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${quizMode === 'ai' ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-indigo-200'}`}
                  >
                    <div className="text-xl mb-1 text-indigo-500">✨</div>
                    <h4 className="font-bold text-slate-800 text-sm">AI Quiz</h4>
                    <p className="text-xs text-slate-500 mt-1">Auto Generate</p>
                  </button>
                </div>
              )}

              <input
                type="text"
                autoFocus
                placeholder={createType === 'quiz' ? "e.g. Science Midterm Quiz" : "e.g. Class Opinion Poll"}
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg mb-6 outline-none"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNamePrompt(false)}
                  className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quizName.trim()}
                  className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Start Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Students / Attendance Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Manage Class & Attendance</h3>
                <p className="text-slate-500">What would you like to do?</p>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Handle Students */}
              <button
                onClick={() => {
                  setShowManageModal(false);
                  onNavigate('student_add');
                }}
                className="group text-left p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all flex flex-col h-full"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-700">Handle Students</h4>
                <p className="text-sm text-slate-500 flex-1">Register new students, assign clickers, and manage your class rosters.</p>
              </button>

              {/* Option 2: Mark Attendance */}
              <button
                onClick={() => {
                  setShowManageModal(false);
                  onNavigate('attendance');
                }}
                className="group text-left p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-rose-400 hover:bg-rose-50 transition-all flex flex-col h-full"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-xl mb-4 text-rose-600 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-rose-700">Mark Attendance</h4>
                <p className="text-sm text-slate-500 flex-1">Take daily live attendance using hardware clickers for your classes.</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
