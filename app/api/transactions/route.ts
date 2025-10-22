import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Transaction, CreateTransactionInput } from '@/types';

// GET /api/transactions - 거래 내역 조회 (필터링 지원)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const project_id = searchParams.get('project_id');

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (project_id) {
      query += ' AND project_id = ?';
      params.push(parseInt(project_id));
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const stmt = db.prepare(query);
    const transactions = stmt.all(...params) as Transaction[];

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST /api/transactions - 거래 기록
export async function POST(request: NextRequest) {
  try {
    const body: CreateTransactionInput = await request.json();

    const stmt = db.prepare(`
      INSERT INTO transactions (type, amount, category, date, memo, payment_method, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.type,
      body.amount,
      body.category,
      body.date,
      body.memo || null,
      body.payment_method || null,
      body.project_id || null
    );

    const newTransaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid) as Transaction;

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

