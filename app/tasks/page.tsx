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
    } catch (error) {
      console.error('Error updating task status:', error);
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
        {/* 칸반보드 */}
        <KanbanBoard
          tasks={tasks}
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

