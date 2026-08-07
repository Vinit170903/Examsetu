import { useState, useRef, useCallback } from 'react';
import { Question, QuizConfig } from '../types';
import { FALLBACK_SAMPLE_QUESTIONS } from '../data/sampleQuestions';

export function useMcqGenerator() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [requested, setRequested] = useState<number>(0);
  const [completed, setCompleted] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isFallbackRef = useRef<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  const generateQuestions = useCallback((config: QuizConfig): Promise<Question[]> => {
    return new Promise((resolve) => {
      setIsGenerating(true);
      setError(null);
      setIsFallback(false);
      isFallbackRef.current = false;
      setQuestions([]);
      setCompleted(0);
      setRequested(config.questionCount);

      // Clean up existing socket if any
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Format kb_name: e.g., "ncert-class-9-science"
      const cleanSubject = config.subject.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const kb_name = `ncert-${config.classId}-${cleanSubject}`;

      const payload = {
        chapters: config.chapters.map((ch) => ({
          chapter_label: ch.chapter_label,
          weight_percent: ch.weight_percent,
        })),
        subject: config.subject,
        ncert_class: config.classId,
        kb_name: kb_name,
        count: config.questionCount,
        section_id: config.section_id || 'A',
      };

      const accumulatedQuestions: Question[] = [];
      let wsTimeout: NodeJS.Timeout;

      const activateFallback = (reason: string) => {
        if (isFallbackRef.current) return;
        console.warn(`[MCQ Generator] Using fallback questions: ${reason}`);
        setIsFallback(true);
        isFallbackRef.current = true;
        setError(`WebSocket notice: ${reason}`);

        // Prepare sample fallback questions tailored to count
        const prepared = Array.from({ length: config.questionCount }, (_, idx) => {
          const sample = FALLBACK_SAMPLE_QUESTIONS[idx % FALLBACK_SAMPLE_QUESTIONS.length];
          return {
            ...sample,
            id: `Q${idx + 1}`,
            chapter_label: config.chapters[idx % config.chapters.length]?.chapter_label || sample.chapter_label,
          };
        });

        setQuestions(prepared);
        setCompleted(config.questionCount);
        setIsGenerating(false);
        resolve(prepared);
      };

      // Set timeout for WebSocket connection attempt (15 seconds)
      wsTimeout = setTimeout(() => {
        if (accumulatedQuestions.length === 0) {
          if (socketRef.current) {
            socketRef.current.close();
          }
          activateFallback('Server offline / connection timed out (15s)');
        }
      }, 15000);

      try {
        console.log(`Connecting to ws://localhost:8001/api/v1/lms/papers/generate-mcq with payload:`, payload);
        const socket = new WebSocket('ws://localhost:8001/api/v1/lms/papers/generate-mcq');
        socketRef.current = socket;

        socket.onopen = () => {
          console.log('WebSocket connected, sending payload...');
          socket.send(JSON.stringify(payload));
        };

        socket.onmessage = (event) => {
          clearTimeout(wsTimeout);
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'question' && data.question) {
              const q: Question = {
                id: data.question.id || `Q${accumulatedQuestions.length + 1}`,
                type: data.question.type || 'mcq',
                text: data.question.text || '',
                options: data.question.options || [],
                correct_answer: data.question.correct_answer || '',
                source: data.question.source || 'ncert_ai',
                chapter_label: data.question.chapter_label || config.chapters[0]?.chapter_label || '',
                section_id: data.question.section_id || 'A',
                marks: data.question.marks || 1,
              };

              accumulatedQuestions.push(q);
              setQuestions([...accumulatedQuestions]);
              setCompleted(data.completed ?? accumulatedQuestions.length);

              if (data.completed === data.requested || accumulatedQuestions.length >= config.questionCount) {
                setIsGenerating(false);
                socket.close();
                resolve(accumulatedQuestions);
              }
            } else if (data.type === 'done') {
              console.log('Received done event from server.');
              setIsGenerating(false);
              socket.close();
              resolve(accumulatedQuestions);
            } else if (data.type === 'progress' || data.type === 'session') {
              // Optionally log or handle progress
            }
          } catch (err) {
            console.error('Error parsing WS message:', err);
          }
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(wsTimeout);
          activateFallback('WebSocket endpoint unreachable or connection error');
        };

        socket.onclose = (event) => {
          console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
          clearTimeout(wsTimeout);
          if (accumulatedQuestions.length > 0) {
            setIsGenerating(false);
            resolve(accumulatedQuestions);
          } else if (!isFallbackRef.current) {
            activateFallback('Connection closed before questions received');
          }
        };
      } catch (e: any) {
        clearTimeout(wsTimeout);
        activateFallback(e?.message || 'WebSocket initialization failed');
      }
    });
  }, []);

  return {
    questions,
    requested,
    completed,
    isGenerating,
    isFallback,
    error,
    generateQuestions,
  };
}
