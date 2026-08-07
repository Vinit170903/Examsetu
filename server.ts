import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: string;
  chapter_label: string;
  marks: number;
}

interface StudentAnswer {
  questionIndex: number;
  selected: string;
  correct: boolean;
  timeSpentMs?: number;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  answers: StudentAnswer[];
  score: number;
  joinedAt: number;
}

interface SessionState {
  joinCode: string;
  status: 'lobby' | 'live' | 'done';
  config: any;
  requested: number;
  completed: number;
  questions: Question[];
  currentQuestionIndex: number;
  questionStartTime: number | null;
  timerSeconds: number;
  students: { [id: string]: Student };
  updatedAt: number;
}

const sessions: { [code: string]: SessionState } = {};
const sessionSockets: { [code: string]: Set<WebSocket> } = {};

function broadcastSessionUpdate(code: string) {
  const session = sessions[code];
  if (!session) return;

  const payload = JSON.stringify({
    type: 'session_state',
    session: getFormattedSession(session),
  });

  const sockets = sessionSockets[code];
  if (sockets) {
    sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
}

function getFormattedSession(session: SessionState) {
  return {
    joinCode: session.joinCode,
    status: session.status,
    config: session.config,
    requested: session.requested,
    completed: session.completed,
    questions: session.questions,
    currentQuestionIndex: session.currentQuestionIndex,
    questionStartTime: session.questionStartTime,
    timerSeconds: session.timerSeconds,
    students: Object.values(session.students),
    updatedAt: session.updatedAt,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);
  const PORT = 3000;

  // WebSocket Server for Session Relay
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname === '/api/ws-relay') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    let currentCode: string | null = null;

    ws.on('message', (messageRaw: string) => {
      try {
        const msg = JSON.parse(messageRaw.toString());

        if (msg.type === 'subscribe') {
          const code = msg.joinCode?.toUpperCase();
          if (code) {
            currentCode = code;
            if (!sessionSockets[code]) {
              sessionSockets[code] = new Set();
            }
            sessionSockets[code].add(ws);

            if (sessions[code]) {
              ws.send(JSON.stringify({
                type: 'session_state',
                session: getFormattedSession(sessions[code]),
              }));
            }
          }
        } else if (msg.type === 'create_session') {
          const code = msg.joinCode?.toUpperCase() || Math.random().toString(36).substring(2, 8).toUpperCase();
          sessions[code] = {
            joinCode: code,
            status: 'lobby',
            config: msg.config || {},
            requested: msg.requested || 5,
            completed: 0,
            questions: msg.questions || [],
            currentQuestionIndex: 0,
            questionStartTime: null,
            timerSeconds: msg.timerSeconds || 30,
            students: {},
            updatedAt: Date.now(),
          };

          currentCode = code;
          if (!sessionSockets[code]) {
            sessionSockets[code] = new Set();
          }
          sessionSockets[code].add(ws);

          broadcastSessionUpdate(code);
        } else if (msg.type === 'update_questions') {
          const code = msg.joinCode?.toUpperCase();
          if (code && sessions[code]) {
            sessions[code].questions = msg.questions || sessions[code].questions;
            sessions[code].completed = msg.completed ?? sessions[code].completed;
            sessions[code].requested = msg.requested ?? sessions[code].requested;
            sessions[code].updatedAt = Date.now();
            broadcastSessionUpdate(code);
          }
        } else if (msg.type === 'student_join') {
          const code = msg.joinCode?.toUpperCase();
          const { studentId, name } = msg;
          if (code && sessions[code] && studentId) {
            const id = `${studentId}_${name}`.toLowerCase();
            if (!sessions[code].students[id]) {
              sessions[code].students[id] = {
                id,
                studentId,
                name: name || `Student ${studentId}`,
                answers: [],
                score: 0,
                joinedAt: Date.now(),
              };
            }
            sessions[code].updatedAt = Date.now();

            currentCode = code;
            if (!sessionSockets[code]) {
              sessionSockets[code] = new Set();
            }
            sessionSockets[code].add(ws);

            broadcastSessionUpdate(code);
          }
        } else if (msg.type === 'start_quiz') {
          const code = msg.joinCode?.toUpperCase();
          if (code && sessions[code]) {
            sessions[code].status = 'live';
            sessions[code].currentQuestionIndex = 0;
            sessions[code].questionStartTime = Date.now();
            sessions[code].updatedAt = Date.now();
            broadcastSessionUpdate(code);
          }
        } else if (msg.type === 'submit_answer') {
          const code = msg.joinCode?.toUpperCase();
          const { studentId, questionIndex, selectedOption, timeSpentMs } = msg;
          if (code && sessions[code] && studentId) {
            const session = sessions[code];
            const studentKey = Object.keys(session.students).find(
              (k) => session.students[k].studentId === studentId || session.students[k].id === studentId
            );

            if (studentKey && session.questions[questionIndex]) {
              const student = session.students[studentKey];
              const q = session.questions[questionIndex];

              const isCorrect = selectedOption === q.correct_answer;
              
              // Prevent duplicate answers for the same question
              const existingIdx = student.answers.findIndex((a) => a.questionIndex === questionIndex);
              const answerObj: StudentAnswer = {
                questionIndex,
                selected: selectedOption,
                correct: isCorrect,
                timeSpentMs: timeSpentMs || 0,
              };

              if (existingIdx >= 0) {
                student.answers[existingIdx] = answerObj;
              } else {
                student.answers.push(answerObj);
              }

              // Recalculate score
              student.score = student.answers.reduce((acc, ans) => {
                if (ans.correct) {
                  return acc + (q.marks || 1) * 10;
                }
                return acc;
              }, 0);

              session.updatedAt = Date.now();
              broadcastSessionUpdate(code);
            }
          }
        } else if (msg.type === 'next_question') {
          const code = msg.joinCode?.toUpperCase();
          if (code && sessions[code]) {
            const session = sessions[code];
            if (session.currentQuestionIndex + 1 < session.questions.length) {
              session.currentQuestionIndex += 1;
              session.questionStartTime = Date.now();
            } else {
              session.status = 'done';
            }
            session.updatedAt = Date.now();
            broadcastSessionUpdate(code);
          }
        } else if (msg.type === 'end_quiz') {
          const code = msg.joinCode?.toUpperCase();
          if (code && sessions[code]) {
            sessions[code].status = 'done';
            sessions[code].updatedAt = Date.now();
            broadcastSessionUpdate(code);
          }
        } else if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('Error handling WS message:', err);
      }
    });

    ws.on('close', () => {
      if (currentCode && sessionSockets[currentCode]) {
        sessionSockets[currentCode].delete(ws);
      }
    });
  });

  // REST endpoints for optional HTTP polling/REST callers
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/sessions', (req, res) => {
    const { joinCode, config, requested, questions, timerSeconds } = req.body;
    const code = (joinCode || Math.random().toString(36).substring(2, 8)).toUpperCase();

    sessions[code] = {
      joinCode: code,
      status: 'lobby',
      config: config || {},
      requested: requested || (questions ? questions.length : 5),
      completed: questions ? questions.length : 0,
      questions: questions || [],
      currentQuestionIndex: 0,
      questionStartTime: null,
      timerSeconds: timerSeconds || 30,
      students: {},
      updatedAt: Date.now(),
    };

    broadcastSessionUpdate(code);
    res.json({ success: true, session: getFormattedSession(sessions[code]) });
  });

  app.get('/api/sessions/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const session = sessions[code];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ session: getFormattedSession(session) });
  });

  app.post('/api/sessions/:code/join', (req, res) => {
    const code = req.params.code.toUpperCase();
    const { studentId, name } = req.body;

    if (!sessions[code]) {
      return res.status(404).json({ error: 'Session not found. Please check join code.' });
    }

    const session = sessions[code];
    const id = `${studentId}_${name}`.toLowerCase();
    if (!session.students[id]) {
      session.students[id] = {
        id,
        studentId: String(studentId),
        name: String(name || `Student ${studentId}`),
        answers: [],
        score: 0,
        joinedAt: Date.now(),
      };
      session.updatedAt = Date.now();
      broadcastSessionUpdate(code);
    }

    res.json({ success: true, student: session.students[id], session: getFormattedSession(session) });
  });

  app.post('/api/sessions/:code/questions', (req, res) => {
    const code = req.params.code.toUpperCase();
    const { questions, completed, requested } = req.body;

    if (!sessions[code]) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessions[code];
    if (questions) session.questions = questions;
    if (typeof completed === 'number') session.completed = completed;
    if (typeof requested === 'number') session.requested = requested;
    session.updatedAt = Date.now();

    broadcastSessionUpdate(code);
    res.json({ success: true, session: getFormattedSession(session) });
  });

  app.post('/api/sessions/:code/start', (req, res) => {
    const code = req.params.code.toUpperCase();
    if (!sessions[code]) return res.status(404).json({ error: 'Session not found' });

    const session = sessions[code];
    session.status = 'live';
    session.currentQuestionIndex = 0;
    session.questionStartTime = Date.now();
    session.updatedAt = Date.now();

    broadcastSessionUpdate(code);
    res.json({ success: true, session: getFormattedSession(session) });
  });

  app.post('/api/sessions/:code/answer', (req, res) => {
    const code = req.params.code.toUpperCase();
    const { studentId, questionIndex, selectedOption, timeSpentMs } = req.body;

    if (!sessions[code]) return res.status(404).json({ error: 'Session not found' });

    const session = sessions[code];
    const studentKey = Object.keys(session.students).find(
      (k) => session.students[k].studentId === String(studentId) || session.students[k].id === String(studentId)
    );

    if (!studentKey) {
      return res.status(404).json({ error: 'Student not found in session' });
    }

    const student = session.students[studentKey];
    const q = session.questions[questionIndex];
    if (!q) return res.status(400).json({ error: 'Invalid question index' });

    const isCorrect = selectedOption === q.correct_answer;
    const answerObj: StudentAnswer = {
      questionIndex,
      selected: selectedOption,
      correct: isCorrect,
      timeSpentMs: timeSpentMs || 0,
    };

    const existingIdx = student.answers.findIndex((a) => a.questionIndex === questionIndex);
    if (existingIdx >= 0) {
      student.answers[existingIdx] = answerObj;
    } else {
      student.answers.push(answerObj);
    }

    student.score = student.answers.reduce((acc, ans) => {
      if (ans.correct) {
        const questionMarks = session.questions[ans.questionIndex]?.marks || 1;
        return acc + questionMarks * 10;
      }
      return acc;
    }, 0);

    session.updatedAt = Date.now();
    broadcastSessionUpdate(code);

    res.json({ success: true, student, isCorrect, session: getFormattedSession(session) });
  });

  app.post('/api/sessions/:code/next', (req, res) => {
    const code = req.params.code.toUpperCase();
    if (!sessions[code]) return res.status(404).json({ error: 'Session not found' });

    const session = sessions[code];
    if (session.currentQuestionIndex + 1 < session.questions.length) {
      session.currentQuestionIndex += 1;
      session.questionStartTime = Date.now();
    } else {
      session.status = 'done';
    }
    session.updatedAt = Date.now();

    broadcastSessionUpdate(code);
    res.json({ success: true, session: getFormattedSession(session) });
  });

  app.post('/api/sessions/:code/end', (req, res) => {
    const code = req.params.code.toUpperCase();
    if (!sessions[code]) return res.status(404).json({ error: 'Session not found' });

    const session = sessions[code];
    session.status = 'done';
    session.updatedAt = Date.now();

    broadcastSessionUpdate(code);
    res.json({ success: true, session: getFormattedSession(session) });
  });

  // Serve Vite in dev / Static dist in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`VidyaSetu Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VidyaSetu server:', err);
});
