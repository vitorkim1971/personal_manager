'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { Transaction, CreateTransactionInput, TransactionType, TransactionCategory, PaymentMethod } from '@/types';
import { format } from 'date-fns';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

const incomeCategories = ['타이탄', '아일라', '투자수익', '기타수익'];
const expenseCategories = [
  '부모님 생활비',
  '지연이 카드값',
  '예현이 용돈',
  '영주 용돈',
  '중원이 용돈',
  '차입금 변제',
  '아파트 임대비',
  '러시아 생활비',
  '스베따 급여',
  '식비',
  '교통비',
  '주거비',
  '쇼핑',
  '의료비',
  '교육비',
  '기타'
];

export default function TransactionForm({ transaction, onClose, onSuccess }: TransactionFormProps) {
  const [formData, setFormData] = useState<CreateTransactionInput>({
    type: 'expense',
    amount: 0,
    category: '식비',
    date: format(new Date(), 'yyyy-MM-dd'),
    memo: '',
    payment_method: '카드',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        memo: transaction.memo || '',
        payment_method: transaction.payment_method,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions';
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
          label="거래 유형"
          value={formData.type}
          onChange={(e) => {
            const newType = e.target.value as TransactionType;
            setFormData({ 
              ...formData, 
              type: newType,
              category: newType === 'income' ? '기타' : '식비'
            });
          }}
          options={[
            { value: 'income', label: '수입' },
            { value: 'expense', label: '지출' },
          ]}
        />

        <Input
          label="금액"
          type="number"
          value={formData.amount || ''}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = value === '' ? 0 : parseFloat(value);
            setFormData({ ...formData, amount: isNaN(numValue) ? 0 : numValue });
          }}
          required
          min="0"
          step="1"
        />

        <Select
          label="카테고리"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
          options={categories.map(cat => ({ value: cat, label: cat }))}
        />

        <Input
          label="날짜"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Select
          label="결제 수단"
          value={formData.payment_method || '현금'}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as PaymentMethod })}
          options={[
            { value: '현금', label: '현금' },
            { value: 'USDT', label: 'USDT' },
            { value: '계좌이체', label: '계좌이체' },
            { value: '카드', label: '카드' },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
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

