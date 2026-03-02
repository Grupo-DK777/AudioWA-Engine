import { Router } from 'express';
import {
  createTranscription,
  getTranscription,
  listTranscriptions,
} from '../controllers/transcription.controller.js';
import { uploadAudio } from '../middlewares/upload.middleware.js';

export const transcriptionRouter = Router();

transcriptionRouter.post('/transcribe', uploadAudio, createTranscription);
transcriptionRouter.get('/transcriptions', listTranscriptions);
transcriptionRouter.get('/transcriptions/:id', getTranscription);
