import { connectToDatabase } from '@/lib/mongoose';
import { Category } from '@/models/Category';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  const categories = await Category.find();
  return NextResponse.json(categories);
}
