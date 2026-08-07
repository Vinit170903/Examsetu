import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

interface NavbarProps {
  onResetQuiz?: () => void;
  isQuizActive?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetQuiz, isQuizActive, onLogout }) => {
  return (
    <header className="h-16 bg-[#14213D] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-[14px]">
        <div className="w-[38px] h-[38px] border-2 border-dashed border-[#E29B2A] rounded-full flex items-center justify-center font-['Space_Grotesk'] font-bold text-[16px] text-[#E29B2A] shrink-0">
          E
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="font-['Space_Grotesk'] font-bold text-[17px] text-[#FBF7EE]">
              ExamSetu <span className="text-[#E29B2A]">Live Quiz</span>
            </span>
            <span className="ml-[10px] font-['IBM_Plex_Mono'] text-[10px] tracking-[0.06em] bg-[#E29B2A]/15 border border-[#E29B2A]/40 text-[#E29B2A] px-[10px] py-[4px] rounded-full flex items-center gap-1 uppercase">
              Teacher Projection Mode
            </span>
          </div>
          <p className="text-[11px] text-[#9AA3C0] mt-[1px] hidden sm:block">
            NCERT Single-Screen Classroom Live Quiz Projection Tool
          </p>
        </div>
      </div>

      <div className="flex items-center gap-[10px]">
        {isQuizActive && onResetQuiz && (
          <button
            onClick={onResetQuiz}
            className="font-['Inter'] text-[13px] font-semibold px-[16px] py-[9px] rounded-[8px] border border-white/15 bg-white/5 text-[#FBF7EE] transition-colors hover:bg-white/10 cursor-pointer"
          >
            End &amp; Start New Quiz
          </button>
        )}
        <button className="hidden lg:flex items-center gap-[7px] font-['Inter'] text-[13px] font-semibold px-[16px] py-[9px] rounded-[8px] border border-[#2F7A52]/40 bg-[#2F7A52]/12 text-[#B9F0D2] cursor-default">
          <span className="w-[7px] h-[7px] rounded-full bg-[#2F7A52]" />
          Projector Ready · 16:9
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="font-['Inter'] text-[13px] font-semibold px-[16px] py-[9px] rounded-[8px] border border-[#B5432D]/40 bg-transparent text-[#F2A995] hover:bg-[#B5432D]/10 transition-colors cursor-pointer"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};
