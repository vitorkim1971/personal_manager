'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { CompanyTransaction, CreateCompanyTransactionInput, CompanyAccount } from '@/types';
import { format } from 'date-fns';

interface CompanyTransactionFormProps {
  transaction?: CompanyTransaction | null;
  accounts: CompanyAccount[];
  onClose: () => void;
  onSuccess: () => void;
}

const incomeCategories = ['타이탄', '아일라', '투자수익', '컨설팅수익', '기타수익'];
const expenseCategories = [
  '인건비',
  '사무실임대료',
  '마케팅비용',
  '개발비용',
  '법무회계비용',
  '여비교통비',
  '통신비',
  '접대비',
  '기타지출'
];

export default function CompanyTransactionForm({ transaction, accounts, onClose, onSuccess }: CompanyTransactionFormProps) {
  const defaultAccountId = accounts.length > 0 ? accounts[0].id : 0;
  
  const [formData, setFormData] = useState<CreateCompanyTransactionInput>({
    account_id: defaultAccountId,
    type: 'expense',
    amount: 0,
    category: '인건비',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    payment_method: '계좌이체',
    reference_number: '',
    vendor_customer: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        account_id: transaction.account_id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        description: transaction.description,
        payment_method: transaction.payment_method,
        reference_number: transaction.reference_number,
        vendor_customer: transaction.vendor_customer,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = transaction ? `/api/company-transactions/${transaction.id}` : '/api/company-transactions';
      const method = transaction ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={transaction ? '거래 수정' : '새 거래 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="계좌"
          value={formData.account_id.toString()}
          onChange={(e) => setFormData({ ...formData, account_id: parseInt(e.target.value) })}
          options={accounts.map(acc => ({ value: acc.id.toString(), label: acc.account_name }))}
        />

        <Select
          label="거래 유형"
          value={formData.type}
          onChange={(e) => {
            const newType = e.target.value as any;
            setFormData({
              ...formData,
              type: newType,
              category: newType === 'income' ? '타이탄' : '인건비'
            });
          }}
          options={[
            { value: 'income', label: '수입' },
            { value: 'expense', label: '지출' },
            { value: 'transfer', label: '이체' },
          ]}
        />

        <Input
          label="금액"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
          required
          min="0"
          step="0.01"
        />

        <Select
          label="카테고리"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={categories.map(cat => ({ value: cat, label: cat }))}
        />

        <Input
          label="날짜"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Input
          label="거래처/고객"
          type="text"
          value={formData.vendor_customer}
          onChange={(e) => setFormData({ ...formData, vendor_customer: e.target.value })}
        />

        <Select
          label="결제 수단"
          value={formData.payment_method || '계좌이체'}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          options={[
            { value: '계좌이체', label: '계좌이체' },
            { value: '현금', label: '현금' },
            { value: 'USDT', label: 'USDT' },
            { value: '카드', label: '카드' },
            { value: '수표', label: '수표' },
          ]}
        />

        <Input
          label="참조번호"
          type="text"
          value={formData.reference_number}
          onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
          placeholder="송금번호, 증빙번호 등"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            {transaction ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

