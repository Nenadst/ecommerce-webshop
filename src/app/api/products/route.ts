import { connectToDatabase } from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();

  try {
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
