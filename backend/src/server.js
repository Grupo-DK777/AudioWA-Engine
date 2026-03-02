import express from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import { env } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import { transcriptionRouter } from './routes/transcription.routes.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';
import './workers/transcription.worker.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  pinoHttp({
    logger,
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', transcriptionRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');

    app.listen(env.port, () => {
      logger.info(`AudioWA-Engine listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
