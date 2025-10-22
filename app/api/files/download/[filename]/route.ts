import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { readFile } from 'fs/promises';
import type { File as FileType } from '@/types';

// GET /api/files/download/[filename] - 파일명으로 파일 다운로드
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const stmt = db.prepare('SELECT * FROM files WHERE filename = ?');
    const file = stmt.get(filename) as FileType | undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 파일 읽기
    const fileBuffer = await readFile(file.file_path);

    // 파일 다운로드 응답
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.file_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.original_name)}"`,
        'Content-Length': file.file_size.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
