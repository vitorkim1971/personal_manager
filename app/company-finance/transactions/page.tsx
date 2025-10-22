'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CompanyTransactionForm from '@/components/features/CompanyTransactionForm';
import type { CompanyTransaction, CompanyAccount } from '@/types';
import { formatCurrency, formatDateKorean } from '@/lib/utils';
import { format } from 'date-fns';

export default function CompanyTransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<CompanyTransaction[]>([]);
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CompanyTransaction | null>(null);
  const [filter, setFilter] = useState({
    accountId: '',
    type: '',
    month: '', // 기본값을 빈 문자열로 변경하여 전체 거래 내역 표시
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

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
      const params = new URLSearchParams();
      if (filter.accountId) params.append('account_id', filter.accountId);
      if (filter.type) params.append('type', filter.type);
      if (filter.month) {
        const [year, month] = filter.month.split('-');
        params.append('startDate', `${year}-${month}-01`);
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        params.append('endDate', `${year}-${month}-${lastDay}`);
      }

      const response = await fetch(`/api/company-transactions?${params.toString()}`);
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

  const handleEditTransaction = (transaction: CompanyTransaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('이 거래를 삭제하시겠습니까?')) return;

    try {
      await fetch(`/api/company-transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
    fetchAccounts();
  };

  const getAccountName = (accountId: number) => {
    return accounts.find(acc => acc.id === accountId)?.account_name || '-';
  };

  const getTypeColor = (type: string) => {
    if (type === 'income') return 'text-green-600';
    if (type === 'expense') return 'text-red-600';
    return 'text-blue-600';
  };

  const getTypeLabel = (type: string) => {
    if (type === 'income') return '수입';
    if (type === 'expense') return '지출';
    return '이체';
  };

  return (
    <MainLayout
      title="회사 거래 내역"
      action={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.push('/company-finance')}>
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
              value={filter.accountId}
              onChange={(e) => setFilter({ ...filter, accountId: e.target.value })}
            >
              <option value="">전체 계좌</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.account_name}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">전체 유형</option>
              <option value="income">수입</option>
              <option value="expense">지출</option>
              <option value="transfer">이체</option>
            </select>

            {(filter.accountId || filter.type || filter.month) && (
              <Button variant="ghost" onClick={() => setFilter({ accountId: '', type: '', month: '' })}>
                필터 초기화
              </Button>
            )}
          </div>
        </Card>

        {/* 거래 목록 */}
        <Card padding={false}>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              거래 내역이 없습니다. 새 거래를 추가해보세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">계좌</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">거래처</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateKorean(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getAccountName(transaction.account_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getTypeColor(transaction.type)}`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.vendor_customer || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {transaction.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditTransaction(transaction)}>
                            수정
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteTransaction(transaction.id)}>
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* 거래 생성/수정 모달 */}
      {isModalOpen && accounts.length > 0 && (
        <CompanyTransactionForm
          transaction={editingTransaction}
          accounts={accounts}
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

