import React, { useState, useEffect } from 'react';
import { useGlobalWebSerial } from '../../hooks/WebSerialProvider';
import { Teacher } from '../../types';
import { getSubjectsForClass } from '../../data/ncertData';
import { useConfirm } from '../../contexts/ConfirmContext';

interface AdminTeacherManageScreenProps {
  teachers: Teacher[];
  allowedClasses: string[];
  initialMacId?: string | null;
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher?: (macId: string) => void;
  onBack: () => void;
}

const AVATARS = [
  '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍💻', '👩‍💻'
];

const AVAILABLE_SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Physics', 'Chemistry', 'Biology'];

export const AdminTeacherManageScreen: React.FC<AdminTeacherManageScreenProps> = ({ teachers, allowedClasses, initialMacId, onSaveTeacher, onDeleteTeacher, onBack }) => {
  const { isConnected, connect, disconnect, detectedMacs, clearDetectedMacs } = useGlobalWebSerial();
  const { confirm } = useConfirm();
  const [selectedMac, setSelectedMac] = useState<string | null>(initialMacId || null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [isActive, setIsActive] = useState(true);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [classSubjects, setClassSubjects] = useState<Record<string, string[]>>({});
  const [activeClassTab, setActiveClassTab] = useState<string | null>(null);

  // Password (visual only for now, since we hardcode it in login, but we provide the field)
  const [password, setPassword] = useState('');

  // Pre-fill form when a MAC is selected
  useEffect(() => {
    if (selectedMac) {
      const existing = teachers.find(t => t.macId === selectedMac);

      if (existing) {
        setName(existing.name || '');
        setEmail(existing.email || '');
        setPhone(existing.phone || '');
        setAvatar(existing.avatar || AVATARS[0]);
        setIsActive(existing.isActive ?? true);
        setAssignedClasses(existing.assignedClasses || []);
        setClassSubjects(existing.classSubjects || {});
        setActiveClassTab(existing.assignedClasses && existing.assignedClasses.length > 0 ? existing.assignedClasses[0] : null);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setAvatar(AVATARS[0]);
        setIsActive(true);
        setAssignedClasses([]);
        setClassSubjects({});
        setActiveClassTab(null);
      }
      setPassword('');
    }
  }, [selectedMac, teachers]);

  const handleSave = () => {
    if (selectedMac && name.trim() && email.trim()) {
      onSaveTeacher({
        macId: selectedMac,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar,
        isActive,
        assignedClasses,
        classSubjects,
        assignedSubjects: [] // Keep empty for legacy field
      });
      // Not deselecting immediately so user can see it saved, but could show a toast.
    }
  };

  const handleDelete = async () => {
    if (selectedMac && onDeleteTeacher) {
      const isConfirmed = await confirm({
        title: 'Remove Teacher?',
        message: `Are you sure you want to remove ${name || 'this teacher'}? This action cannot be undone.`,
        isDestructive: true,
        confirmText: 'Remove'
      });

      if (isConfirmed) {
        onDeleteTeacher(selectedMac);
      }
    }
  };

  const toggleClass = (c: string) => {
    setAssignedClasses(prev => {
      const isSelected = prev.includes(c);
      if (isSelected) {
        const next = prev.filter(x => x !== c);
        if (activeClassTab === c) {
          setActiveClassTab(next.length > 0 ? next[0] : null);
        }
        return next;
      } else {
        const next = [...prev, c];
        if (!activeClassTab) {
          setActiveClassTab(c);
        }
        return next;
      }
    });
  };

  const toggleSubject = (s: string) => {
    if (!activeClassTab) return;
    setClassSubjects(prev => {
      const classSubjs = prev[activeClassTab] || [];
      const isSelected = classSubjs.includes(s);
      return {
        ...prev,
        [activeClassTab]: isSelected ? classSubjs.filter(x => x !== s) : [...classSubjs, s]
      };
    });
  };

  // Generate class grid from 1 to 12
  const classGrid = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

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
            <p className="text-xs text-slate-300/80 font-medium tracking-wide">
              {initialMacId ? 'Edit teacher profile and assignments' : 'Manage teachers, classes and subjects for your institute'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-4 py-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <span>←</span> {initialMacId ? 'Back to Teacher Info' : 'Back to Dashboard'}
          </button>
          <button className="px-5 py-1.5 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-72px)]">
        {/* Left Sidebar: MAC Scanner (Hide if editing a specific teacher) */}
        {!initialMacId && (
          <div className="w-[300px] border-r border-[#E4DCC8] bg-white flex flex-col shadow-sm z-10">
          <div className="p-5 border-b border-[#E4DCC8] bg-slate-50/50">
            <h2 className="font-bold text-[#14213D] text-lg mb-4">Device Scanner</h2>
            {isConnected ? (
              <button
                onClick={disconnect}
                className="w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Disconnect Receiver
              </button>
            ) : (
              <button
                onClick={connect}
                className="w-full py-2.5 bg-[#14213D] text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect ESP Receiver
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center px-5 py-3 border-b border-[#E4DCC8] bg-white">
            <span className="text-xs font-bold text-[#8A8272] uppercase tracking-wider">Detected Clickers</span>
            {detectedMacs.size > 0 && (
              <button onClick={clearDetectedMacs} className="text-[11px] text-[#4F5DE5] font-semibold hover:underline">
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
            {!isConnected && detectedMacs.size === 0 && (
              <div className="text-center py-10 px-4 text-[#8A8272]">
                <p className="text-sm">Connect receiver to scan for teacher clickers.</p>
              </div>
            )}
            
            {isConnected && detectedMacs.size === 0 && (
              <div className="text-center py-10 flex flex-col items-center">
                <div className="w-6 h-6 border-3 border-[#4F5DE5]/30 border-t-[#4F5DE5] rounded-full animate-spin mb-3"></div>
                <p className="text-[#8A8272] text-sm">Waiting for clickers...</p>
                <p className="text-[11px] text-slate-400 mt-1">Ask teacher to press a button</p>
              </div>
            )}

            {Array.from(detectedMacs).map((mac) => {
              const existingTeacher = teachers.find(t => t.macId === mac);
              const isSelected = selectedMac === mac;

              return (
                <div
                  key={mac}
                  onClick={() => setSelectedMac(mac)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                    ? 'bg-[#4F5DE5]/5 border-[#4F5DE5] shadow-sm ring-1 ring-[#4F5DE5]/20'
                    : 'bg-white border-[#E4DCC8] hover:border-[#4F5DE5]/50'
                    }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[13px] font-bold text-[#14213D] ${!existingTeacher && 'font-mono'}`}>
                      {existingTeacher ? existingTeacher.name : 'New Teacher'}
                    </span>
                    {existingTeacher ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#8A8272] font-mono mt-1">
                    ID: {mac}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Main Area: Teacher Profile */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1000px] mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] font-semibold text-[#4F5DE5] mb-6 tracking-wide">
              <button onClick={onBack} className="hover:underline">
                {initialMacId ? 'Teacher Info' : 'Admin Dashboard'}
              </button>
              <span className="text-[#8A8272]">/</span>
              <span>{initialMacId ? 'Edit Profile' : 'Register Teacher'}</span>
            </div>

            {!selectedMac ? (
              <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border border-[#E4DCC8] border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-[#14213D]">No Teacher Selected</h3>
                <p className="text-sm text-[#8A8272] mt-1">Select a scanned device from the sidebar to view or edit their profile.</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Left Column: Basic Info */}
                <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-3xl p-6 shadow-sm border border-[#E4DCC8] flex flex-col">
                  
                  {/* Avatar Area */}
                  <div className="flex flex-col items-center mb-6 pt-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#4F5DE5] flex items-center justify-center text-4xl bg-slate-50 relative group cursor-pointer mb-3">
                      {avatar}
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-xs font-bold">Edit</span>
                      </div>
                    </div>
                    <button className="text-[12px] font-bold text-[#4F5DE5] flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Change Photo
                    </button>
                  </div>

                  {/* Active Toggle */}
                  <div 
                    onClick={() => setIsActive(!isActive)}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full border cursor-pointer transition-colors mb-8 ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    <span className={`text-[13px] font-bold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="block text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Ravi Sharma"
                        className="w-full bg-[#FBF7EE] border border-[#E4DCC8] rounded-xl px-4 py-2.5 text-[14px] text-[#14213D] focus:outline-none focus:border-[#4F5DE5] focus:ring-1 focus:ring-[#4F5DE5]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-1.5 ml-1">Email (Teacher ID)</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. ravi@teacher.vidyasetu.in"
                        className="w-full bg-[#FBF7EE] border border-[#E4DCC8] rounded-xl px-4 py-2.5 text-[14px] text-[#14213D] focus:outline-none focus:border-[#4F5DE5] focus:ring-1 focus:ring-[#4F5DE5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-1.5 ml-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#FBF7EE] border border-[#E4DCC8] rounded-xl px-4 py-2.5 text-[14px] text-[#14213D] focus:outline-none focus:border-[#4F5DE5] focus:ring-1 focus:ring-[#4F5DE5]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#14213D] uppercase tracking-wider mb-1.5 ml-1">Reset Password</label>
                      <input 
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Leave blank to keep unchanged"
                        className="w-full bg-[#FBF7EE] border border-[#E4DCC8] rounded-xl px-4 py-2.5 text-[14px] text-[#14213D] focus:outline-none focus:border-[#4F5DE5] focus:ring-1 focus:ring-[#4F5DE5] placeholder:text-[#8A8272]/70"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-6 border-t border-[#E4DCC8] space-y-3">
                    <button 
                      onClick={handleSave}
                      className="w-full bg-[#4F5DE5] hover:bg-[#434ec9] text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
                    >
                      Save Profile
                    </button>
                    <button 
                      onClick={onBack}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Cancel / Go Back
                    </button>
                    {onDeleteTeacher && selectedMac && teachers.some(t => t.macId === selectedMac) && (
                      <button 
                        onClick={handleDelete}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl border border-red-200 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Remove Teacher
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Column: Classes and Subjects */}
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/* Assign Classes Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E4DCC8]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#E29B2A] flex items-center justify-center text-xl shadow-sm">
                          📚
                        </div>
                        <div>
                          <h3 className="font-bold text-[#14213D] text-[18px]">Assign Classes</h3>
                          <p className="text-[13px] text-[#8A8272]">Select the classes this teacher is responsible for.</p>
                        </div>
                      </div>
                      <div className="bg-[#FBF7EE] text-[#E29B2A] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#E4DCC8]">
                        {assignedClasses.length} Selected
                      </div>
                    </div>
                    
                    <div className="w-full h-px bg-dashed bg-[#E4DCC8] mb-6"></div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {classGrid.map(c => {
                        const num = c.replace('Class ', '');
                        const isSelected = assignedClasses.includes(c);
                        return (
                          <div 
                            key={c}
                            onClick={() => toggleClass(c)}
                            className={`flex flex-col items-center justify-center py-4 rounded-xl border cursor-pointer transition-all relative ${isSelected ? 'border-[#E29B2A] bg-white ring-1 ring-[#E29B2A] shadow-sm' : 'border-[#E4DCC8] bg-[#FBF7EE] hover:border-[#E29B2A]/50'}`}
                          >
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 text-[#E29B2A]">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 ${isSelected ? 'bg-[#E29B2A] text-white shadow-sm' : 'bg-white text-[#14213D] border border-[#E4DCC8]'}`}>
                              {num}
                            </div>
                            <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#14213D]' : 'text-[#8A8272]'}`}>{c}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Assign Subjects Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E4DCC8]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#4F5DE5] flex items-center justify-center text-xl shadow-sm">
                          📱
                        </div>
                        <div>
                          <h3 className="font-bold text-[#14213D] text-[18px]">Assign Subjects</h3>
                          <p className="text-[13px] text-[#8A8272]">Select subjects for each assigned class.</p>
                        </div>
                      </div>
                    </div>
                    
                    {assignedClasses.length === 0 ? (
                      <div className="py-8 text-center text-[#8A8272] text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Please assign at least one class above to select subjects.
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-[#E4DCC8] scrollbar-hide">
                          {assignedClasses.sort((a, b) => parseInt(a.replace('Class ', '')) - parseInt(b.replace('Class ', ''))).map(c => (
                            <button
                              key={c}
                              onClick={() => setActiveClassTab(c)}
                              className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeClassTab === c ? 'bg-[#14213D] text-white shadow-sm' : 'bg-[#FBF7EE] text-[#8A8272] border border-[#E4DCC8] hover:bg-slate-100'}`}
                            >
                              {c}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeClassTab === c ? 'bg-white/20 text-white' : 'bg-white text-[#14213D] border border-[#E4DCC8]'}`}>
                                {(classSubjects[c] || []).length}
                              </span>
                            </button>
                          ))}
                        </div>

                        {activeClassTab && (
                          <div className="flex flex-wrap gap-3">
                            {getSubjectsForClass(`class-${activeClassTab.replace('Class ', '')}`).map((sub, i) => {
                              const isSelected = (classSubjects[activeClassTab] || []).includes(sub);
                              const dotColors = ['bg-[#E29B2A]', 'bg-[#2F7A52]', 'bg-[#4F5DE5]', 'bg-purple-500', 'bg-rose-500', 'bg-red-500'];
                              const dotColor = dotColors[i % dotColors.length];

                              return (
                                <div
                                  key={sub}
                                  onClick={() => toggleSubject(sub)}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer transition-all ${isSelected ? 'border-[#2F7A52] bg-white ring-1 ring-[#2F7A52] shadow-sm' : 'border-[#E4DCC8] bg-[#FBF7EE] hover:border-slate-300'}`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                                  <span className={`text-[13px] font-bold ${isSelected ? 'text-[#14213D]' : 'text-[#8A8272]'}`}>{sub}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
