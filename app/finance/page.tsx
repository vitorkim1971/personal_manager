'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TransactionForm from '@/components/features/TransactionForm';
import TransactionList from '@/components/features/TransactionList';
import MonthlySummary from '@/components/features/MonthlySummary';
import BudgetForm from '@/components/features/BudgetForm';
import BudgetList from '@/components/features/BudgetList';
import type { Transaction, TransactionType, TransactionCategory, MonthlySummary as MonthlySummaryType, Budget } from '@/types';
import { format } from 'date-fns';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryType | null>(null);
  const [yearlySummary, setYearlySummary] = useState<any>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [filter, setFilter] = useState<{
    type?: TransactionType;
    category?: TransactionCategory;
    month?: string;
    year?: string;
  }>({
    month: format(new Date(), 'yyyy-MM'),
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchTransactions();
    fetchMonthlySummary();
    fetchYearlySummary();
    fetchBudgets();
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

  const fetchMonthlySummary = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.month) params.append('month', filter.month);

      const response = await fetch(`/api/stats?type=monthly&${params.toString()}`);
      const data = await response.json();
      setMonthlySummary(data);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    }
  };

  const fetchYearlySummary = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.year) params.append('year', filter.year);

      const response = await fetch(`/api/stats?type=yearly&${params.toString()}`);
      const data = await response.json();
      setYearlySummary(data);
    } catch (error) {
      console.error('Error fetching yearly summary:', error);
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
      fetchMonthlySummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
    fetchMonthlySummary();
  };

  const fetchBudgets = async () => {
    try {
      const params = new URLSearchParams();
      params.append('type', 'personal');
      if (filter.month) {
        const [year, month] = filter.month.split('-');
        params.append('year', year);
        params.append('month', month);
      }

      const response = await fetch(`/api/budgets?${params.toString()}`);
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = async (id: number) => {
    if (!confirm('이 예산을 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleBudgetFormSuccess = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
    fetchBudgets();
  };

  return (
    <MainLayout
      title="재정 관리"
      action={
        <Button onClick={handleCreateTransaction}>
          + 새 거래
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 월별 요약 */}
        {monthlySummary && <MonthlySummary summary={monthlySummary} />}

        {/* 필터 */}
        <Card>
          <div className="flex gap-4">
            <input
              type="month"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
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

            {(filter.type || filter.category) && (
              <Button variant="ghost" onClick={() => setFilter({ month: filter.month })}>
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

        {/* 예산 관리 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>예산 관리</CardTitle>
              <Button onClick={handleCreateBudget}>
                + 새 예산
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <BudgetList
              budgets={budgets}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          </CardContent>
        </Card>
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

      {/* 예산 생성/수정 모달 */}
      {isBudgetModalOpen && (
        <BudgetForm
          budget={editingBudget}
          type="personal"
          onClose={() => {
            setIsBudgetModalOpen(false);
            setEditingBudget(null);
          }}
          onSuccess={handleBudgetFormSuccess}
        />
      )}
    </MainLayout>
  );
}

