import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorResponse, successResponse } from './utils/response.js';

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, can restrict in production
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers with request size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply General Rate Limiter to API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'BookSaathi API is running healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Main API Routes
app.use('/api', routes);

// Handle 404 Not Found
app.use('*', (req, res) => {
  return errorResponse(res, 404, `Cannot ${req.method} ${req.originalUrl}`);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
