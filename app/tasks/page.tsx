'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TaskForm from '@/components/features/TaskForm';
import KanbanBoard from '@/components/features/KanbanBoard';
import type { Task, Priority, TaskStatus, TaskCategory, Project } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // 필터링 상태
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    category: '',
    dueDate: '',
    status: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('이 작업을 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
      
      // 커스텀 이벤트 발생 (대시보드 업데이트용)
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };


  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
      
      // 커스텀 이벤트 발생 (대시보드 업데이트용)
      window.dispatchEvent(new CustomEvent('taskUpdated'));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    fetchTasks();
    
    // 커스텀 이벤트 발생 (대시보드 업데이트용)
    window.dispatchEvent(new CustomEvent('taskUpdated'));
  };

  // 필터링된 작업 목록
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !filters.search || 
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesCategory = !filters.category || task.category === filters.category;
    const matchesStatus = !filters.status || task.status === filters.status;
    
    let matchesDueDate = true;
    if (filters.dueDate) {
      if (filters.dueDate === 'overdue') {
        matchesDueDate = task.due_date && new Date(task.due_date) < new Date();
      } else if (filters.dueDate === 'thisWeek') {
        const dueDate = new Date(task.due_date);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        matchesDueDate = task.due_date && dueDate >= today && dueDate <= weekFromNow;
      } else if (filters.dueDate === 'thisMonth') {
        const dueDate = new Date(task.due_date);
        const today = new Date();
        const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        matchesDueDate = task.due_date && dueDate >= today && dueDate <= monthFromNow;
      }
    }
    
    return matchesSearch && matchesPriority && matchesCategory && matchesStatus && matchesDueDate;
  });

  // 진행률 계산
  const getProgressStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      progressPercentage,
      todo: tasks.filter(task => task.status === 'todo').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      delayed: tasks.filter(task => task.status === 'delayed').length
    };
  };

  const progressStats = getProgressStats();

  return (
    <MainLayout
      title="업무 관리"
      action={
        <Button onClick={handleCreateTask}>
          + 새 작업
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 진행률 및 필터링 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 전체 진행률 */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 진행률</h3>
            <div className="space-y-4">
              {/* 진행률 바 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">완료율</span>
                  <span className="text-sm font-bold text-gray-900">{progressStats.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressStats.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  {progressStats.completed} / {progressStats.total} 완료
                </div>
              </div>
              
              {/* 상태별 통계 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">{progressStats.todo}</div>
                  <div className="text-xs text-gray-500">할일</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{progressStats.inProgress}</div>
                  <div className="text-xs text-blue-500">진행중</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{progressStats.delayed}</div>
                  <div className="text-xs text-orange-500">지연</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{progressStats.completed}</div>
                  <div className="text-xs text-green-500">완료</div>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터링 */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">검색 및 필터</h3>
            <div className="space-y-4">
              {/* 검색 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
                <input
                  type="text"
                  placeholder="제목 또는 설명 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
              </div>
              
              {/* 필터 옵션들 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 우선순위 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  >
                    <option value="">전체</option>
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
                
                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  >
                    <option value="">전체</option>
                    <option value="업무">업무</option>
                    <option value="개인">개인</option>
                    <option value="프로젝트">프로젝트</option>
                  </select>
                </div>
                
                {/* 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  >
                    <option value="">전체</option>
                    <option value="todo">할일</option>
                    <option value="in_progress">진행중</option>
                    <option value="delayed">지연</option>
                    <option value="completed">완료</option>
                  </select>
                </div>
                
                {/* 마감일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                  <select
                    value={filters.dueDate}
                    onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  >
                    <option value="">전체</option>
                    <option value="overdue">지연됨</option>
                    <option value="thisWeek">이번 주</option>
                    <option value="thisMonth">이번 달</option>
                  </select>
                </div>
              </div>
              
              {/* 필터 초기화 */}
              <div className="flex justify-end">
                <button
                  onClick={() => setFilters({ search: '', priority: '', category: '', dueDate: '', status: '' })}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 칸반보드 */}
        <KanbanBoard
          tasks={filteredTasks}
          projects={projects}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* 작업 생성/수정 모달 */}
      {isModalOpen && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </MainLayout>
  );
}

