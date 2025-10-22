import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { CompanyTransaction, UpdateCompanyTransactionInput } from '@/types';

// GET - 특정 거래 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = db.prepare('SELECT * FROM company_transactions WHERE id = ?')
      .get(params.id) as CompanyTransaction | undefined;

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching company transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

// PUT - 거래 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateCompanyTransactionInput = await request.json();
    
    // 기존 거래 정보 조회
    const oldTransaction = db.prepare('SELECT * FROM company_transactions WHERE id = ?')
      .get(params.id) as CompanyTransaction;

    if (!oldTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.account_id !== undefined) {
      updates.push('account_id = ?');
      values.push(body.account_id);
    }
    if (body.type !== undefined) {
      updates.push('type = ?');
      values.push(body.type);
    }
    if (body.amount !== undefined) {
      updates.push('amount = ?');
      values.push(body.amount);
    }
    if (body.category !== undefined) {
      updates.push('category = ?');
      values.push(body.category);
    }
    if (body.date !== undefined) {
      updates.push('date = ?');
      values.push(body.date);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.payment_method !== undefined) {
      updates.push('payment_method = ?');
      values.push(body.payment_method);
    }
    if (body.reference_number !== undefined) {
      updates.push('reference_number = ?');
      values.push(body.reference_number);
    }
    if (body.project_id !== undefined) {
      updates.push('project_id = ?');
      values.push(body.project_id);
    }
    if (body.vendor_customer !== undefined) {
      updates.push('vendor_customer = ?');
      values.push(body.vendor_customer);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(params.id);

    // 이전 거래 계좌 잔액 복원
    const oldAccount = db.prepare('SELECT balance FROM company_accounts WHERE id = ?')
      .get(oldTransaction.account_id) as { balance: number };
    
    let restoredBalance = oldAccount.balance;
    if (oldTransaction.type === 'income') {
      restoredBalance -= oldTransaction.amount;
    } else if (oldTransaction.type === 'expense') {
      restoredBalance += oldTransaction.amount;
    }

    db.prepare('UPDATE company_accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(restoredBalance, oldTransaction.account_id);

    // 거래 업데이트
    db.prepare(`
      UPDATE company_transactions 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const updatedTransaction = db.prepare('SELECT * FROM company_transactions WHERE id = ?')
      .get(params.id) as CompanyTransaction;

    // 새 계좌 잔액 업데이트
    const newAccount = db.prepare('SELECT balance FROM company_accounts WHERE id = ?')
      .get(updatedTransaction.account_id) as { balance: number };
    
    let newBalance = newAccount.balance;
    if (updatedTransaction.type === 'income') {
      newBalance += updatedTransaction.amount;
    } else if (updatedTransaction.type === 'expense') {
      newBalance -= updatedTransaction.amount;
    }

    db.prepare('UPDATE company_accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newBalance, updatedTransaction.account_id);

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating company transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE - 거래 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = db.prepare('SELECT * FROM company_transactions WHERE id = ?')
      .get(params.id) as CompanyTransaction;

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 계좌 잔액 복원
    const account = db.prepare('SELECT balance FROM company_accounts WHERE id = ?')
      .get(transaction.account_id) as { balance: number };
    
    let newBalance = account.balance;
    if (transaction.type === 'income') {
      newBalance -= transaction.amount;
    } else if (transaction.type === 'expense') {
      newBalance += transaction.amount;
    }

    db.prepare('UPDATE company_accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newBalance, transaction.account_id);

    db.prepare('DELETE FROM company_transactions WHERE id = ?').run(params.id);
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting company transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

