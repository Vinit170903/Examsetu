import React, { useState, useEffect, useRef } from 'react';
import { useGlobalWebSerial } from '../hooks/WebSerialProvider';
import { Student } from '../types';

interface StudentManageScreenProps {
  students: Student[];
  allowedClasses: string[];
  initialClassId?: string;
  onSaveStudent: (student: Student) => void;
  onBack: () => void;
}

const AVATARS = [
  '👨‍🎓', '👩‍🎓', '🧑‍🎓', '🦁', '🐯', '🐼', '🦊', '🐰',
  '🐶', '🐱', '🦄', '🐸', '🐙', '🐢', '🦋', '🚀', '🌟', '🎨'
];

export const StudentManageScreen: React.FC<StudentManageScreenProps> = ({ students, allowedClasses, initialClassId, onSaveStudent, onBack }) => {
  const { isConnected, connect, disconnect, detectedMacs, detectedEspIds, clearDetectedMacs, clickLog, resetAnswered, clickResolutionCache } = useGlobalWebSerial();
  const [selectedMac, setSelectedMac] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState<number | ''>('');

  const displayClasses = allowedClasses.length > 0 ? allowedClasses : Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
  const [classId, setClassId] = useState(initialClassId || displayClasses[0] || 'Class 9');
  const [section, setSection] = useState('A');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  // Clear the live activity log whenever the user switches to a different class
  useEffect(() => {
    resetAnswered();
  }, [classId, resetAnswered]);

  // When a new MAC or class is selected, pre-fill if it exists
  useEffect(() => {
    if (selectedMac) {
      const existing = students.find(s => s.macId === selectedMac && s.classId === classId);
      const espId = detectedEspIds[selectedMac];

      if (existing) {
        setName(existing.name);
        setRollNo(existing.rollNo);
        setSection(existing.section);
        setAvatar(existing.avatar);
      } else {
        setName('');
        setRollNo(espId !== undefined ? espId : '');
        setSection('A');
        setAvatar(AVATARS[0]);
      }
    }
  }, [selectedMac, classId, students, detectedEspIds]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMac && name.trim() && rollNo !== '') {
      onSaveStudent({
        macId: selectedMac,
        name: name.trim(),
        rollNo: Number(rollNo),
        classId,
        section,
        avatar
      });
      setSelectedMac(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 mt-4 pb-12">
      <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-700"
                title="Go Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              Manage Students
            </h2>
            <p className="text-slate-500 mt-1 ml-11">Connect your master device and press clickers to register students.</p>
          </div>
          <div>
            {isConnected ? (
              <button
                onClick={disconnect}
                className="px-6 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Disconnect
              </button>
            ) : (
              <button
                onClick={connect}
                className="px-6 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Detected Devices */}
          <div className="w-1/3 border-r border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h3 className="font-semibold text-slate-700">Detected Devices</h3>
              <button
                onClick={clearDetectedMacs}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Clear List
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!isConnected && detectedMacs.size === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Connect ESP to see devices
                </div>
              )}

              {isConnected && detectedMacs.size === 0 && (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-3"></div>
                  Waiting for clickers...
                  <span className="text-xs text-slate-400 mt-1 block">Press a button on any ESP sender</span>
                </div>
              )}

              {Array.from(detectedMacs).map((mac) => {
                const studentInClass = students.find(s => s.macId === mac && s.classId === classId);
                const isRegisteredInClass = !!studentInClass;
                const isSelected = selectedMac === mac;

                return (
                  <button
                    key={mac}
                    onClick={() => setSelectedMac(mac)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected
                      ? 'bg-amber-50 border-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-amber-200 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-semibold text-slate-700 ${isRegisteredInClass ? '' : 'font-mono'}`}>
                        {isRegisteredInClass ? `${studentInClass.rollNo}. ${studentInClass.name}` : mac}
                      </span>
                      {isRegisteredInClass ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Saved</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">New</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {isRegisteredInClass ? mac : <span className="font-sans">{'Unregistered in ' + classId}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Area: Registration Form */}
          <div className="w-2/3 p-8 overflow-y-auto bg-white">
            {!selectedMac ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-lg">Select a device from the left to register.</p>
              </div>
            ) : (
              <div className="max-w-md mx-auto animate-in fade-in duration-300">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Register Student</h3>
                  <p className="text-slate-500 text-sm">MAC: <span className="font-mono font-semibold">{selectedMac}</span></p>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Roll Number</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Auto ID"
                        className="w-full p-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed outline-none"
                        value={rollNo}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                      <select
                        required
                        className={`w-full p-3 border border-slate-300 rounded-xl outline-none appearance-none ${initialClassId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-amber-500 bg-white'}`}
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        disabled={!!initialClassId}
                      >
                        {displayClasses.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-1/4">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Sec</label>
                      <input
                        type="text"
                        required
                        maxLength={1}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none uppercase"
                        value={section}
                        onChange={(e) => setSection(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Avatar</label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATARS.map(av => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setAvatar(av)}
                          className={`text-2xl p-2 rounded-xl transition-all ${avatar === av
                            ? 'bg-amber-100 ring-2 ring-amber-500 scale-110'
                            : 'bg-slate-50 hover:bg-slate-100 grayscale-[0.5] hover:grayscale-0'
                            }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-md text-lg"
                    >
                      Save Student Profile
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Click Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Live Activity Log
            </h3>
            <p className="text-sm text-slate-500 mt-1">Real-time button clicks from connected student devices.</p>
          </div>
          <button
            onClick={resetAnswered}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Clear Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">Time</th>
                <th className="p-4 font-semibold whitespace-nowrap">Student Name</th>
                <th className="p-4 font-semibold whitespace-nowrap">Roll No</th>
                <th className="p-4 font-semibold whitespace-nowrap">Class</th>
                <th className="p-4 font-semibold whitespace-nowrap">MAC ID</th>
                <th className="p-4 font-semibold whitespace-nowrap text-center">Option Selected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clickLog.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No click activity yet. Press a button on a clicker to see data.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clickLog.map((click, index) => {
                  let student: Student | null | undefined = clickResolutionCache.current[click.timestamp];

                  if (student === undefined) {
                    if (click.macId) {
                      student = students.find(s => s.macId === click.macId && s.classId === classId) || students.find(s => s.macId === click.macId) || null;
                    } else if (click.rollNum !== undefined) {
                      student = students.find(s => s.rollNo === click.rollNum && s.classId === classId) || students.find(s => s.rollNo === click.rollNum) || null;
                    } else if (click.name) {
                      student = students.find(s => s.name.toLowerCase() === click.name.toLowerCase() && s.classId === classId) || students.find(s => s.name.toLowerCase() === click.name.toLowerCase()) || null;
                    } else {
                      student = null;
                    }
                    clickResolutionCache.current[click.timestamp] = student;
                  }

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {student ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xl bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full">
                              {student.avatar}
                            </span>
                            {student.name}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-xl bg-slate-100 w-8 h-8 flex items-center justify-center rounded-full">
                              ❓
                            </span>
                            {click.name} <span className="text-xs text-amber-500 ml-2">(Unregistered)</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {student?.rollNo || click.rollNum || '-'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {student ? (
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                            {student.classId} {student.section}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {student?.macId || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shadow-sm
                          ${click.answer === 'A' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            click.answer === 'B' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              click.answer === 'C' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {click.answer}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
