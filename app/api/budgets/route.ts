import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types';

// GET - 예산 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'personal' | 'company'
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let query = 'SELECT * FROM budgets WHERE 1=1';
    const params: any[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(parseInt(year));
    }
    if (month) {
      query += ' AND month = ?';
      params.push(parseInt(month));
    }

    query += ' ORDER BY year DESC, month DESC, category ASC';

    const budgets = db.prepare(query).all(...params) as Budget[];
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

// POST - 새 예산 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateBudgetInput = await request.json();
    console.log('Creating budget with data:', body);

    const result = db.prepare(`
      INSERT INTO budgets (
        type, category, budgeted_amount, spent_amount, year, month, 
        description, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      body.type,
      body.category,
      body.budgeted_amount,
      body.spent_amount || 0,
      body.year,
      body.month,
      body.description || null,
      body.is_active !== undefined ? body.is_active : 1
    );

    const newBudget = db.prepare('SELECT * FROM budgets WHERE id = ?')
      .get(result.lastInsertRowid) as Budget;

    return NextResponse.json(newBudget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create budget',
      message: errorMessage,
      details: error 
    }, { status: 500 });
  }
}
