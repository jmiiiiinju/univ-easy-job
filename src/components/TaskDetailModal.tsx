import React from 'react';
import { Task, CurrentUser } from '../types';
import { X, Clock, MapPin, ShieldCheck, Zap, MessageSquare, ArrowRight, CheckCircle2, User } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  currentUser: CurrentUser;
  onClose: () => void;
  onQuickAccept: (task: Task) => void;
  onOpenChat: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  currentUser,
  onClose,
  onQuickAccept,
  onOpenChat,
}) => {
  if (!task) return null;

  const isMine = task.requesterId === currentUser.id;
  const isPerformer = task.performerId === currentUser.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {task.isUrgent && (
              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                급구 의뢰
              </span>
            )}
            <span className="font-semibold text-slate-700">{task.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{task.deliveryMethod === 'online' ? '온라인 완료' : '교내 대면'}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title & Status */}
          <div>
            <div className="text-xs text-slate-400 mb-1">한 줄 의뢰 내용</div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h2>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-1.5">요청 상세 내용</div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Location / Delivery instructions */}
          {task.locationDetails && (
            <div className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900">교내 전달 위치: </span>
                <span>{task.locationDetails}</span>
              </div>
            </div>
          )}

          {/* Requester & Performer Profile Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] text-slate-400 mb-1 font-medium">의뢰자 정보</div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {task.requesterName[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{task.requesterName}</div>
                  <div className="text-[11px] text-slate-500">{task.requesterCampus}</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
                <span>캠퍼스 매너온도</span>
                <span className="font-mono font-bold text-blue-600">{task.requesterMannerTemp.toFixed(1)}℃</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] text-slate-400 mb-1 font-medium">수행자 정보</div>
              {task.performerName ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                      {task.performerName[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{task.performerName}</div>
                      <div className="text-[11px] text-slate-500">{task.performerCampus}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>수행자 매너온도</span>
                    <span className="font-mono font-bold text-emerald-600">{task.performerMannerTemp?.toFixed(1) || 36.5}℃</span>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col justify-center text-xs text-slate-400">
                  <span>아직 수행자가 매칭되지 않았습니다.</span>
                  <span className="text-[11px] text-blue-600 mt-1">지금 원터치로 수락할 수 있습니다.</span>
                </div>
              )}
            </div>
          </div>

          {/* Submission and Reviews if completed */}
          {task.status === 'completed' && task.reviews && task.reviews.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-2">거래 완료 후기</div>
              {task.reviews.map((rev) => (
                <div key={rev.id} className="text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-medium text-slate-800">{rev.fromUserName}</span>
                    <span className="text-amber-500 font-mono font-bold">★ {rev.rating}.0</span>
                  </div>
                  <p className="text-slate-700 mb-2">{rev.comment}</p>
                  <div className="flex flex-wrap gap-1">
                    {rev.badges.map((b) => (
                      <span key={b} className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trust & Escrow Guarantee note */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">캠퍼스 안심 정산 보호: </span>
              의뢰가 정상 완료되고 의뢰자가 검수한 후에만 수행자에게 정산액이 지급됩니다. (플랫폼 고정 수수료 {task.platformFee}원)
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-400">사례비 지급액</div>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {task.reward.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">원</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {task.status === 'open' && !isMine && (
                <button
                  onClick={() => {
                    onQuickAccept(task);
                    onClose();
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>원터치 수락하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {(task.status === 'matched' || task.status === 'in_progress' || task.status === 'submitted') && (
                <button
                  onClick={() => {
                    onOpenChat(task);
                    onClose();
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>1:1 작업실 열기</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
