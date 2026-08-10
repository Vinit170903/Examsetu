import React, { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: (userName: string, role: 'teacher' | 'admin') => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher');
  const [teacherId, setTeacherId] = useState('ravi@teacher.vidyasetu.in');
  const [teacherPassword, setTeacherPassword] = useState('teacher123');
  const [adminId, setAdminId] = useState('admin@vidyasetu.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'teacher') {
      if (teacherId === 'ravi@teacher.vidyasetu.in' && teacherPassword === 'teacher123') {
        const namePart = teacherId.split('@')[0];
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        onLoginSuccess(capitalized, 'teacher');
      } else {
        setError('Invalid Teacher ID or Password');
      }
    } else {
      if (adminId === 'admin@vidyasetu.in' && adminPassword === 'admin123') {
        const namePart = adminId.split('@')[0];
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        onLoginSuccess(capitalized, 'admin');
      } else {
        setError('Invalid Admin ID or Password');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FBF7EE] min-h-screen">
      <div className="w-full max-w-[440px] bg-white px-[36px] py-[40px] shadow-[0_20px_50px_-24px_rgba(20,33,61,0.2)] rounded-[20px] relative">
        {/* Side Cutouts */}
        <div className="absolute w-[24px] h-[24px] bg-[#FBF7EE] rounded-full top-1/2 -translate-y-1/2 -left-[12px]" />
        <div className="absolute w-[24px] h-[24px] bg-[#FBF7EE] rounded-full top-1/2 -translate-y-1/2 -right-[12px]" />

        {/* Role Toggle */}
        <div className="flex bg-[#FBF7EE] rounded-xl p-1 mb-6 border border-[#E4DCC8]/50 shadow-inner">
          <button
            type="button"
            onClick={() => { setRole('teacher'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-['Inter'] text-[14px] font-semibold transition-all flex items-center justify-center gap-2 ${role === 'teacher'
              ? 'bg-white text-[#14213D] shadow-sm border border-[#E4DCC8]/30'
              : 'text-[#8A8272] hover:text-[#14213D]'
              }`}
          >
            <span>👨‍🏫 🏫</span> Teacher
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-['Inter'] text-[14px] font-semibold transition-all flex items-center justify-center gap-2 ${role === 'admin'
              ? 'bg-[#14213D] text-white shadow-md'
              : 'text-[#8A8272] hover:text-[#14213D]'
              }`}
          >
            <span>🛡️</span> Admin
          </button>
        </div>

        {/* Top Badge */}
        {role === 'teacher' ? (
          <div className="flex items-center gap-1.5 border border-[#2F7A52]/30 bg-[#2F7A52]/5 text-[#2F7A52] px-[10px] py-[4px] rounded-[16px] w-fit mb-[16px]">
            <span className="w-[4px] h-[4px] rounded-full bg-[#2F7A52]" />
            <span className="font-['IBM_Plex_Mono'] text-[9.5px] font-semibold tracking-[0.05em] uppercase">
              Secure Teacher Access
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 border border-[#4F5DE5]/30 bg-[#4F5DE5]/5 text-[#4F5DE5] px-[10px] py-[4px] rounded-[16px] w-fit mb-[16px]">
            <span className="w-[4px] h-[4px] rounded-full bg-[#4F5DE5]" />
            <span className="font-['IBM_Plex_Mono'] text-[9.5px] font-semibold tracking-[0.05em] uppercase">
              Institute Admin Access
            </span>
          </div>
        )}

        <div className="mb-[28px]">
          <h2 className="font-['Space_Grotesk'] text-[26px] font-bold text-[#14213D] mb-[4px] tracking-tight">
            {role === 'teacher' ? 'Teacher Sign In' : 'Admin Sign In'}
          </h2>
          <p className="font-['Inter'] text-[14px] text-[#8A8272] leading-relaxed">
            Sign in to access the exam portal
          </p>
        </div>

        <form className="space-y-[24px]" onSubmit={handleLogin}>
          {role === 'teacher' ? (
            <>
              <div>
                <label htmlFor="teacherId" className="block font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#14213D] uppercase tracking-wider mb-1">
                  Teacher ID
                </label>
                <input
                  id="teacherId"
                  type="text"
                  required
                  className="appearance-none block w-full bg-transparent border-0 border-b-[1.5px] border-[#E4DCC8] px-0 py-2 text-[#14213D] font-['Inter'] text-[15px] focus:outline-none focus:ring-0 focus:border-[#E29B2A] placeholder:text-[#8A8272]/50 transition-colors"
                  placeholder="e.g. ravi@teacher.vidyasetu.in"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#14213D] uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none block w-full bg-transparent border-0 border-b-[1.5px] border-[#E4DCC8] px-0 py-2 text-[#14213D] font-['Inter'] text-[15px] tracking-widest focus:outline-none focus:ring-0 focus:border-[#E29B2A] placeholder:text-[#8A8272]/50 transition-colors"
                  placeholder="••••••••"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="adminId" className="block font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#14213D] uppercase tracking-wider mb-1">
                  Admin ID
                </label>
                <input
                  id="adminId"
                  type="text"
                  required
                  className="appearance-none block w-full bg-transparent border-0 border-b-[1.5px] border-[#E4DCC8] px-0 py-2 text-[#14213D] font-['Inter'] text-[15px] focus:outline-none focus:ring-0 focus:border-[#4F5DE5] placeholder:text-[#8A8272]/50 transition-colors"
                  placeholder="e.g. admin@vidyasetu.in"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="adminPassword" className="block font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#14213D] uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  required
                  className="appearance-none block w-full bg-transparent border-0 border-b-[1.5px] border-[#E4DCC8] px-0 py-2 text-[#14213D] font-['Inter'] text-[15px] tracking-widest focus:outline-none focus:ring-0 focus:border-[#4F5DE5] placeholder:text-[#8A8272]/50 transition-colors"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-0">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                defaultChecked
                className={`h-4 w-4 border-[#E4DCC8] rounded cursor-pointer transition-colors ${role === 'teacher' ? 'text-[#E29B2A] focus:ring-[#E29B2A] accent-[#E29B2A]' : 'text-[#4F5DE5] focus:ring-[#4F5DE5] accent-[#4F5DE5]'
                  }`}
              />
              <label htmlFor="remember_me" className="ml-2 block text-[13px] text-[#8A8272] cursor-pointer font-['Inter']">
                Remember me
              </label>
            </div>

            <div className="text-[13px]">
              <a href="#" className={`font-semibold transition-colors font-['Inter'] ${role === 'teacher' ? 'text-[#14213D] hover:text-[#E29B2A]' : 'text-[#14213D] hover:text-[#4F5DE5]'
                }`}>
                Forgot password?
              </a>
            </div>
          </div>

          {error && (
            <p className="text-[#B5432D] text-[12px] font-medium bg-[#B5432D]/10 p-2.5 rounded-lg border border-[#B5432D]/20">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full font-['Space_Grotesk'] font-bold text-[16px] py-[12px] rounded-[12px] shadow-[0_8px_16px_-8px_rgba(226,155,42,0.6)] hover:-translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2 ${role === 'teacher'
                ? 'bg-[#E29B2A] text-[#14213D] hover:shadow-[0_10px_20px_-8px_rgba(226,155,42,0.8)]'
                : 'bg-[#4F5DE5] text-white hover:shadow-[0_10px_20px_-8px_rgba(79,93,229,0.8)] shadow-[0_8px_16px_-8px_rgba(79,93,229,0.6)]'
                }`}
            >
              Sign In →
            </button>
          </div>
        </form>

        <div className="mt-[24px] text-center border-t border-dashed border-[#E4DCC8] pt-[20px]">
          <p className="text-[12px] text-[#8A8272] font-['Inter']">
            {role === 'teacher' ? 'Roll number based classroom login' : 'Institute-wide control panel'} · Rajasthan Board
          </p>
        </div>
      </div>
    </div>
  );
}

