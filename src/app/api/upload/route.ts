import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file: File | null = formData.get('file') as unknown as File;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  // Calculate hash of file content for deduplication
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const extension = path.extname(file.name);
  const filename = `${hash}${extension}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);

  // Check if file with same hash already exists
  if (existsSync(filepath)) {
    // File already exists, return existing URL
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url, message: 'Using existing image' });
  }

  // Save new file
  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
