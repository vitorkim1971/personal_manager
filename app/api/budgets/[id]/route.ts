import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Budget, UpdateBudgetInput } from '@/types';

// GET - 특정 예산 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?')
      .get(id) as Budget | undefined;

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

// PUT - 예산 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateBudgetInput = await request.json();
    const updates: string[] = [];
    const values: any[] = [];

    if (body.type !== undefined) {
      updates.push('type = ?');
      values.push(body.type);
    }
    if (body.category !== undefined) {
      updates.push('category = ?');
      values.push(body.category);
    }
    if (body.budgeted_amount !== undefined) {
      updates.push('budgeted_amount = ?');
      values.push(body.budgeted_amount);
    }
    if (body.spent_amount !== undefined) {
      updates.push('spent_amount = ?');
      values.push(body.spent_amount);
    }
    if (body.year !== undefined) {
      updates.push('year = ?');
      values.push(body.year);
    }
    if (body.month !== undefined) {
      updates.push('month = ?');
      values.push(body.month);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      values.push(body.description);
    }
    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    db.prepare(`
      UPDATE budgets 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const updatedBudget = db.prepare('SELECT * FROM budgets WHERE id = ?')
      .get(id) as Budget;

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

// DELETE - 예산 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
