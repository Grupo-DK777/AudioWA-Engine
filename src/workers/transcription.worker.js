import fs from 'fs/promises';
import { Worker } from 'bullmq';
import { redisConnection } from '../queues/transcription.queue.js';
import { failTranscription, processTranscription } from '../services/transcription.service.js';
import { logger } from '../utils/logger.js';

export const transcriptionWorker = new Worker(
  'transcription-jobs',
  async (job) => {
    const { transcriptionId, filePath, targetLanguage } = job.data;

    try {
      const result = await processTranscription({
        transcriptionId,
        filePath,
        targetLanguage,
      });

      logger.info({ transcriptionId }, 'Transcription job completed');
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
    connection: redisConnection,
    concurrency: 2,
  },
);

transcriptionWorker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, err: error }, 'Worker emitted failed event');
});

transcriptionWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Worker emitted completed event');
});
