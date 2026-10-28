import React from 'react';
import { LeanCanvasMetrics, CurrentUser } from '../types';
import { CAMPUS_OPTIONS } from '../data/mockData';

interface HeroMetricBarProps {
  metrics: LeanCanvasMetrics;
  currentUser: CurrentUser;
  selectedCampus: string;
  onSelectCampus: (campusId: string) => void;
  onOpenNewTask: () => void;
}

export const HeroMetricBar: React.FC<HeroMetricBarProps> = ({
  metrics,
  selectedCampus,
  onSelectCampus,
  onOpenNewTask,
}) => {
  const currentCampusInfo = CAMPUS_OPTIONS.find((c) => c.id === selectedCampus) || CAMPUS_OPTIONS[0];

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-2">
              <select
                value={selectedCampus}
                onChange={(e) => onSelectCampus(e.target.value)}
                className="bg-blue-50 text-blue-700 border border-blue-200 font-medium rounded-md px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-normal">
                {currentCampusInfo.earlyAdopterLabel} (진행 중 의뢰 {currentCampusInfo.activeCount}건)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              1만 원짜리 일도 5분 만에, 믿고 맡기는 캠퍼스 의뢰
            </h1>

            <p className="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">
              자료정리, 엑셀 수식, 영문 첨삭, 도서관 프린트 출력 등<br className="hidden sm:inline" />
              크몽·숨고에 맡기기 애매한 소액 과제를 같은 학교 학우들과 안전하게 해결하세요.
            </p>

            {/* Clean inline trust indicators (Zero-pill, unboxed) */}
            <div className="flex items-center gap-3 mt-4 text-xs text-slate-500 font-medium">
              <span>평균 매칭 <strong className="font-mono text-slate-800">4분 18초</strong></span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>수락 완료율 <strong className="font-mono text-slate-800">{metrics.acceptanceRate}%</strong></span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>건당 고정 수수료 <strong className="font-mono text-slate-800">{metrics.feePerTransaction}원</strong></span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={onOpenNewTask}
              className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer text-center"
            >
              + 한 줄 의뢰 등록하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
