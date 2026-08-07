import React, { useState } from 'react';
import { Student, StudentReport } from '../types';
import { X, Printer, Trash2, CheckCircle2, FileText } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

interface StudentReportModalProps {
  student: Student;
  reports: StudentReport[];
  onClose: () => void;
  onDeleteReport: (reportId: string) => void;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  student,
  reports,
  onClose,
  onDeleteReport
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 ? reports[0].id : null
  );
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-50 print:absolute print:inset-0 print:block print:p-0 print:bg-white">
      <div className="w-full flex flex-col h-full overflow-hidden relative print:h-auto print:shadow-none print:w-full print:bg-transparent print:overflow-visible print:block">

        {/* Header - Hidden during print */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white print:hidden shadow-sm z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-slate-200">
              {student.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
              <p className="text-sm font-medium text-slate-500">Roll {student.rollNo} • {student.classId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors print:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">

          {/* Left Sidebar: List of Reports - Hidden during print */}
          <div className="w-64 border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-y-auto flex flex-col print:hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider p-4 pb-2">Saved Reports</h3>
            {reports.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 italic">No reports saved yet.</p>
            ) : (
              <div className="space-y-1 p-2">
                {reports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedReportId === report.id ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-200' : 'hover:bg-slate-100 text-slate-700'}`}
                  >
                    <div className="font-bold text-sm truncate">{report.quizName}</div>
                    <div className="text-xs font-medium opacity-70">{new Date(report.date).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Main Area: Selected Report Details & Printable Area */}
          <div className="flex-1 flex flex-col bg-slate-100 overflow-y-auto print:bg-white print:overflow-visible print:block">
            {selectedReport ? (
              <div className="p-8 max-w-5xl mx-auto w-full print:p-0 print:max-w-none">

                {/* Print Action Bar - Hidden during print */}
                <div className="flex justify-end gap-3 mb-6 print:hidden">
                  <button
                    onClick={async () => {
                      const isConfirmed = await confirm({
                        title: 'Delete Student Report?',
                        message: 'Are you sure you want to delete this report? This action cannot be undone.',
                        isDestructive: true,
                        confirmText: 'Delete'
                      });
                      if (isConfirmed) {
                        onDeleteReport(selectedReport.id);
                        if (selectedReportId === selectedReport.id) {
                          setSelectedReportId(null);
                        }
                        showToast('Report deleted', 'success');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 rounded-xl font-bold text-sm transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Export PDF / Print
                  </button>
                </div>

                {/* --- PRINTABLE REPORT CONTENT --- */}
                <div id="print-area" className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:block">

                  {/* Report Header */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-8 mb-8">
                    <div>
                      <h1 className="text-3xl font-black text-slate-800 mb-2">{selectedReport.quizName}</h1>
                      <div className="text-slate-500 font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Quiz Performance Report
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
                      <p className="text-slate-500 font-medium">Roll {student.rollNo} • {student.classId}</p>
                      <p className="text-slate-400 text-sm mt-1">{new Date(selectedReport.date).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* High-Level Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-10">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col items-center justify-center print:border-2 print:border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Accuracy</span>
                      <span className="text-3xl font-black text-amber-700">{selectedReport.accuracy}%</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center justify-center print:border-2 print:border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Correct</span>
                      <span className="text-3xl font-black text-emerald-700">{selectedReport.correct}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex flex-col items-center justify-center print:border-2 print:border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Incorrect</span>
                      <span className="text-3xl font-black text-rose-700">{selectedReport.incorrect}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center print:border-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Skipped</span>
                      <span className="text-3xl font-black text-slate-700">{selectedReport.unattempted}</span>
                    </div>
                  </div>

                  {/* Detailed Question Breakdown */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Question Breakdown</h3>
                    <div className="space-y-4">
                      {selectedReport.responses.map((resp, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 print:border-slate-200 print:break-inside-avoid">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-slate-400 shrink-0 shadow-sm border border-slate-200">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800 mb-2">{resp.questionText}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
                              <span className="text-slate-500">
                                Correct Answer: <strong className="text-emerald-600">{resp.correctAnswer}</strong>
                              </span>
                              <span className="text-slate-300 hidden sm:inline">•</span>
                              {resp.picked ? (
                                <span className={resp.isCorrect ? 'text-emerald-600 flex items-center gap-1' : 'text-rose-600 flex items-center gap-1'}>
                                  Student Picked: <strong>{resp.picked}</strong>
                                  {resp.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : ' (Wrong)'}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">No Response</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* End of Print Area */}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-medium flex-col gap-4 print:hidden">
                <FileText className="w-12 h-12 text-slate-200" />
                <p>Select a report to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles for Hiding App Background */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { margin: 0.5cm; }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
};
