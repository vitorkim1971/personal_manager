'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { Budget } from '@/types';

interface BudgetListProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: number) => void;
}

export default function BudgetList({ budgets, onEdit, onDelete }: BudgetListProps) {
  if (!Array.isArray(budgets) || budgets.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">등록된 예산이 없습니다.</p>
          <p className="text-sm text-gray-400">새 예산을 추가해보세요.</p>
        </div>
      </Card>
    );
  }

  const getRemainingAmount = (budget: Budget) => {
    return budget.budgeted_amount - budget.spent_amount;
  };

  const getUsagePercentage = (budget: Budget) => {
    if (budget.budgeted_amount === 0) return 0;
    return Math.min((budget.spent_amount / budget.budgeted_amount) * 100, 100);
  };

  const getStatusColor = (budget: Budget) => {
    const percentage = getUsagePercentage(budget);
    if (percentage >= 100) return 'text-red-600 bg-red-100';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const remaining = getRemainingAmount(budget);
        const percentage = getUsagePercentage(budget);
        const statusColor = getStatusColor(budget);

        return (
          <Card key={budget.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{budget.category || '기타'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {budget.year}년 {budget.month}월
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                      {percentage.toFixed(1)}% 사용
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${budget.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {budget.is_active ? '활성' : '비활성'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">예산:</span>
                  <span className="font-medium">{formatCurrency(budget.budgeted_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">지출:</span>
                  <span className="font-medium">{formatCurrency(budget.spent_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-700">잔여:</span>
                  <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentage >= 100 ? 'bg-red-500' : 
                    percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {budget.description && (
                <p className="text-sm text-gray-600 mt-2">{budget.description}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(budget)}
                >
                  수정
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('이 예산을 삭제하시겠습니까?')) {
                      onDelete(budget.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
