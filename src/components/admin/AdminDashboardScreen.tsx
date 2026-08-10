import React from 'react';
import { Teacher } from '../types';

interface AdminDashboardScreenProps {
  teachers: Teacher[];
  onRegister: () => void;
  onViewInfo: () => void;
  onViewInstituteInfo: () => void;
  onEdit: (macId: string) => void;
  onBack: () => void;
}

export function AdminDashboardScreen({ teachers, onRegister, onViewInfo, onViewInstituteInfo, onEdit, onBack }: AdminDashboardScreenProps) {
  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FBF7EE]">
      {/* Top Navbar */}
      <header className="bg-[#14213D] text-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#E29B2A] flex items-center justify-center text-[#E29B2A] font-bold text-lg shadow-sm">
            E
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg tracking-tight">ExamSetu <span className="text-[#E29B2A]">Admin</span></h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E29B2A] border border-[#E29B2A]/30 bg-[#E29B2A]/10 px-2 py-0.5 rounded-full">
                • INSTITUTE ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-300/80 font-medium tracking-wide">Manage teachers, classes and subjects for your institute</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-5 py-1.5 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full p-6 sm:p-10 space-y-12">

        {/* Dashboard Header */}
        <div>
          <h2 className="text-[32px] font-extrabold text-[#14213D] tracking-tight">Admin Overview</h2>
          <p className="text-slate-500 text-[15px] mt-1.5 font-medium">Manage your institute's teachers, classes, and subjects from one central hub.</p>
        </div>

        {/* 3 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div
            onClick={onRegister}
            className="relative overflow-hidden bg-gradient-to-br from-[#14213D] to-[#1e325c] p-8 rounded-[24px] shadow-xl shadow-blue-900/10 hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer group flex flex-col min-h-[220px]"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-8xl">👨‍🏫</span>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-6 text-2xl border border-white/20 shadow-inner text-white">
              +
            </div>
            <h3 className="font-bold text-white text-[20px] mb-2 tracking-wide">Register Teacher</h3>
            <p className="text-blue-100/80 text-[14px] flex-1 leading-relaxed max-w-[90%]">
              Create new teacher accounts and manage their access credentials.
            </p>
            <div className="mt-6 flex items-center gap-2 text-white font-semibold text-[14px] group-hover:gap-3 transition-all">
              Register New <span>→</span>
            </div>
          </div>

          <div onClick={onViewInstituteInfo} className="relative overflow-hidden bg-gradient-to-br from-[#E29B2A] to-[#d97706] p-8 rounded-[24px] shadow-xl shadow-orange-900/10 hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer group flex flex-col min-h-[220px]">
            <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-8xl">🏫</span>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl mb-6 text-2xl border border-white/20 shadow-inner text-white">
              🏫
            </div>
            <h3 className="font-bold text-white text-[20px] mb-2 tracking-wide">Institute Info</h3>
            <p className="text-orange-50 text-[14px] flex-1 leading-relaxed max-w-[90%]">
              Browse each class, see its subjects, and check assigned teachers.
            </p>
            <div className="mt-6 flex items-center gap-2 text-white font-semibold text-[14px] group-hover:gap-3 transition-all">
              View Info <span>→</span>
            </div>
          </div>

          <div onClick={onViewInfo} className="group relative bg-[#2F7A52] text-white p-6 sm:p-8 rounded-[32px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-[#2F7A52]/20 shadow-lg shadow-[#2F7A52]/20">
            <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
              <span className="text-8xl">📋</span>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl mb-6 text-2xl border border-white/20 shadow-inner text-white">
              📋
            </div>
            <h3 className="font-bold text-white text-[20px] mb-2 tracking-wide">Teacher Info</h3>
            <p className="text-emerald-50 text-[14px] flex-1 leading-relaxed max-w-[90%]">
              Browse all teachers, view full profiles, and edit their details.
            </p>
            <div className="mt-6 flex items-center gap-2 text-white font-semibold text-[14px] group-hover:gap-3 transition-all">
              View Profiles <span>→</span>
            </div>
          </div>
        </div>

        {/* Recent Teachers List */}
        <div className="pt-2">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-[20px] font-extrabold text-[#14213D]">Recently Registered Teachers</h3>
              <p className="text-sm text-slate-500 mt-1">Latest accounts added to the system</p>
            </div>
            <button onClick={onRegister} className="bg-white border-2 border-[#14213D] text-[#14213D] hover:bg-[#14213D] hover:text-white font-bold text-[14px] px-6 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2">
              <span>+</span> Add Teacher
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teachers.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-[24px] border border-slate-200 border-dashed text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
                <p className="text-slate-500 text-[15px] font-medium">No teachers registered yet.</p>
                <button onClick={onRegister} className="mt-4 text-[#4F5DE5] font-semibold hover:underline">Register your first teacher</button>
              </div>
            ) : (
              teachers.slice().reverse().map(teacher => (
                <div key={teacher.macId} className="group bg-white p-6 rounded-[20px] border border-slate-200 hover:border-[#14213D]/20 hover:shadow-lg hover:shadow-blue-900/5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                        {teacher.avatar || '👨‍🏫'}
                      </div>
                      {teacher.isActive ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Inactive</span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-[#14213D] text-[18px] leading-tight mb-1">{teacher.name}</h4>
                    <p className="text-slate-500 text-[13px] font-medium mb-4">{teacher.email}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {(() => {
                        const allSubjs = teacher.classSubjects
                          ? Array.from(new Set(Object.values(teacher.classSubjects).flat()))
                          : (teacher.assignedSubjects || []);

                        return (
                          <>
                            {allSubjs.slice(0, 2).map(sub => (
                              <span key={sub} className="bg-purple-50 text-purple-700 text-[11px] px-2 py-0.5 rounded-md font-semibold border border-purple-100">{sub}</span>
                            ))}
                            {allSubjs.length > 2 && (
                              <span className="bg-slate-50 text-slate-600 text-[11px] px-2 py-0.5 rounded-md font-semibold border border-slate-100">+{allSubjs.length - 2} more</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <button onClick={onViewInfo} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 text-[13px] font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                      View
                    </button>
                    <button
                      onClick={() => onEdit(teacher.macId)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FBF7EE] text-[#E29B2A] text-[13px] font-semibold rounded-xl hover:bg-[#F5EEDF] transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
