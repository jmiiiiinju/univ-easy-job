import React from 'react';
import { Task, CurrentUser } from '../types';
import { Clock, MapPin, Zap, MessageSquare, ArrowRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentUser: CurrentUser;
  onSelectTask: (task: Task) => void;
  onQuickAccept: (task: Task) => void;
  onOpenChat: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUser,
  onSelectTask,
  onQuickAccept,
  onOpenChat,
}) => {
  const isMine = task.requesterId === currentUser.id;

  const getStatusText = () => {
    switch (task.status) {
      case 'open':
        return { label: '접수중', style: 'text-blue-600 bg-blue-50' };
      case 'matched':
      case 'in_progress':
        return { label: '작업중', style: 'text-amber-700 bg-amber-50' };
      case 'submitted':
        return { label: '검수대기', style: 'text-purple-700 bg-purple-50' };
      case 'completed':
        return { label: '완료', style: 'text-slate-500 bg-slate-100' };
      default:
        return { label: '진행중', style: 'text-slate-500 bg-slate-100' };
    }
  };

  const status = getStatusText();

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Task Info */}
      <div className="flex-1 min-w-0">
        {/* Category & Status Line */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
          {task.isUrgent && (
            <span className="font-bold text-amber-600 flex items-center gap-0.5">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              급구
            </span>
          )}
          <span className="font-medium text-slate-700">{task.categoryLabel}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{task.deliveryMethod === 'online' ? '온라인 제출' : '교내 대면'}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3 text-slate-400" />
            {task.deadline}
          </span>
          <span className={`ml-auto sm:ml-2 text-[11px] font-medium px-2 py-0.5 rounded ${status.style}`}>
            {status.label}
          </span>
        </div>

        {/* Task Title */}
        <h3
          onClick={() => onSelectTask(task)}
          className="text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer leading-snug line-clamp-1"
        >
          {task.title}
        </h3>

        {/* Description & Location */}
        <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-1">
          {task.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <span className="text-slate-700 font-medium">{task.requesterName}</span>
          <span>({task.requesterCampus})</span>
          <span>·</span>
          <span className="font-mono text-blue-600 font-medium">{task.requesterMannerTemp.toFixed(1)}℃</span>
          {task.locationDetails && (
            <>
              <span>·</span>
              <span className="truncate text-slate-500">{task.locationDetails}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Reward & Action Button */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 sm:pl-4 sm:border-l sm:border-slate-100">
        <div className="text-left sm:text-right">
          <div className="text-[11px] text-slate-400">사례비</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {task.reward.toLocaleString()}
            <span className="text-xs font-normal text-slate-500 ml-0.5">원</span>
          </div>
        </div>

        <div>
          {task.status === 'open' && !isMine && (
            <button
              onClick={() => onQuickAccept(task)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>수락하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {task.status === 'open' && isMine && (
            <button
              onClick={() => onSelectTask(task)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              내 의뢰 확인
            </button>
          )}

          {(task.status === 'matched' || task.status === 'in_progress' || task.status === 'submitted') && (
            <button
              onClick={() => onOpenChat(task)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>1:1 작업실</span>
            </button>
          )}

          {task.status === 'completed' && (
            <button
              onClick={() => onSelectTask(task)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              상세보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
