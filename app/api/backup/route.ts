import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/backup?action=export - 데이터 내보내기
// POST /api/backup?action=import - 데이터 가져오기
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'export') {
    try {
      // 모든 테이블 데이터 조회
      const tasks = db.prepare('SELECT * FROM tasks').all();
      const transactions = db.prepare('SELECT * FROM transactions').all();
      const projects = db.prepare('SELECT * FROM projects').all();
      const budgets = db.prepare('SELECT * FROM budgets').all();
      const settings = db.prepare('SELECT * FROM settings').all();

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          tasks,
          transactions,
          projects,
          budgets,
          settings,
        },
      };

      return NextResponse.json(backup);
    } catch (error) {
      console.error('Error exporting data:', error);
      return NextResponse.json(
        { error: 'Failed to export data' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'import') {
    try {
      const backup = await request.json();

      // 데이터 유효성 검사
      if (!backup.data) {
        return NextResponse.json(
          { error: 'Invalid backup format' },
          { status: 400 }
        );
      }

      // 기존 데이터 삭제
      db.prepare('DELETE FROM tasks').run();
      db.prepare('DELETE FROM transactions').run();
      db.prepare('DELETE FROM projects').run();
      db.prepare('DELETE FROM budgets').run();
      db.prepare('DELETE FROM settings').run();

      // 데이터 복원
      if (backup.data.projects) {
        const insertProject = db.prepare(`
          INSERT INTO projects (id, name, description, start_date, end_date, status, target_revenue, progress, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const project of backup.data.projects) {
          insertProject.run(
            project.id,
            project.name,
            project.description,
            project.start_date,
            project.end_date,
            project.status,
            project.target_revenue,
            project.progress,
            project.created_at,
            project.updated_at
          );
        }
      }

      if (backup.data.tasks) {
        const insertTask = db.prepare(`
          INSERT INTO tasks (id, title, description, due_date, priority, category, status, project_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const task of backup.data.tasks) {
          insertTask.run(
            task.id,
            task.title,
            task.description,
            task.due_date,
            task.priority,
            task.category,
            task.status,
            task.project_id,
            task.created_at,
            task.updated_at
          );
        }
      }

      if (backup.data.transactions) {
        const insertTransaction = db.prepare(`
          INSERT INTO transactions (id, type, amount, category, date, memo, payment_method, project_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const transaction of backup.data.transactions) {
          insertTransaction.run(
            transaction.id,
            transaction.type,
            transaction.amount,
            transaction.category,
            transaction.date,
            transaction.memo,
            transaction.payment_method,
            transaction.project_id,
            transaction.created_at,
            transaction.updated_at
          );
        }
      }

      if (backup.data.budgets) {
        const insertBudget = db.prepare(`
          INSERT INTO budgets (id, category, amount, month, year, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const budget of backup.data.budgets) {
          insertBudget.run(
            budget.id,
            budget.category,
            budget.amount,
            budget.month,
            budget.year,
            budget.created_at,
            budget.updated_at
          );
        }
      }

      if (backup.data.settings) {
        const insertSetting = db.prepare(`
          INSERT INTO settings (id, key, value, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const setting of backup.data.settings) {
          insertSetting.run(
            setting.id,
            setting.key,
            setting.value,
            setting.created_at,
            setting.updated_at
          );
        }
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error importing data:', error);
      return NextResponse.json(
        { error: 'Failed to import data' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

