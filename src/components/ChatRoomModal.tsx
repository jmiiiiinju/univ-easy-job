import React, { useState, useRef, useEffect } from 'react';
import { Task, CurrentUser, ChatMessage } from '../types';
import { X, Send, Paperclip, CheckCircle2, ShieldCheck, ArrowRight, Star, Clock, AlertTriangle } from 'lucide-react';

interface ChatRoomModalProps {
  task: Task;
  currentUser: CurrentUser;
  messages: ChatMessage[];
  onClose: () => void;
  onSendMessage: (taskId: string, text: string, attachmentName?: string) => void;
  onSubmitResult: (taskId: string, content: string) => void;
  onApproveAndComplete: (taskId: string) => void;
  onOpenReview: (task: Task) => void;
}

export const ChatRoomModal: React.FC<ChatRoomModalProps> = ({
  task,
  currentUser,
  messages,
  onClose,
  onSendMessage,
  onSubmitResult,
  onApproveAndComplete,
  onOpenReview,
}) => {
  const [inputText, setInputText] = useState('');
  const [submissionInput, setSubmissionInput] = useState('');
  const [showSubmitBox, setShowSubmitBox] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRequester = currentUser.id === task.requesterId;
  const isPerformer = currentUser.id === task.performerId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(task.id, inputText.trim());
    setInputText('');
  };

  const handleSubmitResultAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionInput.trim()) return;
    onSubmitResult(task.id, submissionInput.trim());
    setShowSubmitBox(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full h-[90vh] max-h-[820px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              1:1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                  {task.title}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                  {task.reward.toLocaleString()}원
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>의뢰자: {task.requesterName}</span>
                <span aria-hidden="true">·</span>
                <span>수행자: {task.performerName || '매칭 완료'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 font-medium">에스크로 안심보관</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper progress */}
        <div className="bg-slate-100/70 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-4 overflow-x-auto">
            <div className={`flex items-center gap-1 font-medium ${task.status !== 'open' ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. 매칭완료</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1 font-medium ${task.status === 'in_progress' || task.status === 'matched' || task.status === 'submitted' || task.status === 'completed' ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>2. 작업중</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1 font-medium ${task.status === 'submitted' || task.status === 'completed' ? 'text-purple-600 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. 결과물제출</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1 font-medium ${task.status === 'completed' ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. 검수·정산완료</span>
            </div>
          </div>

          {/* Quick status badge */}
          <div className="hidden sm:block text-[11px] font-mono text-slate-500">
            마감: {task.deadline}
          </div>
        </div>

        {/* Action Callout Bar depending on state */}
        {task.status === 'submitted' && (
          <div className="bg-purple-50 border-b border-purple-200 px-5 py-2.5 flex items-center justify-between text-xs text-purple-900 shrink-0">
            <div>
              <span className="font-bold">결과물이 제출되었습니다: </span>
              <span className="italic">{task.submissionContent}</span>
            </div>
            {isRequester ? (
              <button
                onClick={() => onApproveAndComplete(task.id)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                검수 승인 및 정산하기
              </button>
            ) : (
              <span className="text-purple-700 font-medium">의뢰자 검수 대기중</span>
            )}
          </div>
        )}

        {task.status === 'completed' && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-900 shrink-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>거래가 안전하게 완료되었습니다! (플랫폼 수수료 800원 정산 완료)</span>
            </div>
            <button
              onClick={() => onOpenReview(task)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>평점·후기 작성</span>
            </button>
          </div>
        )}

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {/* Welcome Info Box */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 max-w-lg mx-auto text-center shadow-xs">
            <div className="font-semibold text-slate-900 mb-1">
              같은 학교 학우와의 1:1 안심 작업실입니다
            </div>
            <div>
              작업 진행 및 파일 링크(구글 드라이브, 노션 등)를 편하게 나누세요. 작업이 완료되면 결과물을 제출하고 의뢰자 승인 후 정산됩니다.
            </div>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isSystem = msg.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="inline-block px-3 py-1 bg-slate-200/80 text-slate-700 text-[11px] rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[11px] text-slate-400 mb-0.5 px-1 font-medium">
                  {msg.senderName}
                </div>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Performer Submission Box Drawer */}
        {showSubmitBox && (
          <div className="p-4 bg-purple-50 border-t border-purple-200 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-900 mb-2">
              <span>수행 결과물 제출하기</span>
              <button
                onClick={() => setShowSubmitBox(false)}
                className="text-purple-600 hover:text-purple-800"
              >
                닫기
              </button>
            </div>
            <form onSubmit={handleSubmitResultAction} className="space-y-2">
              <input
                type="text"
                required
                placeholder="예: 구글 드라이브 링크, 노션 링크, 또는 작업 완료 보고 내용"
                value={submissionInput}
                onChange={(e) => setSubmissionInput(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  의뢰자에게 제출하기
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bottom Toolbar & Chat Input */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {task.status !== 'completed' && (
                <button
                  onClick={() => setShowSubmitBox(!showSubmitBox)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors cursor-pointer"
                >
                  {task.status === 'submitted' ? '결과물 재제출' : '결과물 제출하기'}
                </button>
              )}

              {isRequester && task.status === 'submitted' && (
                <button
                  onClick={() => onApproveAndComplete(task.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  최종 검수 승인
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              사례비: <span className="font-mono font-semibold text-slate-800">{task.reward.toLocaleString()}원</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="학우님께 보낼 메시지를 입력하세요..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>전송</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
