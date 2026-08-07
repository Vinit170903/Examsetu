export interface Question {
  id: string;
  type?: string;
  text: string;
  options: string[];
  correct_answer: string;
  source?: string;
  chapter_label: string;
  section_id?: string;
  marks: number;
  // Poll-specific fields
  pollType?: 'single_choice' | 'yes_no' | 'rating' | 'word_cloud' | 'emoji';
}

export type Medium = 'English' | 'Hindi';

export interface ClassOption {
  id: string; // e.g. 'class-9'
  label: string; // e.g. 'Class 9'
  gradeNumber: number; // 1 to 12
}

export interface Chapter {
  id: string;
  label: string;
}

export interface ChapterConfig {
  chapter_label: string;
  weight_percent: number;
}

export interface QuizConfig {
  quizName: string; // New field
  medium: Medium;
  classId: string; // 'class-9'
  classNameDisplay: string; // 'Class 9'
  subject: string;
  chapters: ChapterConfig[];
  questionCount: number;
  rollCount: number;
  timerSeconds: number; // Question timer setting
  type: 'quiz' | 'poll'; // Added for poll feature
  kb_name: string;
  section_id: string;
  // Poll-specific settings
  showLiveResults?: boolean;
  isAnonymous?: boolean;
}

export interface SavedQuiz {
  id: string;
  createdAt: number;
  lastPlayedAt?: number;
  config: QuizConfig;
  questions: Question[];
}

export interface Student {
  macId: string;
  name: string;
  rollNo: number;
  classId: string;
  section: string;
  avatar: string;
}

export type AppScreen = 'login' | 'class_selection' | 'home' | 'saved_quizzes' | 'saved_polls' | 'student_add' | 'student_register' | 'dashboard' | 'wizard' | 'poll_creator' | 'review' | 'live' | 'complete';

export type AnswerType = 'A' | 'B' | 'C' | 'D';

export interface StudentReport {
  id: string;
  quizName: string;
  date: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  responses: {
    questionText: string;
    correctAnswer: string;
    picked: string | null;
    isCorrect: boolean;
  }[];
}

export interface ClassQuizReport {
  id: string;
  quizId?: string;
  quizName: string;
  classId: string;
  classNameDisplay: string;
  subject: string;
  date: number;
  totalQuestions: number;
  participationRate: number;
  classAccuracy: number;
  type?: 'quiz' | 'poll';
  pollData?: {
    text: string;
    pollType: 'single_choice' | 'yes_no' | 'rating' | 'word_cloud' | 'emoji';
    options: string[];
    optionCounts: number[];
    totalResponded: number;
    timerSeconds: number;
  }[];
  studentPerformances: {
    macId: string;
    rollNo: number;
    name: string;
    accuracy: number;
    correct: number;
    incorrect: number;
    unattempted: number;
  }[];
}
