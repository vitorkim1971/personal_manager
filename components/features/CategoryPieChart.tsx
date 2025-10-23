'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { CategorySummary } from '@/types';

interface CategoryPieChartProps {
  data: CategorySummary[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444'];

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">데이터가 없습니다.</div>;
  }

  const chartData = data.map(item => ({
    name: item.category,
    value: item.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

