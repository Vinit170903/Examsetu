import React, { useState } from 'react';
import { Plus, Folder, Users, BarChart3, Clock, ChevronRight } from 'lucide-react';
import { AppScreen, SavedQuiz } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onStartWizard: (name: string, type: 'quiz' | 'poll') => void;
  onPlayQuiz: (quiz: SavedQuiz) => void;
  savedQuizzes?: SavedQuiz[];
  savedPolls?: SavedQuiz[];
  userName?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onStartWizard, onPlayQuiz, savedQuizzes = [], savedPolls = [], userName = 'Teacher' }) => {
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [quizName, setQuizName] = useState('');
  const [createType, setCreateType] = useState<'quiz' | 'poll'>('quiz');

  const handleStartQuizClick = () => {
    setShowNamePrompt(true);
  };

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizName.trim()) {
      onStartWizard(quizName.trim(), createType);
      setShowNamePrompt(false);
      setQuizName('');
      setCreateType('quiz');
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
          onClick={() => onNavigate('student_add')}
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
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {item.config.type === 'poll' ? 'POLL' : 'QUIZ'} • {item.config.classNameDisplay || `Class ${item.config.classId?.replace('class-', '')}`} {item.config.subjectDisplay || item.config.subject}
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

      {/* Quiz Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Name Your Creation</h3>
            <p className="text-slate-500 mb-6">Select the type and give it a descriptive name before we start generating.</p>

            <form onSubmit={handleStartSubmit}>
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setCreateType('quiz')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${createType === 'quiz' ? 'border-[#A8F0C6] bg-[#A8F0C6]/20 text-[#065F46]' : 'border-slate-200 text-slate-500 hover:border-[#A8F0C6]'}`}
                >
                  Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setCreateType('poll')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${createType === 'poll' ? 'border-[#FBCFE8] bg-[#FBCFE8]/20 text-[#831843]' : 'border-slate-200 text-slate-500 hover:border-[#FBCFE8]'}`}
                >
                  Poll
                </button>
              </div>

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
                  Start Wizard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
