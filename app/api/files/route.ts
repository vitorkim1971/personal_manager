import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { File as FileType, CreateFileInput } from '@/types';

// GET /api/files - 파일 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const task_id = searchParams.get('task_id');
    const project_id = searchParams.get('project_id');

    let query = 'SELECT * FROM files WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (task_id) {
      query += ' AND task_id = ?';
      params.push(parseInt(task_id));
    }

    if (project_id) {
      query += ' AND project_id = ?';
      params.push(parseInt(project_id));
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const files = stmt.all(...params) as FileType[];

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST /api/files - 파일 업로드
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const task_id = formData.get('task_id') as string;
    const project_id = formData.get('project_id') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 저장 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 데이터베이스에 파일 정보 저장
    const stmt = db.prepare(`
      INSERT INTO files (name, original_name, file_path, file_size, file_type, category, task_id, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      fileName,
      file.name,
      filePath,
      file.size,
      file.type || null,
      category || null,
      task_id ? parseInt(task_id) : null,
      project_id ? parseInt(project_id) : null
    );

    const newFile = db.prepare('SELECT * FROM files WHERE id = ?').get(result.lastInsertRowid) as FileType;

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

