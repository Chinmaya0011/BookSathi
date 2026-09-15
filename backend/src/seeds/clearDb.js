import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';

dotenv.config();

export const clearAllDatabaseData = async () => {
  console.log('\n======================================================');
  console.log('🧹 Starting Complete Database Wipe...');
  console.log('======================================================\n');

  await connectDB();

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log(`Found ${collections.length} database collections to wipe.`);

  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;
    const col = db.collection(colName);
    const deleteResult = await col.deleteMany({});
    console.log(`✓ Cleared collection '${colName}' (${deleteResult.deletedCount} documents removed)`);
  }

  console.log('\n🎉 ALL DATABASE COLLECTIONS EMPTIED COMPLETELY!');
  await disconnectDB();
};

if (process.argv[1] && process.argv[1].includes('clearDb.js')) {
  clearAllDatabaseData()
    .then(() => {
      console.log('Database cleanup finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database cleanup error:', err);
      process.exit(1);
    });
}
