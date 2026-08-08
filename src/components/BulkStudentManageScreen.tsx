import React, { useState, useEffect, useRef } from 'react';
import { useGlobalWebSerial } from '../hooks/WebSerialProvider';
import { Student } from '../types';
import { Upload, Download, Save, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface BulkStudentManageScreenProps {
  initialClassId: string;
  existingStudents: Student[];
  onSaveStudents: (students: Student[]) => void;
  onBack: () => void;
}

const AVATARS = [
  '👨‍🎓', '👩‍🎓', '🧑‍🎓', '🦁', '🐯', '🐼', '🦊', '🐰',
  '🐶', '🐱', '🦄', '🐸', '🐙', '🐢', '🦋', '🚀', '🌟', '🎨'
];

export const BulkStudentManageScreen: React.FC<BulkStudentManageScreenProps> = ({
  initialClassId,
  existingStudents,
  onSaveStudents,
  onBack
}) => {
  const { isConnected, connect, disconnect, detectedMacs, detectedEspIds, resetAnswered } = useGlobalWebSerial();
  const { showToast } = useToast();
  
  const [importedStudents, setImportedStudents] = useState<Student[]>([]);
  const [unpairedMacs, setUnpairedMacs] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear serial state on mount
  useEffect(() => {
    resetAnswered();
  }, [resetAnswered]);

  // Handle Serial Data matching
  useEffect(() => {
    if (!isConnected) return;
    
    setImportedStudents(prev => {
      let updated = [...prev];
      let hasChanges = false;
      const newUnpaired = new Set<string>();

      // Check all detected devices from WebSerial
      detectedMacs.forEach(mac => {
        const rollNo = detectedEspIds[mac];
        
        if (rollNo !== undefined) {
          // Find if there's a student in the imported list with this roll no
          const studentIndex = updated.findIndex(s => s.rollNo === rollNo);
          
          if (studentIndex >= 0) {
            // Assign MAC to this student if not already assigned
            if (updated[studentIndex].macId !== mac) {
              updated[studentIndex] = { ...updated[studentIndex], macId: mac };
              hasChanges = true;
            }
          } else {
            // Roll no from device doesn't match any in our imported list
            newUnpaired.add(mac);
          }
        }
      });

      if (newUnpaired.size !== unpairedMacs.size) {
        setUnpairedMacs(newUnpaired);
      }

      return hasChanges ? updated : prev;
    });
  }, [detectedMacs, detectedEspIds, isConnected, unpairedMacs.size]);

  const handleDownloadTemplate = () => {
    const header = "Roll No,Name,Class,Section\n";
    const row1 = `1,John Doe,${initialClassId},A\n`;
    const row2 = `2,Jane Smith,${initialClassId},B\n`;
    const content = header + row1 + row2;
    
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Student_Template_${initialClassId.replace(' ', '_')}.csv`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const parsedStudents: Student[] = [];
        
        // Start from index 1 to skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',');
          if (parts.length >= 2) {
            const rollNo = parseInt(parts[0].trim());
            const name = parts[1].trim();
            const classId = parts[2]?.trim() || initialClassId;
            const section = parts[3]?.trim() || 'A';
            
            if (!isNaN(rollNo) && name) {
              // Ensure roll number is unique in the import list
              if (!parsedStudents.some(s => s.rollNo === rollNo)) {
                parsedStudents.push({
                  macId: '', // Will be filled by hardware
                  name,
                  rollNo,
                  classId,
                  section,
                  avatar: AVATARS[rollNo % AVATARS.length] // Random-ish default avatar
                });
              }
            }
          }
        }
        
        if (parsedStudents.length > 0) {
          setImportedStudents(parsedStudents);
          showToast(`Successfully parsed ${parsedStudents.length} students from CSV.`, 'success');
        } else {
          showToast('No valid student data found in CSV. Make sure format is correct.', 'error');
        }
      } catch (err) {
        showToast('Error reading CSV file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleSave = () => {
    const pairedStudents = importedStudents.filter(s => s.macId);
    if (pairedStudents.length === 0) {
      showToast('No students have been paired with clickers yet!', 'error');
      return;
    }
    
    // Deduplicate against existing students? The main App.tsx handles saving/replacing based on macId usually.
    // We just emit them.
    onSaveStudents(pairedStudents);
  };

  const pairedCount = importedStudents.filter(s => s.macId).length;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 mt-4 pb-12 h-[calc(100vh-100px)]">
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
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
              Bulk Register Students
            </h2>
            <p className="text-slate-500 mt-1 ml-11">Upload a CSV, then press clickers to auto-pair devices to students.</p>
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
                disabled={importedStudents.length === 0}
                className="px-6 py-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect & Scan
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={pairedCount === 0}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Save {pairedCount} Students
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col border-r border-slate-200 bg-white">
            {importedStudents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                  <Upload className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Student List</h3>
                <p className="text-slate-500 text-center max-w-md mb-8">
                  Download the CSV template, fill in your students' Roll Numbers and Names, then upload it here to begin pairing.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-5 h-5" />
                    Download CSV Template
                  </button>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Upload className="w-5 h-5" />
                    Upload CSV File
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    <span className="font-bold text-slate-700">{initialClassId} Students</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold">
                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{pairedCount} Paired</span>
                    <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{importedStudents.length - pairedCount} Waiting</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className="text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                        <th className="p-4 font-semibold rounded-tl-xl">Roll No</th>
                        <th className="p-4 font-semibold">Student</th>
                        <th className="p-4 font-semibold">Sec</th>
                        <th className="p-4 font-semibold rounded-tr-xl">Device Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importedStudents.map(student => {
                        const isPaired = !!student.macId;
                        return (
                          <tr key={student.rollNo} className={`transition-colors ${isPaired ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                            <td className="p-4 font-mono text-slate-600 font-bold">#{student.rollNo}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-lg shadow-sm border border-indigo-100 shrink-0">
                                  {student.avatar}
                                </div>
                                <span className="font-bold text-slate-800">{student.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">{student.section}</td>
                            <td className="p-4">
                              {isPaired ? (
                                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold leading-none">Paired</span>
                                    <span className="text-[10px] font-mono leading-none mt-1 opacity-70">{student.macId}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-amber-500 bg-amber-50 w-fit px-3 py-1.5 rounded-lg border border-amber-100">
                                  {isConnected ? (
                                    <div className="w-4 h-4 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin"></div>
                                  ) : (
                                    <AlertCircle className="w-4 h-4" />
                                  )}
                                  <span className="text-xs font-bold">Waiting for click...</span>
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
            )}
          </div>

          {/* Right Sidebar: Unregistered Devices */}
          <div className="w-1/4 min-w-[250px] bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-100">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Unregistered Devices
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">Devices pressed that don't match any Roll No in your CSV.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {unpairedMacs.size === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No unregistered devices detected.
                </div>
              ) : (
                Array.from(unpairedMacs).map(mac => (
                  <div key={mac} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Unknown Device</span>
                    <span className="font-mono text-sm text-slate-700">{mac}</span>
                    <span className="text-[10px] text-slate-500">Roll No: {detectedEspIds[mac] !== undefined ? detectedEspIds[mac] : 'Unknown'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
