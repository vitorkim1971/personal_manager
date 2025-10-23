'use client';

import { useState, useEffect, useCallback } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Memo, CreateMemoInput, UpdateMemoInput } from '@/types';

interface MemoFormProps {
  memo?: Memo;
  onSave: () => void;
  onCancel: () => void;
}

export default function MemoForm({ memo, onSave, onCancel }: MemoFormProps) {
  const [formData, setFormData] = useState<CreateMemoInput>({
    title: memo?.title || '',
    content: memo?.content || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save 함수
  const autoSave = useCallback(async () => {
    if (!formData.title.trim()) return;

    setIsSaving(true);
    try {
      const url = memo ? `/api/memos/${memo.id}` : '/api/memos';
      const method = memo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setLastSaved(new Date());
        if (!memo) {
          // 새 메모가 생성되면 목록 새로고침
          onSave();
        }
      }
    } catch (error) {
      console.error('Error auto-saving memo:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, memo, onSave]);

  // 입력이 변경될 때마다 자동 저장 트리거 (디바운싱)
  useEffect(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      if (formData.title.trim()) {
        autoSave();
      }
    }, 1000); // 1초 후 자동 저장

    setSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [formData.title, formData.content]);

  const handleDelete = async () => {
    if (!memo) return;
    if (!confirm('이 메모를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/memos/${memo.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSave();
      } else {
        alert('메모 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
      alert('메모 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <Input
        label="제목"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        placeholder="메모 제목을 입력하세요"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          내용
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          value={formData.content || ''}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={10}
          placeholder="메모 내용을 입력하세요"
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {isSaving && <span className="text-blue-600">저장 중...</span>}
          {!isSaving && lastSaved && (
            <span>마지막 저장: {lastSaved.toLocaleTimeString('ko-KR')}</span>
          )}
          {!isSaving && !lastSaved && formData.title.trim() && (
            <span className="text-gray-400">자동 저장 대기 중...</span>
          )}
        </div>

        <div className="flex gap-2">
          {memo && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              삭제
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onCancel}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
