'use client';

import { useState, useEffect } from 'react';
import { DailyTaskWithStatus } from '@/types';

export default function DailyTasksSummary() {
  const [tasks, setTasks] = useState<DailyTaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    
    // 주기적으로 데이터 새로고침 (30초마다)
    const interval = setInterval(fetchTasks, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/daily-tasks?date=${today}&include_completed=true`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch daily tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      fetchTasks();
    };

    const handleTaskUpdate = () => {
      fetchTasks();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('dailyTaskUpdated', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('dailyTaskUpdated', handleTaskUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        로딩 중...
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.is_completed_today).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (totalTasks === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        매일할일을 등록하고<br />
        꾸준히 완료해보세요!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 진행률 바 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">완료율</span>
          <span className="text-sm font-bold text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-center text-sm text-gray-600">
          {completedTasks} / {totalTasks} 완료
        </div>
      </div>

      {/* 간단한 통계 */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{totalTasks}</div>
          <div className="text-xs text-blue-500">총 할일</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">{completedTasks}</div>
          <div className="text-xs text-green-500">완료</div>
        </div>
      </div>

      {/* 연속 완료 일수 */}
      {tasks.some(task => task.streak_count > 0) && (
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <div className="text-sm text-orange-600">
            🔥 최대 연속 완료: {Math.max(...tasks.map(task => task.streak_count))}일
          </div>
        </div>
      )}

      {/* 빠른 액션 */}
      <div className="pt-2">
        <button 
          onClick={() => window.location.href = '/daily-tasks'}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          매일할일 관리
        </button>
      </div>
    </div>
  );
}
