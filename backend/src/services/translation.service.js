import OpenAI from 'openai';
import { env } from '../config/env.js';

const openai = new OpenAI({ apiKey: env.openAiApiKey });

export const translateText = async ({ text, targetLanguage }) => {
  if (!targetLanguage || !text) {
    return null;
  }

  const response = await openai.responses.create({
    model: env.openAiTranslationModel,
    input: [
      {
        role: 'system',
        content:
          'You are a professional translator. Return only the translated text, with no extra metadata.',
      },
      {
        role: 'user',
        content: `Translate the following text to ${targetLanguage}:\n\n${text}`,
      },
    ],
  });

  return response.output_text?.trim() || null;
};
