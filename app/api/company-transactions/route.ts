import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { CompanyTransaction, CreateCompanyTransactionInput } from '@/types';

// GET - 거래 내역 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const projectId = searchParams.get('project_id');

    let query = 'SELECT * FROM company_transactions WHERE 1=1';
    const params: any[] = [];

    if (accountId) {
      query += ' AND account_id = ?';
      params.push(parseInt(accountId));
    }
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
    if (projectId) {
      query += ' AND project_id = ?';
      params.push(parseInt(projectId));
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const transactions = db.prepare(query).all(...params) as CompanyTransaction[];
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching company transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - 새 거래 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateCompanyTransactionInput = await request.json();

    const result = db.prepare(`
      INSERT INTO company_transactions (
        account_id, type, amount, category, date, description,
        payment_method, reference_number, project_id, vendor_customer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.account_id,
      body.type,
      body.amount,
      body.category,
      body.date,
      body.description || null,
      body.payment_method || null,
      body.reference_number || null,
      body.project_id || null,
      body.vendor_customer || null
    );

    // 계좌 잔액 업데이트
    const account = db.prepare('SELECT balance FROM company_accounts WHERE id = ?')
      .get(body.account_id) as { balance: number };
    
    let newBalance = account.balance;
    if (body.type === 'income') {
      newBalance += body.amount;
    } else if (body.type === 'expense') {
      newBalance -= body.amount;
    }

    db.prepare('UPDATE company_accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newBalance, body.account_id);

    const newTransaction = db.prepare('SELECT * FROM company_transactions WHERE id = ?')
      .get(result.lastInsertRowid) as CompanyTransaction;

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating company transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

