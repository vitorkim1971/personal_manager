'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  income: number;
  expense: number;
}

export default function IncomeExpenseChart() {
  const [data, setData] = useState<TrendData[]>([]);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await fetch('/api/stats?type=trends');
      const trendsData = await response.json();
      setData(trendsData);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">데이터가 없습니다.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          name="수입"
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981' }}
        />
        <Line 
          type="monotone" 
          dataKey="expense" 
          name="지출"
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ fill: '#ef4444' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

