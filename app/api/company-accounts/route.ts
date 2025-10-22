import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { CompanyAccount, CreateCompanyAccountInput } from '@/types';

// GET - 모든 계좌 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get('is_active');

    let query = 'SELECT * FROM company_accounts';
    const params: any[] = [];

    if (isActive !== null) {
      query += ' WHERE is_active = ?';
      params.push(parseInt(isActive));
    }

    query += ' ORDER BY created_at DESC';

    const accounts = db.prepare(query).all(...params) as CompanyAccount[];
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching company accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

// POST - 새 계좌 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateCompanyAccountInput = await request.json();

    const result = db.prepare(`
      INSERT INTO company_accounts (
        account_name, account_number, bank_name, account_type,
        currency, balance, description, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.account_name,
      body.account_number || null,
      body.bank_name || null,
      body.account_type || 'checking',
      body.currency || 'USD',
      body.balance || 0,
      body.description || null,
      body.is_active !== undefined ? body.is_active : 1
    );

    const newAccount = db.prepare('SELECT * FROM company_accounts WHERE id = ?')
      .get(result.lastInsertRowid) as CompanyAccount;

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating company account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

