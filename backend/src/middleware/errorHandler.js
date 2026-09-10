import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const key = Object.keys(err.keyPattern || {})[0] || 'field';
    if (key.includes('bookingSlug')) {
      return errorResponse(res, 409, 'This booking link is already taken. Please choose another.', null, 'SLUG_ALREADY_EXISTS');
    }
    if (key.includes('email')) {
      return errorResponse(res, 409, 'An account with this email address already exists.', null, 'EMAIL_ALREADY_EXISTS');
    }
    if (key.includes('startTime') || key.includes('dateString') || key.includes('professionalId')) {
      return errorResponse(res, 409, 'This time slot is already booked. Please choose another time.', null, 'SLOT_ALREADY_BOOKED');
    }
    return errorResponse(res, 409, `Duplicate entry for ${key}.`, null, 'DUPLICATE_KEY_ERROR');
  }

  // Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Invalid ${err.path}: ${err.value}`, null, 'INVALID_ID');
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return errorResponse(res, 400, messages[0] || 'Validation error', messages, 'VALIDATION_ERROR');
  }

  // Default fallback
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong on our end. Please try again.';
  const code = typeof err.code === 'string' ? err.code : null;

  return errorResponse(res, statusCode, message, null, code);
};

