import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seeds/seed.js';
import { User } from './models/User.js';
import { initSocket } from './socket/index.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if running fresh local development and no users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] No existing users found. Auto-seeding demo data...');
      await seedDatabase();
    }

    const httpServer = http.createServer(app);
    
    // Initialize Socket.IO with authentication & scoped rooms
    const io = initSocket(httpServer);
    console.log('⚡ Socket.IO real-time engine initialized.');

    httpServer.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 BookSaathi REST API & Realtime Socket.IO running on http://localhost:${PORT}`);
      console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`🩺 Demo Public Link: http://localhost:3000/book/dr-rajesh`);
      console.log(`🔑 Demo Doctor: dr.rajesh@booksaathi.in | Password123`);
      console.log(`🔑 Demo User:   rahul.user@booksaathi.in | User@12345`);
      console.log(`🔑 Demo Admin:  admin@booksaathi.in | Admin@12345`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
