import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { CompanyFinanceSummary } from '@/types';

// GET - 회사 재무 통계
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const month = searchParams.get('month');

    if (type === 'monthly') {
      // 월별 요약
      const targetMonth = month || new Date().toISOString().slice(0, 7);
      const [year, monthNum] = targetMonth.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const endDate = `${year}-${monthNum}-${lastDay}`;

      // 수입
      const incomeResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'income' AND date >= ? AND date <= ?
      `).get(startDate, endDate) as { total: number };

      // 지출
      const expenseResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'expense' AND date >= ? AND date <= ?
      `).get(startDate, endDate) as { total: number };

      // 전월 데이터
      const prevMonth = new Date(parseInt(year), parseInt(monthNum) - 2, 1);
      const prevYear = prevMonth.getFullYear();
      const prevMonthNum = String(prevMonth.getMonth() + 1).padStart(2, '0');
      const prevStartDate = `${prevYear}-${prevMonthNum}-01`;
      const prevLastDay = new Date(prevYear, prevMonth.getMonth() + 1, 0).getDate();
      const prevEndDate = `${prevYear}-${prevMonthNum}-${prevLastDay}`;

      const prevIncomeResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'income' AND date >= ? AND date <= ?
      `).get(prevStartDate, prevEndDate) as { total: number };

      const prevExpenseResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'expense' AND date >= ? AND date <= ?
      `).get(prevStartDate, prevEndDate) as { total: number };

      // 계좌 잔액
      const accountBalances = db.prepare(`
        SELECT account_name, balance
        FROM company_accounts
        WHERE is_active = 1
        ORDER BY balance DESC
      `).all() as { account_name: string; balance: number }[];

      const summary: CompanyFinanceSummary = {
        month: targetMonth,
        totalIncome: incomeResult.total,
        totalExpense: expenseResult.total,
        netIncome: incomeResult.total - expenseResult.total,
        accountBalances,
        prevMonthIncome: prevIncomeResult.total,
        prevMonthExpense: prevExpenseResult.total,
      };

      return NextResponse.json(summary);
    }

    if (type === 'yearly') {
      // 연간 요약
      const year = searchParams.get('year') || new Date().getFullYear().toString();
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      // 수입
      const incomeResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'income' AND date >= ? AND date <= ?
      `).get(startDate, endDate) as { total: number };

      // 지출
      const expenseResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'expense' AND date >= ? AND date <= ?
      `).get(startDate, endDate) as { total: number };

      // 전년 데이터
      const prevYear = (parseInt(year) - 1).toString();
      const prevStartDate = `${prevYear}-01-01`;
      const prevEndDate = `${prevYear}-12-31`;

      const prevIncomeResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'income' AND date >= ? AND date <= ?
      `).get(prevStartDate, prevEndDate) as { total: number };

      const prevExpenseResult = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM company_transactions
        WHERE type = 'expense' AND date >= ? AND date <= ?
      `).get(prevStartDate, prevEndDate) as { total: number };

      // 월별 데이터 (차트용)
      const monthlyData = db.prepare(`
        SELECT 
          strftime('%m', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM company_transactions
        WHERE date >= ? AND date <= ?
        GROUP BY strftime('%m', date)
        ORDER BY month ASC
      `).all(startDate, endDate) as { month: string; income: number; expense: number }[];

      const summary: CompanyFinanceSummary = {
        year: year,
        totalIncome: incomeResult.total,
        totalExpense: expenseResult.total,
        netIncome: incomeResult.total - expenseResult.total,
        accountBalances: [],
        prevYearIncome: prevIncomeResult.total,
        prevYearExpense: prevExpenseResult.total,
        monthlyData,
      };

      return NextResponse.json(summary);
    }

    if (type === 'categories') {
      // 카테고리별 집계
      const categories = db.prepare(`
        SELECT 
          category,
          type,
          COALESCE(SUM(amount), 0) as amount,
          COUNT(*) as count
        FROM company_transactions
        WHERE date >= date('now', '-30 days')
        GROUP BY category, type
        ORDER BY amount DESC
      `).all() as { category: string; type: string; amount: number; count: number }[];

      return NextResponse.json(categories);
    }

    if (type === 'trends') {
      // 최근 30일 추이
      const trends = db.prepare(`
        SELECT 
          date,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM company_transactions
        WHERE date >= date('now', '-30 days')
        GROUP BY date
        ORDER BY date ASC
      `).all() as { date: string; income: number; expense: number }[];

      return NextResponse.json(trends);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

