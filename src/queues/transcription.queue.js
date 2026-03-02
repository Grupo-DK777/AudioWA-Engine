import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '../config/env.js';

const connection = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
});

export const transcriptionQueue = new Queue('transcription-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

export const addTranscriptionJob = async (payload) => {
  return transcriptionQueue.add('process-transcription', payload);
};

export { connection as redisConnection };
