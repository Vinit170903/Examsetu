import React, { useState } from 'react';
import { Teacher } from '../../types';
import { getSubjectsForClass } from '../../data/ncertData';

interface AdminInstituteInfoScreenProps {
  teachers: Teacher[];
  allowedClasses: string[];
  instituteSubjects: Record<string, string[]>;
  onSaveInstituteInfo: (newInstituteSubjects: Record<string, string[]>, updatedTeachers: Teacher[]) => void;
  onBack: () => void;
}

export const AdminInstituteInfoScreen: React.FC<AdminInstituteInfoScreenProps> = ({
  teachers,
  allowedClasses,
  instituteSubjects,
  onSaveInstituteInfo,
  onBack
}) => {
  const classesList = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

  const [activeClass, setActiveClass] = useState<string>(classesList[0]);

  // Local state for edits
  const [localSubjects, setLocalSubjects] = useState<Record<string, string[]>>(() => {
    const base = JSON.parse(JSON.stringify(instituteSubjects)) as Record<string, string[]>;

    // Ensure all classes have their standard subjects by default if not set
    Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).forEach(cls => {
      if (base[cls] === undefined) {
        base[cls] = getSubjectsForClass(cls.toLowerCase().replace(' ', '-'));
      }
    });

    return base;
  });

  const [localAssignments, setLocalAssignments] = useState<Record<string, Record<string, string>>>(() => {
    const map: Record<string, Record<string, string>> = {};
    teachers.forEach(t => {
      if (t.classSubjects) {
        Object.entries(t.classSubjects).forEach(([c, subs]) => {
          if (!map[c]) map[c] = {};
          subs.forEach(s => {
            map[c][s] = t.macId;
          });
        });
      }
    });
    return map;
  });

  const [showAddSubjectDropdown, setShowAddSubjectDropdown] = useState(false);

  const handleAssignTeacher = (className: string, subject: string, teacherMac: string) => {
    setLocalAssignments(prev => {
      const updated = { ...prev };
      if (!updated[className]) updated[className] = {};

      if (teacherMac === 'unassigned') {
        delete updated[className][subject];
      } else {
        updated[className][subject] = teacherMac;
      }
      return updated;
    });
  };

  const handleAddSubject = (className: string, subject: string) => {
    setLocalSubjects(prev => {
      const updated = { ...prev };
      if (!updated[className]) updated[className] = [];
      if (!updated[className].includes(subject)) {
        updated[className] = [...updated[className], subject];
      }
      return updated;
    });
    setShowAddSubjectDropdown(false);
  };

  const handleRemoveSubject = (className: string, subject: string) => {
    // Remove from subjects list
    setLocalSubjects(prev => {
      const updated = { ...prev };
      if (updated[className]) {
        updated[className] = updated[className].filter(s => s !== subject);
      }
      return updated;
    });

    // Remove assignment
    setLocalAssignments(prev => {
      const updated = { ...prev };
      if (updated[className] && updated[className][subject]) {
        delete updated[className][subject];
      }
      return updated;
    });
  };

  const handleSave = () => {
    const newTeachers = teachers.map(t => {
      const newClassSubjects: Record<string, string[]> = {};
      const newAssignedClasses = new Set<string>();

      Object.entries(localAssignments).forEach(([c, subsMap]) => {
        Object.entries(subsMap).forEach(([s, mac]) => {
          if (mac === t.macId) {
            if (!newClassSubjects[c]) newClassSubjects[c] = [];
            newClassSubjects[c].push(s);
            newAssignedClasses.add(c);
          }
        });
      });

      return {
        ...t,
        classSubjects: newClassSubjects,
        assignedClasses: Array.from(newAssignedClasses)
      };
    });

    onSaveInstituteInfo(localSubjects, newTeachers);
  };

  const activeSubjects = localSubjects[activeClass] || [];
  const activeAssignments = localAssignments[activeClass] || {};
  const activeTeachersInvolved = new Set(Object.values(activeAssignments)).size;
  const isClassIncomplete = activeSubjects.length > 0 && activeSubjects.some(s => !activeAssignments[s]);

  // Options for adding subject
  const availableSubjectsForClass = getSubjectsForClass(activeClass.toLowerCase().replace(' ', '-'))
    .filter(s => !activeSubjects.includes(s));

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
            <p className="text-xs text-slate-300/80 font-medium tracking-wide">Institute Info — classes, subjects & teacher assignment</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-1.5 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-72px)]">
        {/* Left Sidebar: Classes */}
        <div className="w-[320px] border-r border-[#E4DCC8] bg-white flex flex-col shadow-sm z-10">
          <div className="p-5 border-b border-[#E4DCC8]">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-[#14213D] text-[15px]">All Classes</h2>
              <span className="bg-[#FBF7EE] text-[#E29B2A] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#E4DCC8]">
                {classesList.length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
            {classesList.map((cls) => {
              const isSelected = activeClass === cls;
              const subjects = localSubjects[cls] || [];
              const assignments = localAssignments[cls] || {};
              const incomplete = subjects.length > 0 && subjects.some(s => !assignments[s]);

              const classNumStr = cls.replace('Class ', '');

              return (
                <div
                  key={cls}
                  onClick={() => setActiveClass(cls)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${isSelected
                    ? 'bg-amber-50/50 border-[#E29B2A] shadow-sm ring-1 ring-[#E29B2A]/20'
                    : 'bg-white border-[#E4DCC8] hover:border-slate-300'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isSelected ? 'bg-[#E29B2A] text-white shadow-sm' : 'bg-[#FBF7EE] text-[#8A8272] border border-[#E4DCC8]'}`}>
                    {classNumStr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-[#14213D]">{cls}</h4>
                    <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${incomplete ? 'text-red-500 font-semibold' : 'text-[#8A8272]'}`}>
                      {subjects.length} subjects {incomplete && <span>• ⚠️ incomplete</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Area: Class Info */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <div className="max-w-[800px] mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] font-semibold text-[#E29B2A] mb-6 tracking-wide">
              <button onClick={onBack} className="hover:underline">Admin Dashboard</button>
              <span className="text-[#8A8272]">/</span>
              <span>Institute Info</span>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E4DCC8] mb-24">

              {/* Header section */}
              <div className="flex items-start justify-between mb-8 pb-8 border-b border-dashed border-[#E4DCC8]">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-[#E29B2A] flex items-center justify-center text-2xl bg-orange-50 font-bold text-[#E29B2A]">
                    {activeClass.replace('Class ', '')}
                  </div>
                  <div>
                    <h2 className="text-[22px] font-bold text-[#14213D]">{activeClass}</h2>
                    <div className="flex items-center gap-3 mt-1 text-[13px] text-[#8A8272]">
                      <p>{activeSubjects.length} subjects</p>
                      <span className="text-slate-300">•</span>
                      <p>{activeTeachersInvolved} teachers involved</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowAddSubjectDropdown(!showAddSubjectDropdown)}
                    className="flex items-center gap-2 px-5 py-2 bg-[#FBF7EE] border border-[#E29B2A]/30 text-[#E29B2A] font-bold text-[13px] rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
                  >
                    + Add Subject
                  </button>

                  {showAddSubjectDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2 max-h-64 overflow-y-auto">
                      {availableSubjectsForClass.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">All standard subjects added.</div>
                      ) : (
                        availableSubjectsForClass.map(sub => (
                          <div
                            key={sub}
                            onClick={() => handleAddSubject(activeClass, sub)}
                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 font-medium"
                          >
                            {sub}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Subjects List */}
              <div className="space-y-4">
                {activeSubjects.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <p className="text-slate-500 font-medium">No subjects added to this class yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Click "+ Add Subject" to get started.</p>
                  </div>
                ) : (
                  activeSubjects.map(sub => {
                    const assignedTeacherMac = activeAssignments[sub];
                    const isUnassigned = !assignedTeacherMac;

                    return (
                      <div key={sub} className="flex items-center justify-between p-4 bg-[#FBF7EE] border border-[#E4DCC8] rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#E29B2A]/10 flex items-center justify-center text-lg">
                            📘
                          </div>
                          <span className="font-bold text-[#14213D] text-[14px]">{sub}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={assignedTeacherMac || 'unassigned'}
                            onChange={(e) => handleAssignTeacher(activeClass, sub, e.target.value)}
                            className={`px-4 py-2 rounded-xl text-[13px] font-semibold border focus:outline-none focus:ring-2 focus:ring-[#E29B2A]/50 appearance-none bg-white cursor-pointer ${isUnassigned
                              ? 'text-red-500 border-red-200'
                              : 'text-slate-700 border-slate-200'
                              }`}
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '10px', paddingRight: '36px' }}
                          >
                            <option value="unassigned">⚠️ Unassigned — select teacher</option>
                            {teachers.map(t => (
                              <option key={t.macId} value={t.macId}>
                                {t.name}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleRemoveSubject(activeClass, sub)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Save floating bar */}
            <div className="fixed bottom-0 left-[320px] right-0 bg-white border-t border-[#E4DCC8] p-4 flex justify-end shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20">
              <div className="max-w-[800px] w-full mx-auto flex justify-end gap-3">
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-xl font-bold text-[13px] text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl font-bold text-[13px] text-white bg-[#E29B2A] hover:bg-[#d97706] transition-colors shadow-md"
                >
                  Save Assignments
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
