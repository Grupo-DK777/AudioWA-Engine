import fs from 'fs/promises';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';
import { failTranscription, processTranscription } from '../services/transcription.service.js';
import { logger } from '../utils/logger.js';

// Create a dedicated connection for the worker to avoid blocking the queue's connection
const workerConnection = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

export const transcriptionWorker = new Worker(
  'transcription-jobs',
  async (job) => {
    const { transcriptionId, filePath, targetLanguage } = job.data;
    logger.info({ transcriptionId }, 'Starting to process transcription job');

    try {
      const result = await processTranscription({
        transcriptionId,
        filePath,
        targetLanguage,
      });

      logger.info({ transcriptionId }, 'Transcription job completed successfully');
      await fs.unlink(filePath).catch(() => {});
      return result;
    } catch (error) {
      logger.error({ err: error, transcriptionId }, 'Transcription job failed');
      await failTranscription({
        transcriptionId,
        errorMessage: error.message,
      });
      await fs.unlink(filePath).catch(() => {});
      throw error;
    }
  },
  {
    connection: workerConnection,
    concurrency: 2,
  },
);

transcriptionWorker.on('ready', () => {
  logger.info('Transcription Worker is ready and listening for jobs');
});

transcriptionWorker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, err: error }, 'Worker emitted failed event');
});

transcriptionWorker.on('error', (err) => {
  logger.error({ err }, 'Worker encountered an error');
});

transcriptionWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Worker emitted completed event');
});

