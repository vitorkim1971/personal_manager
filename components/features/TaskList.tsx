'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel, formatRelativeTime, isDeadlineApproaching, isOverdue } from '@/lib/utils';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (task: Task) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onToggleComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          작업이 없습니다. 새 작업을 추가해보세요.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} padding={false}>
          <div className="p-4 flex items-start gap-4">
            {/* 체크박스 */}
            <input
              type="checkbox"
              checked={task.status === 'completed'}
              onChange={() => onToggleComplete(task)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            {/* 작업 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className={cn(
                    'text-lg font-medium',
                    task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                  )}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                    수정
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(task.id)}>
                    삭제
                  </Button>
                </div>
              </div>

              {/* 메타데이터 */}
              <div className="mt-3 flex flex-wrap gap-2">
                {/* 우선순위 */}
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getPriorityColor(task.priority)
                )}>
                  {getPriorityLabel(task.priority)}
                </span>

                {/* 상태 */}
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatusColor(task.status)
                )}>
                  {getStatusLabel(task.status)}
                </span>

                {/* 카테고리 */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {task.category}
                </span>

                {/* 마감일 */}
                {task.due_date && (
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    isOverdue(task.due_date) && task.status !== 'completed'
                      ? 'bg-red-100 text-red-800'
                      : isDeadlineApproaching(task.due_date) && task.status !== 'completed'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  )}>
                    {formatRelativeTime(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

