'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TransactionForm from '@/components/features/TransactionForm';
import TransactionList from '@/components/features/TransactionList';
import type { Transaction, TransactionType, TransactionCategory } from '@/types';

export default function FinanceTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<{
    type?: TransactionType;
    category?: TransactionCategory;
    month?: string;
  }>({
    month: '', // 기본값을 빈 문자열로 설정하여 전체 거래 내역 표시
  });

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.category) params.append('category', filter.category);
      if (filter.month) {
        const [year, month] = filter.month.split('-');
        params.append('startDate', `${year}-${month}-01`);
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        params.append('endDate', `${year}-${month}-${lastDay}`);
      }

      const response = await fetch(`/api/transactions?${params.toString()}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('이 거래를 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  return (
    <MainLayout
      title="전체 거래 내역"
      action={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.push('/finance')}>
            ← 돌아가기
          </Button>
          <Button onClick={handleCreateTransaction}>
            + 새 거래
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 필터 */}
        <Card>
          <div className="flex gap-4">
            <input
              type="month"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
              placeholder="전체 기간"
            />

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.type || ''}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as TransactionType || undefined })}
            >
              <option value="">전체 유형</option>
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.category || ''}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as TransactionCategory || undefined })}
            >
              <option value="">전체 카테고리</option>
              <option value="타이탄">타이탄</option>
              <option value="아일라">아일라</option>
              <option value="투자수익">투자수익</option>
              <option value="기타수익">기타수익</option>
              <option value="부모님 생활비">부모님 생활비</option>
              <option value="지연이 카드값">지연이 카드값</option>
              <option value="예현이 용돈">예현이 용돈</option>
              <option value="영주 용돈">영주 용돈</option>
              <option value="중원이 용돈">중원이 용돈</option>
              <option value="차입금 변제">차입금 변제</option>
              <option value="아파트 임대비">아파트 임대비</option>
              <option value="러시아 생활비">러시아 생활비</option>
              <option value="스베따 급여">스베따 급여</option>
            </select>

            {(filter.type || filter.category || filter.month) && (
              <Button variant="ghost" onClick={() => setFilter({ month: '' })}>
                필터 초기화
              </Button>
            )}
          </div>
        </Card>

        {/* 거래 목록 */}
        <TransactionList
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* 거래 생성/수정 모달 */}
      {isModalOpen && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </MainLayout>
  );
}
