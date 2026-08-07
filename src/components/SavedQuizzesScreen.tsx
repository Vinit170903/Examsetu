import React, { useState } from 'react';
import { SavedQuiz, ClassQuizReport } from '../types';
import { ClassReportModal } from './ClassReportModal';
import { FileText, LayoutTemplate } from 'lucide-react';

interface SavedQuizzesScreenProps {
  savedQuizzes: SavedQuiz[];
  savedPolls: SavedQuiz[];
  allowedClasses: string[];
  onPlay: (quiz: SavedQuiz) => void;
  onEdit: (quiz: SavedQuiz) => void;
  onDelete: (id: string, isPoll: boolean) => void;
  onBack: () => void;
}

export const SavedQuizzesScreen: React.FC<SavedQuizzesScreenProps> = ({
  savedQuizzes,
  savedPolls,
  allowedClasses,
  onPlay,
  onEdit,
  onDelete,
  onBack,
}) => {
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'polls'>('quizzes');

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
            <button onClick={() => setExpandedClass(null)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg text-sm transition-colors">
              Close View
            </button>
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
                        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                          {quiz.questions.length} Qs
                        </span>
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

      <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
        {expandedClass ? renderDetailView() : renderClassGrid()}
      </div>
    </div>
  );
};
