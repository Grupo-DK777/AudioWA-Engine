import fs from 'fs';
import OpenAI from 'openai';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { translateText } from './translation.service.js';

const openai = new OpenAI({ apiKey: env.openAiApiKey });

export const createPendingTranscription = async ({ file, targetLanguage }) => {
  return prisma.transcription.create({
    data: {
      originalFilename: file.originalname,
      storedFilename: file.filename,
      status: 'PENDING',
      targetLanguage: targetLanguage || env.defaultTargetLanguage || null,
    },
  });
};

export const processTranscription = async ({ transcriptionId, filePath, targetLanguage }) => {
  await prisma.transcription.update({
    where: { id: transcriptionId },
    data: { status: 'PROCESSING' },
  });

  const transcriptionResponse = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: env.openAiTranscriptionModel,
    response_format: 'verbose_json',
  });

  const transcriptionText = transcriptionResponse.text?.trim() || '';
  const detectedLanguage = transcriptionResponse.language || 'unknown';
  const durationSeconds = transcriptionResponse.duration || 0;

  const translatedText = await translateText({
    text: transcriptionText,
    targetLanguage,
  });

  const updated = await prisma.transcription.update({
    where: { id: transcriptionId },
    data: {
      detectedLanguage,
      transcriptionText,
      translatedText,
      durationSeconds,
      status: 'COMPLETED',
    },
  });

  return updated;
};

export const failTranscription = async ({ transcriptionId, errorMessage }) => {
  return prisma.transcription.update({
    where: { id: transcriptionId },
    data: {
      status: 'FAILED',
      errorMessage,
    },
  });
};

export const getAllTranscriptions = async () => {
  return prisma.transcription.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const getTranscriptionById = async (id) => {
  return prisma.transcription.findUnique({ where: { id } });
};
