import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Smartphone, Sparkles, UserCheck } from 'lucide-react';

interface JoinScreenProps {
  initialCode?: string;
  onJoin: (joinCode: string, studentId: string, name: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({
  initialCode = '',
  onJoin,
  isLoading = false,
  error,
}) => {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !studentId.trim() || !name.trim()) return;
    onJoin(code.trim().toUpperCase(), studentId.trim(), name.trim());
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#4F3FE0] to-[#8B5CF6] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/25">
            <Smartphone className="w-7 h-7" />
          </div>

          <h1 className="font-display font-bold text-2xl text-slate-900">
            Join Live Quiz
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your room join code and student credentials to participate live.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              6-Digit Join Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-amber-200 rounded-xl font-mono font-extrabold text-center text-2xl tracking-widest text-amber-700 uppercase focus:bg-white focus:border-amber-600 focus:outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Student Roll No. / ID
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 101 or S0912"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:bg-white focus:border-amber-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:bg-white focus:border-amber-600 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !code || !studentId || !name}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#4F3FE0] to-[#8B5CF6] hover:from-amber-700 hover:to-violet-700 text-white font-display font-bold text-base rounded-2xl shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isLoading ? 'Joining Session...' : 'Enter Live Quiz'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 text-[11px] text-slate-400">
          Powered by VidyaSetu Real-Time Sync Engine
        </div>
      </div>
    </div>
  );
};
