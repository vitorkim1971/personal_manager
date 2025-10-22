'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDateKorean } from '@/lib/utils';
import type { 
  TodayTaskStats, MonthlySummary, Transaction, CategorySummary, 
  Project, CompanyFinanceSummary, CompanyAccount, Budget, CompanyTransaction 
} from '@/types';
import IncomeExpenseChart from '@/components/features/IncomeExpenseChart';
import CategoryPieChart from '@/components/features/CategoryPieChart';
import Calendar from '@/components/features/Calendar';

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
  const [companyTransactions, setCompanyTransactions] = useState<CompanyTransaction[]>([]);
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

      const companyTransactionsRes = await fetch('/api/company-transactions');
      const companyTransactionsData = await companyTransactionsRes.json();
      setCompanyTransactions(companyTransactionsData);

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
                <div>
                  <div className="text-sm text-gray-500 mb-1">📋 업무관리 메뉴</div>
                  업무관리
                </div>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/tasks'}>
                  보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">
                        {recentTasks.filter(task => task.status === 'todo').length}
                      </div>
                      <div className="text-xs text-gray-500">할일</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {recentTasks.filter(task => task.status === 'in_progress').length}
                      </div>
                      <div className="text-xs text-gray-500">진행중</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {recentTasks.filter(task => task.status === 'completed').length}
                      </div>
                      <div className="text-xs text-gray-500">완료</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 text-center">
                    총 {recentTasks.length}개 작업
                  </div>
                </>
              ) : (
                <div className="text-gray-500">작업이 없습니다</div>
              )}
            </CardContent>
          </Card>

          {/* 개인 재정관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">💰 재정관리 메뉴</div>
                  개인 재정
                </div>
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
                <div>
                  <div className="text-sm text-gray-500 mb-1">🏢 회사재무 메뉴</div>
                  회사재무
                </div>
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
                <div>
                  <div className="text-sm text-gray-500 mb-1">📁 프로젝트 메뉴</div>
                  프로젝트
                </div>
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
                <div>
                  <div className="text-sm text-gray-500 mb-1">💰 재정관리 메뉴</div>
                  개인 예산 현황
                </div>
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
                  <div className="text-sm mb-2">등록된 개인 예산이 없습니다.</div>
                  <div className="text-xs text-gray-400">재정관리 메뉴에서 예산을 등록해보세요.</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 회사 예산 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">🏢 회사재무 메뉴</div>
                  회사 예산 현황
                </div>
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
                  <div className="text-sm mb-2">등록된 회사 예산이 없습니다.</div>
                  <div className="text-xs text-gray-400">회사재무 메뉴에서 예산을 등록해보세요.</div>
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
                <div>
                  <div className="text-sm text-gray-500 mb-1">📋 업무관리 메뉴</div>
                  최근 할 일
                </div>
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
                <div>
                  <div className="text-sm text-gray-500 mb-1">💰 재정관리 메뉴</div>
                  최근 거래
                </div>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/transactions'}>
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
              <CardTitle>
                <div>
                  <div className="text-sm text-gray-500 mb-1">💰 재정관리 메뉴</div>
                  최근 30일 추이
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart />
            </CardContent>
          </Card>

          {/* 카테고리별 지출 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div>
                  <div className="text-sm text-gray-500 mb-1">💰 재정관리 메뉴</div>
                  카테고리별 지출
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={categoryStats} />
            </CardContent>
          </Card>
        </div>

        {/* 달력 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 업무 달력 */}
          <div className="lg:col-span-2">
            <Calendar 
              tasks={recentTasks} 
              transactions={recentTransactions}
              companyTransactions={companyTransactions}
              onTaskClick={(task) => {
                // 작업 클릭 시 업무관리 페이지로 이동
                window.location.href = '/tasks';
              }}
              onTransactionClick={(transaction) => {
                // 개인 거래 클릭 시 재정관리 페이지로 이동
                window.location.href = '/finance';
              }}
              onCompanyTransactionClick={(transaction) => {
                // 회사 거래 클릭 시 회사재무 페이지로 이동
                window.location.href = '/company-finance';
              }}
            />
          </div>

          {/* 업무 요약 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div>
                  <div className="text-sm text-gray-500 mb-1">📋 업무관리 메뉴</div>
                  이번 달 업무 요약
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">총 작업</span>
                  <span className="font-semibold">{recentTasks.length}개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">완료된 작업</span>
                  <span className="font-semibold text-green-600">
                    {recentTasks.filter(task => task.status === 'completed').length}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">진행중 작업</span>
                  <span className="font-semibold text-blue-600">
                    {recentTasks.filter(task => task.status === 'in_progress').length}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">지연된 작업</span>
                  <span className="font-semibold text-red-600">
                    {recentTasks.filter(task => 
                      task.due_date && 
                      new Date(task.due_date) < new Date() && 
                      task.status !== 'completed'
                    ).length}개
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.location.href = '/tasks'}
                    className="w-full"
                  >
                    전체 업무 보기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

