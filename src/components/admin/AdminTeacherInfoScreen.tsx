import React, { useState } from 'react';
import { Teacher } from '../../types';

interface AdminTeacherInfoScreenProps {
  teachers: Teacher[];
  onEditTeacher: (macId: string) => void;
  onBack: () => void;
}

export const AdminTeacherInfoScreen: React.FC<AdminTeacherInfoScreenProps> = ({ teachers, onEditTeacher, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMac, setSelectedMac] = useState<string | null>(teachers.length > 0 ? teachers[0].macId : null);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.macId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeacher = teachers.find(t => t.macId === selectedMac);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FBF7EE] font-sans">
      {/* Top Navbar */}
      <header className="bg-[#14213D] text-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#E29B2A] flex items-center justify-center text-[#E29B2A] font-bold text-lg shadow-sm cursor-pointer" onClick={onBack}>
            E
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg tracking-tight">ExamSetu <span className="text-[#E29B2A]">Admin</span></h1>
            </div>
            <p className="text-xs text-slate-300/80 font-medium tracking-wide">Teacher Info — view and edit teacher profiles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-4 py-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </button>
          <button className="px-5 py-1.5 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-72px)]">
        {/* Left Sidebar: Teacher List */}
        <div className="w-[320px] border-r border-[#E4DCC8] bg-white flex flex-col shadow-sm z-10">
          <div className="p-5 border-b border-[#E4DCC8]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-[#14213D] text-[15px]">All Teachers</h2>
              <span className="bg-[#FBF7EE] text-[#E29B2A] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#E4DCC8]">
                {teachers.length}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search teacher..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#FBF7EE] border border-[#E4DCC8] rounded-xl pl-9 pr-4 py-2 text-[13px] text-[#14213D] focus:outline-none focus:border-[#4F5DE5] focus:ring-1 focus:ring-[#4F5DE5]"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
            {filteredTeachers.map((teacher) => {
              const isSelected = selectedMac === teacher.macId;
              const allSubjs = teacher.classSubjects 
                ? Array.from(new Set(Object.values(teacher.classSubjects).flat()))
                : (teacher.assignedSubjects || []);
                
              return (
                <div
                  key={teacher.macId}
                  onClick={() => setSelectedMac(teacher.macId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${isSelected
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-white border-[#E4DCC8] hover:border-slate-300'
                    }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FBF7EE] border border-[#E4DCC8] flex items-center justify-center text-lg shrink-0">
                    {teacher.avatar || '👨‍🏫'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-[#14213D] truncate">{teacher.name}</h4>
                    <p className="text-[11px] text-[#8A8272] truncate mt-0.5">
                      {teacher.assignedClasses.length} classes · {allSubjs.length} subjects
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{teacher.macId}</p>
                  </div>
                  <div className="shrink-0 flex items-center">
                    <div className={`w-2 h-2 rounded-full ${teacher.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  </div>
                </div>
              );
            })}
            
            {filteredTeachers.length === 0 && (
              <div className="text-center py-10 px-4 text-[#8A8272]">
                <p className="text-sm">No teachers found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Area: Teacher Profile Details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[800px] mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] font-semibold text-[#2F7A52] mb-6 tracking-wide">
              <button onClick={onBack} className="hover:underline">Admin Dashboard</button>
              <span className="text-[#8A8272]">/</span>
              <span>Teacher Info</span>
            </div>

            {!selectedTeacher ? (
              <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-[#E4DCC8] border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-[#14213D]">No Teacher Selected</h3>
                <p className="text-sm text-[#8A8272] mt-1">Select a teacher from the sidebar to view their profile.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E4DCC8]">
                
                {/* Header Profile Section */}
                <div className="flex items-start justify-between mb-8 pb-8 border-b border-dashed border-[#E4DCC8]">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#4F5DE5] flex items-center justify-center text-3xl bg-slate-50">
                      {selectedTeacher.avatar || '👨‍🏫'}
                    </div>
                    <div>
                      <h2 className="text-[22px] font-bold text-[#14213D]">{selectedTeacher.name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[13px] text-[#8A8272]">{selectedTeacher.email}</p>
                        <span className="text-slate-300">•</span>
                        <p className="text-[12px] text-slate-500 font-mono">MAC: {selectedTeacher.macId}</p>
                      </div>
                      <div className="mt-3">
                        {selectedTeacher.isActive ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-200">Active</span>
                        ) : (
                          <span className="bg-slate-50 text-slate-600 text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-200">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onEditTeacher(selectedTeacher.macId)}
                    className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 text-[#14213D] font-bold text-[13px] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-10">
                  <div>
                    <h4 className="text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-2">Full Name</h4>
                    <p className="text-[15px] font-semibold text-[#14213D]">{selectedTeacher.name}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-2">Email (Teacher ID)</h4>
                    <p className="text-[15px] font-semibold text-[#14213D]">{selectedTeacher.email}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-2">Phone Number</h4>
                    <p className="text-[15px] font-semibold text-[#14213D]">{selectedTeacher.phone || '—'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-2">Reset Password</h4>
                    <p className="text-[15px] font-semibold text-slate-400">•••••••• (hidden)</p>
                  </div>
                </div>

                {/* Assigned Classes */}
                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-3">Assigned Classes</h4>
                  {selectedTeacher.assignedClasses.length === 0 ? (
                    <p className="text-[13px] text-slate-400 italic">No classes assigned yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.assignedClasses.sort((a, b) => parseInt(a.replace('Class ', '')) - parseInt(b.replace('Class ', ''))).map(c => (
                        <span key={c} className="bg-[#FBF7EE] text-[#E29B2A] text-[12px] px-3 py-1.5 rounded-full font-semibold border border-[#E4DCC8]">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned Subjects */}
                <div>
                  <h4 className="text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-3">Assigned Subjects (Across all classes)</h4>
                  {(() => {
                    const allSubjs = selectedTeacher.classSubjects 
                      ? Array.from(new Set(Object.values(selectedTeacher.classSubjects).flat()))
                      : (selectedTeacher.assignedSubjects || []);

                    if (allSubjs.length === 0) {
                      return <p className="text-[13px] text-slate-400 italic">No subjects assigned yet.</p>;
                    }

                    return (
                      <div className="flex flex-wrap gap-2">
                        {allSubjs.map((sub, i) => {
                          const dotColors = ['bg-[#E29B2A]', 'bg-[#2F7A52]', 'bg-[#4F5DE5]', 'bg-purple-500', 'bg-rose-500', 'bg-red-500'];
                          const dotColor = dotColors[i % dotColors.length];
                          
                          return (
                            <div key={sub} className="flex items-center gap-1.5 bg-white border border-[#E4DCC8] px-3 py-1.5 rounded-full shadow-sm">
                              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                              <span className="text-[12px] font-semibold text-[#14213D]">{sub}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
