import React from 'react';
import { QuizSession, Student } from '../../types';
import { Loader2, Users, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

interface WaitingLobbyProps {
  session: QuizSession;
  student: Student;
}

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({ session, student }) => {
  const classmatesCount = session.students.length;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 text-center space-y-6">
        {/* Animated Pulsing Status Ring */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
          <div className="w-20 h-20 bg-gradient-to-tr from-[#4F3FE0] to-[#8B5CF6] text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 relative z-10">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        </div>

        <div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full inline-flex items-center gap-1.5 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Connected to Live Room
          </span>

          <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">
            You're In!
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Waiting for the teacher to start the quiz...
          </p>
        </div>

        {/* Joined Student Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-violet-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
              {student.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{student.name}</p>
              <p className="text-xs text-slate-500 font-mono">ID: {student.studentId}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
            Ready
          </span>
        </div>

        {/* Room Info */}
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between text-xs text-amber-950 font-medium">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Classmates Connected:</span>
          </div>
          <span className="font-mono font-bold text-sm text-amber-700 bg-white px-2.5 py-1 rounded-lg shadow-2xs border border-amber-200">
            {classmatesCount} Joined
          </span>
        </div>

        <div className="pt-2 text-xs text-slate-400">
          Quiz will launch automatically on your screen as soon as teacher clicks "Start Quiz".
        </div>
      </div>
    </div>
  );
};
