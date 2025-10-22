'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { Budget, CreateBudgetInput } from '@/types';

interface BudgetFormProps {
  budget?: Budget;
  type: 'personal' | 'company';
  onClose: () => void;
  onSuccess: () => void;
}

export default function BudgetForm({ budget, type, onClose, onSuccess }: BudgetFormProps) {
  const [formData, setFormData] = useState<CreateBudgetInput>({
    type: type,
    category: '',
    budgeted_amount: 0,
    spent_amount: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    description: '',
    is_active: 1,
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        type: budget.type,
        category: budget.category,
        budgeted_amount: budget.budgeted_amount,
        spent_amount: budget.spent_amount,
        year: budget.year,
        month: budget.month,
        description: budget.description,
        is_active: budget.is_active,
      });
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = budget 
        ? `/api/budgets/${budget.id}` 
        : '/api/budgets';
      const method = budget ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Budget saved:', result);
        onSuccess();
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert(`예산 ${budget ? '수정' : '생성'} 실패: ${error.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('예산 저장 중 오류가 발생했습니다.');
    }
  };

  const personalCategories = [
    '식비', '교통비', '의료비', '쇼핑', '여가', '교육', '통신비', '주거비', '기타'
  ];

  const companyCategories = [
    '인건비', '마케팅', '운영비', '장비구매', '임대료', '전기세', '인터넷비', '기타'
  ];

  const categories = type === 'personal' ? personalCategories : companyCategories;

  const months = [
    { value: 1, label: '1월' },
    { value: 2, label: '2월' },
    { value: 3, label: '3월' },
    { value: 4, label: '4월' },
    { value: 5, label: '5월' },
    { value: 6, label: '6월' },
    { value: 7, label: '7월' },
    { value: 8, label: '8월' },
    { value: 9, label: '9월' },
    { value: 10, label: '10월' },
    { value: 11, label: '11월' },
    { value: 12, label: '12월' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year, label: `${year}년` };
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={budget ? '예산 수정' : '새 예산 추가'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="카테고리"
          value={formData.category || ''}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={categories.map(cat => ({ value: cat, label: cat }))}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="예산 금액"
            type="number"
            value={formData.budgeted_amount || ''}
            onChange={(e) => setFormData({ ...formData, budgeted_amount: parseFloat(e.target.value) || 0 })}
            required
            placeholder="0"
            step="0.01"
          />

          <Input
            label="지출 금액"
            type="number"
            value={formData.spent_amount || ''}
            onChange={(e) => setFormData({ ...formData, spent_amount: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="년도"
            value={formData.year || ''}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            options={years}
            required
          />

          <Select
            label="월"
            value={formData.month || ''}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            options={months}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="예산에 대한 추가 설명"
          />
        </div>

        <Select
          label="상태"
          value={formData.is_active !== undefined ? (formData.is_active ? '1' : '0') : '1'}
          onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
          options={[
            { value: '1', label: '활성' },
            { value: '0', label: '비활성' },
          ]}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">
            {budget ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
