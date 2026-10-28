import React, { useState } from 'react';
import { X, ShieldCheck, User, Lock, School, BookOpen, AlertCircle } from 'lucide-react';
import { CurrentUser } from '../types';
import { CAMPUS_OPTIONS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: CurrentUser, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState('숭실대학교');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const payload = isLoginView
        ? { username, password }
        : { username, password, name, campus, department: department.trim() || '경제학과', studentId: studentId.trim() || '20241001' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || '오류가 발생했습니다.');
        setIsLoading(false);
        return;
      }

      // Convert stored user to CurrentUser format
      const formattedUser: CurrentUser = {
        id: data.user.id,
        name: data.user.name,
        campus: data.user.campus,
        department: data.user.department,
        studentIdPrefix: `${data.user.studentId?.slice(2, 4) || '24'}학번`,
        isVerified: true,
        mannerTemp: data.user.mannerTemp || 36.5,
        role: 'performer',
        balance: data.user.balance || 0,
        completedTasksCount: data.user.completedTasksCount || 0,
        freeCouponAvailable: false,
      };

      onAuthSuccess(formattedUser, data.token);
      onClose();
    } catch (err) {
      setErrorMessage('서버 연결 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoUsername: string) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: demoUsername, password: 'password123' }),
      });
      const data = await res.json();
      if (res.ok) {
        const formattedUser: CurrentUser = {
          id: data.user.id,
          name: data.user.name,
          campus: data.user.campus,
          department: data.user.department,
          studentIdPrefix: `${data.user.studentId?.slice(2, 4) || '22'}학번`,
          isVerified: true,
          mannerTemp: data.user.mannerTemp || 36.5,
          role: 'performer',
          balance: data.user.balance || 0,
          completedTasksCount: data.user.completedTasksCount || 0,
          freeCouponAvailable: false,
        };
        onAuthSuccess(formattedUser, data.token);
        onClose();
      } else {
        setErrorMessage(data.error);
      }
    } catch (err) {
      setErrorMessage('데모 로그인 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              한
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isLoginView ? '캠퍼스 로그인' : '캠퍼스 학생 회원가입'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setIsLoginView(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isLoginView ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginView(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                !isLoginView ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              학생 회원가입
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                아이디
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="아이디 입력 (영문/숫자)"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Additional Fields for Sign Up */}
            {!isLoginView && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    이름 (실명)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      대학교
                    </label>
                    <select
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                    >
                      {CAMPUS_OPTIONS.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      소속 학과
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="예: 경제학과"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    학번 (인증용)
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="예: 20231234"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isLoading
                ? '처리 중...'
                : isLoginView
                ? '로그인하고 시작하기'
                : '회원가입 완료 및 로그인'}
            </button>
          </form>

          {/* Quick Demo Login Helper for Testing */}
          {isLoginView && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 text-center mb-2 font-medium">
                서버 테스트용 1초 간편 로그인
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ssu_econ')}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer text-center"
                >
                  숭실대 김준혁
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ssu_biz')}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer text-center"
                >
                  숭실대 이서연
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
