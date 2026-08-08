import React, { useState, useRef } from 'react';
import { QuizConfig, Question } from '../types';
import { Image as ImageIcon, X, Plus, CheckCircle2, Circle, Upload, Save, Play, ChevronRight, Tag, Trash2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

interface CustomQuizBuilderScreenProps {
  initialConfig: QuizConfig;
  initialQuestions?: Question[];
  allowedClasses: string[];
  onSaveQuiz: (config: QuizConfig, questions: Question[]) => void;
  onBack: () => void;
}

export const CustomQuizBuilderScreen: React.FC<CustomQuizBuilderScreenProps> = ({
  initialConfig,
  initialQuestions = [],
  allowedClasses,
  onSaveQuiz,
  onBack,
}) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  // Current editing state
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(`Q${Date.now()}`);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('A');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [optionImages, setOptionImages] = useState<string[]>(['', '', '', '']);
  const [questionType, setQuestionType] = useState<'MCQ' | 'True/False'>('MCQ');
  const [hideAnswer, setHideAnswer] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topic, setTopic] = useState<string>('');
  const [isAddingTopic, setIsAddingTopic] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      const q = initialQuestions[0];
      setCurrentQuestionId(q.id);
      setQuestionText(q.text);
      setOptions([...q.options]);
      const correctIdx = q.options.findIndex(opt => opt === q.correct_answer);
      setCorrectAnswer(String.fromCharCode(65 + (correctIdx >= 0 ? correctIdx : 0)));
      setImageUrl(q.imageUrl || '');
      setOptionImages(q.optionImages || (q.options.length === 2 && q.options[0] === 'True' && q.options[1] === 'False' ? ['', ''] : ['', '', '', '']));
      setQuestionType(q.options.length === 2 && q.options[0] === 'True' && q.options[1] === 'False' ? 'True/False' : 'MCQ');
      setHideAnswer(q.hideAnswer || false);
      setDifficulty(q.difficulty || 'medium');
      setTopic(q.topic || '');
    }
  }, []); // Run once on mount

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('Image size should be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOptionImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showToast('Image size should be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...optionImages];
        newImages[index] = reader.result as string;
        setOptionImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOptionImage = (index: number) => {
    const newImages = [...optionImages];
    newImages[index] = '';
    setOptionImages(newImages);
    // Also clear the file input if possible
    const input = document.getElementById(`option-image-${index}`) as HTMLInputElement;
    if (input) input.value = '';
  };

  const saveCurrentQuestion = (): boolean => {
    if (!questionText.trim()) {
      showToast('Question text cannot be empty', 'error');
      return false;
    }
    if (options.some(opt => !opt.trim())) {
      showToast('All options must be filled', 'error');
      return false;
    }

    const newQuestion: Question = {
      id: currentQuestionId,
      text: questionText.trim(),
      options: options.map(o => o.trim()),
      correct_answer: options[correctAnswer.charCodeAt(0) - 65].trim(),
      chapter_label: initialConfig.chapters[0]?.chapter_label || 'General',
      marks: 1,
      imageUrl: imageUrl || undefined,
      optionImages: optionImages.some(img => img !== '') ? optionImages : undefined,
      hideAnswer,
      difficulty,
      topic: topic || undefined,
    };

    setQuestions(prev => {
      const exists = prev.findIndex(q => q.id === currentQuestionId);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = newQuestion;
        return next;
      }
      return [...prev, newQuestion];
    });

    return true;
  };

  const handleAddNext = () => {
    if (saveCurrentQuestion()) {
      // Reset form for next question
      setCurrentQuestionId(`Q${Date.now()}`);
      setQuestionText('');
      setOptions(questionType === 'MCQ' ? ['', '', '', ''] : ['True', 'False']);
      setOptionImages(questionType === 'MCQ' ? ['', '', '', ''] : ['', '']);
      setCorrectAnswer('A');
      setImageUrl('');
      setHideAnswer(false);
      setTopic('');
      setDifficulty('medium');
      showToast('Question saved!', 'success');
    }
  };

  const handleEditQuestion = (q: Question) => {
    // Save current before switching? Only if it has text.
    if (questionText.trim()) {
      saveCurrentQuestion();
    }

    setCurrentQuestionId(q.id);
    setQuestionText(q.text);
    setOptions([...q.options]);
    // Find correct answer letter
    const correctIdx = q.options.findIndex(opt => opt === q.correct_answer);
    setCorrectAnswer(String.fromCharCode(65 + (correctIdx >= 0 ? correctIdx : 0)));
    setImageUrl(q.imageUrl || '');
    setOptionImages(q.optionImages || (q.options.length === 2 && q.options[0] === 'True' && q.options[1] === 'False' ? ['', ''] : ['', '', '', '']));
    setQuestionType(q.options.length === 2 && q.options[0] === 'True' && q.options[1] === 'False' ? 'True/False' : 'MCQ');
    setHideAnswer(q.hideAnswer || false);
    setDifficulty(q.difficulty || 'medium');
    setTopic(q.topic || '');
  };

  const handleDeleteQuestion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (currentQuestionId === id) {
      // Switch to a new empty question
      setCurrentQuestionId(`Q${Date.now()}`);
      setQuestionText('');
      setOptions(questionType === 'MCQ' ? ['', '', '', ''] : ['True', 'False']);
      setOptionImages(questionType === 'MCQ' ? ['', '', '', ''] : ['', '']);
      setCorrectAnswer('A');
      setImageUrl('');
      setHideAnswer(false);
      setTopic('');
      setDifficulty('medium');
    }
  };

  const handleGenerateQuiz = () => {
    // Try to save current question if it has content
    if (questionText.trim()) {
      if (!saveCurrentQuestion()) return;
    }

    if (questions.length === 0 && !questionText.trim()) {
      showToast('Please add at least one question to generate the quiz', 'error');
      return;
    }

    // Determine the final questions list (in case they just clicked generate after typing)
    let finalQuestions = [...questions];
    if (questionText.trim() && !questions.find(q => q.id === currentQuestionId)) {
      finalQuestions.push({
        id: currentQuestionId,
        text: questionText.trim(),
        options: options.map(o => o.trim()),
        correct_answer: options[correctAnswer.charCodeAt(0) - 65].trim(),
        chapter_label: initialConfig.chapters[0]?.chapter_label || 'General',
        marks: 1,
        imageUrl: imageUrl || undefined,
        optionImages: optionImages.some(img => img !== '') ? optionImages : undefined,
        hideAnswer,
        difficulty,
        topic: topic || undefined,
      });
    }

    onSaveQuiz({ ...initialConfig, questionCount: finalQuestions.length }, finalQuestions);
  };

  const handleDiscard = async () => {
    if (questions.length > 0 || questionText.trim()) {
      const isConfirmed = await confirm({
        title: 'Discard Quiz',
        message: 'Are you sure you want to discard this custom quiz? All questions will be lost.',
        confirmText: 'Discard',
        cancelText: 'Cancel',
        type: 'danger'
      });
      if (isConfirmed) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <div className="flex-1 flex gap-4 p-3 sm:p-4 bg-[#FBF7EE] text-[#14213D] w-full h-[calc(100vh-80px)] font-['Inter']">

      {/* Left Sidebar - Question List */}
      <aside className="w-full lg:w-[280px] bg-white rounded-[24px] p-4 shrink-0 shadow-[0_14px_34px_-18px_rgba(20,33,61,0.16)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-['Space_Grotesk'] text-[16px] font-bold">Quiz Questions</h3>
          <span className="text-[10px] font-bold text-[#E29B2A] bg-[#FBF7EE] px-2 py-1 rounded-full border border-[#E4DCC8]">
            {questions.length} Questions
          </span>
        </div>
        <p className="text-[11px] leading-snug text-[#8A8272] mb-4">Create your quiz manually — type any question and optionally add an image.</p>

        <div className="border-t border-dashed border-[#E4DCC8] mb-4"></div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              onClick={() => handleEditQuestion(q)}
              className={`relative p-2 rounded-2xl border-2 cursor-pointer transition-all group ${currentQuestionId === q.id
                ? 'border-[#E29B2A] bg-[#E29B2A] text-white shadow-md -translate-y-1'
                : 'border-[#E4DCC8] bg-white hover:border-[#E29B2A]/50'
                }`}
            >
              <div className="flex gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${currentQuestionId === q.id ? 'bg-white/20 text-white' : 'bg-[#FBF7EE] text-[#8A8272]'
                  }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className={`text-xs font-semibold truncate ${currentQuestionId === q.id ? 'text-white' : 'text-[#14213D]'}`}>
                    {q.text || 'Untitled Question'}
                  </p>
                  <div className={`flex items-center gap-2 mt-1 text-[10px] ${currentQuestionId === q.id ? 'text-white/80' : 'text-[#8A8272]'}`}>
                    {q.imageUrl && (
                      <span className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-white">
                        <ImageIcon className="w-3 h-3" /> Image
                      </span>
                    )}
                    <span>{q.options.length} options</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteQuestion(q.id, e)}
                className={`absolute top-3 right-2 p-1 rounded-full opacity-0 transition-opacity ${currentQuestionId === q.id ? 'group-hover:opacity-100 text-white hover:bg-white/20' : 'group-hover:opacity-100 text-[#8A8272] hover:bg-slate-100'
                  }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="text-center py-8 text-[#8A8272] text-sm">
              No questions added yet.
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (questionText.trim()) saveCurrentQuestion();
            setCurrentQuestionId(`Q${Date.now()}`);
            setQuestionText('');
            setOptions(questionType === 'MCQ' ? ['', '', '', ''] : ['True', 'False']);
            setOptionImages(questionType === 'MCQ' ? ['', '', '', ''] : ['', '']);
            setCorrectAnswer('A');
            setImageUrl('');
            setHideAnswer(false);
            setTopic('');
            setDifficulty('medium');
          }}
          className="w-full py-3 border-2 border-dashed border-[#E29B2A] text-[#E29B2A] font-bold rounded-2xl hover:bg-[#E29B2A]/5 transition-colors mb-4 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>

        <button
          onClick={handleGenerateQuiz}
          className="w-full py-4 bg-[#E29B2A] text-white font-['Space_Grotesk'] font-bold rounded-2xl shadow-[0_10px_22px_-10px_rgba(226,155,42,0.6)] hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(226,155,42,0.8)] transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Save className="w-4 h-4" fill="currentColor" /> Save Draft
        </button>
      </aside>

      {/* Main Editor */}
      <main className="flex-1 bg-white rounded-[24px] p-5 sm:p-6 lg:p-8 shadow-[0_20px_50px_-24px_rgba(20,33,61,0.2)] flex flex-col h-full overflow-y-auto relative">
        <div className="absolute w-[26px] h-[26px] bg-[#FBF7EE] rounded-full top-[60px] -left-[13px]" />

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#FBF7EE] flex items-center justify-center">
            <span className="text-[#E29B2A]">✍️</span>
          </div>
          <span className="text-[11px] font-bold text-[#E29B2A] uppercase tracking-wider bg-[#FBF7EE] px-3 py-1 rounded-full border border-[#E4DCC8]">
            Editing Question {questions.findIndex(q => q.id === currentQuestionId) + 1 || questions.length + 1} of {questions.findIndex(q => q.id === currentQuestionId) >= 0 ? questions.length : questions.length + 1}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-['Space_Grotesk'] font-bold text-[#14213D] mb-1">Create Custom Quiz</h2>
        <p className="text-[#8A8272] text-xs sm:text-sm mb-4">Type your questions manually, and optionally upload an image/diagram.</p>

        {/* Media & Question Input */}
        <div className="flex flex-col xl:flex-row gap-4 mb-5">
          {/* Upload Area */}
          <div
            className="w-full xl:w-[220px] h-[140px] shrink-0 border-2 border-dashed border-[#E4DCC8] rounded-xl bg-[#FBF7EE] flex flex-col items-center justify-center p-4 relative overflow-hidden group cursor-pointer hover:border-[#E29B2A] transition-colors"
            onClick={() => !imageUrl && fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="Uploaded" className="absolute inset-0 w-full h-full object-contain bg-white" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors z-10"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-[#2A9D8F]" />
                </div>
                <span className="font-bold text-[#14213D] text-sm text-center">Upload Media</span>
                <span className="text-[10px] text-[#8A8272] mt-1 text-center">Diagram, graph or figure</span>
              </>
            )}
          </div>

          {/* Question Textarea */}
          <div className="flex-1 bg-white border-2 border-[#E4DCC8] rounded-xl p-4 sm:p-5 relative shadow-sm min-h-[140px] focus-within:border-[#E29B2A] transition-colors">
            <textarea
              className="w-full h-full min-h-[100px] bg-transparent text-[#14213D] font-['Space_Grotesk'] text-lg font-semibold resize-none outline-none placeholder:text-[#8A8272]/50"
              placeholder="Type your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrect = correctAnswer === letter;
            let iconBg = 'bg-[#14213D]';
            if (idx === 0) iconBg = 'bg-[#E29B2A]';
            if (idx === 1) iconBg = 'bg-[#4C5FD5]';
            if (idx === 2) iconBg = 'bg-[#2A9D8F]';
            if (idx === 3) iconBg = 'bg-[#8B5FA3]';

            return (
              <div
                key={letter}
                className={`flex items-center gap-3 p-1.5 pl-3 border-[1.5px] rounded-xl transition-all ${isCorrect ? 'border-[#2F7A52] bg-[#2F7A52]/5' : 'border-[#E4DCC8] hover:border-[#E29B2A]/50'
                  }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-['Space_Grotesk'] font-bold text-white text-[13px] shrink-0 ${iconBg}`}>
                  {letter}
                </div>
                <input
                  type="text"
                  placeholder={`Option ${letter}`}
                  value={opt}
                  readOnly={questionType === 'True/False'}
                  onChange={(e) => {
                    const newOpts = [...options];
                    newOpts[idx] = e.target.value;
                    setOptions(newOpts);
                  }}
                  className={`flex-1 bg-transparent outline-none font-medium text-[13.5px] text-[#14213D] py-1.5 ${questionType === 'True/False' ? 'opacity-80' : ''}`}
                />

                {questionType !== 'True/False' && (
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`option-image-${idx}`}
                      onChange={(e) => handleOptionImageUpload(idx, e)}
                    />
                    {optionImages[idx] ? (
                      <div className="relative w-8 h-8 rounded shrink-0 border border-[#E4DCC8] bg-white group/optimg">
                        <img src={optionImages[idx]} alt={`Opt ${letter}`} className="w-full h-full object-contain rounded" />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeOptionImage(idx); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/optimg:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`option-image-${idx}`}
                        className="p-1.5 rounded-lg border border-transparent text-[#8A8272] hover:bg-[#FBF7EE] hover:text-[#E29B2A] cursor-pointer transition-all flex items-center justify-center"
                        title="Add image to option"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </label>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setCorrectAnswer(letter)}
                  className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${isCorrect
                    ? 'border-[#2F7A52] bg-[#2F7A52] text-white shadow-sm'
                    : 'border-[#E4DCC8] text-[#8A8272] hover:bg-[#FBF7EE]'
                    }`}
                  title="Mark as correct answer"
                >
                  {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-dashed border-[#E4DCC8] mb-4"></div>

        {/* Bottom Bar Settings */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={questionType}
                onChange={(e) => {
                  const val = e.target.value as 'MCQ' | 'True/False';
                  setQuestionType(val);
                  if (val === 'True/False') {
                    setOptions(['True', 'False']);
                    setOptionImages(['', '']);
                    if (correctAnswer === 'C' || correctAnswer === 'D') {
                      setCorrectAnswer('A');
                    }
                  } else {
                    setOptions(['', '', '', '']);
                    setOptionImages(['', '', '', '']);
                  }
                }}
                className="border-2 border-[#E4DCC8] rounded-lg px-3 py-1.5 font-bold text-[13px] text-[#14213D] outline-none bg-white cursor-pointer hover:border-[#E29B2A]"
              >
                <option value="MCQ">MCQ</option>
                <option value="True/False">True/False</option>
              </select>
            </div>


          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDifficulty('easy')}
              className={`px-3 py-1 rounded-full border-2 text-[11px] font-bold cursor-pointer transition-colors ${difficulty === 'easy' ? 'border-[#2F7A52] text-[#2F7A52] bg-[#2F7A52]/5' : 'border-[#E4DCC8] text-[#8A8272] hover:border-[#E29B2A]'}`}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`px-3 py-1 rounded-full border-2 text-[11px] font-bold cursor-pointer transition-colors ${difficulty === 'medium' ? 'border-[#E29B2A] text-[#E29B2A] bg-[#E29B2A]/5' : 'border-[#E4DCC8] text-[#8A8272] hover:border-[#E29B2A]'}`}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`px-3 py-1 rounded-full border-2 text-[11px] font-bold cursor-pointer transition-colors ${difficulty === 'hard' ? 'border-[#831843] text-[#831843] bg-[#831843]/5' : 'border-[#E4DCC8] text-[#8A8272] hover:border-[#E29B2A]'}`}
            >
              Hard
            </button>

            {isAddingTopic ? (
              <input
                autoFocus
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onBlur={() => !topic.trim() ? setIsAddingTopic(false) : null}
                onKeyDown={e => e.key === 'Enter' && setIsAddingTopic(false)}
                placeholder="Topic..."
                className="px-3 py-1 rounded-full border border-indigo-300 text-[11px] font-bold text-indigo-700 bg-indigo-50 w-24 outline-none"
              />
            ) : (
              <button
                onClick={() => setIsAddingTopic(true)}
                className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${topic ? 'border-indigo-400 text-indigo-700 bg-indigo-100' : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
              >
                {topic ? (
                  <>
                    <Tag className="w-3 h-3" /> {topic}
                    <X className="w-3 h-3 ml-1 hover:text-red-500" onClick={(e) => { e.stopPropagation(); setTopic(''); setIsAddingTopic(false); }} />
                  </>
                ) : (
                  <><Plus className="w-3 h-3" /> Add Topic Tag</>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-[#E4DCC8] mb-4"></div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="px-4 py-2.5 text-sm font-bold text-red-600 border-2 border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Discard
            </button>
          </div>

          <button
            onClick={handleAddNext}
            className="px-6 py-2.5 bg-[#E29B2A] text-[#14213D] font-['Space_Grotesk'] font-bold text-[14px] rounded-xl shadow-[0_10px_22px_-10px_rgba(226,155,42,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            Save Question & Add Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </main>
    </div>
  );
};
