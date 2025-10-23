import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CreateDailyTaskCompletionInput } from '@/types';

// POST /api/daily-tasks/complete - 매일해야 할 일 완료 처리
export async function POST(request: NextRequest) {
  try {
    const body: CreateDailyTaskCompletionInput = await request.json();
    const { daily_task_id, completion_date, notes } = body;

    if (!daily_task_id || !completion_date) {
      return NextResponse.json({ error: 'daily_task_id and completion_date are required' }, { status: 400 });
    }

    // 작업이 존재하는지 확인
    const task = db.prepare('SELECT * FROM daily_tasks WHERE id = ? AND is_active = 1').get(daily_task_id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found or inactive' }, { status: 404 });
    }

    // 이미 해당 날짜에 완료된 기록이 있는지 확인
    const existingCompletion = db.prepare(
      'SELECT * FROM daily_task_completions WHERE daily_task_id = ? AND completion_date = ?'
    ).get(daily_task_id, completion_date);

    if (existingCompletion) {
      return NextResponse.json({ error: 'Task already completed on this date' }, { status: 409 });
    }

    // 완료 기록 생성
    const stmt = db.prepare(`
      INSERT INTO daily_task_completions (daily_task_id, completion_date, notes)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(daily_task_id, completion_date, notes);
    
    const completion = db.prepare('SELECT * FROM daily_task_completions WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error('Failed to complete daily task:', error);
    return NextResponse.json({ error: 'Failed to complete daily task' }, { status: 500 });
  }
}

// DELETE /api/daily-tasks/complete - 매일해야 할 일 완료 취소
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daily_task_id = searchParams.get('daily_task_id');
    const completion_date = searchParams.get('completion_date');

    if (!daily_task_id || !completion_date) {
      return NextResponse.json({ error: 'daily_task_id and completion_date are required' }, { status: 400 });
    }

    const taskId = parseInt(daily_task_id);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // 완료 기록 확인
    const completion = db.prepare(
      'SELECT * FROM daily_task_completions WHERE daily_task_id = ? AND completion_date = ?'
    ).get(taskId, completion_date);

    if (!completion) {
      return NextResponse.json({ error: 'Completion record not found' }, { status: 404 });
    }

    // 완료 기록 삭제
    const stmt = db.prepare(
      'DELETE FROM daily_task_completions WHERE daily_task_id = ? AND completion_date = ?'
    );
    stmt.run(taskId, completion_date);

    return NextResponse.json({ message: 'Completion record deleted successfully' });
  } catch (error) {
    console.error('Failed to delete completion record:', error);
    return NextResponse.json({ error: 'Failed to delete completion record' }, { status: 500 });
  }
}
