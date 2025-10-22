'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDateKorean } from '@/lib/utils';
import type { 
  TodayTaskStats, MonthlySummary, Transaction, CategorySummary, 
  Project, CompanyFinanceSummary, CompanyAccount, Budget 
} from '@/types';
import IncomeExpenseChart from '@/components/features/IncomeExpenseChart';
import CategoryPieChart from '@/components/features/CategoryPieChart';

export default function DashboardPage() {
  const [todayStats, setTodayStats] = useState<TodayTaskStats | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [personalBalance, setPersonalBalance] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategorySummary[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [companySummary, setCompanySummary] = useState<CompanyFinanceSummary | null>(null);
  const [companyBalance, setCompanyBalance] = useState<any>(null);
  const [companyAccounts, setCompanyAccounts] = useState<CompanyAccount[]>([]);
  const [personalBudgets, setPersonalBudgets] = useState<Budget[]>([]);
  const [companyBudgets, setCompanyBudgets] = useState<Budget[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 개인 재정 관련
      const todayRes = await fetch('/api/stats?type=today');
      const todayData = await todayRes.json();
      setTodayStats(todayData);

      const monthlyRes = await fetch('/api/stats?type=monthly');
      const monthlyData = await monthlyRes.json();
      setMonthlySummary(monthlyData);

      const balanceRes = await fetch('/api/stats?type=balance');
      const balanceData = await balanceRes.json();
      setPersonalBalance(balanceData);

      const transactionsRes = await fetch('/api/transactions');
      const transactionsData = await transactionsRes.json();
      setRecentTransactions(transactionsData.slice(0, 5));

      const categoryRes = await fetch('/api/stats?type=categories');
      const categoryData = await categoryRes.json();
      setCategoryStats(categoryData);

      // 프로젝트 관련
      const projectsRes = await fetch('/api/projects?status=in_progress');
      const projectsData = await projectsRes.json();
      setActiveProjects(projectsData);

      // 회사 재정 관련
      const companyStatsRes = await fetch('/api/company-stats?type=monthly&month=2025-10');
      const companyStatsData = await companyStatsRes.json();
      setCompanySummary(companyStatsData);

      const companyBalanceRes = await fetch('/api/company-stats?type=balance');
      const companyBalanceData = await companyBalanceRes.json();
      setCompanyBalance(companyBalanceData);

      const companyAccountsRes = await fetch('/api/company-accounts');
      const companyAccountsData = await companyAccountsRes.json();
      setCompanyAccounts(companyAccountsData);

      // 예산 관련
      const personalBudgetsRes = await fetch('/api/budgets?type=personal&year=2025&month=10');
      const personalBudgetsData = await personalBudgetsRes.json();
      setPersonalBudgets(personalBudgetsData);

      const companyBudgetsRes = await fetch('/api/budgets?type=company&year=2025&month=10');
      const companyBudgetsData = await companyBudgetsRes.json();
      setCompanyBudgets(companyBudgetsData);

      // 최근 할 일
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setRecentTasks(tasksData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <MainLayout title="대시보드">
      <div className="space-y-6">
        {/* 핵심 지표 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 업무관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                업무관리
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/tasks'}>
                  보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayStats ? (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    {todayStats.completed}/{todayStats.total}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    완료 {todayStats.completed}개 · 진행중 {todayStats.inProgress}개
                  </div>
                  {todayStats.overdue > 0 && (
                    <div className="text-sm text-red-600 mt-1">
                      ⚠️ 지연 {todayStats.overdue}개
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500">데이터 로딩 중...</div>
              )}
            </CardContent>
          </Card>

          {/* 개인 재정관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                개인 재정
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance'}>
                  보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {personalBalance ? (
                <>
                  <div className={`text-2xl font-bold ${personalBalance.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(personalBalance.currentBalance)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    수입 {formatCurrency(personalBalance.totalIncome)} · 지출 {formatCurrency(personalBalance.totalExpense)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    현재 잔액
                  </div>
                </>
              ) : (
                <div className="text-gray-500">데이터 로딩 중...</div>
              )}
            </CardContent>
          </Card>

          {/* 회사재무 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                회사재무
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/company-finance'}>
                  보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {companyBalance ? (
                <>
                  <div className={`text-2xl font-bold ${companyBalance.currentBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(companyBalance.currentBalance)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    수입 {formatCurrency(companyBalance.totalIncome)} · 지출 {formatCurrency(companyBalance.totalExpense)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    계좌 {companyAccounts.length}개
                  </div>
                </>
              ) : (
                <div className="text-gray-500">데이터 로딩 중...</div>
              )}
            </CardContent>
          </Card>

          {/* 프로젝트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                프로젝트
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/projects'}>
                  보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {activeProjects.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                진행 중인 프로젝트
              </div>
              {activeProjects.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  최신: {activeProjects[0]?.name}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 예산 현황 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 개인 예산 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                개인 예산 현황
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance'}>
                  관리
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {personalBudgets.length > 0 ? (
                <div className="space-y-2">
                  {personalBudgets.slice(0, 3).map((budget) => {
                    const usage = budget.budgeted_amount > 0 ? (budget.spent_amount / budget.budgeted_amount) * 100 : 0;
                    return (
                      <div key={budget.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{budget.category}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${usage >= 100 ? 'bg-red-500' : usage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 ml-2">
                          {usage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  등록된 개인 예산이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 회사 예산 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                회사 예산 현황
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/company-finance'}>
                  관리
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {companyBudgets.length > 0 ? (
                <div className="space-y-2">
                  {companyBudgets.slice(0, 3).map((budget) => {
                    const usage = budget.budgeted_amount > 0 ? (budget.spent_amount / budget.budgeted_amount) * 100 : 0;
                    return (
                      <div key={budget.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{budget.category}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${usage >= 100 ? 'bg-red-500' : usage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(usage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 ml-2">
                          {usage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  등록된 회사 예산이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 최근 활동 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 할 일 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                최근 할 일
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/tasks'}>
                  전체보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.category}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? '완료' :
                         task.status === 'in_progress' ? '진행중' : '대기'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  최근 할 일이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 최근 거래 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                최근 거래
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance'}>
                  전체보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{transaction.category}</div>
                        <div className="text-sm text-gray-500">{formatDateKorean(transaction.date)}</div>
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

        {/* 차트 섹션 */}
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
      </div>
    </MainLayout>
  );
}

