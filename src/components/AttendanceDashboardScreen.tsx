import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import { useGlobalWebSerial } from '../hooks/WebSerialProvider';
import { useToast } from '../contexts/ToastContext';
import { CalendarCheck, Users, Clock, Save, AlertCircle, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

interface AttendanceDashboardScreenProps {
  students: Student[];
  allowedClasses: string[];
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  onBack: () => void;
}

export const AttendanceDashboardScreen: React.FC<AttendanceDashboardScreenProps> = ({
  students,
  allowedClasses,
  attendanceRecords,
  setAttendanceRecords,
  onBack
}) => {
  const { showToast } = useToast();
  const { isConnected, connect, disconnect, answeredRolls, lastAnswers, resetAnswered } = useGlobalWebSerial();
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Clear serial state on mount or when switching classes
  useEffect(() => {
    resetAnswered();
  }, [selectedClassId, resetAnswered]);

  const classStudents = selectedClassId 
    ? students.filter(s => s.classId.toLowerCase().replace('-', ' ').trim() === selectedClassId.toLowerCase().replace('-', ' ').trim())
    : [];

  const handleSaveAttendance = () => {
    if (!selectedClassId) return;
    
    const actualPresentRolls = Array.from(answeredRolls).filter(rollNo => lastAnswers[rollNo]?.toUpperCase() === 'E');

    if (actualPresentRolls.length === 0) {
      if (!window.confirm("No students have marked attendance. Are you sure you want to save everyone as absent?")) {
        return;
      }
    }

    const presentRolls = actualPresentRolls;
    const absentRolls = classStudents
      .filter(s => !presentRolls.includes(s.rollNo))
      .map(s => s.rollNo);

    const newRecord: AttendanceRecord = {
      id: `ATT_${Date.now()}`,
      classId: selectedClassId,
      date: Date.now(),
      presentRolls,
      absentRolls
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);
    showToast(`Attendance saved! ${presentRolls.length} Present, ${absentRolls.length} Absent.`, 'success');
    
    // Stop scanning and exit attendance mode
    if (isConnected) disconnect();
    setSelectedClassId(null);
    resetAnswered();
  };

  const selectedRecord = selectedRecordId ? attendanceRecords.find(r => r.id === selectedRecordId) : null;
  const recordStudents = selectedRecord 
    ? students.filter(s => s.classId.toLowerCase().replace('-', ' ').trim() === selectedRecord.classId.toLowerCase().replace('-', ' ').trim())
    : [];

  const classRecords = attendanceRecords.filter(r => r.classId === selectedClassId);

  if (!selectedClassId) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-bold mb-4 flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 flex items-center gap-3">
            <CalendarCheck className="w-10 h-10 text-rose-500" />
            Attendance Management
          </h2>
          <p className="text-slate-500 font-medium mt-2">Select a class to take live attendance or view past records.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {allowedClasses.map(className => {
            const count = students.filter(s => s.classId.toLowerCase().replace('-', ' ').trim() === className.toLowerCase().replace('-', ' ').trim()).length;
            const classNumber = className.replace(/[^0-9]/g, '');
            return (
              <button
                key={className}
                onClick={() => {
                  setSelectedClassId(className);
                  setSelectedRecordId(null);
                }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-rose-400 hover:shadow-md hover:-translate-y-1 transition-all text-center flex flex-col items-center justify-center min-h-[200px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 font-black text-3xl flex items-center justify-center mb-4">
                  {classNumber}
                </div>
                <h3 className="font-bold text-slate-800 text-xl mb-1">{className}</h3>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  {count} Students
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex h-[calc(100vh-40px)] gap-6 p-4">
      {/* Left Sidebar */}
      <div className="w-80 shrink-0 flex flex-col gap-6 overflow-y-auto">
        <div>
          <button onClick={() => {
            if (isConnected) disconnect();
            setSelectedClassId(null);
          }} className="text-slate-500 hover:text-slate-800 font-bold mb-4 flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Classes
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {selectedClassId}
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Attendance Records</p>
        </div>

        {/* Take New Attendance */}
        <div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (isConnected) disconnect();
                setSelectedRecordId(null);
              }}
              className={`text-left p-4 rounded-xl transition-all border ${!selectedRecordId ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-center">
                <h4 className={`font-bold ${!selectedRecordId ? 'text-rose-900' : 'text-slate-700'}`}>Take New Attendance</h4>
                <ChevronRight className={`w-4 h-4 ${!selectedRecordId ? 'text-rose-400' : 'text-slate-400'}`} />
              </div>
              <div className={`text-xs mt-1 ${!selectedRecordId ? 'text-rose-700 font-medium' : 'text-slate-500'}`}>Live clicker scanning</div>
            </button>
          </div>
        </div>

        {/* Past Attendances */}
        {classRecords.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-2 mt-2">Past Attendances</h3>
            <div className="flex flex-col gap-2">
              {classRecords.map(record => {
                const dateObj = new Date(record.date);
                const isSelected = selectedRecordId === record.id;
                
                return (
                  <button
                    key={record.id}
                    onClick={() => {
                      if (isConnected) disconnect();
                      setSelectedRecordId(record.id);
                    }}
                    className={`text-left p-4 rounded-xl transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`text-xs font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-500'} flex items-center gap-1`}>
                      <Users className="w-3 h-3" />
                      {record.presentRolls.length} Present, {record.absentRolls.length} Absent
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {!selectedRecordId ? (
          // Take New Attendance View
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedClassId} Attendance
                </h2>
                <p className="text-slate-500 mt-1">
                  Students press their clickers to mark as Present.
                </p>
              </div>
              <div className="flex gap-3">
                {isConnected ? (
                  <button
                    onClick={disconnect}
                    className="px-6 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Stop Scanning
                  </button>
                ) : (
                  <button
                    onClick={connect}
                    disabled={classStudents.length === 0}
                    className="px-6 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect & Scan
                  </button>
                )}
                
                <button
                  onClick={handleSaveAttendance}
                  className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-5 h-5" />
                  Save Attendance
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="p-4 font-semibold">Roll No</th>
                    <th className="p-4 font-semibold">Student</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map(student => {
                    const isPresent = answeredRolls.has(student.rollNo) && lastAnswers[student.rollNo]?.toUpperCase() === 'E';
                    return (
                      <tr key={student.macId} className={`transition-colors ${isPresent ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 font-mono text-slate-600 font-bold">#{student.rollNo}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm border border-slate-200 shrink-0">
                              {student.avatar}
                            </div>
                            <span className="font-bold text-slate-800">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {isPresent ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-100 w-fit px-3 py-1.5 rounded-lg font-bold text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              Present
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-500 bg-amber-50 border border-amber-100 w-fit px-3 py-1.5 rounded-lg font-bold text-sm">
                              {isConnected ? (
                                <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin"></div>
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                              Waiting...
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {classStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">
                        No registered students found in this class.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedRecord ? (
          // View Past Attendance View
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  {selectedRecord.classId} Attendance
                </h2>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedRecord.date).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-emerald-600 leading-none">{selectedRecord.presentRolls.length}</span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Present</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-rose-600 leading-none">{selectedRecord.absentRolls.length}</span>
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absent</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="p-4 font-semibold">Roll No</th>
                    <th className="p-4 font-semibold">Student</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recordStudents.map(student => {
                    const isPresent = selectedRecord.presentRolls.includes(student.rollNo);
                    return (
                      <tr key={student.macId} className={`transition-colors ${isPresent ? 'bg-emerald-50/20' : 'bg-rose-50/20'}`}>
                        <td className="p-4 font-mono text-slate-600 font-bold">#{student.rollNo}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm border border-slate-200 shrink-0">
                              {student.avatar}
                            </div>
                            <span className="font-bold text-slate-800">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {isPresent ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              Present
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                              <XCircle className="w-4 h-4" />
                              Absent
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
