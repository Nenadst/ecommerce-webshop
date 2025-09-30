import { prisma } from './prisma';

export { prisma };

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('Disconnected from PostgreSQL database');
  } catch (error) {
    console.error('Failed to disconnect from database:', error);
    throw error;
  }
}