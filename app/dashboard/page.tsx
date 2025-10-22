'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { TodayTaskStats, MonthlySummary, Transaction, CategorySummary } from '@/types';
import IncomeExpenseChart from '@/components/features/IncomeExpenseChart';
import CategoryPieChart from '@/components/features/CategoryPieChart';

export default function DashboardPage() {
  const [todayStats, setTodayStats] = useState<TodayTaskStats | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategorySummary[]>([]);
  const [activeProjects, setActiveProjects] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 오늘의 할 일
      const todayRes = await fetch('/api/stats?type=today');
      const todayData = await todayRes.json();
      setTodayStats(todayData);

      // 월별 요약
      const monthlyRes = await fetch('/api/stats?type=monthly');
      const monthlyData = await monthlyRes.json();
      setMonthlySummary(monthlyData);

      // 최근 거래 (5건)
      const transactionsRes = await fetch('/api/transactions');
      const transactionsData = await transactionsRes.json();
      setRecentTransactions(transactionsData.slice(0, 5));

      // 카테고리별 통계
      const categoryRes = await fetch('/api/stats?type=categories');
      const categoryData = await categoryRes.json();
      setCategoryStats(categoryData);

      // 활성 프로젝트 수
      const projectsRes = await fetch('/api/projects?status=in_progress');
      const projectsData = await projectsRes.json();
      setActiveProjects(projectsData.length);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <MainLayout title="대시보드">
      <div className="space-y-6">
        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 오늘의 할 일 */}
          <Card>
            <CardHeader>
              <CardTitle>오늘의 할 일</CardTitle>
            </CardHeader>
            <CardContent>
              {todayStats && (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {todayStats.completed}/{todayStats.total}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    완료 {todayStats.completed}개 · 진행중 {todayStats.inProgress}개
                  </div>
                  {todayStats.overdue > 0 && (
                    <div className="mt-1 text-sm text-red-600">
                      지연 {todayStats.overdue}개
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 월별 수입 */}
          <Card>
            <CardHeader>
              <CardTitle>이번 달 수입</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlySummary && (
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(monthlySummary.totalIncome)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 월별 지출 */}
          <Card>
            <CardHeader>
              <CardTitle>이번 달 지출</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlySummary && (
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(monthlySummary.totalExpense)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 활성 프로젝트 */}
          <Card>
            <CardHeader>
              <CardTitle>진행 중인 프로젝트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {activeProjects}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 수입/지출 추이 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 30일 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart />
            </CardContent>
          </Card>

          {/* 카테고리별 지출 */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 지출</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={categoryStats} />
            </CardContent>
          </Card>
        </div>

        {/* 최근 거래 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 거래</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.category}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                    <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                최근 거래가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

