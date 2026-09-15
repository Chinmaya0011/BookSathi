import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    
    // Initialize Socket.IO with authentication & scoped rooms
    const io = initSocket(httpServer);
    console.log('⚡ Socket.IO real-time engine initialized.');

    httpServer.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 BookSaathi REST API & Realtime Socket.IO running on http://localhost:${PORT}`);
      console.log(`📡 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
