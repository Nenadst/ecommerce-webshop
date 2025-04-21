import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
  var mongooseConnection: Promise<typeof mongoose> | null;
}

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = mongoose.connect(MONGODB_URI, {
    dbName: 'ecommerce-webshop-db',
    bufferCommands: false,
  });
}

export async function connectToDatabase() {
  return cached;
}
