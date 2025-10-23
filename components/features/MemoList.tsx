'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Memo } from '@/types';

interface MemoListProps {
  memos: Memo[];
  onEdit: (memo: Memo) => void;
  onDelete: (id: number) => void;
}

export default function MemoList({ memos, onEdit, onDelete }: MemoListProps) {
  if (!Array.isArray(memos) || memos.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">등록된 메모가 없습니다.</p>
          <p className="text-sm text-gray-400">새 메모를 추가해보세요.</p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {memos.map((memo) => (
        <Card key={memo.id}>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{memo.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    생성: {formatDate(memo.created_at)}
                  </span>
                  {memo.updated_at !== memo.created_at && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-blue-600">
                        수정: {formatDate(memo.updated_at)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {memo.content && (
              <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                {memo.content}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(memo)}
              >
                수정
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('이 메모를 삭제하시겠습니까?')) {
                    onDelete(memo.id);
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                삭제
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
