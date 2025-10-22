import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { unlink } from 'fs/promises';
import type { File as FileType } from '@/types';

// GET /api/files/[id] - 파일 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stmt = db.prepare('SELECT * FROM files WHERE id = ?');
    const file = stmt.get(parseInt(id)) as FileType | undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[id] - 파일 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 파일 정보 조회
    const file = db.prepare('SELECT * FROM files WHERE id = ?').get(parseInt(id)) as FileType | undefined;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 파일 시스템에서 파일 삭제
    try {
      await unlink(file.file_path);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // 파일이 이미 없어도 DB에서는 삭제
    }

    // 데이터베이스에서 삭제
    const stmt = db.prepare('DELETE FROM files WHERE id = ?');
    stmt.run(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

