import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { UpdateDailyTaskInput } from '@/types';

// GET /api/daily-tasks/[id] - 특정 매일할일 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(id);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to fetch daily task:', error);
    return NextResponse.json({ error: 'Failed to fetch daily task' }, { status: 500 });
  }
}

// PUT /api/daily-tasks/[id] - 매일할일 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    console.log('PUT request received for ID:', idParam);
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      console.log('Invalid ID:', idParam);
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const body: UpdateDailyTaskInput = await request.json();
    console.log('Update request body:', body);
    const { title, description, category, priority, start_time, end_time, is_active } = body;

    // 기존 작업 확인
    const existingTask = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(id);
    console.log('Existing task:', existingTask);
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }
    if (start_time !== undefined) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const stmt = db.prepare(`
      UPDATE daily_tasks 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...updateValues);

    const updatedTask = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(id);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Failed to update daily task:', error);
    return NextResponse.json({ error: 'Failed to update daily task' }, { status: 500 });
  }
}

// DELETE /api/daily-tasks/[id] - 매일할일 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // 기존 작업 확인
    const existingTask = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(id);
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // 관련 완료 기록도 함께 삭제 (CASCADE)
    const stmt = db.prepare('DELETE FROM daily_tasks WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete daily task:', error);
    return NextResponse.json({ error: 'Failed to delete daily task' }, { status: 500 });
  }
}
