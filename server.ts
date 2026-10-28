import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types for DB
interface StoredUser {
  id: string;
  username: string;
  password: string;
  name: string;
  campus: string;
  department: string;
  studentId: string;
  mannerTemp: number;
  balance: number;
  completedTasksCount: number;
  createdAt: string;
}

interface StoredTask {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  reward: number;
  platformFee: number;
  isUrgent: boolean;
  deadline: string;
  deadlineTimestamp: number;
  deliveryMethod: string;
  locationDetails?: string;
  status: string;
  requesterId: string;
  requesterName: string;
  requesterCampus: string;
  requesterMannerTemp: number;
  performerId?: string;
  performerName?: string;
  performerCampus?: string;
  performerMannerTemp?: number;
  submissionContent?: string;
  submittedAt?: string;
  createdAt: string;
  reviews?: Array<{
    id: string;
    fromUserName: string;
    rating: number;
    comment: string;
    badges: string[];
    createdAt: string;
  }>;
}

interface StoredMessage {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  senderRole: 'requester' | 'performer' | 'system';
  text: string;
  timestamp: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  tasks: StoredTask[];
  messages: StoredMessage[];
}

const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');

// Initial seed data
const INITIAL_SEED: DatabaseSchema = {
  users: [
    {
      id: 'user_1',
      username: 'ssu_econ',
      password: 'password123',
      name: '김준혁',
      campus: '숭실대학교',
      department: '경제학과',
      studentId: '20221456',
      mannerTemp: 38.6,
      balance: 38400,
      completedTasksCount: 9,
      createdAt: '2026-10-20',
    },
    {
      id: 'user_2',
      username: 'ssu_biz',
      password: 'password123',
      name: '이서연',
      campus: '숭실대학교',
      department: '경영학부',
      studentId: '20231122',
      mannerTemp: 37.4,
      balance: 15000,
      completedTasksCount: 3,
      createdAt: '2026-10-22',
    },
  ],
  tasks: [
    {
      id: 'task-1',
      title: '경영통계학 과제 엑셀 VLOOKUP & 피벗테이블 오류 2개 잡아주실 분',
      description: '과제 제출이 오늘 23시까지인데 함수 #N/A 에러와 피벗테이블 요약이 꼬입니다. 화면 공유나 수정된 파일로 10분만 도와주실 경제/통계 학우님 급히 모십니다!',
      category: 'excel',
      categoryLabel: '엑셀/데이터',
      reward: 15000,
      platformFee: 800,
      isUrgent: true,
      deadline: '오늘 21:30까지',
      deadlineTimestamp: Date.now() + 1000 * 60 * 95,
      deliveryMethod: 'online',
      status: 'open',
      requesterId: 'user_2',
      requesterName: '이서연',
      requesterCampus: '숭실대 경영학부',
      requesterMannerTemp: 37.4,
      createdAt: '12분 전',
    },
    {
      id: 'task-2',
      title: '중앙도서관 1층 무인프린터에서 발표자료 15부 인쇄 후 4층 스터디룸 전달',
      description: '팀플 발표가 30분 뒤인데 노트북 배터리가 방전되어 급합니다. PDF 파일 전달해 드리면 도서관 1층 복합기에서 흑백 양면 15부 출력해서 402호로 가져다주시면 바로 완료 승인합니다!',
      category: 'errand',
      categoryLabel: '프린트/심부름',
      reward: 7000,
      platformFee: 800,
      isUrgent: true,
      deadline: '30분 이내 (초급구)',
      deadlineTimestamp: Date.now() + 1000 * 60 * 25,
      deliveryMethod: 'campus_pickup',
      locationDetails: '중앙도서관 1층 무인프린터기 → 4층 402 스터디룸',
      status: 'open',
      requesterId: 'user_3',
      requesterName: '박민우',
      requesterCampus: '숭실대 경영학부',
      requesterMannerTemp: 39.1,
      createdAt: '5분 전',
    },
    {
      id: 'task-3',
      title: '영문 학술저널 초록(Abstract) 350단어 문맥 및 어색한 표현 첨삭',
      description: '졸업 논문 제출용 영문 초록입니다. 파파고 번역투 느낌을 지우고 경제학술 표현으로 다듬어주실 어학 우수자나 영문과 학우님 부탁드립니다.',
      category: 'translate',
      categoryLabel: '번역/첨삭',
      reward: 16000,
      platformFee: 800,
      isUrgent: false,
      deadline: '오늘 자정까지',
      deadlineTimestamp: Date.now() + 1000 * 60 * 240,
      deliveryMethod: 'online',
      status: 'open',
      requesterId: 'user_4',
      requesterName: '정다은',
      requesterCampus: '숭실대 글로벌통상학과',
      requesterMannerTemp: 38.0,
      createdAt: '28분 전',
    },
    {
      id: 'task-4',
      title: '동아리 일일호프 카드뉴스 4장 폰트/레이아웃 깔끔하게 정리 (피그마/미리캔버스)',
      description: '텍스트와 기본 사진 소스는 다 준비되어 있습니다. 가독성 좋고 힙한 느낌으로 디자인 톤앤매너만 잡아주시면 됩니다.',
      category: 'design',
      categoryLabel: 'PPT/디자인',
      reward: 20000,
      platformFee: 800,
      isUrgent: false,
      deadline: '내일 정오(12:00)까지',
      deadlineTimestamp: Date.now() + 1000 * 60 * 850,
      deliveryMethod: 'online',
      status: 'matched',
      requesterId: 'user_5',
      requesterName: '최현우',
      requesterCampus: '숭실대 중앙동아리',
      requesterMannerTemp: 36.8,
      performerId: 'user_1',
      performerName: '김준혁',
      performerCampus: '숭실대 경제학과',
      performerMannerTemp: 38.6,
      createdAt: '1시간 전',
    },
    {
      id: 'task-5',
      title: '파이썬 BeautifulSoup 웹크롤링 동적 태그 추출 에러 코드 1줄 디버깅',
      description: '과제 제출인데 soup.find_all에서 특정 클래스 자식 요소가 빈 리스트로 반환됩니다. 셀레니움 대신 requests로 가능한지 헤더 문제인지 10분만 봐주세요!',
      category: 'coding',
      categoryLabel: '코딩/IT',
      reward: 12000,
      platformFee: 800,
      isUrgent: false,
      deadline: '3일 이내',
      deadlineTimestamp: Date.now() + 1000 * 60 * 180,
      deliveryMethod: 'online',
      status: 'open',
      requesterId: 'user_6',
      requesterName: '송지호',
      requesterCampus: '숭실대 AI융합학부',
      requesterMannerTemp: 37.9,
      createdAt: '45분 전',
    },
  ],
  messages: [
    {
      id: 'msg-1',
      taskId: 'task-4',
      senderId: 'system',
      senderName: '시스템',
      senderRole: 'system',
      text: '수행자 김준혁 학우님이 의뢰를 수락했습니다. 안전한 에스크로 정산이 연결되었습니다.',
      timestamp: '14:20',
    },
    {
      id: 'msg-2',
      taskId: 'task-4',
      senderId: 'user_5',
      senderName: '최현우 (의뢰자)',
      senderRole: 'requester',
      text: '안녕하세요 학우님! 빠른 수락 감사드립니다. 카드뉴스 텍스트랑 들어갈 사진 링크 전달드립니다.',
      timestamp: '14:21',
    },
    {
      id: 'msg-3',
      taskId: 'task-4',
      senderId: 'user_1',
      senderName: '김준혁 (수행자)',
      senderRole: 'performer',
      text: '네 확인했습니다! 피그마로 텍스트 가독성 올리고 깔끔하게 맞춰서 1시간 안에 초안 보내드릴게요.',
      timestamp: '14:23',
    },
  ],
};

function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED, null, 2), 'utf-8');
    return INITIAL_SEED;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read db.json, returning initial seed:', err);
    return INITIAL_SEED;
  }
}

function writeDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Ensure DB initialized
  readDb();

  // --- API: Authentication ---

  // 회원가입 (Register)
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { username, password, name, campus, department, studentId } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: '아이디, 비밀번호, 이름은 필수입니다.' });
    }

    const db = readDb();
    const existing = db.users.find((u) => u.username === username.trim());
    if (existing) {
      return res.status(409).json({ error: '이미 사용 중인 아이디입니다.' });
    }

    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      username: username.trim(),
      password, // in real app hashed, here stored cleanly
      name: name.trim(),
      campus: campus || '숭실대학교',
      department: department || '경제학과',
      studentId: studentId || `${new Date().getFullYear()}1001`,
      mannerTemp: 36.5,
      balance: 0,
      completedTasksCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDb(db);

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser, token: `token_${newUser.id}` });
  });

  // 로그인 (Login)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const db = readDb();
    const user = db.users.find(
      (u) => u.username === username.trim() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser, token: `token_${user.id}` });
  });

  // 현재 로그인 사용자 조회 (Me)
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer token_')) {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }

    const userId = authHeader.replace('Bearer token_', '');
    const db = readDb();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  // --- API: Tasks ---

  // 의뢰 목록 조회 (Get Tasks)
  app.get('/api/tasks', (req: Request, res: Response) => {
    const db = readDb();
    return res.json(db.tasks);
  });

  // 의뢰 등록 (Create Task)
  app.post('/api/tasks', (req: Request, res: Response) => {
    const taskData = req.body;
    if (!taskData.title) {
      return res.status(400).json({ error: '제목은 필수입니다.' });
    }

    const db = readDb();
    const newTask: StoredTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: 'open',
      createdAt: '방금 전',
    };

    // If urgent, prepend to top
    if (newTask.isUrgent) {
      db.tasks.unshift(newTask);
    } else {
      const urgentIndex = db.tasks.findIndex((t) => !t.isUrgent);
      if (urgentIndex === -1) {
        db.tasks.push(newTask);
      } else {
        db.tasks.splice(urgentIndex, 0, newTask);
      }
    }

    writeDb(db);
    return res.status(201).json(newTask);
  });

  // 의뢰 수락 (Accept Task)
  app.post('/api/tasks/:id/accept', (req: Request, res: Response) => {
    const { id } = req.params;
    const { performerId, performerName, performerCampus, performerMannerTemp } = req.body;

    const db = readDb();
    const taskIndex = db.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: '의뢰를 찾을 수 없습니다.' });
    }

    const task = db.tasks[taskIndex];
    task.status = 'matched';
    task.performerId = performerId;
    task.performerName = performerName;
    task.performerCampus = performerCampus;
    task.performerMannerTemp = performerMannerTemp;

    // Add initial system message
    const sysMsg: StoredMessage = {
      id: `msg-${Date.now()}`,
      taskId: id,
      senderId: 'system',
      senderName: '시스템',
      senderRole: 'system',
      text: `${performerName} 학우님이 의뢰를 수락했습니다. 안전한 안심 에스크로 정산이 연결되었습니다.`,
      timestamp: '방금 전',
    };
    db.messages.push(sysMsg);

    writeDb(db);
    return res.json({ task, message: sysMsg });
  });

  // 결과물 제출 (Submit Result)
  app.post('/api/tasks/:id/submit', (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

    const db = readDb();
    const task = db.tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ error: '의뢰를 찾을 수 없습니다.' });
    }

    task.status = 'submitted';
    task.submissionContent = content;
    task.submittedAt = '방금 전';

    const sysMsg: StoredMessage = {
      id: `msg-${Date.now()}`,
      taskId: id,
      senderId: 'system',
      senderName: '시스템',
      senderRole: 'system',
      text: `수행자가 결과물을 제출했습니다: "${content}". 의뢰자님께서 확인 후 승인해주세요.`,
      timestamp: '방금 전',
    };
    db.messages.push(sysMsg);

    writeDb(db);
    return res.json({ task, message: sysMsg });
  });

  // 최종 검수 승인 및 정산 (Approve & Complete)
  app.post('/api/tasks/:id/complete', (req: Request, res: Response) => {
    const { id } = req.params;

    const db = readDb();
    const task = db.tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ error: '의뢰를 찾을 수 없습니다.' });
    }

    task.status = 'completed';

    // Credit money to performer if user exists
    if (task.performerId) {
      const performer = db.users.find((u) => u.id === task.performerId);
      if (performer) {
        performer.balance += task.reward;
        performer.completedTasksCount += 1;
      }
    }

    const sysMsg: StoredMessage = {
      id: `msg-${Date.now()}`,
      taskId: id,
      senderId: 'system',
      senderName: '시스템',
      senderRole: 'system',
      text: `의뢰자가 검수를 최종 승인했습니다. 사례비 ${task.reward.toLocaleString()}원이 정산되었습니다.`,
      timestamp: '방금 전',
    };
    db.messages.push(sysMsg);

    writeDb(db);
    return res.json({ task, message: sysMsg });
  });

  // 리뷰 및 평점 등록 (Review)
  app.post('/api/tasks/:id/review', (req: Request, res: Response) => {
    const { id } = req.params;
    const { fromUserName, rating, comment, badges } = req.body;

    const db = readDb();
    const task = db.tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ error: '의뢰를 찾을 수 없습니다.' });
    }

    if (!task.reviews) {
      task.reviews = [];
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      fromUserName,
      rating,
      comment,
      badges,
      createdAt: '방금 전',
    };

    task.reviews.push(newReview);

    // Update performer manner temperature
    if (task.performerId) {
      const performer = db.users.find((u) => u.id === task.performerId);
      if (performer) {
        const delta = rating >= 4 ? 0.2 : -0.1;
        performer.mannerTemp = Number((performer.mannerTemp + delta).toFixed(1));
      }
    }

    writeDb(db);
    return res.json({ task, review: newReview });
  });

  // --- API: Messages ---

  // 특정 태스크 대화 목록 조회
  app.get('/api/messages/:taskId', (req: Request, res: Response) => {
    const { taskId } = req.params;
    const db = readDb();
    const msgs = db.messages.filter((m) => m.taskId === taskId);
    return res.json(msgs);
  });

  // 대화 전송
  app.post('/api/messages', (req: Request, res: Response) => {
    const { taskId, senderId, senderName, senderRole, text } = req.body;
    if (!taskId || !text) {
      return res.status(400).json({ error: '내용이 없습니다.' });
    }

    const db = readDb();
    const newMsg: StoredMessage = {
      id: `msg-${Date.now()}`,
      taskId,
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    db.messages.push(newMsg);
    writeDb(db);
    return res.status(201).json(newMsg);
  });

  // 출금 신청
  app.post('/api/users/withdraw', (req: Request, res: Response) => {
    const { userId } = req.body;
    const db = readDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const withdrawnAmount = user.balance;
    user.balance = 0;
    writeDb(db);

    return res.json({ success: true, withdrawnAmount });
  });

  // --- Vite Dev Server Middleware or Static Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
