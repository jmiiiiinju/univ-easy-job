import React, { useState, useEffect } from 'react';
import { Task, CurrentUser, LeanCanvasMetrics, ChatMessage } from './types';
import { INITIAL_TASKS, INITIAL_USER, INITIAL_METRICS, INITIAL_MESSAGES, CAMPUS_OPTIONS } from './data/mockData';
import { Header } from './components/Header';
import { HeroMetricBar } from './components/HeroMetricBar';
import { TaskBoard } from './components/TaskBoard';
import { NewTaskModal } from './components/NewTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ChatRoomModal } from './components/ChatRoomModal';
import { ReviewModal } from './components/ReviewModal';
import { MyPageModal } from './components/MyPageModal';
import { AuthModal } from './components/AuthModal';
import { TaskCard } from './components/TaskCard';
import { MessageSquare, LogIn } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('quicktask_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('quicktask_token') || 'token_user_1');
  const [metrics, setMetrics] = useState<LeanCanvasMetrics>(INITIAL_METRICS);
  const [selectedCampus, setSelectedCampus] = useState<string>('ssu');
  const [activeTab, setActiveTab] = useState<'board' | 'chat' | 'history'>('board');

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeChatTaskId, setActiveChatTaskId] = useState<string | null>('task-4');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<Task | null>(null);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  // Filter for history tab
  const [historySubTab, setHistorySubTab] = useState<'requested' | 'performed'>('performed');

  // Load live tasks from server on mount
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTasks(data);
          }
        }
      } catch (err) {
        console.error('Failed to load tasks from server:', err);
      }
    }
    fetchTasks();
  }, []);

  // Sync user and token to localStorage
  const handleAuthSuccess = (user: CurrentUser, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('quicktask_user', JSON.stringify(user));
    localStorage.setItem('quicktask_token', token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('quicktask_user');
    localStorage.removeItem('quicktask_token');
  };

  // Quick accept handler with server sync
  const handleQuickAccept = async (task: Task) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${task.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          performerId: currentUser.id,
          performerName: currentUser.name,
          performerCampus: `${currentUser.campus} ${currentUser.department}`,
          performerMannerTemp: currentUser.mannerTemp,
        }),
      });

      if (res.ok) {
        const { task: updatedTask, message } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
        setMessages((prev) => ({
          ...prev,
          [task.id]: [...(prev[task.id] || []), message],
        }));
      } else {
        // Fallback local update
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: 'matched' as const,
                  performerId: currentUser.id,
                  performerName: currentUser.name,
                  performerCampus: `${currentUser.campus} ${currentUser.department}`,
                  performerMannerTemp: currentUser.mannerTemp,
                }
              : t
          )
        );
      }
    } catch (err) {
      console.error('Error accepting task:', err);
    }

    setActiveChatTaskId(task.id);
    setIsChatModalOpen(true);
  };

  // Add new task handler with server sync
  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newTaskData),
      });

      if (res.ok) {
        const createdTask = await res.json();
        if (createdTask.isUrgent) {
          setTasks((prev) => [createdTask, ...prev]);
        } else {
          setTasks((prev) => {
            const urgentIdx = prev.findIndex((t) => !t.isUrgent);
            if (urgentIdx === -1) return [...prev, createdTask];
            const next = [...prev];
            next.splice(urgentIdx, 0, createdTask);
            return next;
          });
        }
      } else {
        // Fallback local update
        const localTask: Task = {
          ...newTaskData,
          id: `task-${Date.now()}`,
          status: 'open',
          createdAt: '방금 전',
        };
        setTasks((prev) => [localTask, ...prev]);
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }

    setMetrics((prev) => ({
      ...prev,
      weeklyRequests: prev.weeklyRequests + 1,
    }));
  };

  // Send message in chat with server sync
  const handleSendMessage = async (taskId: string, text: string) => {
    if (!currentUser) return;
    const targetTask = tasks.find((t) => t.id === taskId);
    const isMeRequester = targetTask?.requesterId === currentUser.id;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          senderId: currentUser.id,
          senderName: isMeRequester ? `${currentUser.name} (의뢰자)` : `${currentUser.name} (수행자)`,
          senderRole: isMeRequester ? 'requester' : 'performer',
          text,
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), newMsg],
        }));
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }

    // Interactive reply simulation
    setTimeout(async () => {
      const replyText = isMeRequester
        ? '네 학우님! 말씀하신 내용 확인했습니다. 곧 마무리해서 결과물 제출란에 올려드릴게요 :)'
        : '확인 감사합니다 학우님! 내용 검수 후 바로 완료 승인하겠습니다.';

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            senderId: isMeRequester ? 'peer_performer' : 'peer_requester',
            senderName: isMeRequester ? `${targetTask?.performerName || '수행자'}` : `${targetTask?.requesterName || '의뢰자'}`,
            senderRole: isMeRequester ? 'performer' : 'requester',
            text: replyText,
          }),
        });
        if (res.ok) {
          const replyMsg = await res.json();
          setMessages((prev) => ({
            ...prev,
            [taskId]: [...(prev[taskId] || []), replyMsg],
          }));
        }
      } catch (e) {
        // silent
      }
    }, 1000);
  };

  // Submit result with server sync
  const handleSubmitResult = async (taskId: string, content: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const { task: updatedTask, message } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
        setMessages((prev) => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), message],
        }));
      }
    } catch (err) {
      console.error('Error submitting result:', err);
    }
  };

  // Approve and complete with server sync
  const handleApproveAndComplete = async (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const { task: updatedTask, message } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
        setMessages((prev) => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), message],
        }));

        if (currentUser && targetTask.performerId === currentUser.id) {
          setCurrentUser((prev) => prev ? ({
            ...prev,
            balance: prev.balance + targetTask.reward,
            completedTasksCount: prev.completedTasksCount + 1,
          }) : null);
        }
      }
    } catch (err) {
      console.error('Error completing task:', err);
    }

    setReviewingTask(targetTask);
  };

  // Submit review with server sync
  const handleSubmitReview = async (
    taskId: string,
    rating: number,
    comment: string,
    badges: string[]
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserName: currentUser.name,
          rating,
          comment,
          badges,
        }),
      });

      if (res.ok) {
        const { task: updatedTask } = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
        setCurrentUser((prev) => prev ? ({
          ...prev,
          mannerTemp: Number((prev.mannerTemp + (rating >= 4 ? 0.2 : -0.1)).toFixed(1)),
        }) : null);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const handleWithdraw = async (amount: number) => {
    if (!currentUser) return;
    try {
      await fetch('/api/users/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      setCurrentUser((prev) => prev ? ({ ...prev, balance: 0 }) : null);
    } catch (err) {
      console.error('Error withdrawing:', err);
    }
  };

  const activeChatTask = tasks.find((t) => t.id === activeChatTaskId) || null;
  const activeChatMessages = activeChatTaskId ? messages[activeChatTaskId] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenNewTask={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
          } else {
            setIsNewTaskOpen(true);
          }
        }}
        onOpenMyPage={() => setIsMyPageOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        unreadChatCount={tasks.filter((t) => t.status === 'matched' || t.status === 'submitted').length}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {activeTab === 'board' && (
          <>
            <HeroMetricBar
              metrics={metrics}
              currentUser={currentUser || INITIAL_USER}
              selectedCampus={selectedCampus}
              onSelectCampus={setSelectedCampus}
              onOpenNewTask={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsNewTaskOpen(true);
                }
              }}
            />

            <TaskBoard
              tasks={tasks}
              currentUser={currentUser || INITIAL_USER}
              onSelectTask={(task) => setSelectedTask(task)}
              onQuickAccept={handleQuickAccept}
              onOpenChat={(task) => {
                setActiveChatTaskId(task.id);
                setIsChatModalOpen(true);
              }}
              onOpenNewTask={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsNewTaskOpen(true);
                }
              }}
            />
          </>
        )}

        {/* 1:1 Live Workspace Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">1:1 작업실</h2>
              <p className="text-xs text-slate-500 mt-1">
                매칭된 학우와의 실시간 대화 및 결과물 확인 (서버 실시간 동기화)
              </p>
            </div>

            <div className="space-y-3">
              {tasks
                .filter(
                  (t) =>
                    t.status === 'matched' ||
                    t.status === 'in_progress' ||
                    t.status === 'submitted' ||
                    t.status === 'completed'
                )
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveChatTaskId(t.id);
                      setIsChatModalOpen(true);
                    }}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span className="font-semibold text-blue-600">{t.categoryLabel}</span>
                        <span>·</span>
                        <span>의뢰자: {t.requesterName}</span>
                        <span>·</span>
                        <span>수행자: {t.performerName || '나'}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {t.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {t.reward.toLocaleString()}원
                      </div>
                      <span className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        대화하기
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">내 활동 내역</h2>
                <p className="text-xs text-slate-500 mt-1">
                  내가 올린 의뢰 및 수행한 심부름 관리 (서버에 저장된 데이터)
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg shrink-0">
                <button
                  onClick={() => setHistorySubTab('performed')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    historySubTab === 'performed'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  수행한 일 (용돈)
                </button>
                <button
                  onClick={() => setHistorySubTab('requested')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    historySubTab === 'requested'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  등록한 의뢰
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {tasks
                .filter((t) =>
                  historySubTab === 'performed'
                    ? t.performerId === currentUser?.id
                    : t.requesterId === currentUser?.id
                )
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser || INITIAL_USER}
                    onSelectTask={(t) => setSelectedTask(t)}
                    onQuickAccept={handleQuickAccept}
                    onOpenChat={(t) => {
                      setActiveChatTaskId(t.id);
                      setIsChatModalOpen(true);
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Clean minimal footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-400 text-center">
        <p>캠퍼스 한 줄 의뢰 · 대학생 전용 소액 심부름 &amp; 과제 마켓플레이스</p>
      </footer>

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        currentUser={currentUser || INITIAL_USER}
        onAddTask={handleAddTask}
      />

      <TaskDetailModal
        task={selectedTask}
        currentUser={currentUser || INITIAL_USER}
        onClose={() => setSelectedTask(null)}
        onQuickAccept={handleQuickAccept}
        onOpenChat={(task) => {
          setActiveChatTaskId(task.id);
          setIsChatModalOpen(true);
        }}
      />

      {isChatModalOpen && activeChatTask && (
        <ChatRoomModal
          task={activeChatTask}
          currentUser={currentUser || INITIAL_USER}
          messages={activeChatMessages}
          onClose={() => setIsChatModalOpen(false)}
          onSendMessage={handleSendMessage}
          onSubmitResult={handleSubmitResult}
          onApproveAndComplete={handleApproveAndComplete}
          onOpenReview={(task) => setReviewingTask(task)}
        />
      )}

      {reviewingTask && (
        <ReviewModal
          task={reviewingTask}
          currentUser={currentUser || INITIAL_USER}
          onClose={() => setReviewingTask(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {currentUser && (
        <MyPageModal
          isOpen={isMyPageOpen}
          onClose={() => setIsMyPageOpen(false)}
          currentUser={currentUser}
          tasks={tasks}
          onWithdraw={handleWithdraw}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
