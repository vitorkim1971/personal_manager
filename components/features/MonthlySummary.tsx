'use client';

import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, calculateGrowthRate, formatPercentage } from '@/lib/utils';
import type { MonthlySummary as MonthlySummaryType } from '@/types';

interface MonthlySummaryProps {
  summary: MonthlySummaryType;
}

export default function MonthlySummary({ summary }: MonthlySummaryProps) {
  const incomeGrowth = summary.prevMonthIncome
    ? calculateGrowthRate(summary.totalIncome, summary.prevMonthIncome)
    : 0;
  
  const expenseGrowth = summary.prevMonthExpense
    ? calculateGrowthRate(summary.totalExpense, summary.prevMonthExpense)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 총 수입 */}
      <Card>
        <CardHeader>
          <CardTitle>총 수입</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* 총 지출 */}
      <Card>
        <CardHeader>
          <CardTitle>총 지출</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* 순수익 */}
      <Card>
        <CardHeader>
          <CardTitle>순수익</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${summary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netIncome)}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            수입 - 지출
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

