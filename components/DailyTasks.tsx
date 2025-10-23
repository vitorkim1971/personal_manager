'use client';

import { useEffect, useState } from 'react';
import { DailyTaskWithStatus, CreateDailyTaskInput, Priority } from '@/types';

export default function DailyTasks() {
  const [tasks, setTasks] = useState<DailyTaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTaskWithStatus | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium' as Priority,
    start_time: '',
    end_time: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/daily-tasks?date=${selectedDate}&include_completed=true`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch daily tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTask ? `/api/daily-tasks/${editingTask.id}` : '/api/daily-tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      console.log('Submitting form data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        await fetchTasks();
        setShowModal(false);
        resetForm();
        
        // 커스텀 이벤트 발생 (대시보드 업데이트용)
        window.dispatchEvent(new CustomEvent('dailyTaskUpdated'));
      } else {
        const error = await response.json();
        console.error('API Error:', error);
        alert('저장에 실패했습니다: ' + (error.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to save daily task:', error);
      alert('저장 중 오류가 발생했습니다: ' + error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/daily-tasks/${id}`, { method: 'DELETE' });
      await fetchTasks();
      
      // 커스텀 이벤트 발생 (대시보드 업데이트용)
      window.dispatchEvent(new CustomEvent('dailyTaskUpdated'));
    } catch (error) {
      console.error('Failed to delete daily task:', error);
    }
  };

  const handleEdit = (task: DailyTaskWithStatus) => {
    console.log('Editing task:', task);
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      start_time: task.start_time || '',
      end_time: task.end_time || '',
    });
    setShowModal(true);
  };

  const handleToggleComplete = async (task: DailyTaskWithStatus) => {
    try {
      if (task.is_completed_today) {
        // 완료 취소
        await fetch(`/api/daily-tasks/complete?daily_task_id=${task.id}&completion_date=${selectedDate}`, {
          method: 'DELETE',
        });
      } else {
        // 완료 처리
        await fetch('/api/daily-tasks/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            daily_task_id: task.id,
            completion_date: selectedDate,
          }),
        });
      }
      await fetchTasks();
      
      // 커스텀 이벤트 발생 (대시보드 업데이트용)
      window.dispatchEvent(new CustomEvent('dailyTaskUpdated'));
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      start_time: '',
      end_time: '',
    });
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health': return 'bg-green-100 text-green-800';
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'learning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">로딩중...</div>;
  }

  const completedCount = tasks.filter(task => task.is_completed_today).length;
  const totalCount = tasks.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">매일할일</h2>
          <p className="text-sm text-gray-600">
            {selectedDate} - 완료: {completedCount}/{totalCount}
          </p>
        </div>
        <div className="flex space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900"
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + 새 일정
          </button>
        </div>
      </div>

      {/* 진행률 바 */}
      {totalCount > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`bg-white rounded-lg shadow p-4 border-l-4 ${
              task.is_completed_today ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    task.is_completed_today 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {task.is_completed_today && '✓'}
                </button>
                <div>
                  <h3 className={`font-semibold ${task.is_completed_today ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-sm ${task.is_completed_today ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                  {(task.start_time || task.end_time) && (
                    <p className={`text-xs ${task.is_completed_today ? 'text-gray-400' : 'text-gray-500'}`}>
                      {task.start_time && task.end_time 
                        ? `${task.start_time} - ${task.end_time}`
                        : task.start_time || task.end_time
                      }
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '중간' : '낮음'}
                </span>
                {task.streak_count > 0 && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    🔥 {task.streak_count}일
                  </span>
                )}
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          아직 등록된 매일해야 할 일이 없습니다.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingTask ? '일정 수정' : '새 일정'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  >
                    <option value="general">일반</option>
                    <option value="health">건강</option>
                    <option value="work">업무</option>
                    <option value="personal">개인</option>
                    <option value="learning">학습</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  >
                    <option value="high">높음</option>
                    <option value="medium">중간</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작시간</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">마침시간</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
