import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, CurrentUser } from '../types';
import { TaskCard } from './TaskCard';
import { Search, Plus, Zap } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  currentUser: CurrentUser;
  onSelectTask: (task: Task) => void;
  onQuickAccept: (task: Task) => void;
  onOpenChat: (task: Task) => void;
  onOpenNewTask: () => void;
}

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'excel', label: '엑셀/데이터' },
  { id: 'translate', label: '번역/첨삭' },
  { id: 'design', label: 'PPT/디자인' },
  { id: 'coding', label: '코딩/IT' },
  { id: 'errand', label: '프린트/심부름' },
  { id: 'store', label: '가게/동아리' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  currentUser,
  onSelectTask,
  onQuickAccept,
  onOpenChat,
  onOpenNewTask,
}) => {
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (activeCategory !== 'all' && task.category !== activeCategory) {
        return false;
      }
      if (onlyOpen && task.status !== 'open') {
        return false;
      }
      if (onlyUrgent && !task.isUrgent) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.requesterCampus.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tasks, activeCategory, onlyOpen, onlyUrgent, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Category Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs">
        {/* Category Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-slate-100 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="과제명, 엑셀, 첨삭, 프린트 등 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyUrgent(!onlyUrgent)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                onlyUrgent
                  ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${onlyUrgent ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>급구만</span>
            </button>

            <button
              onClick={() => setOnlyOpen(!onlyOpen)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                onlyOpen
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {onlyOpen ? '✓ 접수중만' : '접수중만'}
            </button>
          </div>
        </div>
      </div>

      {/* Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <div>
          의뢰 <span className="font-semibold text-slate-900 font-mono tabular-nums">{filteredTasks.length}</span>개
        </div>
        <div className="text-slate-400">
          실시간 캠퍼스 게시판
        </div>
      </div>

      {/* Task List: Highly Readable Vertical Card Flow */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              onSelectTask={onSelectTask}
              onQuickAccept={onQuickAccept}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-300">
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            해당 조건의 의뢰가 없습니다
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            직접 필요한 과제나 심부름을 한 줄로 올려보세요.
          </p>
          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>새 의뢰 등록</span>
          </button>
        </div>
      )}
    </div>
  );
};
