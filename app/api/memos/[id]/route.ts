import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv-db';
import type { Memo, UpdateMemoInput } from '@/types';

// GET - 특정 메모 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memo = db.prepare('SELECT * FROM memos WHERE id = ?').get(id) as Memo;

    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    return NextResponse.json(memo);
  } catch (error) {
    console.error('Error fetching memo:', error);
    return NextResponse.json({ error: 'Failed to fetch memo' }, { status: 500 });
  }
}

// PUT - 메모 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateMemoInput = await request.json();
    console.log('Updating memo:', id, body);

    const updates: string[] = [];
    const values: any[] = [];

    if (body.title !== undefined) {
      updates.push('title = ?');
      values.push(body.title);
    }
    if (body.content !== undefined) {
      updates.push('content = ?');
      values.push(body.content);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE memos SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    const updatedMemo = db.prepare('SELECT * FROM memos WHERE id = ?').get(id) as Memo;

    if (!updatedMemo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    return NextResponse.json(updatedMemo);
  } catch (error) {
    console.error('Error updating memo:', error);
    return NextResponse.json({ error: 'Failed to update memo' }, { status: 500 });
  }
}

// DELETE - 메모 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Deleting memo:', id);

    const result = db.prepare('DELETE FROM memos WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Memo deleted' });
  } catch (error) {
    console.error('Error deleting memo:', error);
    return NextResponse.json({ error: 'Failed to delete memo' }, { status: 500 });
  }
}
