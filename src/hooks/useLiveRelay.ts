import { useState, useEffect, useRef, useCallback } from 'react';
import { QuizSession, Question, PaperConfig } from '../types';

export function useLiveRelay(initialJoinCode?: string) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(initialJoinCode || null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<any>(null);

  const fetchSessionHttp = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/sessions/${code.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const connectWebSocket = useCallback((code: string) => {
    if (!code) return;

    if (socketRef.current) {
      try { socketRef.current.close(); } catch (e) {}
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws-relay`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({ type: 'subscribe', joinCode: code }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'session_state' && data.session) {
            setSession(data.session);
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (joinCode) {
      connectWebSocket(joinCode);
      fetchSessionHttp(joinCode);

      // Backup HTTP poll every 2 seconds for guaranteed synchronization
      pollIntervalRef.current = setInterval(() => {
        fetchSessionHttp(joinCode);
      }, 2000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (socketRef.current) {
        try { socketRef.current.close(); } catch (e) {}
      }
    };
  }, [joinCode, connectWebSocket, fetchSessionHttp]);

  const sendWsOrHttp = useCallback(async (msgType: string, payload: any) => {
    const code = payload.joinCode || joinCode;
    const bodyPayload = { type: msgType, ...payload, joinCode: code };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(bodyPayload));
    }

    // Also trigger HTTP for persistence redundancy
    try {
      if (msgType === 'create_session') {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      } else if (msgType === 'student_join') {
        await fetch(`/api/sessions/${code}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      } else if (msgType === 'update_questions') {
        await fetch(`/api/sessions/${code}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      } else if (msgType === 'start_quiz') {
        await fetch(`/api/sessions/${code}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      } else if (msgType === 'submit_answer') {
        await fetch(`/api/sessions/${code}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      } else if (msgType === 'next_question') {
        await fetch(`/api/sessions/${code}/next`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      } else if (msgType === 'end_quiz') {
        await fetch(`/api/sessions/${code}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });
      }
      if (code) {
        fetchSessionHttp(code);
      }
    } catch (e) {
      console.error('Error sending HTTP fallback', e);
    }
  }, [joinCode, fetchSessionHttp]);

  const createSession = useCallback(async (code: string, config: PaperConfig, questions: Question[], timerSeconds = 30) => {
    const formattedCode = code.toUpperCase();
    setJoinCode(formattedCode);
    await sendWsOrHttp('create_session', {
      joinCode: formattedCode,
      config,
      questions,
      requested: config.count || questions.length || 5,
      completed: questions.length,
      timerSeconds,
    });
  }, [sendWsOrHttp]);

  const updateQuestions = useCallback(async (questions: Question[], completed: number, requested: number) => {
    if (!joinCode) return;
    await sendWsOrHttp('update_questions', { questions, completed, requested });
  }, [joinCode, sendWsOrHttp]);

  const joinSession = useCallback(async (code: string, studentId: string, name: string) => {
    const formattedCode = code.toUpperCase();
    setJoinCode(formattedCode);
    await sendWsOrHttp('student_join', { joinCode: formattedCode, studentId, name });
  }, [sendWsOrHttp]);

  const startQuiz = useCallback(async () => {
    if (!joinCode) return;
    await sendWsOrHttp('start_quiz', {});
  }, [joinCode, sendWsOrHttp]);

  const submitAnswer = useCallback(async (studentId: string, questionIndex: number, selectedOption: string, timeSpentMs?: number) => {
    if (!joinCode) return;
    await sendWsOrHttp('submit_answer', { studentId, questionIndex, selectedOption, timeSpentMs });
  }, [joinCode, sendWsOrHttp]);

  const nextQuestion = useCallback(async () => {
    if (!joinCode) return;
    await sendWsOrHttp('next_question', {});
  }, [joinCode, sendWsOrHttp]);

  const endQuiz = useCallback(async () => {
    if (!joinCode) return;
    await sendWsOrHttp('end_quiz', {});
  }, [joinCode, sendWsOrHttp]);

  return {
    session,
    joinCode,
    setJoinCode,
    isConnected,
    createSession,
    updateQuestions,
    joinSession,
    startQuiz,
    submitAnswer,
    nextQuestion,
    endQuiz,
  };
}
