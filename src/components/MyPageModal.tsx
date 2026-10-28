import React, { useState } from 'react';
import { CurrentUser, Task } from '../types';
import { X, ShieldCheck, Award, Wallet, ArrowUpRight, CheckCircle2, User, Sparkles } from 'lucide-react';

interface MyPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  tasks: Task[];
  onWithdraw: (amount: number) => void;
}

export const MyPageModal: React.FC<MyPageModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tasks,
  onWithdraw,
}) => {
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  if (!isOpen) return null;

  const myCreatedTasks = tasks.filter((t) => t.requesterId === currentUser.id);
  const myPerformedTasks = tasks.filter((t) => t.performerId === currentUser.id);

  const handleWithdrawClick = () => {
    if (currentUser.balance <= 0) return;
    onWithdraw(currentUser.balance);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">내 캠퍼스 프로필</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Profile Card */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {currentUser.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{currentUser.name}</h4>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    학생증 인증 완료
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {currentUser.campus} {currentUser.department} ({currentUser.studentIdPrefix})
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400">매너온도</div>
              <div className="text-xl font-bold font-mono text-blue-600 tabular-nums">
                {currentUser.mannerTemp.toFixed(1)}℃
              </div>
              <div className="text-[10px] text-slate-400">기본 36.5℃</div>
            </div>
          </div>

          {/* Wallet & Balance Box */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Wallet className="w-4 h-4 text-emerald-400" />
                정산 완료된 용돈 잔액
              </span>
              <span className="text-emerald-400 font-medium">수수료 공제 후 실입금액</span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-3xl font-bold font-mono tabular-nums">
                  {currentUser.balance.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-slate-300 ml-1">원</span>
              </div>

              <button
                onClick={handleWithdrawClick}
                disabled={currentUser.balance <= 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>내 계좌로 출금</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {withdrawSuccess && (
              <div className="mt-3 p-2 bg-emerald-950/80 border border-emerald-700/60 rounded text-xs text-emerald-300 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>등록된 계좌(카카오뱅크 3333-**)로 전액 출금 신청되었습니다. (5분 내 입금)</span>
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              학우들이 남겨준 칭찬 뱃지
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-700">약속 시간을 잘 지켜요</span>
                <span className="font-mono font-bold text-blue-600">6회</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-700">결과물이 아주 꼼꼼해요</span>
                <span className="font-mono font-bold text-blue-600">5회</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-700">응답이 칼같이 빨라요</span>
                <span className="font-mono font-bold text-blue-600">8회</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                <span className="text-slate-700">매너가 매우 친절해요</span>
                <span className="font-mono font-bold text-blue-600">7회</span>
              </div>
            </div>
          </div>

          {/* Activity Count Summary */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-center text-xs">
            <div>
              <div className="text-slate-400">내가 등록한 의뢰</div>
              <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                {myCreatedTasks.length}건
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-slate-400">내가 수행한 심부름/과제</div>
              <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                {myPerformedTasks.length}건
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-slate-400">보유 할인 쿠폰</div>
              <div className="text-lg font-bold font-mono text-blue-600 mt-0.5">
                {currentUser.freeCouponAvailable ? '1장 (수수료 면제)' : '0장'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
