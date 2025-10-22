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

  const companyCategories = [
    '인건비',
    '사무실임대료',
    '마케팅비용',
    '개발비용',
    '법무회계비용',
    '여비교통비',
    '통신비',
    '접대비',
    '서버 및 SaaS',
    '기타지출'
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
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseFloat(value);
              setFormData({ ...formData, budgeted_amount: isNaN(numValue) ? 0 : numValue });
            }}
            required
            placeholder="0"
            step="0.01"
          />

          <Input
            label="지출 금액"
            type="number"
            value={formData.spent_amount || ''}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? 0 : parseFloat(value);
              setFormData({ ...formData, spent_amount: isNaN(numValue) ? 0 : numValue });
            }}
            placeholder="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="년도"
            value={formData.year ? formData.year.toString() : ''}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
            options={years}
            required
          />

          <Select
            label="월"
            value={formData.month ? formData.month.toString() : ''}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) || new Date().getMonth() + 1 })}
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
