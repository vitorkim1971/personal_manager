import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Task, CreateTaskInput } from '@/types';

// GET /api/tasks - 작업 목록 조회 (필터링 지원)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const project_id = searchParams.get('project_id');

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (project_id) {
      query += ' AND project_id = ?';
      params.push(parseInt(project_id));
    }

    query += ' ORDER BY due_date ASC, priority DESC, created_at DESC';

    const stmt = db.prepare(query);
    const tasks = stmt.all(...params) as Task[];

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - 작업 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskInput = await request.json();

    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, priority, category, status, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.title,
      body.description || null,
      body.due_date || null,
      body.priority || 'medium',
      body.category,
      body.status || 'todo',
      body.project_id || null
    );

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

