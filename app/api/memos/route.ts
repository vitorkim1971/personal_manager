import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/kv-db';
import type { Memo, CreateMemoInput } from '@/types';

// GET - 메모 목록 조회
export async function GET(request: NextRequest) {
  try {
    const memos = db.prepare('SELECT * FROM memos ORDER BY updated_at DESC').all() as Memo[];
    return NextResponse.json(memos);
  } catch (error) {
    console.error('Error fetching memos:', error);
    return NextResponse.json({ error: 'Failed to fetch memos' }, { status: 500 });
  }
}

// POST - 새 메모 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateMemoInput = await request.json();
    console.log('Creating memo with data:', body);

    const result = db.prepare(`
      INSERT INTO memos (
        title, content, created_at, updated_at
      ) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      body.title,
      body.content || null
    );

    const newMemo = db.prepare('SELECT * FROM memos WHERE id = ?')
      .get(result.lastInsertRowid) as Memo;

    return NextResponse.json(newMemo, { status: 201 });
  } catch (error) {
    console.error('Error creating memo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to create memo',
      message: errorMessage,
      details: error
    }, { status: 500 });
  }
}
