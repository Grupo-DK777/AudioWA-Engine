import { addTranscriptionJob } from '../queues/transcription.queue.js';
import {
  createPendingTranscription,
  getAllTranscriptions,
  getTranscriptionById,
} from '../services/transcription.service.js';

export const createTranscription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required in field "audio"' });
    }

    const targetLanguage = req.body.targetLanguage || null;

    const record = await createPendingTranscription({
      file: req.file,
      targetLanguage,
    });

    await addTranscriptionJob({
      transcriptionId: record.id,
      filePath: req.file.path,
      targetLanguage: record.targetLanguage,
    });

    return res.status(202).json({
      id: record.id,
      originalFilename: record.originalFilename,
      detectedLanguage: record.detectedLanguage,
      transcription: record.transcriptionText,
      translatedText: record.translatedText,
      durationSeconds: record.durationSeconds,
      status: record.status,
      createdAt: record.createdAt,
    });
  } catch (error) {
    return next(error);
  }
};

export const listTranscriptions = async (_req, res, next) => {
  try {
    const transcriptions = await getAllTranscriptions();

    return res.json(
      transcriptions.map((item) => ({
        id: item.id,
        originalFilename: item.originalFilename,
        detectedLanguage: item.detectedLanguage,
        transcription: item.transcriptionText,
        translatedText: item.translatedText,
        durationSeconds: item.durationSeconds,
        status: item.status,
        createdAt: item.createdAt,
      })),
    );
  } catch (error) {
    return next(error);
  }
};

export const getTranscription = async (req, res, next) => {
  try {
    const transcription = await getTranscriptionById(req.params.id);

    if (!transcription) {
      return res.status(404).json({ message: 'Transcription not found' });
    }

    return res.json({
      id: transcription.id,
      originalFilename: transcription.originalFilename,
      detectedLanguage: transcription.detectedLanguage,
      transcription: transcription.transcriptionText,
      translatedText: transcription.translatedText,
      durationSeconds: transcription.durationSeconds,
      status: transcription.status,
      createdAt: transcription.createdAt,
    });
  } catch (error) {
    return next(error);
  }
};
