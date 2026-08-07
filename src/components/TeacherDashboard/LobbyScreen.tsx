import React, { useState } from 'react';
import { QuizSession } from '../../types';
import { Users, Copy, Check, Play, Loader2, Sparkles, AlertTriangle, UserPlus, QrCode } from 'lucide-react';

interface LobbyScreenProps {
  session: QuizSession;
  isGenerating: boolean;
  isFallback: boolean;
  fallbackError?: string | null;
  onStartQuiz: () => void;
  onAddSimulatedStudent?: (name: string, studentId: string) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  session,
  isGenerating,
  isFallback,
  fallbackError,
  onStartQuiz,
  onAddSimulatedStudent,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [simName, setSimName] = useState('');

  const joinCode = session.joinCode;
  const questionsCount = session.questions.length;
  const studentsCount = session.students.length;
  const canStart = studentsCount > 0 && questionsCount > 0 && !isGenerating;

  const joinUrl = `${window.location.origin}?role=student&code=${joinCode}`;

  const copyJoinCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !onAddSimulatedStudent) return;
    const randId = Math.floor(1000 + Math.random() * 9000).toString();
    onAddSimulatedStudent(simName.trim(), randId);
    setSimName('');
  };

  const quickBots = ['Rohan Sharma', 'Ananya Gupta', 'Aarav Patel', 'Priya Verma'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Fallback Banner if backend WS failed */}
      {isFallback && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-950">MCQ WebSocket Fallback Active</p>
            <p className="text-amber-800 text-xs mt-0.5">
              {fallbackError || 'Could not connect to ws://localhost:8001/api/v1/lms/papers/generate-mcq. Using 5 pre-loaded NCERT Class 9 Science questions.'}
            </p>
          </div>
        </div>
      )}

      {/* Hero Join Code & Generation Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Join Code Tile */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#4F3FE0] via-amber-600 to-[#8B5CF6] rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/15 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Session Ready
              </span>
              <span className="text-xs text-white/80 font-medium">
                {session.config?.subject || 'Science'} • {session.config?.ncert_class || 'Class 9'}
              </span>
            </div>

            <p className="text-xs font-medium text-amber-100 uppercase tracking-widest">
              Student Join Code
            </p>
            <div className="flex items-center gap-4 mt-2">
              <h1 className="font-mono font-extrabold text-5xl sm:text-6xl tracking-wider text-white drop-shadow-xs">
                {joinCode}
              </h1>

              <div className="flex flex-col gap-2">
                <button
                  onClick={copyJoinCode}
                  className="px-3 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 backdrop-blur-sm transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={copyJoinLink}
                  className="px-3 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 backdrop-blur-sm transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <QrCode className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-amber-100">
            <span>Students can open device view and enter <b>{joinCode}</b></span>
            <span>Room: Section {session.config?.section_id || 'A'}</span>
          </div>
        </div>

        {/* Question Generation Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              MCQ Stream Progress
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isGenerating ? 'Generating questions via WebSocket...' : 'Questions ready for live quiz'}
            </p>

            <div className="mt-6">
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 mb-2">
                <span>Questions Generated</span>
                <span className="font-mono text-amber-600">{session.completed} / {session.requested}</span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#4F3FE0] to-[#8B5CF6] rounded-full transition-all duration-300"
                  style={{ width: `${(session.completed / Math.max(1, session.requested)) * 100}%` }}
                />
              </div>

              {isGenerating && (
                <div className="flex items-center gap-2 text-xs text-amber-600 font-medium mt-3 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Streaming question payload...</span>
                </div>
              )}
            </div>
          </div>

          {/* Start Quiz Action Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onStartQuiz}
              disabled={!canStart}
              className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                canStart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer scale-102'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {!canStart
                  ? studentsCount === 0
                    ? 'Waiting for student to join...'
                    : 'Generating questions...'
                  : `Start Live Quiz (${studentsCount} Student${studentsCount > 1 ? 's' : ''})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Roster Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                Connected Students
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-mono font-bold">
                  {studentsCount} Joined
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Students will appear here live when they join on their mobile device or tab.
              </p>
            </div>
          </div>

          {/* Quick Bot Add Form for Easy Single-Window Testing */}
          {onAddSimulatedStudent && (
            <form onSubmit={handleAddBot} className="flex items-center gap-2">
              <input
                type="text"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                placeholder="Student Name..."
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 w-36"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs rounded-lg border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Join Bot</span>
              </button>
            </form>
          )}
        </div>

        {/* Roster Grid */}
        {studentsCount === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mt-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Users className="w-6 h-6" />
            </div>
            <p className="font-display font-semibold text-slate-800 text-sm">No students in lobby yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Share join code <strong className="font-mono text-amber-600">{joinCode}</strong> or click below to add a test student bot to try the quiz!
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              <span className="text-xs text-slate-400 font-medium self-center">Quick Add:</span>
              {quickBots.map((botName, idx) => (
                <button
                  key={idx}
                  onClick={() => onAddSimulatedStudent && onAddSimulatedStudent(botName, `S10${idx + 1}`)}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-600 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  + {botName}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
            {session.students.map((student, index) => (
              <div
                key={student.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 animate-fade-in"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{student.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">ID: {student.studentId}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Connected" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
