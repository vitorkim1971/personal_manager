import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Transaction, UpdateTransactionInput } from '@/types';

// GET /api/transactions/[id] - 거래 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
    const transaction = stmt.get(parseInt(id)) as Transaction | undefined;

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - 거래 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateTransactionInput = await request.json();

    const updates: string[] = [];
    const values: any[] = [];

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
    if (body.memo !== undefined) {
      updates.push('memo = ?');
      values.push(body.memo);
    }
    if (body.payment_method !== undefined) {
      updates.push('payment_method = ?');
      values.push(body.payment_method);
    }
    if (body.project_id !== undefined) {
      updates.push('project_id = ?');
      values.push(body.project_id);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(parseInt(id));

    const stmt = db.prepare(`
      UPDATE transactions SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    const updatedTransaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(parseInt(id)) as Transaction;

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - 거래 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    const result = stmt.run(parseInt(id));

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

