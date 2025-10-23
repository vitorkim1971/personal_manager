'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DailyTasks from '@/components/DailyTasks';
import DailyTasksSummary from '@/components/DailyTasksSummary';
import CategoryPieChart from '@/components/features/CategoryPieChart';
import Calendar from '@/components/features/Calendar';
import type {
  Transaction,
  CompanyTransaction,
  Project,
  CategorySummary,
  MonthlySummary,
  CompanyFinanceSummary,
  CompanyAccount,
  Budget,
  Memo
} from '@/types';

export default function DashboardPage() {
  const [todayStats, setTodayStats] = useState<any>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [personalBalance, setPersonalBalance] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategorySummary[]>([]);
  const [companyCategoryStats, setCompanyCategoryStats] = useState<CategorySummary[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [companySummary, setCompanySummary] = useState<CompanyFinanceSummary | null>(null);
  const [companyBalance, setCompanyBalance] = useState<any>(null);
  const [companyAccounts, setCompanyAccounts] = useState<CompanyAccount[]>([]);
  const [companyTransactions, setCompanyTransactions] = useState<CompanyTransaction[]>([]);
  const [personalBudgets, setPersonalBudgets] = useState<Budget[]>([]);
  const [companyBudgets, setCompanyBudgets] = useState<Budget[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemoTitle, setNewMemoTitle] = useState('');
  const [newMemoContent, setNewMemoContent] = useState('');

  useEffect(() => {
    fetchDashboardData();
    
    // 업무관리 업데이트 이벤트 감지
    const handleTaskUpdate = () => {
      fetchTasksData();
    };
    
    // 페이지 포커스 시 업무관리 데이터 새로고침
    const handleFocus = () => {
      fetchTasksData();
    };
    
    window.addEventListener('taskUpdated', handleTaskUpdate);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate);
      window.removeEventListener('focus', handleFocus);
    };
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

      // 회사재무 관련
      const companyStatsRes = await fetch('/api/company-stats');
      const companyStatsData = await companyStatsRes.json();
      setCompanySummary(companyStatsData);

      const companyCategoryRes = await fetch('/api/company-stats?type=categories');
      const companyCategoryData = await companyCategoryRes.json();
      setCompanyCategoryStats(companyCategoryData);

      const companyBalanceRes = await fetch('/api/company-stats?type=balance');
      const companyBalanceData = await companyBalanceRes.json();
      setCompanyBalance(companyBalanceData);

      const companyAccountsRes = await fetch('/api/company-accounts');
      const companyAccountsData = await companyAccountsRes.json();
      setCompanyAccounts(companyAccountsData);

      const companyTransactionsRes = await fetch('/api/company-transactions');
      const companyTransactionsData = await companyTransactionsRes.json();
      setCompanyTransactions(companyTransactionsData);

      // 프로젝트 관련
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      setActiveProjects(projectsData.filter((project: Project) => project.status === 'in_progress'));

      // 예산 관련
      const personalBudgetsRes = await fetch('/api/budgets?type=personal');
      const personalBudgetsData = await personalBudgetsRes.json();
      setPersonalBudgets(personalBudgetsData);

      const companyBudgetsRes = await fetch('/api/budgets?type=company');
      const companyBudgetsData = await companyBudgetsRes.json();
      setCompanyBudgets(companyBudgetsData);

      // 최근 할 일
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setRecentTasks(tasksData); // 전체 작업 데이터 사용

      // 메모 조회
      const memosRes = await fetch('/api/memos');
      const memosData = await memosRes.json();
      setMemos(memosData.slice(0, 5)); // 최근 5개만 표시
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchTasksData = async () => {
    try {
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setRecentTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDateKorean = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCreateMemo = async () => {
    if (!newMemoTitle.trim()) {
      alert('메모 제목을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMemoTitle,
          content: newMemoContent,
        }),
      });

      if (response.ok) {
        setNewMemoTitle('');
        setNewMemoContent('');
        // 메모 목록 새로고침
        const memosRes = await fetch('/api/memos');
        const memosData = await memosRes.json();
        setMemos(memosData.slice(0, 5));
      } else {
        alert('메모 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating memo:', error);
      alert('메모 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <MainLayout title="대시보드">
      <div className="space-y-8">
        {/* 핵심 지표 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 업무관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">📋 업무관리 메뉴</div>
                  전체 업무 요약
                </div>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/tasks'}>
                  보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <>
                  {/* 진행률 바 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">완료율</span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round((recentTasks.filter(task => task.status === 'completed').length / recentTasks.length) * 100)}%
                      </span>
                      </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.round((recentTasks.filter(task => task.status === 'completed').length / recentTasks.length) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 상세 통계 */}
                  <div className="space-y-3">
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
                  </div>
                </>
              ) : (
                <div className="text-gray-500">작업이 없습니다</div>
              )}
            </CardContent>
          </Card>

          {/* 매일할일 요약 */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div>
                  <div className="text-sm text-gray-500 mb-1">📅 매일할일</div>
                  오늘의 진행률
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyTasksSummary />
            </CardContent>
          </Card>

          {/* 개인 재정관리 요약 */}
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

          {/* 회사재무 요약 */}
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
                  <div className={`text-2xl font-bold ${companyBalance.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(companyBalance.currentBalance)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    수입 {formatCurrency(companyBalance.totalIncome)} · 지출 {formatCurrency(companyBalance.totalExpense)}
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
        </div>

        {/* 개인 재정관리 섹션 */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">💰</span>
            개인 재정관리
          </h2>

          {/* 개인 재정 3열 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 개인 최근 거래 */}
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
                    {recentTransactions.slice(0, 3).map((transaction) => (
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
                    개인 거래가 없습니다.
                  </div>
                )}
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

            {/* 개인 예산 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">💰 재정관리 메뉴</div>
                    예산 현황
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance'}>
                    관리
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personalBudgets.length > 0 ? (
                  <div className="space-y-4">
                    {personalBudgets.slice(0, 3).map((budget) => {
                      const percentage = (budget.spent_amount / budget.budgeted_amount) * 100;
                      const isOverBudget = percentage > 100;

                      return (
                        <div key={budget.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{budget.category || '기타'}</span>
                            <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                              {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.budgeted_amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    설정된 예산이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 회사재무 섹션 */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🏢</span>
            회사재무
          </h2>

          {/* 회사 재정 3열 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 회사 최근 거래 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">🏢 회사재무 메뉴</div>
                    최근 거래
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/company-finance/transactions'}>
                    전체보기
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companyTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {companyTransactions.slice(0, 3).map((transaction) => (
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
                    회사 거래가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 회사 카테고리별 지출 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">🏢 회사재무 메뉴</div>
                    카테고리별 지출
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={companyCategoryStats} />
              </CardContent>
            </Card>

            {/* 회사 예산 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">🏢 회사재무 메뉴</div>
                    예산 현황
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/company-finance'}>
                    관리
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companyBudgets.length > 0 ? (
                  <div className="space-y-4">
                    {companyBudgets.slice(0, 3).map((budget) => {
                      const percentage = (budget.spent_amount / budget.budgeted_amount) * 100;
                      const isOverBudget = percentage > 100;

                      return (
                        <div key={budget.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{budget.category || '기타'}</span>
                            <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                              {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.budgeted_amount)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    설정된 예산이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 매일할일 섹션 */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📅</span>
            매일할일
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DailyTasks />
            </div>
            
            {/* 매일할일 요약 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">📅 매일할일</div>
                    오늘의 진행률
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DailyTasksSummary />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 메모 및 달력 섹션 */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📝</span>
            개인메모 및 업무 달력
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 개인메모 섹션 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">📝 개인메모</div>
                      빠른 메모
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => window.location.href = '/memos'}>
                      전체보기
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 메모 작성 폼 */}
                  <div className="space-y-3 mb-4 pb-4 border-b">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium text-sm"
                      placeholder="메모 제목"
                      value={newMemoTitle}
                      onChange={(e) => setNewMemoTitle(e.target.value)}
                    />
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium text-sm"
                      placeholder="메모 내용"
                      value={newMemoContent}
                      onChange={(e) => setNewMemoContent(e.target.value)}
                      rows={3}
                    />
                    <Button size="sm" onClick={handleCreateMemo} className="w-full">
                      메모 추가
                    </Button>
                  </div>

                  {/* 메모 목록 */}
                  {memos.length > 0 ? (
                    <div className="space-y-3">
                      {memos.map((memo) => (
                        <div
                          key={memo.id}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => window.location.href = '/memos'}
                        >
                          <div className="font-medium text-gray-900 text-sm mb-1">{memo.title}</div>
                          {memo.content && (
                            <div className="text-xs text-gray-600 mb-2 line-clamp-2">{memo.content}</div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(memo.updated_at).toLocaleString('ko-KR', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      메모가 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}