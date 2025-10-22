'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { Task, CreateTaskInput, Priority, TaskStatus, TaskCategory, Project } from '@/types';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({ task, onClose, onSuccess }: TaskFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: '업무',
    status: 'todo',
    project_id: undefined,
    reference_links: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date || '',
        priority: task.priority,
        category: task.category,
        status: task.status,
        project_id: task.project_id,
        reference_links: task.reference_links || '',
      });
    }
  }, [task]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
      const method = task ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={task ? '작업 수정' : '새 작업 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="제목"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <Input
          label="마감일"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />

        <Select
          label="우선순위"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
          options={[
            { value: 'high', label: '높음' },
            { value: 'medium', label: '보통' },
            { value: 'low', label: '낮음' },
          ]}
        />

        <Select
          label="카테고리"
          value={formData.category}
          onChange={(e) => {
            const newCategory = e.target.value as TaskCategory;
            setFormData({ 
              ...formData, 
              category: newCategory,
              project_id: newCategory === '프로젝트' ? formData.project_id : undefined
            });
          }}
          options={[
            { value: '업무', label: '업무' },
            { value: '개인', label: '개인' },
            { value: '프로젝트', label: '프로젝트' },
          ]}
        />

        {formData.category === '프로젝트' && (
          <Select
            label="프로젝트 선택"
            value={formData.project_id ? formData.project_id.toString() : ''}
            onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) || undefined })}
            options={[
              { value: '', label: '프로젝트를 선택하세요' },
              ...projects.map(project => ({ 
                value: project.id.toString(), 
                label: project.name 
              }))
            ]}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">관련 문서 링크</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={formData.reference_links}
            onChange={(e) => setFormData({ ...formData, reference_links: e.target.value })}
            placeholder="관련 문서나 참고할 수 있는 내용들의 링크를 입력하세요 (여러 링크는 줄바꿈으로 구분)"
          />
        </div>

        <Select
          label="상태"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          options={[
            { value: 'todo', label: '할 일' },
            { value: 'in_progress', label: '진행 중' },
            { value: 'completed', label: '완료' },
          ]}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            {task ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

