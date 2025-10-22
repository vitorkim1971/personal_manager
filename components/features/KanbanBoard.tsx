'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Task, Project } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface KanbanBoardProps {
  tasks: Task[];
  projects?: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (taskId: number, newStatus: string) => void;
}

interface TaskCardProps {
  task: Task;
  projectName?: string;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskCard = ({ task, projectName, onEdit, onDelete }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'in_progress': return 'bg-blue-50 border-blue-200';
      case 'overdue': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return '할일';
      case 'in_progress': return '진행중';
      case 'overdue': return '지연';
      case 'completed': return '완료';
      default: return status;
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg border-l-4 border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getPriorityColor(task.priority)} ${getStatusColor(task.status)}`}
      onClick={() => onEdit(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
          {task.title}
        </h3>
        <div className="flex gap-1 ml-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="h-6 w-6 p-0"
          >
            ✏️
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="h-6 w-6 p-0 text-red-600"
          >
            🗑️
          </Button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-3">
          {task.description}
        </p>
      )}
      
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
          {getPriorityLabel(task.priority)}
        </span>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
          {task.category}
        </span>
        {projectName && (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
            {projectName}
          </span>
        )}
      </div>
      
      {task.due_date && (
        <div className="text-xs text-gray-500">
          📅 {format(new Date(task.due_date), 'MM/dd', { locale: ko })}
        </div>
      )}
      
      {task.reference_links && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">참고 링크:</div>
          <div className="text-xs text-blue-600 line-clamp-2">
            {task.reference_links.split('\n').slice(0, 2).map((link, index) => (
              <div key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {task.attached_files && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">첨부파일:</div>
          <div className="text-xs text-green-600">
            {task.attached_files.split(',').slice(0, 2).map((file, index) => (
              <div key={index}>
                📎 {file.length > 20 ? `${file.substring(0, 20)}...` : file}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function KanbanBoard({ tasks, projects = [], onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const getProjectName = (projectId?: number) => {
    if (!projectId) return undefined;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  };

  const columns = [
    { id: 'todo', title: '할일', color: 'bg-gray-100' },
    { id: 'in_progress', title: '진행중', color: 'bg-blue-100' },
    { id: 'overdue', title: '지연', color: 'bg-red-100' },
    { id: 'completed', title: '완료', color: 'bg-green-100' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      onStatusChange(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div key={column.id} className="flex flex-col">
            <div className={`${column.color} p-3 rounded-t-lg border-b`}>
              <h2 className="font-semibold text-sm text-gray-800">
                {column.title}
                <span className="ml-2 text-xs bg-white px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </h2>
            </div>
            
            <div 
              className={`flex-1 min-h-[400px] p-3 space-y-3 bg-gray-50 rounded-b-lg border-2 border-dashed border-gray-200 ${
                draggedTask ? 'border-blue-300 bg-blue-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {columnTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="transition-transform hover:scale-105"
                >
                  <TaskCard
                    task={task}
                    projectName={getProjectName(task.project_id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">
                  작업이 없습니다
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
