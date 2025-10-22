'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CompanyAccountList from '@/components/features/CompanyAccountList';
import CompanyAccountForm from '@/components/features/CompanyAccountForm';
import type { CompanyAccount, CompanyFinanceSummary } from '@/types';
import { formatCurrency, calculateGrowthRate, formatPercentage } from '@/lib/utils';
import { format } from 'date-fns';

export default function CompanyFinancePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [summary, setSummary] = useState<CompanyFinanceSummary | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CompanyAccount | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    fetchAccounts();
    fetchSummary();
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

  const handleFormSuccess = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
    fetchAccounts();
    fetchSummary();
  };

  const incomeGrowth = summary?.prevMonthIncome
    ? calculateGrowthRate(summary.totalIncome, summary.prevMonthIncome)
    : 0;

  const expenseGrowth = summary?.prevMonthExpense
    ? calculateGrowthRate(summary.totalExpense, summary.prevMonthExpense)
    : 0;

  return (
    <MainLayout title="회사 재무관리">
      <div className="space-y-6">
        {/* 월별 선택 */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="month"
                className="px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <Button onClick={() => router.push('/company-finance/transactions')}>
                거래 내역 보기
              </Button>
            </div>
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
      </div>

      {/* 계좌 생성/수정 모달 */}
      {isAccountModalOpen && (
        <CompanyAccountForm
          account={editingAccount}
          onClose={() => {
            setIsAccountModalOpen(false);
            setEditingAccount(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </MainLayout>
  );
}

