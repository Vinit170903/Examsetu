import React, { useState } from 'react';
import { Student, StudentReport, ClassQuizReport } from '../types';
import { StudentReportModal } from './StudentReportModal';
import { ClassReportModal } from './ClassReportModal';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import { Plus, Users, FileText } from 'lucide-react';

interface StudentDashboardScreenProps {
  mode?: 'reports' | 'manage';
  students: Student[];
  allowedClasses: string[];
  studentReports: Record<string, StudentReport[]>;
  setStudentReports: React.Dispatch<React.SetStateAction<Record<string, StudentReport[]>>>;
  classReports?: ClassQuizReport[];
  setClassReports?: React.Dispatch<React.SetStateAction<ClassQuizReport[]>>;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (macId: string, classId: string) => void;
  onAddStudent?: (classId: string) => void;
  onBack: () => void;
}

const AVATARS = [
  '👨‍🎓', '👩‍🎓', '🧑‍🎓', '🦁', '🐯', '🐼', '🦊', '🐰',
  '🐶', '🐱', '🦄', '🐸', '🐙', '🐢', '🦋', '🚀', '🌟', '🎨'
];

export const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = ({
  mode = 'reports',
  students,
  allowedClasses,
  studentReports,
  setStudentReports,
  classReports = [],
  setClassReports,
  onUpdateStudent,
  onDeleteStudent,
  onAddStudent,
  onBack,
}) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [editingMac, setEditingMac] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [viewingReportsFor, setViewingReportsFor] = useState<Student | null>(null);
  const [viewingClassReports, setViewingClassReports] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'student_reports' | 'class_reports'>('student_reports');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editRollNo, setEditRollNo] = useState<number | ''>('');
  const [editClassId, setEditClassId] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const handleEditClick = (student: Student) => {
    setEditingMac(student.macId);
    setEditName(student.name);
    setEditRollNo(student.rollNo);
    setEditClassId(student.classId);
    setEditSection(student.section);
    setEditAvatar(student.avatar);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMac && editName.trim() && editRollNo !== '') {
      onUpdateStudent({
        macId: editingMac,
        name: editName.trim(),
        rollNo: Number(editRollNo),
        classId: editClassId,
        section: editSection,
        avatar: editAvatar
      });
      setEditingMac(null);
    }
  };

  const handleBackClick = () => {
    if (viewingClassReports) {
      setViewingClassReports(null);
    } else if (expandedClass) {
      setExpandedClass(null);
    } else {
      onBack();
    }
  };

  const displayClasses: string[] = allowedClasses.length > 0
    ? allowedClasses
    : Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

  const renderClassGrid = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
        {displayClasses.map((className) => {
          const isClassReportsTab = mode === 'reports' && activeTab === 'class_reports';

          let count = 0;
          if (isClassReportsTab) {
            count = (classReports || []).filter(r => {
              const rClassName = r.classNameDisplay.toLowerCase().replace('-', ' ').trim();
              const cNormalized = className.toLowerCase().replace('-', ' ').trim();
              return rClassName === cNormalized;
            }).length;
          } else {
            count = students.filter(s => {
              const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
              const cNormalized = className.toLowerCase().replace('-', ' ').trim();
              return sNormalized === cNormalized;
            }).length;
          }

          const classNumber = className.replace(/class/i, '').trim();

          return (
            <button
              key={className}
              onClick={() => {
                if (isClassReportsTab) {
                  setViewingClassReports(className);
                } else {
                  setExpandedClass(className);
                }
              }}
              className="group relative overflow-hidden aspect-square rounded-3xl bg-white flex flex-col items-center justify-center transition-all duration-300 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center font-bold text-2xl mb-4 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 border border-amber-100">
                {classNumber || '🏫'}
              </div>

              <h3 className="font-bold text-lg text-slate-800 mb-1 tracking-wide">
                {className}
              </h3>

              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${count > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                {count} {isClassReportsTab ? (count === 1 ? 'Report' : 'Reports') : 'Students'}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderDetailView = () => {
    const classStudents = students.filter(s => {
      const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
      const cNormalized = (expandedClass || '').toLowerCase().replace('-', ' ').trim();
      return sNormalized === cNormalized;
    });

    return (
      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Left Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2">My Classes</h3>
          {displayClasses.map(className => {
            const count = students.filter(s => {
              const sNormalized = s.classId.toLowerCase().replace('-', ' ').trim();
              const cNormalized = className.toLowerCase().replace('-', ' ').trim();
              return sNormalized === cNormalized;
            }).length;

            const isSelected = expandedClass === className;

            return (
              <button
                key={className}
                onClick={() => setExpandedClass(className)}
                className={`text-left p-4 rounded-xl transition-all border ${isSelected ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <h4 className={`font-bold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>{className}</h4>
                <div className={`text-xs mt-1 ${isSelected ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>{count} students</div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{expandedClass}</h2>
              <p className="text-sm text-slate-500">{classStudents.length} students • Manage roster</p>
            </div>
            <div className="flex gap-2">
              {mode === 'manage' && onAddStudent && expandedClass && (
                <button onClick={() => onAddStudent(expandedClass)} className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 font-semibold rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              )}
              <button onClick={() => setExpandedClass(null)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg text-sm transition-colors">
                Close View
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-semibold w-24">Roll No</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold text-center w-32">Clicker</th>
                  {mode === 'reports' && <th className="p-4 font-semibold text-center w-28">Reports</th>}
                  {mode === 'manage' && <th className="p-4 font-semibold text-right w-40">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map(student => (
                  <tr key={student.macId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-slate-600 font-medium">#{student.rollNo}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm border border-slate-200">
                          {student.avatar}
                        </div>
                        <span className="font-bold text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Paired
                      </span>
                      <div className="text-[9px] font-mono text-slate-400 mt-1">{student.macId}</div>
                    </td>
                    {mode === 'reports' && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setViewingReportsFor(student)}
                          className="px-3 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold rounded-lg text-xs transition-colors border border-amber-100"
                        >
                          View ({(studentReports[student.macId] || []).length})
                        </button>
                      </td>
                    )}
                    {mode === 'manage' && (
                      <td className="p-4 text-right">
                        <button onClick={() => handleEditClick(student)} className="text-amber-600 hover:text-amber-800 font-semibold text-xs mr-4 transition-colors">
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            const isConfirmed = await confirm({
                              title: 'Delete Student?',
                              message: `Are you sure you want to remove ${student.name} from the roster? This action cannot be undone.`,
                              isDestructive: true,
                              confirmText: 'Remove'
                            });
                            if (isConfirmed) {
                              onDeleteStudent(student.macId, student.classId);
                              showToast('Student removed', 'success');
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {classStudents.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="text-4xl mb-4 opacity-50">📭</div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No students found</h3>
                <p className="text-slate-500 text-sm">There are no students registered in {expandedClass} yet.</p>
              </div>
            )}
          </div>
        </div>

        {viewingReportsFor && (
          <StudentReportModal
            student={viewingReportsFor}
            reports={studentReports[viewingReportsFor.macId] || []}
            onClose={() => setViewingReportsFor(null)}
            onDeleteReport={(reportId) => {
              setStudentReports(prev => ({
                ...prev,
                [viewingReportsFor.macId]: prev[viewingReportsFor.macId].filter(r => r.id !== reportId)
              }));
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
              title="Go Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            {mode === 'manage' ? 'Student Management' : 'Reports'}
          </h2>
          <p className="text-slate-500 mt-1 ml-11">
            {mode === 'manage' ? 'Manage your class rosters and add new students.' : 'View student and class performance reports.'}
          </p>
        </div>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold">
          Total Students: {students.length}
        </div>
      </div>

      {!expandedClass && !viewingClassReports && mode === 'reports' && (
        <div className="px-6 pt-4 bg-slate-50/50 border-b border-slate-200 flex gap-4">
          <button
            onClick={() => setActiveTab('student_reports')}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'student_reports' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Users className="w-4 h-4" />
            Student Reports
          </button>
          <button
            onClick={() => setActiveTab('class_reports')}
            className={`pb-3 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'class_reports' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-4 h-4" />
            Class Reports
          </button>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
        {expandedClass ? renderDetailView() : renderClassGrid()}
      </div>

      {/* Edit Modal */}
      {editingMac && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Edit Student</h3>
              <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">{editingMac}</span>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
                    value={editRollNo}
                    disabled
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
                    value={editClassId}
                    disabled
                    readOnly
                  />
                </div>
                <div className="w-1/4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Sec</label>
                  <input
                    type="text"
                    required
                    maxLength={1}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none uppercase"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`text-xl p-2 rounded-xl transition-all ${editAvatar === av
                        ? 'bg-amber-100 ring-2 ring-amber-500 scale-110'
                        : 'bg-slate-50 hover:bg-slate-100 grayscale-[0.5] hover:grayscale-0'
                        }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingMac(null)}
                  className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingReportsFor && (
        <StudentReportModal
          student={viewingReportsFor}
          reports={studentReports[viewingReportsFor.macId] || []}
          onClose={() => setViewingReportsFor(null)}
          onDeleteReport={(reportId) => {
            setStudentReports(prev => ({
              ...prev,
              [viewingReportsFor.macId]: prev[viewingReportsFor.macId].filter(r => r.id !== reportId)
            }));
          }}
        />
      )}

      {viewingClassReports && setClassReports && (
        <ClassReportModal
          classId={viewingClassReports.toLowerCase().replace(' ', '-')}
          classNameDisplay={viewingClassReports}
          reports={classReports.filter(r => {
            const rClassName = r.classNameDisplay.toLowerCase().replace('-', ' ').trim();
            const cNormalized = viewingClassReports.toLowerCase().replace('-', ' ').trim();
            return rClassName === cNormalized;
          })}
          onClose={() => setViewingClassReports(null)}
          onDeleteReport={(id) => {
            setClassReports(prev => prev.filter(r => r.id !== id));
          }}
        />
      )}
    </div>
  );
};
