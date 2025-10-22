import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Project, CreateProjectInput } from '@/types';

// GET /api/projects - 프로젝트 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const projects = stmt.all(...params) as Project[];

    // 각 프로젝트의 수익 계산
    const projectsWithRevenue = projects.map(project => {
      const revenueStmt = db.prepare(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        WHERE project_id = ?
      `);
      
      const revenue = revenueStmt.get(project.id) as { total_income: number | null; total_expense: number | null };
      
      return {
        ...project,
        actual_revenue: (revenue.total_income || 0) - (revenue.total_expense || 0),
        total_income: revenue.total_income || 0,
        total_expense: revenue.total_expense || 0,
      };
    });

    return NextResponse.json(projectsWithRevenue);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - 프로젝트 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectInput = await request.json();

    const stmt = db.prepare(`
      INSERT INTO projects (name, description, start_date, end_date, status, target_revenue, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      body.name,
      body.description || null,
      body.start_date || null,
      body.end_date || null,
      body.status || 'planning',
      body.target_revenue || null,
      body.progress || 0
    );

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid) as Project;

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

