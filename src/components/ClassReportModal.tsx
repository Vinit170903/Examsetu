import React, { useState } from 'react';
import { ClassQuizReport } from '../types';
import { X, Printer, Trash2, FileText, CheckCircle2, List } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

interface ClassReportModalProps {
  classId: string;
  classNameDisplay: string;
  reports: ClassQuizReport[];
  onClose: () => void;
  onDeleteReport: (reportId: string) => void;
}

export const ClassReportModal: React.FC<ClassReportModalProps> = ({
  classId,
  classNameDisplay,
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
              🏫
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{classNameDisplay}</h2>
              <p className="text-sm font-medium text-slate-500">Past Quiz Reports</p>
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
          <div className="w-72 border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 overflow-y-auto flex flex-col print:hidden">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 italic">No reports saved yet.</div>
            ) : (
              <div className="p-4 space-y-8">
                {/* Quiz Reports Section */}
                {reports.filter(r => r.type !== 'poll').length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Quiz Reports
                    </h3>
                    <div className="space-y-1.5">
                      {reports.filter(r => r.type !== 'poll').map(report => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReportId(report.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${selectedReportId === report.id ? 'bg-indigo-50 text-indigo-900 shadow-sm border border-indigo-100' : 'hover:bg-slate-100 text-slate-700 border border-transparent'}`}
                        >
                          <div className="font-bold text-sm truncate">{report.quizName}</div>
                          <div className="text-xs font-medium opacity-70 mt-0.5">{new Date(report.date).toLocaleDateString()}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Poll Reports Section */}
                {reports.filter(r => r.type === 'poll').length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <List className="w-4 h-4" /> Poll Reports
                    </h3>
                    <div className="space-y-1.5">
                      {reports.filter(r => r.type === 'poll').map(report => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReportId(report.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${selectedReportId === report.id ? 'bg-amber-50 text-amber-900 shadow-sm border border-amber-100' : 'hover:bg-slate-100 text-slate-700 border border-transparent'}`}
                        >
                          <div className="font-bold text-sm truncate">{report.quizName}</div>
                          <div className="text-xs font-medium opacity-70 mt-0.5">{new Date(report.date).toLocaleDateString()}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                        title: 'Delete Class Report?',
                        message: 'Are you sure you want to delete this class report? This action cannot be undone.',
                        isDestructive: true,
                        confirmText: 'Delete'
                      });

                      if (isConfirmed) {
                        onDeleteReport(selectedReport.id);
                        if (selectedReportId === selectedReport.id) {
                          setSelectedReportId(null);
                        }
                        showToast('Class report deleted', 'success');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 rounded-xl font-bold text-sm transition-colors shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Export PDF / Print
                  </button>
                </div>

                {/* --- PRINTABLE REPORT CONTENT --- */}
                <div id="print-area" className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:block">

                  {/* Report Header */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-8 mb-8">
                    <div>
                      <h1 className="text-4xl font-black text-slate-900 mb-2">{selectedReport.quizName}</h1>
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <FileText className="w-5 h-5" />
                        Class Performance Report
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-slate-800">{selectedReport.classNameDisplay}</h2>
                      <p className="text-sm text-slate-500">{selectedReport.subject}</p>
                      <p className="text-sm text-slate-400 mt-1">{new Date(selectedReport.date).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedReport.type === 'poll' && selectedReport.pollData ? (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                        Poll-By-Poll Breakdown
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedReport.pollData.map((q, idx) => {
                          const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
                          const totalR = q.totalResponded || 0;
                          const pollType = q.pollType || 'single_choice';

                          return (
                            <div key={idx} className={`bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col ${pollType === 'word_cloud' ? 'md:col-span-2' : ''}`}>
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 pr-4">
                                  <h4 className="font-bold text-slate-800 text-lg mb-2">{q.text}</h4>
                                  <p className="text-xs font-medium text-slate-500">
                                    {totalR} responses
                                  </p>
                                </div>
                                <div className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-amber-200">
                                  {pollType === 'single_choice' && <CheckCircle2 className="w-3 h-3" />}
                                  {pollType === 'yes_no' && <span className="text-sm leading-none">👍</span>}
                                  {pollType === 'rating' && <span className="text-sm leading-none">⭐</span>}
                                  {pollType === 'emoji' && <span className="text-sm leading-none">😃</span>}
                                  {pollType === 'word_cloud' && <List className="w-3 h-3" />}
                                  {pollType.replace('_', ' ')}
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col justify-end mt-4">
                                {pollType === 'single_choice' && (
                                  <div className="space-y-3">
                                    {q.options.map((opt, oIdx) => {
                                      const count = q.optionCounts[oIdx] || 0;
                                      const pct = totalR > 0 ? Math.round((count / totalR) * 100) : 0;
                                      return (
                                        <div key={oIdx} className="flex items-center gap-3">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${['bg-amber-500', 'bg-indigo-500', 'bg-teal-500', 'bg-purple-500', 'bg-rose-500'][oIdx % 5]}`}>
                                            {OPTION_LABELS[oIdx]}
                                          </div>
                                          <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                                            <div className={`h-full ${['bg-amber-500', 'bg-indigo-500', 'bg-teal-500', 'bg-purple-500', 'bg-rose-500'][oIdx % 5]}`} style={{ width: `${pct}%` }}></div>
                                          </div>
                                          <div className="w-8 text-right text-xs font-bold text-slate-600">{pct}%</div>
                                          {opt && !['Option A', 'Option B', 'Option C', 'Option D'].includes(opt) && (
                                            <div className="w-1/3 truncate text-xs text-slate-500 font-medium" title={opt}>{opt}</div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {pollType === 'yes_no' && (
                                  <div className="flex items-center justify-center gap-12 py-4">
                                    <div className="relative w-32 h-32">
                                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {(() => {
                                          const yesCount = q.optionCounts[0] || 0;
                                          const noCount = q.optionCounts[1] || 0;
                                          const total = yesCount + noCount;
                                          const yesPct = total > 0 ? yesCount / total : 0;
                                          return (
                                            <>
                                              <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="16" />
                                              {total > 0 && (
                                                <>
                                                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E11D48" strokeWidth="16" strokeDasharray="251.2 251.2" />
                                                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="16" strokeDasharray={`${yesPct * 251.2} 251.2`} />
                                                </>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </svg>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-sm font-bold text-slate-700 w-16 truncate" title={q.options[0]}>{q.options[0] || 'Yes'}</span>
                                        <span className="text-sm font-bold text-slate-500 w-8">{totalR > 0 ? Math.round(((q.optionCounts[0] || 0) / totalR) * 100) : 0}%</span>
                                        <span className="text-xs font-medium text-slate-400">• {q.optionCounts[0] || 0} votes</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-rose-600"></div>
                                        <span className="text-sm font-bold text-slate-700 w-16 truncate" title={q.options[1]}>{q.options[1] || 'No'}</span>
                                        <span className="text-sm font-bold text-slate-500 w-8">{totalR > 0 ? Math.round(((q.optionCounts[1] || 0) / totalR) * 100) : 0}%</span>
                                        <span className="text-xs font-medium text-slate-400">• {q.optionCounts[1] || 0} votes</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {pollType === 'rating' && (
                                  <div className="space-y-3">
                                    {q.options.map((opt, i) => {
                                      const count = q.optionCounts[i] || 0;
                                      const pct = totalR > 0 ? Math.round((count / totalR) * 100) : 0;
                                      return (
                                        <div key={i} className="flex items-center gap-3">
                                          <div className="w-32 flex items-center justify-end text-xs font-bold text-slate-600 truncate" title={opt}>
                                            {opt}
                                          </div>
                                          <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                                            <div className="h-full bg-purple-500 transition-all" style={{ width: `${pct}%` }}></div>
                                          </div>
                                          <div className="w-8 text-right text-xs font-bold text-slate-600">{count}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {pollType === 'emoji' && (
                                  <div className="flex items-end justify-between h-40 px-2 sm:px-8 pb-2">
                                    {q.options.map((opt, i) => {
                                      const count = q.optionCounts[i] || 0;
                                      const pct = totalR > 0 ? Math.round((count / totalR) * 100) : 0;
                                      const colors = ['bg-emerald-600', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-600', 'bg-teal-500'];
                                      return (
                                        <div key={i} className="flex flex-col items-center gap-3">
                                          <span className="text-3xl" title={opt}>{opt}</span>
                                          <div className={`w-8 rounded-t-lg ${colors[i % colors.length]} flex items-end justify-center pb-2 transition-all`} style={{ height: `${Math.max(12, pct * 1.2)}px`, minHeight: '24px' }}></div>
                                          <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {pollType === 'word_cloud' && (
                                  <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 py-8">
                                    {q.options.map((opt, i) => {
                                      const count = q.optionCounts[i] || 0;
                                      const colors = ['text-indigo-600', 'text-teal-600', 'text-amber-500', 'text-purple-400', 'text-emerald-700', 'text-slate-500', 'text-blue-600', 'text-rose-600'];

                                      let sizeClass = 'text-lg';
                                      if (totalR > 0) {
                                        const pct = (count / totalR) * 100;
                                        if (pct > 40) sizeClass = 'text-5xl';
                                        else if (pct > 25) sizeClass = 'text-4xl';
                                        else if (pct > 15) sizeClass = 'text-3xl';
                                        else if (pct > 5) sizeClass = 'text-2xl';
                                        else if (pct === 0) return null;
                                      }

                                      return (
                                        <span key={i} className={`font-bold ${sizeClass} ${colors[i % colors.length]} transition-all hover:scale-110 cursor-default`} title={`${count} votes`}>{opt}</span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
                          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Class Accuracy</p>
                          <p className="text-4xl font-black text-amber-700">{selectedReport.classAccuracy}%</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Participation</p>
                          <p className="text-4xl font-black text-emerald-700">{selectedReport.participationRate}%</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Questions</p>
                          <p className="text-4xl font-black text-slate-700">{selectedReport.totalQuestions}</p>
                        </div>
                      </div>

                      {/* Student Performance Table */}
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Student Performance Overview</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="p-3">Roll</th>
                                <th className="p-3">Name</th>
                                <th className="p-3 text-center">Accuracy</th>
                                <th className="p-3 text-center">Correct</th>
                                <th className="p-3 text-center">Incorrect</th>
                                <th className="p-3 text-center">Skipped</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedReport.studentPerformances
                                .sort((a, b) => a.rollNo - b.rollNo)
                                .map((sp, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-semibold text-slate-700">#{sp.rollNo}</td>
                                    <td className="p-3 font-bold text-slate-900">{sp.name}</td>
                                    <td className="p-3 text-center">
                                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${sp.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700' : sp.accuracy >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {sp.accuracy}%
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-medium text-emerald-600">{sp.correct}</td>
                                    <td className="p-3 text-center font-medium text-rose-600">{sp.incorrect}</td>
                                    <td className="p-3 text-center font-medium text-slate-400">{sp.unattempted}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

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
