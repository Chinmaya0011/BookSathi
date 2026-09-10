import { errorResponse } from '../utils/response.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return errorResponse(res, 400, formattedErrors[0]?.message || 'Validation error', formattedErrors);
    }
    return errorResponse(res, 400, 'Invalid request data');
  }
};
