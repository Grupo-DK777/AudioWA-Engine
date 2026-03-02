import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['DATABASE_URL', 'OPENAI_API_KEY', 'REDIS_URL'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  openAiApiKey: process.env.OPENAI_API_KEY,
  redisUrl: process.env.REDIS_URL,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 25),
  defaultTargetLanguage: process.env.DEFAULT_TARGET_LANGUAGE || '',
  openAiTranscriptionModel:
    process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe',
  openAiTranslationModel: process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4o-mini',
};
