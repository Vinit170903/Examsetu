import React, { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: (userName: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [teacherId, setTeacherId] = useState('ravi@teacher.vidyasetu.in');
  const [password, setPassword] = useState('teacher123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (teacherId === 'ravi@teacher.vidyasetu.in' && password === 'teacher123') {
      const namePart = teacherId.split('@')[0];
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      onLoginSuccess(capitalized);
    } else {
      setError('Invalid Teacher ID or Password');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#FBF7EE] min-h-screen">
      <div className="w-full max-w-[420px] bg-white px-[40px] py-[44px] shadow-[0_20px_50px_-24px_rgba(20,33,61,0.2)] rounded-[20px] relative">
        {/* Side Cutouts */}
        <div className="absolute w-[26px] h-[26px] bg-[#FBF7EE] rounded-full top-1/2 -translate-y-1/2 -left-[13px]" />
        <div className="absolute w-[26px] h-[26px] bg-[#FBF7EE] rounded-full top-1/2 -translate-y-1/2 -right-[13px]" />

        {/* Top Badge */}
        <div className="flex items-center gap-2 border border-[#2F7A52]/30 bg-[#2F7A52]/5 text-[#2F7A52] px-[12px] py-[6px] rounded-[20px] w-fit mb-[24px]">
          <span className="w-[5px] h-[5px] rounded-full bg-[#2F7A52]" />
          <span className="font-['IBM_Plex_Mono'] text-[10.5px] font-semibold tracking-[0.05em] uppercase">
            Secure Teacher Access
          </span>
        </div>

        <div className="mb-[32px]">
          <h2 className="font-['Space_Grotesk'] text-[28px] font-bold text-[#14213D] mb-[8px] tracking-tight">
            Teacher Sign In
          </h2>
          <p className="font-['Inter'] text-[14.5px] text-[#8A8272] leading-relaxed">
            Sign in to access the exam portal</p>
        </div>

        <form className="space-y-[28px]" onSubmit={handleLogin}>
          <div>
            <label htmlFor="teacherId" className="block font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#14213D] uppercase tracking-wider mb-2">
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
            <label htmlFor="password" className="block font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#14213D] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="appearance-none block w-full bg-transparent border-0 border-b-[1.5px] border-[#E4DCC8] px-0 py-2 text-[#14213D] font-['Inter'] text-[15px] tracking-widest focus:outline-none focus:ring-0 focus:border-[#E29B2A] placeholder:text-[#8A8272]/50 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-[#E29B2A] focus:ring-[#E29B2A] border-[#E4DCC8] rounded cursor-pointer transition-colors accent-[#E29B2A]"
              />
              <label htmlFor="remember_me" className="ml-2 block text-[13.5px] text-[#8A8272] cursor-pointer font-['Inter']">
                Remember me
              </label>
            </div>

            <div className="text-[13.5px]">
              <a href="#" className="font-semibold text-[#14213D] hover:text-[#E29B2A] transition-colors font-['Inter']">
                Forgot password?
              </a>
            </div>
          </div>

          {error && (
            <p className="text-[#B5432D] text-[13px] font-medium bg-[#B5432D]/10 p-3 rounded-lg border border-[#B5432D]/20">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full font-['Space_Grotesk'] font-bold text-[16px] py-[14px] rounded-[12px] bg-[#E29B2A] text-[#14213D] shadow-[0_10px_22px_-10px_rgba(226,155,42,0.6)] hover:-translate-y-[1px] hover:shadow-[0_12px_24px_-10px_rgba(226,155,42,0.8)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Sign In →
            </button>
          </div>
        </form>

        <div className="mt-[28px] text-center border-t border-dashed border-[#E4DCC8] pt-[20px]">
          <p className="text-[11.5px] text-[#8A8272] font-['Inter']">
            Roll number based classroom login · Rajasthan Board
          </p>
        </div>
      </div>
    </div>
  );
}
