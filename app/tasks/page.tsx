'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TaskForm from '@/components/features/TaskForm';
import TaskList from '@/components/features/TaskList';
import type { Task, Priority, TaskStatus, TaskCategory, Project } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<{
    status?: TaskStatus;
    priority?: Priority;
    category?: TaskCategory;
  }>({});

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [filter]);

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
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.category) params.append('category', filter.category);

      const response = await fetch(`/api/tasks?${params.toString()}`);
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
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    fetchTasks();
  };

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
        {/* 필터 */}
        <Card>
          <div className="flex gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as TaskStatus || undefined })}
            >
              <option value="">전체 상태</option>
              <option value="todo">할 일</option>
              <option value="in_progress">진행 중</option>
              <option value="completed">완료</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.priority || ''}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value as Priority || undefined })}
            >
              <option value="">전체 우선순위</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.category || ''}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as TaskCategory || undefined })}
            >
              <option value="">전체 카테고리</option>
              <option value="업무">업무</option>
              <option value="개인">개인</option>
              <option value="프로젝트">프로젝트</option>
            </select>

            {(filter.status || filter.priority || filter.category) && (
              <Button variant="ghost" onClick={() => setFilter({})}>
                필터 초기화
              </Button>
            )}
          </div>
        </Card>

        {/* 작업 목록 */}
        <TaskList
          tasks={tasks}
          projects={projects}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
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

