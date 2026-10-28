import React, { useState } from 'react';
import { Task, CurrentUser } from '../types';
import { X, Star, Check, ThumbsUp, Sparkles } from 'lucide-react';

interface ReviewModalProps {
  task: Task;
  currentUser: CurrentUser;
  onClose: () => void;
  onSubmitReview: (taskId: string, rating: number, comment: string, badges: string[]) => void;
}

const BADGE_OPTIONS = [
  '약속 시간을 잘 지켜요',
  '응답이 칼같이 빨라요',
  '결과물이 아주 꼼꼼해요',
  '매너가 매우 친절해요',
  '요구사항을 완벽히 반영해요',
  '다음에 또 맡기고 싶어요',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  task,
  currentUser,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([
    '약속 시간을 잘 지켜요',
    '결과물이 아주 꼼꼼해요',
  ]);

  const targetName =
    currentUser.id === task.requesterId
      ? task.performerName || '수행자'
      : task.requesterName;

  const toggleBadge = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview(
      task.id,
      rating,
      comment.trim() || '빠르고 꼼꼼하게 도와주셔서 감사합니다!',
      selectedBadges
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="text-xs font-semibold text-blue-600">캠퍼스 신뢰 구축</div>
            <h3 className="text-base font-bold text-slate-900">상호 평점 및 매너온도 평가</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Profile summary */}
          <div className="text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center mx-auto mb-2">
              {targetName[0]}
            </div>
            <div className="text-sm font-bold text-slate-900">
              {targetName} 학우님과의 거래는 어떠셨나요?
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              남겨주신 평가는 학우님의 캠퍼스 매너온도에 실시간 반영됩니다.
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-xs font-semibold text-amber-600 font-mono">
            {rating === 5 && '최고예요! 완벽한 도움이었어요 (5.0)'}
            {rating === 4 && '좋았어요! 만족스럽습니다 (4.0)'}
            {rating === 3 && '보통이었어요 (3.0)'}
            {rating <= 2 && '조금 아쉬웠어요'}
          </div>

          {/* Manner Badges */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              칭찬 뱃지를 선택해주세요 (복수 선택 가능)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map((badge) => {
                const isSelected = selectedBadges.includes(badge);
                return (
                  <button
                    type="button"
                    key={badge}
                    onClick={() => toggleBadge(badge)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                    <span>{badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              상세 후기 한마디
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="학우님께 도움이 될 따뜻한 후기를 남겨주세요."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              다음에 하기
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              평가 및 후기 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
