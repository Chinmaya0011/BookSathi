import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/booksaathi';

  try {
    // Attempt connection with 10s timeout for remote cloud Atlas
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${uri}): ${err.message}`);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[MongoDB] Starting in-memory MongoDB fallback for local development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`[MongoDB] In-memory MongoDB connected: ${memUri}`);
      } catch (memErr) {
        console.error('[MongoDB] In-memory database failed:', memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
