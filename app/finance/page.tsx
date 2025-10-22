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
import { formatCurrency, calculateGrowthRate, formatPercentage } from '@/lib/utils';
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
      // 최근 10개 거래만 표시
      setTransactions(data.slice(0, 10));
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
      fetchYearlySummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
    fetchMonthlySummary();
    fetchYearlySummary();
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

  // 성장률 계산
  const monthlyIncomeGrowth = monthlySummary?.prevMonthIncome
    ? calculateGrowthRate(monthlySummary.totalIncome, monthlySummary.prevMonthIncome)
    : 0;

  const monthlyExpenseGrowth = monthlySummary?.prevMonthExpense
    ? calculateGrowthRate(monthlySummary.totalExpense, monthlySummary.prevMonthExpense)
    : 0;

  const yearlyIncomeGrowth = yearlySummary?.prevYearIncome
    ? calculateGrowthRate(yearlySummary.totalIncome, yearlySummary.prevYearIncome)
    : 0;

  const yearlyExpenseGrowth = yearlySummary?.prevYearExpense
    ? calculateGrowthRate(yearlySummary.totalExpense, yearlySummary.prevYearExpense)
    : 0;

  return (
    <MainLayout title="재정 관리">
      <div className="space-y-6">
        {/* 월별/연간 선택 및 액션 버튼 */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">월간:</label>
                <input
                  type="month"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={filter.month}
                  onChange={(e) => setFilter({ ...filter, month: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">연간:</label>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={filter.year}
                  onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    );
                  })}
                </select>
              </div>
              <Button onClick={handleCreateTransaction} variant="primary">
                + 새 거래
              </Button>
            </div>
            <div className="flex items-center gap-2">
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
                <Button variant="ghost" onClick={() => setFilter({ month: filter.month, year: filter.year })}>
                  필터 초기화
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* 연간 재무 요약 */}
        {yearlySummary && (
          <Card>
            <h2 className="text-xl font-bold mb-4">{filter.year}년 연간 재무 현황</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-2">연간 총 수입</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(yearlySummary.totalIncome)}
                </div>
                {yearlySummary.prevYearIncome !== undefined && (
                  <div className="mt-2 text-sm">
                    전년 대비{' '}
                    <span className={yearlyIncomeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {yearlyIncomeGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(yearlyIncomeGrowth))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">연간 총 지출</div>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(yearlySummary.totalExpense)}
                </div>
                {yearlySummary.prevYearExpense !== undefined && (
                  <div className="mt-2 text-sm">
                    전년 대비{' '}
                    <span className={yearlyExpenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {yearlyExpenseGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(yearlyExpenseGrowth))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">연간 순수익</div>
                <div className={`text-3xl font-bold ${yearlySummary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(yearlySummary.netIncome)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  수입 - 지출
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 월별 재무 요약 */}
        {monthlySummary && (
          <Card>
            <h2 className="text-xl font-bold mb-4">{filter.month} 월간 재무 현황</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-2">월간 총 수입</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(monthlySummary.totalIncome)}
                </div>
                {monthlySummary.prevMonthIncome !== undefined && (
                  <div className="mt-2 text-sm">
                    전월 대비{' '}
                    <span className={monthlyIncomeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {monthlyIncomeGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(monthlyIncomeGrowth))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">월간 총 지출</div>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(monthlySummary.totalExpense)}
                </div>
                {monthlySummary.prevMonthExpense !== undefined && (
                  <div className="mt-2 text-sm">
                    전월 대비{' '}
                    <span className={monthlyExpenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {monthlyExpenseGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(monthlyExpenseGrowth))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">월간 순수익</div>
                <div className={`text-3xl font-bold ${monthlySummary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlySummary.netIncome)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  수입 - 지출
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 최근 거래 내역 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 거래 내역</CardTitle>
              <Button variant="ghost" onClick={() => window.location.href = '/finance/transactions'}>
                전체보기 →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </CardContent>
        </Card>

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

