import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CreateDailyTaskInput, DailyTaskWithStatus } from '@/types';

// GET /api/daily-tasks - 매일해야 할 일 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get('include_completed') === 'true';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        dt.*,
        CASE WHEN dtc.id IS NOT NULL THEN 1 ELSE 0 END as is_completed_today,
        dtc.notes as completion_notes,
        COALESCE(streak.streak_count, 0) as streak_count
      FROM daily_tasks dt
      LEFT JOIN daily_task_completions dtc ON dt.id = dtc.daily_task_id AND dtc.completion_date = ?
      LEFT JOIN (
        SELECT 
          daily_task_id,
          COUNT(*) as streak_count
        FROM daily_task_completions
        WHERE completion_date >= date('now', '-30 days')
        GROUP BY daily_task_id
      ) streak ON dt.id = streak.daily_task_id
      WHERE dt.is_active = 1
    `;

    const params = [date];

    if (!includeCompleted) {
      query += ' AND dtc.id IS NULL';
    }

    query += ' ORDER BY dt.priority DESC, dt.created_at ASC';

    const tasks = db.prepare(query).all(...params) as DailyTaskWithStatus[];

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch daily tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch daily tasks' }, { status: 500 });
  }
}

// POST /api/daily-tasks - 새 매일할일 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateDailyTaskInput = await request.json();
    console.log('Received request body:', body);
    
    const { title, description, category = 'general', priority = 'medium', start_time, end_time, is_active = 1 } = body;

    if (!title.trim()) {
      console.log('Title validation failed');
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    console.log('Inserting task with values:', { title, description, category, priority, start_time, end_time, is_active });

    const stmt = db.prepare(`
      INSERT INTO daily_tasks (title, description, category, priority, start_time, end_time, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, description, category, priority, start_time, end_time, is_active);
    console.log('Insert result:', result);
    
    const newTask = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(result.lastInsertRowid) as DailyTaskWithStatus;
    console.log('Created task:', newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Failed to create daily task:', error);
    return NextResponse.json({ error: 'Failed to create daily task' }, { status: 500 });
  }
}
