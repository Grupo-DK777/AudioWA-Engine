import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env.js';

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const allowedMimeTypes = [
  'audio/ogg',
  'audio/opus',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
];

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, env.uploadDir),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    return;
  }

  cb(null, true);
};

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
  },
  fileFilter,
}).single('audio');
