import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// GET /api/stats - 통계 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // today, monthly, trends, categories

    if (type === 'today') {
      return getTodayStats();
    } else if (type === 'monthly') {
      return getMonthlyStats(request);
    } else if (type === 'yearly') {
      return getYearlyStats(request);
    } else if (type === 'balance') {
      return getCurrentBalance();
    } else if (type === 'trends') {
      return getTrendsData();
    } else if (type === 'categories') {
      return getCategoryStats(request);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

// 오늘의 할 일 통계
function getTodayStats() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN due_date < ? AND status != 'completed' THEN 1 ELSE 0 END) as overdue
    FROM tasks
    WHERE due_date IS NOT NULL AND date(due_date) <= ?
  `);

  const stats = stmt.get(today, today) as any;

  return NextResponse.json({
    total: stats.total || 0,
    completed: stats.completed || 0,
    inProgress: stats.in_progress || 0,
    todo: stats.todo || 0,
    overdue: stats.overdue || 0,
  });
}

// 월별 재정 요약
function getMonthlyStats(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const monthParam = searchParams.get('month'); // YYYY-MM
  
  const targetDate = monthParam ? new Date(monthParam + '-01') : new Date();
  const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd');

  // 이번 달 데이터
  const stmt = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
    FROM transactions
    WHERE date >= ? AND date <= ?
  `);

  const currentMonth = stmt.get(startDate, endDate) as any;

  // 전월 데이터
  const prevMonthDate = subMonths(targetDate, 1);
  const prevStartDate = format(startOfMonth(prevMonthDate), 'yyyy-MM-dd');
  const prevEndDate = format(endOfMonth(prevMonthDate), 'yyyy-MM-dd');

  const prevMonth = stmt.get(prevStartDate, prevEndDate) as any;

  const totalIncome = currentMonth.total_income || 0;
  const totalExpense = currentMonth.total_expense || 0;
  const netIncome = totalIncome - totalExpense;

  const prevIncome = prevMonth.total_income || 0;
  const prevExpense = prevMonth.total_expense || 0;

  return NextResponse.json({
    month: format(targetDate, 'yyyy-MM'),
    totalIncome,
    totalExpense,
    netIncome,
    prevMonthIncome: prevIncome,
    prevMonthExpense: prevExpense,
  });
}

// 최근 30일 추이 데이터
function getTrendsData() {
  const stmt = db.prepare(`
    SELECT 
      date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE date >= date('now', '-30 days')
    GROUP BY date
    ORDER BY date ASC
  `);

  const trends = stmt.all() as any[];

  return NextResponse.json(trends);
}

// 카테고리별 지출 통계
function getCategoryStats(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const monthParam = searchParams.get('month');
  
  const targetDate = monthParam ? new Date(monthParam + '-01') : new Date();
  const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd');

  const stmt = db.prepare(`
    SELECT 
      category,
      SUM(amount) as amount,
      COUNT(*) as count
    FROM transactions
    WHERE type = 'expense' AND date >= ? AND date <= ?
    GROUP BY category
    ORDER BY amount DESC
  `);

  const categories = stmt.all(startDate, endDate) as any[];

  const totalExpense = categories.reduce((sum, cat) => sum + cat.amount, 0);

  const categoriesWithPercentage = categories.map(cat => ({
    category: cat.category,
    amount: cat.amount,
    count: cat.count,
    percentage: totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0,
  }));

  return NextResponse.json(categoriesWithPercentage);
}

// 연간 통계 데이터
function getYearlyStats(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearParam = searchParams.get('year');
  
  const targetYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();
  const startDate = `${targetYear}-01-01`;
  const endDate = `${targetYear}-12-31`;

  // 수입
  const incomeStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE type = 'income' AND date >= ? AND date <= ?
  `);
  const incomeResult = incomeStmt.get(startDate, endDate) as { total: number };

  // 지출
  const expenseStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE type = 'expense' AND date >= ? AND date <= ?
  `);
  const expenseResult = expenseStmt.get(startDate, endDate) as { total: number };

  // 전년 데이터
  const prevYear = targetYear - 1;
  const prevStartDate = `${prevYear}-01-01`;
  const prevEndDate = `${prevYear}-12-31`;

  const prevIncomeStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE type = 'income' AND date >= ? AND date <= ?
  `);
  const prevIncomeResult = prevIncomeStmt.get(prevStartDate, prevEndDate) as { total: number };

  const prevExpenseStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE type = 'expense' AND date >= ? AND date <= ?
  `);
  const prevExpenseResult = prevExpenseStmt.get(prevStartDate, prevEndDate) as { total: number };

  return NextResponse.json({
    year: targetYear,
    totalIncome: incomeResult.total,
    totalExpense: expenseResult.total,
    netIncome: incomeResult.total - expenseResult.total,
    prevYearIncome: prevIncomeResult.total,
    prevYearExpense: prevExpenseResult.total,
  });
}

// 현재 잔액 계산 (총 수입 - 총 지출)
function getCurrentBalance() {
  // 총 수입
  const incomeStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE type = 'income'
  `);
  const incomeResult = incomeStmt.get() as { total: number };

  // 총 지출
  const expenseStmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE type = 'expense'
  `);
  const expenseResult = expenseStmt.get() as { total: number };

  const currentBalance = incomeResult.total - expenseResult.total;

  return NextResponse.json({
    currentBalance,
    totalIncome: incomeResult.total,
    totalExpense: expenseResult.total,
  });
}

