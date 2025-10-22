'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Task } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function Calendar({ tasks, onTaskClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasksByDate, setTasksByDate] = useState<Map<string, Task[]>>(new Map());

  useEffect(() => {
    // 날짜별로 작업 그룹화
    const groupedTasks = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = format(new Date(task.due_date), 'yyyy-MM-dd');
        if (!groupedTasks.has(dateKey)) {
          groupedTasks.set(dateKey, []);
        }
        groupedTasks.get(dateKey)!.push(task);
      }
    });
    
    setTasksByDate(groupedTasks);
  }, [tasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTaskStatusColor = (task: Task) => {
    if (task.status === 'completed') return 'bg-green-100 text-green-800';
    if (task.status === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (isPast(new Date(task.due_date!)) && task.status !== 'completed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getDayClasses = (day: Date) => {
    const baseClasses = 'h-8 w-8 flex items-center justify-center text-sm rounded-full';
    
    if (!isSameMonth(day, currentDate)) {
      return `${baseClasses} text-gray-300`;
    }
    
    if (isToday(day)) {
      return `${baseClasses} bg-blue-500 text-white font-bold`;
    }
    
    return `${baseClasses} hover:bg-gray-100`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  return (
    <Card>
      <div className="p-4">
        {/* 달력 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
          >
            ←
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('next')}
          >
            →
          </Button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(dateKey) || [];
            
            return (
              <div key={dateKey} className="min-h-[60px] border border-gray-100 p-1">
                <div className={getDayClasses(day)}>
                  {format(day, 'd')}
                </div>
                
                {/* 해당 날짜의 작업들 */}
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs px-1 py-0.5 rounded cursor-pointer truncate ${getTaskStatusColor(task)}`}
                      onClick={() => onTaskClick?.(task)}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayTasks.length - 2}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>완료</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>진행중</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>할일</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span>지연</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
