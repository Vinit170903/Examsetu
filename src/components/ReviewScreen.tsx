import React, { useState } from 'react';
import { Question, QuizConfig } from '../types';
import { FALLBACK_SAMPLE_QUESTIONS } from '../data/sampleQuestions';

interface ReviewScreenProps {
  config: QuizConfig;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  onSave: () => void;
  onDiscard: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ config, questions, setQuestions, onSave, onDiscard }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  const handleEditClick = (q: Question) => {
    setEditingId(q.id);
    setEditForm(q);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      setQuestions(questions.map((q) => (q.id === editingId ? { ...q, ...editForm } as Question : q)));
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleAddQuestion = () => {
    const newId = `Q${Date.now()}`;
    const newQuestion: Question = {
      id: newId,
      text: 'New Question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'A',
      chapter_label: config.chapters[0]?.chapter_label || '',
      marks: 1,
    };
    setQuestions([...questions, newQuestion]);
    setEditingId(newId);
    setEditForm(newQuestion);
  };

  const handleRegenerate = async (qToReplace: Question) => {
    setIsRegenerating(qToReplace.id);
    
    try {
      const cleanSubject = config.subject.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const kb_name = `ncert-${config.classId}-${cleanSubject}`;
      
      const payload = {
        chapters: [{ chapter_label: qToReplace.chapter_label, weight_percent: 100 }],
        subject: config.subject,
        ncert_class: config.classId,
        kb_name: kb_name,
        count: 1,
        section_id: config.section_id || 'A',
      };

      const socket = new WebSocket('ws://localhost:8001/api/v1/lms/papers/generate-mcq');
      
      let newQuestion: Question | null = null;

      socket.onopen = () => {
        socket.send(JSON.stringify(payload));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'question' && data.question) {
            newQuestion = {
              id: data.question.id || `Q${Date.now()}`,
              type: data.question.type || 'mcq',
              text: data.question.text || '',
              options: data.question.options || [],
              correct_answer: data.question.correct_answer || '',
              source: data.question.source || 'ncert_ai',
              chapter_label: data.question.chapter_label || qToReplace.chapter_label,
              section_id: data.question.section_id || 'A',
              marks: data.question.marks || 1,
            };
            socket.close();
          } else if (data.type === 'done') {
            socket.close();
          }
        } catch (e) {
          console.error(e);
        }
      };

      socket.onclose = () => {
        if (newQuestion) {
          setQuestions(questions.map(q => q.id === qToReplace.id ? newQuestion! : q));
        } else {
          const sample = FALLBACK_SAMPLE_QUESTIONS[Math.floor(Math.random() * FALLBACK_SAMPLE_QUESTIONS.length)];
          const fallbackQ = { ...sample, id: `Q${Date.now()}`, chapter_label: qToReplace.chapter_label };
          setQuestions(questions.map(q => q.id === qToReplace.id ? fallbackQ : q));
        }
        setIsRegenerating(null);
      };
      
      socket.onerror = () => {
         socket.close();
      };
      
    } catch (e) {
      console.error(e);
      setIsRegenerating(null);
    }
  };

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Review: {config.quizName || (config.type === 'poll' ? 'Generated Poll' : 'Generated Quiz')}</h2>
          <p className="text-slate-500 mt-1">Edit, add, or remove questions before saving the {config.type === 'poll' ? 'poll' : 'quiz'}.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            Discard {config.type === 'poll' ? 'Poll' : 'Quiz'}
          </button>
          <button
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-white border border-amber-200 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors"
          >
            + Add Question
          </button>
          <button
            onClick={onSave}
            disabled={questions.length === 0}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            Save {config.type === 'poll' ? 'Poll' : 'Quiz'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {questions.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No questions available. Please add some.
          </div>
        )}

        {questions.map((q, idx) => {
          const isEditing = editingId === q.id;

          return (
            <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                    <textarea
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      rows={3}
                      value={editForm.text || ''}
                      onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editForm.options?.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 w-6">{getOptionLabel(optIdx)}.</span>
                        <input
                          type="text"
                          className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(editForm.options || [])];
                            newOpts[optIdx] = e.target.value;
                            setEditForm({ ...editForm, options: newOpts });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer</label>
                      <select
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500"
                        value={editForm.correct_answer || (editForm.options ? editForm.options[0] : '')}
                        onChange={(e) => setEditForm({ ...editForm, correct_answer: e.target.value })}
                      >
                        {editForm.options?.map((opt, optIdx) => {
                          const val = getOptionLabel(optIdx);
                          return <option key={optIdx} value={opt}>Option {val}</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button onClick={handleCancelEdit} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">Save Changes</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Q{idx + 1}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">{q.chapter_label}</span>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">{q.text}</h3>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleRegenerate(q)}
                        disabled={isRegenerating === q.id}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Regenerate this question"
                      >
                        {isRegenerating === q.id ? (
                          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </button>
                      <button onClick={() => handleEditClick(q)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {q.options.map((opt, optIdx) => {
                      const label = getOptionLabel(optIdx);
                      const isCorrect = opt === q.correct_answer || label === q.correct_answer;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center p-3 rounded-lg border ${
                            isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className={`font-semibold w-8 ${isCorrect ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {label}.
                          </span>
                          <span className={`${isCorrect ? 'text-emerald-800 font-medium' : 'text-slate-700'}`}>
                            {opt}
                          </span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                              Correct
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {questions.length > 0 && (
          <div className="flex justify-center pt-6 pb-8">
            <button
              onClick={onSave}
              className="px-10 py-4 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save {config.type === 'poll' ? 'Poll' : 'Quiz'} & Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
