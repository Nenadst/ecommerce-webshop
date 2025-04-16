import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file: File | null = formData.get('file') as unknown as File;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true }); // ✅ create the folder if missing
  }

  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;
  return NextResponse.json({ url });
}
