import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';

export async function GET() {
  await connectToDatabase();

  const user = await User.create({
    email: 'test@test.com',
    password: '123',
    name: 'Test User',
  });

  return NextResponse.json(user);
}

// export async function GET() {
//   await connectToDatabase();
//   const users = await User.find();
//   return NextResponse.json(users);
// }
