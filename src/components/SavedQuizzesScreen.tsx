import React, { useState } from 'react';
import { SavedQuiz, ClassQuizReport, Student } from '../types';
import { ClassReportModal } from './ClassReportModal';
import { FileText, LayoutTemplate } from 'lucide-react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface SavedQuizzesScreenProps {
  savedQuizzes: SavedQuiz[];
  savedPolls: SavedQuiz[];
  classReports: ClassQuizReport[];
  setClassReports: React.Dispatch<React.SetStateAction<ClassQuizReport[]>>;
  allowedClasses: string[];
  students: Student[];
  onPlay: (quiz: SavedQuiz) => void;
  onEdit: (quiz: SavedQuiz) => void;
  onDelete: (id: string, isPoll: boolean) => void;
  onUpload?: (quiz: SavedQuiz) => void;
  onBack: () => void;
}

export const SavedQuizzesScreen: React.FC<SavedQuizzesScreenProps> = ({
  savedQuizzes,
  savedPolls,
  classReports,
  setClassReports,
  allowedClasses,
  students,
  onPlay,
  onEdit,
  onDelete,
  onUpload,
  onBack,
}) => {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'polls'>('quizzes');
  const [downloadingQuiz, setDownloadingQuiz] = useState<SavedQuiz | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const generatePDF = (quiz: SavedQuiz) => {
    const doc = new jsPDF();
    const isPoll = quiz.config.type === 'poll';

    let y = 20;
    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${isPoll ? 'Poll' : 'Quiz'} Name: ${quiz.config.quizName || `Untitled ${isPoll ? 'Poll' : 'Quiz'}`}`, margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Class: ${quiz.config.classNameDisplay}`, margin, y);
    y += 6;
    doc.text(`Subject: ${quiz.config.subject}`, margin, y);
    y += 10;

    quiz.questions.forEach((q, index) => {
      checkPageBreak(30);

      doc.setFont("helvetica", "bold");
      const splitTitle = doc.splitTextToSize(`Q${index + 1}. ${q.text}`, 170);
      doc.text(splitTitle, margin, y);
      y += splitTitle.length * 6;

      doc.setFont("helvetica", "normal");
      q.options.forEach((opt, oIndex) => {
        checkPageBreak(10);
        const optText = doc.splitTextToSize(`   ${String.fromCharCode(65 + oIndex)}. ${opt}`, 170);
        doc.text(optText, margin, y);
        y += optText.length * 6;
      });

      if (!isPoll) {
        checkPageBreak(10);
        doc.setFont("helvetica", "italic");
        doc.text(`   Correct Answer: ${q.correct_answer}`, margin, y);
        doc.setFont("helvetica", "normal");
        y += 6;
      }
      y += 4; // spacing between questions
    });

    doc.save(`${quiz.config.quizName || (isPoll ? 'Poll' : 'Quiz')}.pdf`);
  };

  const generateTXT = (quiz: SavedQuiz) => {
    let content = `Title: ${quiz.config.quizName || `Untitled ${quiz.config.type === 'poll' ? 'Poll' : 'Quiz'}`}\n`;
    content += `Class: ${quiz.config.classNameDisplay}\n`;
    content += `Subject: ${quiz.config.subject}\n`;
    content += `Type: ${quiz.config.type}\n`;
    if (quiz.config.chapters && quiz.config.chapters.length > 0) {
      content += `Chapters: ${quiz.config.chapters.map(c => c.name).join(', ')}\n`;
    }
    content += `\n`;

    quiz.questions.forEach((q, index) => {
      content += `Q${index + 1}: ${q.text}\n`;
      q.options.forEach((opt, oIndex) => {
        content += `${String.fromCharCode(65 + oIndex)}) ${opt}\n`;
      });
      if (quiz.config.type !== 'poll' && q.correct_answer) {
        const correctIdx = q.options.indexOf(q.correct_answer);
        if (correctIdx >= 0) {
          content += `Ans: ${String.fromCharCode(65 + correctIdx)}\n`;
        }
      }
      content += `\n`;
    });

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${quiz.config.quizName || (quiz.config.type === 'poll' ? 'Poll' : 'Quiz')}.txt`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const generateWord = async (quiz: SavedQuiz) => {
    const isPoll = quiz.config.type === 'poll';

    const children = [
      new Paragraph({
        children: [
          new TextRun({ text: `${isPoll ? 'Poll' : 'Quiz'} Name: ${quiz.config.quizName || `Untitled ${isPoll ? 'Poll' : 'Quiz'}`}`, bold: true, size: 32 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Class: ${quiz.config.classNameDisplay}`, size: 24 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Subject: ${quiz.config.subject}`, size: 24 }),
        ],
      }),
      new Paragraph({ text: "" }), // Spacing
    ];

    quiz.questions.forEach((q, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Q${index + 1}. ${q.text}`, bold: true, size: 24 }),
          ],
        })
      );

      q.options.forEach((opt, oIndex) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `   ${String.fromCharCode(65 + oIndex)}. ${opt}`, size: 24 }),
            ],
          })
        );
      });

      if (!isPoll) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `   Correct Answer: ${q.correct_answer}`, italics: true, size: 24 }),
            ],
          })
        );
      }

      children.push(new Paragraph({ text: "" }));
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', url);
    downloadAnchorNode.setAttribute('download', `${quiz.config.quizName || (isPoll ? 'Poll' : 'Quiz')}.docx`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };

  const isPollMode = activeTab === 'polls';
  const activeItems = isPollMode ? savedPolls : savedQuizzes;

  const displayClasses: string[] = allowedClasses.length > 0
    ? allowedClasses
    : Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

  const renderClassGrid = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2 max-w-6xl mx-auto">
        {displayClasses.map((className) => {
          const items = activeItems.filter(q => {
            const qClassName = (q.config.classNameDisplay || `Class ${q.config.classId?.replace('class-', '') || ''}`).toLowerCase().replace('-', ' ').trim();
            const cNormalized = className.toLowerCase().replace('-', ' ').trim();
            return qClassName === cNormalized;
          });

          const classNumber = className.replace(/class/i, '').trim();

          return (
            <button
              key={className}
              onClick={() => {
                setExpandedClass(expandedClass === className ? null : className);
              }}
              className="group relative overflow-hidden aspect-square rounded-3xl bg-white flex flex-col items-center justify-center transition-all duration-300 shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center font-bold text-2xl mb-4 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 border border-amber-100">
                {classNumber || '🏫'}
              </div>

              <h3 className="font-bold text-lg text-slate-800 mb-1 tracking-wide">
                {className}
              </h3>

              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${items.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                {items.length} {items.length === 1 ? (isPollMode ? 'Poll' : 'Quiz') : (isPollMode ? 'Polls' : 'Quizzes')}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderDetailView = () => {
    const classQuizzes = activeItems.filter(q => {
      const qClassName = (q.config.classNameDisplay || `Class ${q.config.classId?.replace('class-', '') || ''}`).toLowerCase().replace('-', ' ').trim();
      const cNormalized = (expandedClass || '').toLowerCase().replace('-', ' ').trim();
      return qClassName === cNormalized;
    });

    return (
      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Left Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2 overflow-y-auto pr-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-2">My Classes</h3>
          {displayClasses.map(className => {
            const count = activeItems.filter(q => {
              const qClassName = (q.config.classNameDisplay || `Class ${q.config.classId?.replace('class-', '') || ''}`).toLowerCase().replace('-', ' ').trim();
              const cNormalized = className.toLowerCase().replace('-', ' ').trim();
              return qClassName === cNormalized;
            }).length;

            const isSelected = expandedClass === className;

            return (
              <button
                key={className}
                onClick={() => setExpandedClass(className)}
                className={`text-left p-4 rounded-xl transition-all border ${isSelected ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <h4 className={`font-bold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>{className}</h4>
                <div className={`text-xs mt-1 ${isSelected ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>{count} {count === 1 ? (isPollMode ? 'poll' : 'quiz') : (isPollMode ? 'polls' : 'quizzes')}</div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{expandedClass}</h2>
              <p className="text-sm text-slate-500">{classQuizzes.length} {classQuizzes.length === 1 ? (isPollMode ? 'poll' : 'quiz') : (isPollMode ? 'polls' : 'quizzes')} saved</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-white text-slate-800 border border-slate-200 hover:border-amber-400 hover:text-amber-600 font-bold rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import TXT
              </button>
              <button onClick={() => setExpandedClass(null)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg text-sm transition-colors shadow-sm">
                Close View
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl">
            {classQuizzes.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full bg-white border border-slate-200 rounded-xl">
                <div className="text-4xl mb-4 opacity-50">📭</div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No {isPollMode ? 'polls' : 'quizzes'} found</h3>
                <p className="text-slate-500 text-sm">You haven't saved any {isPollMode ? 'polls' : 'quizzes'} for {expandedClass}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-2">
                {classQuizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-2">{quiz.config.quizName || `Untitled ${isPollMode ? 'Poll' : 'Quiz'}`}</h3>
                        <div className="flex items-center gap-2">
                          {quiz.config.creationMode === 'custom' && (
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap uppercase tracking-wider">
                              Custom
                            </span>
                          )}
                          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                            {quiz.questions.length} Qs
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-slate-500">
                        <p><span className="font-medium text-slate-700">Class:</span> {quiz.config.classNameDisplay}</p>
                        <p><span className="font-medium text-slate-700">Subject:</span> {quiz.config.subject}</p>
                        <p><span className="font-medium text-slate-700">Saved:</span> {new Date(quiz.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex border-t border-slate-100 bg-slate-50 divide-x divide-slate-200">
                      <button
                        onClick={() => onDelete(quiz.id, isPollMode)}
                        className="flex-1 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex justify-center items-center gap-1 font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                      <button
                        onClick={() => onEdit(quiz)}
                        className="flex-1 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors flex justify-center items-center gap-1 font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setDownloadingQuiz(quiz)}
                        className="flex-1 py-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex justify-center items-center gap-1 font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      <button
                        onClick={() => onPlay(quiz)}
                        className="flex-1 py-3 text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors flex justify-center items-center gap-1 font-bold text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Play
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
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
            Saved Content
          </h2>
          <p className="text-slate-500 mt-1 ml-11">Manage and play your saved quizzes and polls.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('quizzes'); setExpandedClass(null); }}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'quizzes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Quizzes ({savedQuizzes.length})
            </button>
            <button
              onClick={() => { setActiveTab('polls'); setExpandedClass(null); }}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'polls' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Polls ({savedPolls.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
        {expandedClass ? renderDetailView() : renderClassGrid()}
      </div>

      {/* Download Format Selection Modal */}
      {downloadingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Download Options</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{downloadingQuiz.config.quizName || `Untitled ${downloadingQuiz.config.type === 'poll' ? 'Poll' : 'Quiz'}`}</p>
              </div>
              <button
                onClick={() => setDownloadingQuiz(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white">
              {/* PDF Option Card */}
              <button
                onClick={() => { generatePDF(downloadingQuiz); setDownloadingQuiz(null); }}
                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-red-400 hover:bg-red-50 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    <text x="6" y="16" fontSize="7" fontWeight="bold" fill="currentColor">PDF</text>
                  </svg>
                </div>
                <span className="font-bold text-slate-700 text-sm group-hover:text-red-700 text-center">PDF Format</span>
                <span className="text-[10px] text-slate-500 mt-1 text-center">For printing</span>
              </button>

              {/* Word Option Card */}
              <button
                onClick={() => { generateWord(downloadingQuiz); setDownloadingQuiz(null); }}
                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <text x="6" y="16" fontSize="6" fontWeight="bold" fill="currentColor">DOC</text>
                  </svg>
                </div>
                <span className="font-bold text-slate-700 text-sm group-hover:text-blue-700 text-center">Word Format</span>
                <span className="text-[10px] text-slate-500 mt-1 text-center">For editing</span>
              </button>

              {/* TXT Option Card */}
              <button
                onClick={() => { generateTXT(downloadingQuiz); setDownloadingQuiz(null); }}
                className="flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <text x="6" y="15" fontSize="5" fontWeight="bold" fill="currentColor">TXT</text>
                  </svg>
                </div>
                <span className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 text-center">Text Data</span>
                <span className="text-[10px] text-slate-500 mt-1 text-center">For importing back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import TXT Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Import Text Quiz (.txt)</h3>
                <p className="text-sm text-slate-500 mt-1">Upload your .txt file or review the accepted data template.</p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[500px]">
              {/* Left Side: Upload Area */}
              <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center justify-center bg-white relative">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <label className="w-full max-w-[280px] aspect-square border-2 border-dashed border-amber-400 bg-white rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-md z-10">
                  <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 group-hover:bg-amber-50 transition-all duration-300">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Click to Upload</h4>
                  <p className="text-sm font-medium text-amber-600 mt-1">Only .txt files are supported</p>
                  <input type="file" accept=".txt" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const text = event.target?.result as string;
                        const lines = text.split('\n').map(l => l.trim());

                        let currentQuiz = {
                          config: {
                            type: 'quiz' as const,
                            quizName: 'Imported Quiz',
                            classId: expandedClass ? `class-${expandedClass.match(/\d+/)?.[0] || '1'}` : 'class-1',
                            classNameDisplay: expandedClass || 'Class 1',
                            subject: 'General',
                            creationMode: 'custom' as const,
                            chapterCount: 0,
                            chapters: [] as any[]
                          },
                          questions: [] as any[],
                          id: '',
                          createdAt: Date.now()
                        };

                        let currentQuestion: any = null;

                        for (const line of lines) {
                          if (line.startsWith('Title:')) currentQuiz.config.quizName = line.replace('Title:', '').trim();
                          else if (line.startsWith('Class:')) {
                            const cls = line.replace('Class:', '').trim();
                            if (!expandedClass) {
                              currentQuiz.config.classNameDisplay = cls;
                              const m = cls.match(/\d+/);
                              if (m) currentQuiz.config.classId = `class-${m[0]}`;
                            }
                          }
                          else if (line.startsWith('Subject:')) currentQuiz.config.subject = line.replace('Subject:', '').trim();
                          else if (line.startsWith('Type:')) {
                            const t = line.replace('Type:', '').trim().toLowerCase();
                            if (t === 'poll') currentQuiz.config.type = 'poll';
                          }
                          else if (line.startsWith('Chapters:')) {
                            const chaps = line.replace('Chapters:', '').split(',').map(c => c.trim()).filter(Boolean);
                            currentQuiz.config.chapters = chaps.map(name => ({ name }));
                            currentQuiz.config.chapterCount = chaps.length;
                          }
                          else if (line.match(/^Q\d+:/)) {
                            if (currentQuestion) {
                              if (currentQuiz.config.type === 'quiz' && !currentQuestion.correct_answer) {
                                currentQuestion.correct_answer = currentQuestion.options[0] || '';
                              }
                              currentQuiz.questions.push(currentQuestion);
                            }
                            currentQuestion = {
                              id: `q${currentQuiz.questions.length + 1}`,
                              text: line.replace(/^Q\d+:/, '').trim(),
                              options: []
                            };
                          }
                          else if (line.match(/^[A-Z]\)/)) {
                            if (currentQuestion) {
                              currentQuestion.options.push(line.replace(/^[A-Z]\)/, '').trim());
                            }
                          }
                          else if (line.startsWith('Ans:')) {
                            if (currentQuestion) {
                              const letter = line.replace('Ans:', '').trim().toUpperCase();
                              const idx = letter.charCodeAt(0) - 65;
                              if (idx >= 0 && idx < currentQuestion.options.length) {
                                currentQuestion.correct_answer = currentQuestion.options[idx];
                              } else {
                                currentQuestion.correct_answer = letter; // fallback
                              }
                            }
                          }
                        }

                        if (currentQuestion) {
                          if (currentQuiz.config.type === 'quiz' && !currentQuestion.correct_answer) {
                            currentQuestion.correct_answer = currentQuestion.options[0] || '';
                          }
                          currentQuiz.questions.push(currentQuestion);
                        }

                        if (currentQuiz.questions.length > 0) {
                          currentQuiz.id = `${currentQuiz.config.type === 'poll' ? 'SP' : 'SQ'}${Date.now()}`;
                          onUpload?.(currentQuiz);
                          setShowImportModal(false);
                        } else {
                          alert('Invalid text format or no questions found');
                        }
                      } catch (err) {
                        alert('Error reading TXT file');
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }} />
                </label>
              </div>

              {/* Right Side: Template Preview */}
              <div className="flex-1 p-6 flex flex-col bg-white overflow-hidden">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h4 className="font-bold text-slate-800 text-lg">Text Data Template</h4>
                  <button
                    onClick={() => {
                      let content = `Title: Sample Math Quiz\n`;
                      content += `Class: Class 2\n`;
                      content += `Subject: Mathematics\n`;
                      content += `Type: quiz\n`;
                      content += `Chapters: Basic Addition\n\n`;
                      content += `Q1: What is 5 + 3?\n`;
                      content += `A) 6\n`;
                      content += `B) 7\n`;
                      content += `C) 8\n`;
                      content += `D) 9\n`;
                      content += `Ans: C\n`;

                      const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `quiz_template.txt`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="text-xs font-bold px-4 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Template
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#14213D] rounded-2xl p-5 text-[13px] font-mono leading-relaxed shadow-inner">
                  <pre><code className="text-blue-100">{`Title: Sample Math Quiz
Class: Class 2
Subject: Mathematics
Type: quiz
Chapters: Basic Addition

Q1: What is 5 + 3?
A) 6
B) 7
C) 8
D) 9
Ans: C`}</code></pre>
                </div>

                <div className="mt-4 shrink-0 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3 items-start">
                  <span className="text-amber-500 text-base mt-0.5">💡</span>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Make sure each question starts with <code className="bg-white px-1 py-0.5 rounded text-amber-900 border border-amber-100 shadow-sm font-mono font-bold">Q[Number]:</code>, options start with <code className="bg-white px-1 py-0.5 rounded text-amber-900 border border-amber-100 shadow-sm font-mono font-bold">A)</code>, <code className="bg-white px-1 py-0.5 rounded text-amber-900 border border-amber-100 shadow-sm font-mono font-bold">B)</code>, and the answer uses <code className="bg-white px-1 py-0.5 rounded text-amber-900 border border-amber-100 shadow-sm font-mono font-bold">Ans: [Letter]</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
