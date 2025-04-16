import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// ✅ Extend globalThis using ES module-compatible syntax
interface GlobalWithMongoose {
  mongooseConnection: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & GlobalWithMongoose;

if (!globalWithMongoose.mongooseConnection) {
  globalWithMongoose.mongooseConnection = mongoose.connect(MONGODB_URI, {
    dbName: 'ecommerce-webshop-db',
    bufferCommands: false,
  });
}

export async function connectToDatabase() {
  return globalWithMongoose.mongooseConnection;
}
