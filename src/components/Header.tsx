import React from 'react';
import { CurrentUser } from '../types';
import { Plus, LogIn, LogOut, User } from 'lucide-react';

interface HeaderProps {
  activeTab: 'board' | 'chat' | 'history';
  setActiveTab: (tab: 'board' | 'chat' | 'history') => void;
  currentUser: CurrentUser | null;
  onOpenNewTask: () => void;
  onOpenMyPage: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  unreadChatCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenNewTask,
  onOpenMyPage,
  onOpenAuth,
  onLogout,
  unreadChatCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Brand Wordmark */}
          <button
            onClick={() => setActiveTab('board')}
            className="flex items-center gap-2 cursor-pointer text-left shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              한
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              캠퍼스 한 줄 의뢰
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTab('board')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer ${
                activeTab === 'board'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              의뢰 목록
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`relative whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              1:1 작업실
              {unreadChatCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-600 text-white text-[11px] font-mono rounded-full">
                  {unreadChatCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              내 활동
            </button>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMyPage}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-blue-600 font-mono font-semibold">{currentUser.mannerTemp.toFixed(1)}℃</span>
                </button>
                <button
                  onClick={onLogout}
                  title="로그아웃"
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인 / 회원가입</span>
              </button>
            )}

            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>의뢰 등록</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('board')}
            className={`py-1 ${activeTab === 'board' ? 'text-blue-600 font-bold' : ''}`}
          >
            의뢰 목록
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-1 ${activeTab === 'chat' ? 'text-blue-600 font-bold' : ''}`}
          >
            1:1 작업실 {unreadChatCount > 0 ? `(${unreadChatCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1 ${activeTab === 'history' ? 'text-blue-600 font-bold' : ''}`}
          >
            내 활동
          </button>
          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="py-1 text-blue-600 font-bold"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
