import React, { useState } from 'react';
import { Task, TaskCategory, DeliveryMethod, CurrentUser } from '../types';
import { X, Zap, MapPin } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
}

const DEADLINE_OPTIONS = [
  '30분 이내 (초급구)',
  '1시간 이내',
  '3시간 이내',
  '오늘 자정까지',
  '내일 정오(12:00)까지',
  '내일 자정까지',
  '2일 이내',
  '3일 이내',
  '5일 이내',
  '1주일 이내 (7일)',
  '직접 입력',
];

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('excel');
  const [reward, setReward] = useState<number>(15000);
  const [deadlineSelect, setDeadlineSelect] = useState('오늘 자정까지');
  const [customDeadline, setCustomDeadline] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('online');
  const [locationDetails, setLocationDetails] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  if (!isOpen) return null;

  const baseFee = 800;
  const urgentFee = isUrgent ? 1000 : 0;
  const totalAmount = reward + baseFee + urgentFee;

  const finalDeadline = deadlineSelect === '직접 입력' ? customDeadline.trim() || '마감 협의' : deadlineSelect;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const categoryLabels: Record<TaskCategory, string> = {
      all: '전체',
      excel: '엑셀/데이터',
      translate: '번역/첨삭',
      design: 'PPT/디자인',
      coding: '코딩/IT',
      errand: '프린트/심부름',
      store: '가게/동아리',
    };

    onAddTask({
      title: title.trim(),
      description: description.trim() || '요청 상세: 한 줄 제목 내용대로 빠른 도움 부탁드립니다!',
      category,
      categoryLabel: categoryLabels[category],
      reward,
      platformFee: baseFee,
      isUrgent,
      deadline: finalDeadline,
      deadlineTimestamp: Date.now() + 1000 * 60 * 120,
      deliveryMethod,
      locationDetails: deliveryMethod === 'campus_pickup' ? locationDetails : undefined,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterCampus: `${currentUser.campus} ${currentUser.department}`,
      requesterMannerTemp: currentUser.mannerTemp,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">한 줄 의뢰 등록</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              한 줄 의뢰 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 경영통계학 과제 엑셀 VLOOKUP 오류 수정 부탁드립니다"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Category & Delivery Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="excel">엑셀/데이터</option>
                <option value="translate">번역/첨삭</option>
                <option value="design">PPT/디자인</option>
                <option value="coding">코딩/IT</option>
                <option value="errand">프린트/심부름</option>
                <option value="store">가게/동아리</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                완료 방식
              </label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="online">온라인 (파일/링크)</option>
                <option value="campus_pickup">교내 대면 (직접 전달)</option>
              </select>
            </div>
          </div>

          {/* Location details if pickup */}
          {deliveryMethod === 'campus_pickup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                교내 만남 장소
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="예: 중앙도서관 1층 무인프린터 앞"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Reward & Deadline (Expanded up to 1 Week) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                사례비 (원)
              </label>
              <input
                type="number"
                step="1000"
                min="3000"
                value={reward}
                onChange={(e) => setReward(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                마감 시간 (최대 1주일)
              </label>
              <select
                value={deadlineSelect}
                onChange={(e) => setDeadlineSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                {DEADLINE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Deadline Input if selected */}
          {deadlineSelect === '직접 입력' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                마감 일시 직접 입력
              </label>
              <input
                type="text"
                placeholder="예: 이번 주 금요일 18시까지, 4일 뒤 오후 2시"
                value={customDeadline}
                onChange={(e) => setCustomDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              상세 전달사항 (선택)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="필요한 조건이나 파일 형식, 전달할 사항을 적어주세요."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none resize-none"
            />
          </div>

          {/* Urgent checkbox (+1,000 KRW) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="urgent-boost"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="urgent-boost" className="text-xs text-slate-800 cursor-pointer select-none">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  급구 의뢰 상단 고정 노출 (+1,000원 추가)
                </span>
                <span className="text-slate-600 block mt-0.5">
                  게시판 최상단에 강조 표시되어 평균 5분 이내로 더 빠르게 매칭됩니다.
                </span>
              </label>
            </div>
          </div>

          {/* Clean Total Breakdown */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1 font-mono">
            <div className="flex justify-between text-slate-600 font-sans">
              <span>수행자 지급 사례비:</span>
              <span className="font-semibold text-slate-900 tabular-nums">{reward.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-slate-600 font-sans">
              <span>기본 안전 수수료:</span>
              <span className="tabular-nums">+{baseFee.toLocaleString()}원</span>
            </div>
            {isUrgent && (
              <div className="flex justify-between text-amber-800 font-sans font-medium">
                <span>급구 상단 고정 옵션:</span>
                <span className="tabular-nums">+1,000원</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-sans font-bold text-slate-900">
              <span>총 결제 금액:</span>
              <span className="text-blue-600 font-mono text-base tabular-nums">
                {totalAmount.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
