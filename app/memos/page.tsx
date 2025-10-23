'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import MemoForm from '@/components/features/MemoForm';
import MemoList from '@/components/features/MemoList';
import type { Memo } from '@/types';

export default function MemosPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | undefined>(undefined);

  const fetchMemos = async () => {
    try {
      const response = await fetch('/api/memos');
      if (response.ok) {
        const data = await response.json();
        setMemos(data);
      }
    } catch (error) {
      console.error('Error fetching memos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  const handleAddNew = () => {
    setSelectedMemo(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (memo: Memo) => {
    setSelectedMemo(memo);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/memos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMemos();
      } else {
        alert('메모 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
      alert('메모 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSave = () => {
    fetchMemos();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedMemo(undefined);
  };

  if (loading) {
    return (
      <MainLayout title="개인메모">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="개인메모">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">개인메모</h1>
        <Button onClick={handleAddNew}>
          새 메모 추가
        </Button>
      </div>

      <MemoList
        memos={memos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCancel}
          title={selectedMemo ? '메모 수정' : '새 메모 추가'}
          size="lg"
        >
          <MemoForm
            memo={selectedMemo}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </Modal>
      )}
    </MainLayout>
  );
}
