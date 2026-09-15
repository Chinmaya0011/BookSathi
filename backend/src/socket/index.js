import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ProfessionalProfile } from '../models/ProfessionalProfile.js';
import { Appointment } from '../models/Appointment.js';
import { Conversation } from '../models/Conversation.js';
import { hashCancelToken } from '../services/appointmentService.js';
import { otpService } from '../services/otpService.js';
import { setSocketServer } from './socketEmitter.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
  ];

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
      }

      if (!token) {
        return next(new Error('AUTHENTICATION_ERROR: Token is required to establish real-time connection.'));
      }

      const secret = process.env.JWT_SECRET || 'booksaathi_jwt_super_secret_key_2026_indian_professionals';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id).select('+role');
      if (!user || !user.isActive) {
        return next(new Error('AUTHENTICATION_ERROR: User account is inactive or not found.'));
      }

      socket.user = user;

      // Find linked professional profile if applicable
      if (user.role === 'PROFESSIONAL') {
        const profile = await ProfessionalProfile.findOne({ userId: user._id });
        socket.profile = profile || null;
      }

      next();
    } catch (err) {
      return next(new Error('AUTHENTICATION_ERROR: Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    // 1. Join personal user room
    socket.join(`user:${userId}`);

    // 2. Join professional room if provider
    if (socket.profile) {
      const proId = socket.profile._id.toString();
      socket.join(`professional:${proId}`);
      socket.join(`prof_${proId}`);
    }

    // 3. Join admin channels if ADMIN
    if (user.role === 'ADMIN') {
      socket.join('admin:ops');
      socket.join(`admin:${userId}`);
      socket.join('role:admin');
    }

    // Queue real-time subscription
    socket.on('join:queue', ({ professionalId, dateString }) => {
      if (professionalId && dateString) {
        socket.join(`queue_${professionalId}_${dateString}`);
      }
    });

    socket.on('leave:queue', ({ professionalId, dateString }) => {
      if (professionalId && dateString) {
        socket.leave(`queue_${professionalId}_${dateString}`);
      }
    });

    // Secure guest / public booking room join with valid cancelToken or manageSessionToken
    socket.on('join:booking', async (data = {}, callback) => {
      try {
        const { appointmentCode, cancelToken, sessionToken } = data;
        if (!appointmentCode) {
          if (callback) callback({ success: false, error: 'Appointment code is required.' });
          return;
        }

        const appointment = await Appointment.findOne({ appointmentCode }).select('+cancelTokenHash');
        if (!appointment) {
          socket.emit('join:booking_error', { message: 'Appointment not found.' });
          if (callback) callback({ success: false, error: 'Appointment not found.' });
          return;
        }

        let isAuthorized = false;
        if (cancelToken && appointment.cancelTokenHash && hashCancelToken(cancelToken) === appointment.cancelTokenHash) {
          isAuthorized = true;
        } else if (sessionToken && otpService.verifyManageSessionToken(sessionToken, appointmentCode)) {
          isAuthorized = true;
        } else if (user.role === 'ADMIN' || (appointment.userId && appointment.userId.toString() === userId)) {
          isAuthorized = true;
        }

        if (!isAuthorized) {
          socket.emit('join:booking_error', { message: 'Unauthorized booking credentials.' });
          if (callback) callback({ success: false, error: 'Unauthorized.' });
          return;
        }

        socket.join(`booking:${appointmentCode}`);
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Dynamic room authorization for specific appointments (Strict Membership Check)
    socket.on('join:appointment', async (appointmentId, callback) => {
      try {
        if (!appointmentId) return;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
          socket.emit('join:appointment_error', { message: 'Appointment not found.' });
          if (callback) callback({ success: false, error: 'Appointment not found.' });
          return;
        }

        const isOwner = appointment.userId && appointment.userId.toString() === userId;
        const isPro = socket.profile && appointment.professionalId.toString() === socket.profile._id.toString();
        const isAdmin = user.role === 'ADMIN';

        if (!isOwner && !isPro && !isAdmin) {
          socket.emit('join:appointment_error', {
            message: 'Unauthorized. You are not a participant in this appointment.',
          });
          if (callback) callback({ success: false, error: 'Unauthorized.' });
          return;
        }

        socket.join(`appointment:${appointmentId}`);
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('leave:appointment', (appointmentId) => {
      if (!appointmentId) return;
      socket.leave(`appointment:${appointmentId}`);
    });

    // Real-time Chat Conversation Rooms (Strict Membership Check)
    socket.on('join:conversation', async (conversationId, callback) => {
      try {
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('join:conversation_error', { message: 'Conversation not found.' });
          if (callback) callback({ success: false, error: 'Conversation not found.' });
          return;
        }

        const isParticipant = conversation.participants?.some(
          (p) => p.user && p.user.toString() === userId
        );
        const isAdmin = user.role === 'ADMIN';

        if (!isParticipant && !isAdmin) {
          socket.emit('join:conversation_error', {
            message: 'Unauthorized. You are not a participant in this conversation.',
          });
          if (callback) callback({ success: false, error: 'Unauthorized.' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('leave:conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('chat:typing', ({ conversationId, recipientId, isTyping }) => {
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('chat:typing', {
          conversationId,
          userId,
          name: user.name || 'User',
          isTyping,
        });
      }
      if (recipientId) {
        socket.to(`user:${recipientId}`).emit('chat:typing', {
          conversationId,
          userId,
          name: user.name || 'User',
          isTyping,
        });
      }
    });

    socket.on('chat:read', ({ conversationId, recipientId }) => {
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('chat:read', {
          conversationId,
          readerId: userId,
        });
      }
      if (recipientId) {
        socket.to(`user:${recipientId}`).emit('chat:read', {
          conversationId,
          readerId: userId,
        });
      }
    });

    // Client ping/pong heartbeat for status monitoring
    socket.on('heartbeat', (data) => {
      socket.emit('heartbeat:ack', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      // Clean disconnect
    });
  });

  ioInstance = io;
  setSocketServer(io);
  return io;
};

export const getIO = () => {
  return ioInstance;
};
