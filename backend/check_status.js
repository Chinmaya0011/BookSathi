import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const res = await mongoose.connection.collection('professionalprofiles').updateMany(
    { status: 'SUSPENDED' },
    { $set: { status: 'ACTIVE' } }
  );
  console.log('Updated profiles to ACTIVE:', res.modifiedCount);

  const profiles = await mongoose.connection.collection('professionalprofiles').find({}).toArray();
  console.log('Current profiles:', profiles.map(p => ({ email: p.email, status: p.status, name: p.name })));

  await mongoose.disconnect();
}

fix().catch(console.error);
