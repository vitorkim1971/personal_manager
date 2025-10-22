import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { CompanyAccount, UpdateCompanyAccountInput } from '@/types';

// GET - 특정 계좌 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = db.prepare('SELECT * FROM company_accounts WHERE id = ?')
      .get(params.id) as CompanyAccount | undefined;

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching company account:', error);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}

// PUT - 계좌 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateCompanyAccountInput = await request.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.account_name !== undefined) {
      updates.push('account_name = ?');
      values.push(body.account_name);
    }
    if (body.account_number !== undefined) {
      updates.push('account_number = ?');
      values.push(body.account_number);
    }
    if (body.bank_name !== undefined) {
      updates.push('bank_name = ?');
      values.push(body.bank_name);
    }
    if (body.account_type !== undefined) {
      updates.push('account_type = ?');
      values.push(body.account_type);
    }
    if (body.currency !== undefined) {
      updates.push('currency = ?');
      values.push(body.currency);
    }
    if (body.balance !== undefined) {
      updates.push('balance = ?');
      values.push(body.balance);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.exchange_name !== undefined) {
      updates.push('exchange_name = ?');
      values.push(body.exchange_name);
    }
    if (body.wallet_address !== undefined) {
      updates.push('wallet_address = ?');
      values.push(body.wallet_address);
    }
    if (body.network !== undefined) {
      updates.push('network = ?');
      values.push(body.network);
    }
    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(params.id);

    db.prepare(`
      UPDATE company_accounts 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const updatedAccount = db.prepare('SELECT * FROM company_accounts WHERE id = ?')
      .get(params.id) as CompanyAccount;

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error updating company account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

// DELETE - 계좌 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    db.prepare('DELETE FROM company_accounts WHERE id = ?').run(params.id);
    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting company account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

