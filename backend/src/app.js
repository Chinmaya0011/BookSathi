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

// Enable trust proxy for reverse proxies & serverless environments (Vercel, Cloudflare, Heroku, AWS)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing
const rawClientUrl = (process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');
const rawFrontendUrl = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');

const allowedOrigins = [
  rawClientUrl,
  rawFrontendUrl,
  'https://book-sathi-three.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://www.headerguards.online'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');
      const isProduction = process.env.NODE_ENV === 'production';
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      if (isProduction) {
        return callback(new Error('CORS policy: Origin not allowed'), false);
      }

      return callback(null, true); // Permissive in local dev only
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers with request size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie Parser Middleware
app.use((req, res, next) => {
  if (req.headers.cookie) {
    req.cookies = req.headers.cookie.split(';').reduce((cookies, item) => {
      const [name, ...rest] = item.trim().split('=');
      if (name) {
        cookies[name] = decodeURIComponent(rest.join('=') || '');
      }
      return cookies;
    }, {});
  } else {
    req.cookies = req.cookies || {};
  }
  next();
});

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
app.use((req, res) => {
  return errorResponse(res, 404, `Cannot ${req.method} ${req.originalUrl}`);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
