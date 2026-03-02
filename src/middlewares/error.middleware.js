import multer from 'multer';
import { logger } from '../utils/logger.js';

export const notFoundMiddleware = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorMiddleware = (error, req, res, _next) => {
  logger.error({ err: error, path: req.originalUrl }, 'Unhandled error');

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        details: `Max size: ${process.env.MAX_FILE_SIZE_MB || 25} MB`,
      });
    }

    return res.status(400).json({ message: error.message });
  }

  const status = error.statusCode || 500;
  return res.status(status).json({
    message: error.message || 'Internal server error',
  });
};
