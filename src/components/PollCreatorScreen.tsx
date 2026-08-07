import React, { useState } from 'react';
import { QuizConfig, Question } from '../types';
import { CheckSquare, MessageSquare, Plus, Rocket, X, BarChart2, Hash, Smile, LayoutGrid, Eye, UserX } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

interface PollCreatorScreenProps {
  allowedClasses: string[];
  initialConfig: QuizConfig;
  onSaveDraft: (config: QuizConfig, questions: Question[]) => void;
  onLaunch: (config: QuizConfig, questions: Question[]) => void;
  onBack: () => void;
}

const POLL_TYPES = [
  { id: 'single_choice', label: 'Single Choice', icon: CheckSquare },
  { id: 'yes_no', label: 'Yes / No', icon: Hash },
  { id: 'rating', label: 'Rating Scale', icon: BarChart2 },
  { id: 'word_cloud', label: 'Word Cloud', icon: MessageSquare },
  { id: 'emoji', label: 'Emoji Reaction', icon: Smile },
];

const DEFAULT_OPTIONS: Record<string, string[]> = {
  single_choice: ['', '', '', ''],
  yes_no: ['Yes', 'No'],
  rating: ['1 - Poor', '2 - Fair', '3 - Good', '4 - Excellent'],
  word_cloud: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
  emoji: ['👍', '👎', '😲', '🤔'],
};

export const PollCreatorScreen: React.FC<PollCreatorScreenProps> = ({
  allowedClasses,
  initialConfig,
  onSaveDraft,
  onLaunch,
  onBack,
}) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const [polls, setPolls] = useState<Question[]>([
    {
      id: `P${Date.now()}`,
      text: '',
      options: ['', '', '', ''],
      correct_answer: 'A', // Not strictly used for polls but required by Question type
      chapter_label: 'Poll',
      marks: 1,
      pollType: 'single_choice'
    }
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [config, setConfig] = useState<QuizConfig>({
    ...initialConfig,
    showLiveResults: true,
    isAnonymous: false,
    type: 'poll'
  });

  const activePoll = polls[activeIndex];

  const handleUpdateActivePoll = (updates: Partial<Question>) => {
    setPolls(prev => prev.map((p, i) => i === activeIndex ? { ...p, ...updates } as Question : p));
  };

  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...activePoll.options];
    newOptions[optIndex] = value;
    handleUpdateActivePoll({ options: newOptions });
  };

  const handleRemoveOption = (optIndex: number) => {
    if (activePoll.options.length <= 2) {
      showToast('A poll must have at least 2 options.', 'error');
      return;
    }
    const newOptions = activePoll.options.filter((_, i) => i !== optIndex);
    handleUpdateActivePoll({ options: newOptions });
  };

  const handleAddOption = () => {
    if (activePoll.options.length >= 4) {
      showToast('Maximum 4 options allowed for ESP clickers.', 'error');
      return;
    }
    handleUpdateActivePoll({ options: [...activePoll.options, ''] });
  };

  const handleTypeChange = (typeId: any) => {
    handleUpdateActivePoll({
      pollType: typeId,
      options: [...DEFAULT_OPTIONS[typeId]]
    });
  };

  const handleAddPoll = () => {
    const newPoll: Question = {
      id: `P${Date.now()}`,
      text: '',
      options: ['', '', '', ''],
      correct_answer: 'A',
      chapter_label: 'Poll',
      marks: 1,
      pollType: 'single_choice'
    };
    setPolls(prev => [...prev, newPoll]);
    setActiveIndex(polls.length);
  };

  const handleRemovePoll = async (index: number) => {
    if (polls.length <= 1) return;

    const isConfirmed = await confirm({
      title: 'Delete Poll',
      message: 'Are you sure you want to delete this poll from the session?',
      isDestructive: true,
      confirmText: 'Delete'
    });

    if (isConfirmed) {
      const newPolls = polls.filter((_, i) => i !== index);
      setPolls(newPolls);
      if (activeIndex >= index && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      } else if (activeIndex >= newPolls.length) {
        setActiveIndex(newPolls.length - 1);
      }
    }
  };

  const validatePolls = () => {
    for (let i = 0; i < polls.length; i++) {
      if (!polls[i].text.trim()) {
        showToast(`Poll ${i + 1} is missing a question text.`, 'error');
        setActiveIndex(i);
        return false;
      }
      const validOptions = polls[i].options.filter(opt => opt.trim().length > 0);
      if (validOptions.length < 2) {
        showToast(`Poll ${i + 1} needs at least 2 non-empty options.`, 'error');
        setActiveIndex(i);
        return false;
      }
    }
    return true;
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="w-full h-full min-h-[calc(100vh-6rem)] bg-[#FDFBF7] flex">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-slate-200 bg-white p-6 flex flex-col h-[calc(100vh-6rem)] shrink-0 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Poll Session</h2>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
            {polls.length} Polls
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Multiple polls run in sequence within a session — just like quiz questions.
        </p>

        <div className="flex-1 space-y-3 overflow-y-auto mb-6 pr-2">
          {polls.map((poll, idx) => (
            <div
              key={poll.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group ${activeIndex === idx
                ? 'border-indigo-500 bg-indigo-50/30 shadow-[0_4px_12px_rgba(99,102,241,0.1)]'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                }`}
            >
              <div className="flex gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${activeIndex === idx ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate mb-1 ${activeIndex === idx ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {poll.text || 'Untitled Poll...'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    {(() => {
                      const Icon = POLL_TYPES.find(t => t.id === poll.pollType)?.icon || LayoutGrid;
                      return <Icon className="w-3.5 h-3.5 text-amber-500" />;
                    })()}
                    {POLL_TYPES.find(t => t.id === poll.pollType)?.label}
                  </div>
                </div>
                {polls.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemovePoll(idx); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddPoll}
          className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 transition-colors mb-4"
        >
          <Plus className="w-4 h-4" /> Add Another Poll
        </button>

        <button
          onClick={() => {
            if (validatePolls()) {
              onLaunch(config, polls);
            }
          }}
          className="w-full py-3.5 bg-[#D97706] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-[0_4px_12px_rgba(217,119,6,0.3)] hover:shadow-[0_6px_16px_rgba(217,119,6,0.4)] hover:-translate-y-0.5"
        >
          <Rocket className="w-4 h-4" /> Launch Full Session
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-6rem)] custom-scrollbar">
        <div className="max-w-4xl mx-auto p-8 lg:p-12">

          <div className="mb-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white rounded-full border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold tracking-wider uppercase border border-indigo-100 mb-1 inline-block">
                    Editing Poll {activeIndex + 1} of {polls.length}
                  </span>
                  <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create a Live Poll</h1>
                </div>
              </div>
              <p className="text-slate-500 font-medium ml-14">
                Create a quick opinion or check-in poll — allow the classroom to respond live.
              </p>
            </div>

            <button
              onClick={onBack}
              className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-sm"
            >
              Cancel & Exit
            </button>
          </div>

          <div className="space-y-8">

            {/* Poll Question */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                Poll Question
              </label>
              <textarea
                value={activePoll.text}
                onChange={(e) => handleUpdateActivePoll({ text: e.target.value })}
                placeholder="E.g., Do we need more revision on this topic?"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-medium text-slate-800 placeholder:text-slate-400"
                rows={3}
              />
            </div>

            {/* Poll Type */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                Poll Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {POLL_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = activePoll.pollType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${isSelected
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`mb-3 ${isSelected ? 'text-indigo-600' : 'text-amber-500'}`}>
                        {isSelected ? (
                          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                            <CheckSquare className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <span className={`text-[11px] font-bold text-center ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Options */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                Answer Options
              </label>
              <div className="space-y-3">
                {activePoll.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {getOptionLetter(i)}
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${getOptionLetter(i)}`}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveOption(i)}
                      className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0 bg-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {activePoll.options.length < 4 && (
                <button
                  onClick={handleAddOption}
                  className="w-full mt-4 py-3 bg-indigo-50/50 border border-dashed border-indigo-200 text-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              )}
            </div>

            {/* Global Session Settings */}
            {activeIndex === polls.length - 1 && (
              <>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                    Poll Settings
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Results Toggle */}
                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Show Live Results</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Students will see a real-time bar chart</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, showLiveResults: !prev.showLiveResults }))}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${config.showLiveResults ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${config.showLiveResults ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Anonymous Responses Toggle */}
                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                          <UserX className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Anonymous Responses</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Roll numbers will be hidden</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${config.isAnonymous ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${config.isAnonymous ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">
                    Class & Duration
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={config.classId}
                      onChange={(e) => {
                        const classNameDisplay = allowedClasses.includes(e.target.value)
                          ? e.target.value
                          : `Class ${e.target.value.replace('class-', '')}`;
                        setConfig(prev => ({ ...prev, classId: e.target.value, classNameDisplay }));
                      }}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {allowedClasses.length > 0 ? (
                        allowedClasses.map(c => <option key={c} value={c}>{c}</option>)
                      ) : (
                        <option value="class-8">Class 8</option>
                      )}
                    </select>

                    <select
                      value={config.timerSeconds}
                      onChange={(e) => setConfig(prev => ({ ...prev, timerSeconds: parseInt(e.target.value, 10) }))}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="15">15 Seconds</option>
                      <option value="30">30 Seconds</option>
                      <option value="60">60 Seconds</option>
                      <option value="120">120 Seconds</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 pb-12">
              <button
                onClick={() => {
                  if (validatePolls()) {
                    onSaveDraft(config, polls);
                  }
                }}
                className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Save as Draft
              </button>

              <button
                onClick={() => {
                  if (activeIndex < polls.length - 1) {
                    setActiveIndex(activeIndex + 1);
                  } else {
                    if (validatePolls()) {
                      handleAddPoll();
                    }
                  }
                }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                {activeIndex < polls.length - 1 ? 'Next Poll' : 'Next Poll'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
