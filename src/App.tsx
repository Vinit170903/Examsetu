import React, { useState, useEffect } from 'react';
import { AppScreen, QuizConfig, Medium, Question, SavedQuiz, Student, StudentReport, ClassQuizReport, AttendanceRecord } from './types';
import { useMcqGenerator } from './hooks/useMcqGenerator';
import { getSubjectsForClass, getChaptersForClassAndSubject } from './data/ncertData';
import { useToast } from './contexts/ToastContext';
import { useConfirm } from './contexts/ConfirmContext';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { SavedQuizzesScreen } from './components/SavedQuizzesScreen';
import { StudentManageScreen } from './components/StudentManageScreen';
import { BulkStudentManageScreen } from './components/BulkStudentManageScreen';
import { StudentDashboardScreen } from './components/StudentDashboardScreen';
import { AttendanceDashboardScreen } from './components/AttendanceDashboardScreen';
import { WizardSteps } from './components/Wizard/WizardSteps';
import { Step1Medium } from './components/Wizard/Step1Medium';
import { Step2Class } from './components/Wizard/Step2Class';
import { Step3Subject } from './components/Wizard/Step3Subject';
import { Step4Chapters } from './components/Wizard/Step4Chapters';
import { Step5Settings } from './components/Wizard/Step5Settings';
import { ReviewScreen } from './components/ReviewScreen';
import { LiveQuizScreen } from './components/LiveQuizScreen';
import { QuizCompleteScreen } from './components/QuizCompleteScreen';
import { LoginScreen } from './components/LoginScreen';
import { ClassSelectionScreen } from './components/ClassSelectionScreen';
import { PollCreatorScreen } from './components/PollCreatorScreen';
import { CustomQuizBuilderScreen } from './components/CustomQuizBuilderScreen'; // Force IDE refresh

export const sortClasses = (classes: string[]) => {
  return [...classes].sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
    return numA - numB;
  });
};

export default function App() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [screen, setScreen] = useState<AppScreen>(() => {
    return localStorage.getItem('examsetu_is_logged_in') === 'true' ? 'home' : 'login';
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('examsetu_user_name') || 'Teacher';
  });
  const [wizardStepIdx, setWizardStepIdx] = useState<number>(0);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(0);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<Record<number, string>[]>([]);
  const [preselectedClassId, setPreselectedClassId] = useState<string | undefined>(undefined);

  const [allowedClasses, setAllowedClasses] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('examsetu_allowed_classes');
      if (item) {
        return sortClasses(JSON.parse(item));
      }
      return [];
    } catch (error) {
      console.error('Error loading allowed classes', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('examsetu_allowed_classes', JSON.stringify(allowedClasses));
  }, [allowedClasses]);

  // Load saved quizzes from local storage
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>(() => {
    try {
      const item = localStorage.getItem('examsetu_saved_quizzes');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error loading saved quizzes', error);
      return [];
    }
  });

  // Save to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('examsetu_saved_quizzes', JSON.stringify(savedQuizzes));
  }, [savedQuizzes]);

  // Load saved polls from local storage
  const [savedPolls, setSavedPolls] = useState<SavedQuiz[]>(() => {
    try {
      const item = localStorage.getItem('examsetu_saved_polls');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error loading saved polls', error);
      return [];
    }
  });

  // Save polls to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('examsetu_saved_polls', JSON.stringify(savedPolls));
  }, [savedPolls]);

  // Load students from local storage
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const item = localStorage.getItem('examsetu_students');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error loading students', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('examsetu_students', JSON.stringify(students));
  }, [students]);

  // Load student reports from local storage
  const [studentReports, setStudentReports] = useState<Record<string, StudentReport[]>>(() => {
    try {
      const item = localStorage.getItem('examsetu_student_reports');
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error('Error loading student reports', error);
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('examsetu_student_reports', JSON.stringify(studentReports));
  }, [studentReports]);

  // Load class reports from local storage
  const [classReports, setClassReports] = useState<ClassQuizReport[]>(() => {
    try {
      const item = localStorage.getItem('examsetu_class_reports');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error loading class reports', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('examsetu_class_reports', JSON.stringify(classReports));
  }, [classReports]);

  // Load attendance records from local storage
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const item = localStorage.getItem('examsetu_attendance_records');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error loading attendance records', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('examsetu_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Initialize default quiz configuration
  const defaultChapters = getChaptersForClassAndSubject('class-9', 'Science').slice(0, 3);
  const equalWeight = Math.floor(100 / defaultChapters.length);

  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    quizName: '',
    medium: 'English',
    classId: 'class-9',
    classNameDisplay: 'Class 9',
    subject: 'Science',
    chapters: defaultChapters.map((ch, i) => ({
      chapter_label: ch,
      weight_percent: i === 0 ? equalWeight + (100 - equalWeight * defaultChapters.length) : equalWeight,
    })),
    questionCount: 10,
    rollCount: 30,
    timerSeconds: 30,
    type: 'quiz',
    kb_name: 'ncert-class-9-science',
    section_id: 'A',
  });

  // MCQ Generator Hook
  const {
    questions,
    isGenerating,
    isFallback,
    error: generatorError,
    generateQuestions,
  } = useMcqGenerator();

  const handleStepAdvance = (nextIdx: number) => {
    setWizardStepIdx(nextIdx);
    if (nextIdx > maxReachedStep) {
      setMaxReachedStep(nextIdx);
    }
  };

  // Home Screen actions
  const handleStartWizard = (quizName: string, type: 'quiz' | 'poll') => {
    setQuizConfig(prev => ({ ...prev, quizName, type, creationMode: 'ai' }));
    if (type === 'poll') {
      setScreen('poll_creator');
    } else {
      setWizardStepIdx(0);
      setMaxReachedStep(0);
      setScreen('wizard');
    }
  };

  const handleStartCustomQuiz = (quizName: string) => {
    setQuizConfig(prev => ({ ...prev, quizName, type: 'quiz', creationMode: 'custom' }));
    setWizardStepIdx(0);
    setMaxReachedStep(0);
    setScreen('wizard');
  };

  const handleNavigate = (targetScreen: AppScreen) => {
    setScreen(targetScreen);
  };

  // Step 1: Medium selection
  const handleSelectMedium = (medium: Medium) => {
    setQuizConfig((prev) => ({ ...prev, medium }));
  };

  // Step 2: Class selection
  const handleSelectClass = (classId: string, classNameDisplay: string) => {
    const availableSubjects = getSubjectsForClass(classId);
    const defaultSubj = availableSubjects[0] || 'Science';
    const newChapters = getChaptersForClassAndSubject(classId, defaultSubj).slice(0, 3);
    const eqW = Math.floor(100 / newChapters.length);

    setQuizConfig((prev) => ({
      ...prev,
      classId,
      classNameDisplay,
      subject: defaultSubj,
      chapters: newChapters.map((ch, i) => ({
        chapter_label: ch,
        weight_percent: i === 0 ? eqW + (100 - eqW * newChapters.length) : eqW,
      })),
    }));
  };

  // Step 3: Subject selection
  const handleSelectSubject = (subject: string) => {
    const newChapters = getChaptersForClassAndSubject(quizConfig.classId, subject).slice(0, 3);
    const eqW = Math.floor(100 / newChapters.length);

    setQuizConfig((prev) => ({
      ...prev,
      subject,
      chapters: newChapters.map((ch, i) => ({
        chapter_label: ch,
        weight_percent: i === 0 ? eqW + (100 - eqW * newChapters.length) : eqW,
      })),
    }));
  };

  // Step 4: Chapters selection
  const handleUpdateChapters = (chapters: QuizConfig['chapters']) => {
    setQuizConfig((prev) => ({ ...prev, chapters }));
  };

  // Step 5: Start Quiz Generation
  const handleStartQuiz = async (finalConfig: QuizConfig) => {
    setQuizConfig(finalConfig);
    if (finalConfig.creationMode === 'custom') {
      setScreen('custom_quiz_builder');
    } else {
      const resultQuestions = await generateQuestions(finalConfig);
      if (resultQuestions && resultQuestions.length > 0) {
        setQuizQuestions(resultQuestions);
        setScreen('review');
      }
    }
  };

  // Review Actions
  const handleSaveQuiz = () => {
    const newSavedQuiz: SavedQuiz = {
      id: `SQ${Date.now()}`,
      createdAt: Date.now(),
      config: quizConfig,
      questions: quizQuestions,
    };

    // Replace if we were editing an existing one, or just add new
    // For now, always add as new to keep it simple, or we could check if it has an ID
    // Since we don't track "currently editing quiz ID", we just save it as new.
    if (quizConfig.type === 'poll') {
      setSavedPolls(prev => [newSavedQuiz, ...prev]);
    } else {
      setSavedQuizzes(prev => [newSavedQuiz, ...prev]);
    }
    setScreen('saved_quizzes');
  };

  const handleDiscardQuiz = async () => {
    const isConfirmed = await confirm({
      title: 'Discard Quiz?',
      message: 'Are you sure you want to discard this quiz? All generated questions will be lost.',
      isDestructive: true,
      confirmText: 'Discard'
    });

    if (isConfirmed) {
      setScreen('home');
    }
  };

  // Saved Quizzes Actions
  const handlePlaySavedQuiz = (quiz: SavedQuiz) => {
    const updatedQuiz = { ...quiz, lastPlayedAt: Date.now() };
    if (quiz.config.type === 'poll') {
      setSavedPolls(prev => prev.map(q => q.id === quiz.id ? updatedQuiz : q));
    } else {
      setSavedQuizzes(prev => prev.map(q => q.id === quiz.id ? updatedQuiz : q));
    }

    setQuizConfig(quiz.config);
    setQuizQuestions(quiz.questions);
    setScreen('live');
  };

  const handleEditSavedQuiz = (quiz: SavedQuiz) => {
    setQuizConfig(quiz.config);
    setQuizQuestions(quiz.questions);

    // Remove the old one from the list so when they save it doesn't duplicate
    // Or we could track `editingQuizId` but removing it is a quick workaround for "Save as" behavior.
    setSavedQuizzes(prev => prev.filter(q => q.id !== quiz.id));

    if (quiz.config.creationMode === 'custom') {
      setScreen('custom_quiz_builder');
    } else {
      setScreen('review');
    }
  };

  const handleDeleteSavedQuiz = async (id: string, isPoll: boolean = false) => {
    const isConfirmed = await confirm({
      title: isPoll ? 'Delete Saved Poll?' : 'Delete Saved Quiz?',
      message: `Are you sure you want to delete this saved ${isPoll ? 'poll' : 'quiz'}? This action cannot be undone.`,
      isDestructive: true,
      confirmText: 'Delete'
    });

    if (isConfirmed) {
      if (isPoll) {
        setSavedPolls(prev => prev.filter(q => q.id !== id));
        showToast('Poll deleted successfully', 'success');
      } else {
        setSavedQuizzes(prev => prev.filter(q => q.id !== id));
        showToast('Quiz deleted successfully', 'success');
      }
    }
  };

  const handleRestartApp = () => {
    setScreen('home');
    setWizardStepIdx(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar */}
      {screen !== 'login' && screen !== 'class_selection' && (
        <Navbar
          isQuizActive={screen === 'live'}
          onResetQuiz={handleRestartApp}
          onLogout={() => {
            localStorage.removeItem('examsetu_is_logged_in');
            localStorage.removeItem('examsetu_user_name');
            setScreen('login');
          }}
        />
      )}

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto flex flex-col ${screen === 'live' || screen === 'custom_quiz_builder' ? 'px-4 sm:px-8 max-w-[1800px] py-2 sm:py-4' : 'max-w-7xl px-4 sm:px-6 lg:px-8 py-6'}`}>
        {screen === 'login' && (
          <LoginScreen onLoginSuccess={(name) => {
            localStorage.setItem('examsetu_is_logged_in', 'true');
            localStorage.setItem('examsetu_user_name', name);
            setUserName(name);
            setScreen('class_selection');
          }} />
        )}

        {screen === 'class_selection' && (
          <ClassSelectionScreen
            initialSelected={allowedClasses}
            onSaveClasses={(classes) => {
              setAllowedClasses(sortClasses(classes));
              setScreen('home');
            }}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            onNavigate={handleNavigate}
            onStartWizard={handleStartWizard}
            onStartCustomQuiz={handleStartCustomQuiz}
            onPlayQuiz={handlePlaySavedQuiz}
            savedQuizzes={savedQuizzes}
            savedPolls={savedPolls}
            userName={userName}
          />
        )}

        {screen === 'saved_quizzes' && (
          <SavedQuizzesScreen
            savedQuizzes={savedQuizzes}
            savedPolls={savedPolls}
            classReports={classReports}
            setClassReports={setClassReports}
            allowedClasses={allowedClasses}
            students={students}
            onPlay={handlePlaySavedQuiz}
            onEdit={handleEditSavedQuiz}
            onDelete={handleDeleteSavedQuiz}
            onUpload={(quiz) => {
              if (quiz.config.type === 'poll') {
                setSavedPolls(prev => [quiz, ...prev]);
              } else {
                setSavedQuizzes(prev => [quiz, ...prev]);
              }
              showToast('Quiz imported successfully!', 'success');
            }}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'student_add' && (
          <StudentDashboardScreen
            mode="manage"
            students={students}
            allowedClasses={allowedClasses}
            studentReports={studentReports}
            setStudentReports={setStudentReports}
            onUpdateStudent={(s) => {
              setStudents(prev => prev.map(p => (p.macId === s.macId && p.classId === s.classId) ? s : p));
            }}
            onDeleteStudent={(macId, classId) => {
              setStudents(prev => prev.filter(p => !(p.macId === macId && p.classId === classId)));
            }}
            onAddStudent={(classId) => {
              setPreselectedClassId(classId);
              setScreen('student_register');
            }}
            onBulkAddStudent={(classId) => {
              setPreselectedClassId(classId);
              setScreen('bulk_student_register');
            }}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'student_register' && (
          <StudentManageScreen
            students={students}
            allowedClasses={allowedClasses}
            initialClassId={preselectedClassId}
            onSaveStudent={(s) => {
              setStudents(prev => {
                const existing = prev.findIndex(p => p.macId === s.macId && p.classId === s.classId);
                if (existing >= 0) {
                  const newArr = [...prev];
                  newArr[existing] = s;
                  return newArr;
                }
                return [...prev, s];
              });
              showToast(`Student ${s.name} saved successfully!`, 'success');
            }}
            onBack={() => setScreen('student_add')}
          />
        )}

        {screen === 'bulk_student_register' && (
          <BulkStudentManageScreen
            initialClassId={preselectedClassId}
            existingStudents={students}
            onSaveStudents={(pairedStudents) => {
              setStudents(prev => {
                let updated = [...prev];
                pairedStudents.forEach(s => {
                  const existingIndex = updated.findIndex(p => p.macId === s.macId && p.classId === s.classId);
                  if (existingIndex >= 0) {
                    updated[existingIndex] = s;
                  } else {
                    updated.push(s);
                  }
                });
                return updated;
              });
              showToast(`${pairedStudents.length} students paired and saved successfully!`, 'success');
              setScreen('student_add');
            }}
            onBack={() => setScreen('student_add')}
          />
        )}

        {screen === 'dashboard' && (
          <StudentDashboardScreen
            mode="reports"
            students={students}
            allowedClasses={allowedClasses}
            studentReports={studentReports}
            setStudentReports={setStudentReports}
            classReports={classReports}
            setClassReports={setClassReports}
            onUpdateStudent={(s) => {
              setStudents(prev => prev.map(p => (p.macId === s.macId && p.classId === s.classId) ? s : p));
            }}
            onDeleteStudent={(macId, classId) => {
              setStudents(prev => prev.filter(p => !(p.macId === macId && p.classId === classId)));
            }}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'attendance' && (
          <AttendanceDashboardScreen
            students={students}
            allowedClasses={allowedClasses}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'poll_creator' && (
          <PollCreatorScreen
            allowedClasses={allowedClasses}
            initialConfig={quizConfig}
            onSaveDraft={(config, questions) => {
              setQuizConfig(config);
              setQuizQuestions(questions);
              const newSavedPoll: SavedQuiz = {
                id: `SP${Date.now()}`,
                createdAt: Date.now(),
                config,
                questions,
              };
              setSavedPolls(prev => [newSavedPoll, ...prev]);
              setScreen('saved_quizzes');
            }}
            onLaunch={(config, questions) => {
              setQuizConfig(config);
              setQuizQuestions(questions);
              setScreen('live');
            }}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'custom_quiz_builder' && (
          <CustomQuizBuilderScreen
            initialConfig={quizConfig}
            initialQuestions={quizQuestions}
            allowedClasses={allowedClasses}
            onSaveQuiz={(config, questions) => {
              setQuizConfig(config);
              setQuizQuestions(questions);
              const newSavedQuiz: SavedQuiz = {
                id: `SQ${Date.now()}`,
                createdAt: Date.now(),
                config,
                questions,
              };
              setSavedQuizzes(prev => [newSavedQuiz, ...prev]);
              setScreen('saved_quizzes');
            }}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'wizard' && (
          <div className="space-y-4 max-w-5xl mx-auto w-full">
            <div className="flex justify-between items-end mb-4 px-1">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create a Live Quiz</h1>
                <p className="text-slate-500 font-medium mt-1">
                  Configure settings and generate questions for your classroom session.
                </p>
              </div>
              <button
                onClick={() => setScreen('home')}
                className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors font-semibold text-sm"
              >
                Cancel & Exit
              </button>
            </div>

            {/* 5-Step Progress Indicator */}
            <WizardSteps
              currentStepIndex={wizardStepIdx}
              type={quizConfig.type}
              maxReachedStep={maxReachedStep}
              onSelectStep={(idx) => setWizardStepIdx(idx)}
            />

            {/* Step 1: Medium */}
            {wizardStepIdx === 0 && (
              <Step1Medium
                selectedMedium={quizConfig.medium}
                onSelectMedium={handleSelectMedium}
                onNext={() => handleStepAdvance(1)}
              />
            )}

            {/* Step 2: Class */}
            {wizardStepIdx === 1 && (
              <Step2Class
                selectedClassId={quizConfig.classId}
                allowedClasses={allowedClasses}
                onSelectClass={handleSelectClass}
                onPrev={() => handleStepAdvance(0)}
                onNext={() => handleStepAdvance(2)}
              />
            )}

            {/* Step 3: Subject */}
            {wizardStepIdx === 2 && (
              <Step3Subject
                classId={quizConfig.classId}
                classNameDisplay={quizConfig.classNameDisplay}
                selectedSubject={quizConfig.subject}
                onSelectSubject={handleSelectSubject}
                onPrev={() => handleStepAdvance(1)}
                onNext={() => handleStepAdvance(3)}
              />
            )}

            {/* Step 4: Chapters */}
            {wizardStepIdx === 3 && (
              <Step4Chapters
                classId={quizConfig.classId}
                classNameDisplay={quizConfig.classNameDisplay}
                subject={quizConfig.subject}
                selectedChapters={quizConfig.chapters}
                onUpdateChapters={handleUpdateChapters}
                onPrev={() => handleStepAdvance(2)}
                onNext={() => handleStepAdvance(4)}
              />
            )}

            {/* Step 5: Settings */}
            {wizardStepIdx === 4 && (
              <Step5Settings
                initialConfig={quizConfig}
                isGenerating={isGenerating}
                onStartQuiz={handleStartQuiz}
                onPrev={() => handleStepAdvance(3)}
              />
            )}
          </div>
        )}

        {/* Review Screen */}
        {screen === 'review' && (
          <ReviewScreen
            config={quizConfig}
            questions={quizQuestions}
            setQuestions={setQuizQuestions}
            onSave={handleSaveQuiz}
            onDiscard={handleDiscardQuiz}
          />
        )}

        {/* Live Quiz Screen */}
        {screen === 'live' && (
          <LiveQuizScreen
            config={quizConfig}
            questions={quizQuestions}
            students={students}
            allowedClasses={allowedClasses}
            isFallback={isFallback}
            fallbackError={generatorError}
            onFinishQuiz={(results) => {
              setQuizResults(results);
              setScreen('complete');
            }}
            onSaveStudent={(s) => {
              setStudents(prev => {
                const existing = prev.findIndex(p => p.macId === s.macId && p.classId === s.classId);
                if (existing >= 0) {
                  const newArr = [...prev];
                  newArr[existing] = s;
                  return newArr;
                }
                return [...prev, s];
              });
              showToast(`Student ${s.name} saved successfully!`, 'success');
            }}
          />
        )}

        {/* Quiz Complete Screen */}
        {screen === 'complete' && (
          <QuizCompleteScreen
            config={quizConfig}
            questions={quizQuestions}
            results={quizResults}
            onRestart={handleRestartApp}
            students={students}
            studentReports={studentReports}
            setStudentReports={setStudentReports}
            setClassReports={setClassReports}
          />
        )}
      </main>
    </div>
  );
}
