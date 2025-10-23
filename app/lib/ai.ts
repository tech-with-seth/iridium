import OpenAI from 'openai';

export const ai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
