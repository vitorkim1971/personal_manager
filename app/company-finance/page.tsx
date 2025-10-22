'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CompanyAccountList from '@/components/features/CompanyAccountList';
import CompanyAccountForm from '@/components/features/CompanyAccountForm';
import CompanyTransactionForm from '@/components/features/CompanyTransactionForm';
import BudgetForm from '@/components/features/BudgetForm';
import BudgetList from '@/components/features/BudgetList';
import type { CompanyAccount, CompanyFinanceSummary, CompanyTransaction, Budget } from '@/types';
import { formatCurrency, calculateGrowthRate, formatPercentage, formatDateKorean } from '@/lib/utils';
import { format } from 'date-fns';

export default function CompanyFinancePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [transactions, setTransactions] = useState<CompanyTransaction[]>([]);
  const [summary, setSummary] = useState<CompanyFinanceSummary | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CompanyAccount | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<CompanyTransaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchSummary();
    fetchBudgets();
  }, [selectedMonth]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/company-accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;
      
      const response = await fetch(`/api/company-transactions?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      setTransactions(data.slice(0, 10)); // 최근 10개만
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/company-stats?type=monthly&month=${selectedMonth}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: CompanyAccount) => {
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('이 계좌를 삭제하시겠습니까? 관련된 거래 내역도 삭제됩니다.')) return;

    try {
      await fetch(`/api/company-accounts/${id}`, { method: 'DELETE' });
      fetchAccounts();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: CompanyTransaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('이 거래를 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/company-transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
      fetchAccounts();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleAccountFormSuccess = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
    fetchAccounts();
    fetchSummary();
  };

  const handleTransactionFormSuccess = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
    fetchAccounts();
    fetchSummary();
  };

  const fetchBudgets = async () => {
    try {
      const params = new URLSearchParams();
      params.append('type', 'company');
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
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

  const incomeGrowth = summary?.prevMonthIncome
    ? calculateGrowthRate(summary.totalIncome, summary.prevMonthIncome)
    : 0;

  const expenseGrowth = summary?.prevMonthExpense
    ? calculateGrowthRate(summary.totalExpense, summary.prevMonthExpense)
    : 0;

  const getAccountName = (accountId: number) => {
    return accounts.find(acc => acc.id === accountId)?.account_name || '-';
  };

  const getTypeColor = (type: string) => {
    if (type === 'income') return 'text-green-600';
    if (type === 'expense') return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <MainLayout title="회사 재무관리">
      <div className="space-y-6">
        {/* 월별 선택 및 액션 버튼 */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="month"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <Button onClick={handleCreateTransaction} variant="primary">
                + 수입/지출 추가
              </Button>
            </div>
            <Button variant="ghost" onClick={() => router.push('/company-finance/transactions')}>
              전체 거래 내역 →
            </Button>
          </div>
        </Card>

        {/* 월별 재무 요약 */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div>
                <div className="text-sm text-gray-500 mb-2">총 수입</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </div>
                {summary.prevMonthIncome !== undefined && (
                  <div className="mt-2 text-sm">
                    전월 대비{' '}
                    <span className={incomeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {incomeGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(incomeGrowth))}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div>
                <div className="text-sm text-gray-500 mb-2">총 지출</div>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpense)}
                </div>
                {summary.prevMonthExpense !== undefined && (
                  <div className="mt-2 text-sm">
                    전월 대비{' '}
                    <span className={expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {expenseGrowth >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(expenseGrowth))}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div>
                <div className="text-sm text-gray-500 mb-2">순손익</div>
                <div className={`text-3xl font-bold ${summary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netIncome)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  수입 - 지출
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 최근 거래 내역 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">최근 거래 내역</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              거래 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${getTypeColor(transaction.type)}`}>
                        {transaction.type === 'income' ? '수입' : transaction.type === 'expense' ? '지출' : '이체'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{transaction.category}</span>
                      {transaction.vendor_customer && (
                        <span className="text-sm text-gray-500">· {transaction.vendor_customer}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{getAccountName(transaction.account_id)}</span>
                      <span>·</span>
                      <span>{formatDateKorean(transaction.date)}</span>
                      {transaction.description && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-xs">{transaction.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-bold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditTransaction(transaction)}>
                        수정
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteTransaction(transaction.id)}>
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 계좌 관리 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">계좌 관리</h2>
            <Button onClick={handleCreateAccount}>
              + 새 계좌
            </Button>
          </div>
          <CompanyAccountList
            accounts={accounts}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
          />
        </div>

        {/* 예산 관리 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">예산 관리</h2>
            <Button onClick={handleCreateBudget}>
              + 새 예산
            </Button>
          </div>
          <BudgetList
            budgets={budgets}
            onEdit={handleEditBudget}
            onDelete={handleDeleteBudget}
          />
        </div>
      </div>

      {/* 계좌 생성/수정 모달 */}
      {isAccountModalOpen && (
        <CompanyAccountForm
          account={editingAccount}
          onClose={() => {
            setIsAccountModalOpen(false);
            setEditingAccount(null);
          }}
          onSuccess={handleAccountFormSuccess}
        />
      )}

      {/* 거래 생성/수정 모달 */}
      {isTransactionModalOpen && (
        <>
          {accounts.length > 0 ? (
            <CompanyTransactionForm
              transaction={editingTransaction}
              accounts={accounts}
              onClose={() => {
                setIsTransactionModalOpen(false);
                setEditingTransaction(null);
              }}
              onSuccess={handleTransactionFormSuccess}
            />
          ) : (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md">
                <h3 className="text-lg font-bold mb-4">계좌가 없습니다</h3>
                <p className="text-gray-600 mb-4">
                  거래를 추가하려면 먼저 계좌를 생성해야 합니다.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setIsTransactionModalOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={() => {
                    setIsTransactionModalOpen(false);
                    handleCreateAccount();
                  }}>
                    계좌 생성하기
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 예산 생성/수정 모달 */}
      {isBudgetModalOpen && (
        <BudgetForm
          budget={editingBudget}
          type="company"
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

