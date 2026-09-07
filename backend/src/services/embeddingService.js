const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPineconeIndex } = require('../config/pinecone');
const logger = require('../utils/logger');

let genAIClient = null;

function getAIClient() {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY is not configured');
    return null;
  }
  if (!genAIClient) {
    try {
      genAIClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      logger.info('GoogleGenerativeAI client initialized successfully');
    } catch (err) {
      logger.error('Failed to initialize Google Generative AI SDK:', err);
      return null;
    }
  }
  return genAIClient;
}

/**
 * Generate embedding vector for a given text query/document
 */
async function generateEmbedding(text) {
  const client = getAIClient();
  if (!client) {
    logger.debug('Generating fallback vector for local dev (GEMINI_API_KEY missing)');
    return new Array(768).fill(0).map((_, i) => Math.sin(text.length + i) * 0.01);
  }

  try {
    const embeddingModel = client.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    logger.error('Failed to generate embedding from Gemini API:', err);
    return new Array(768).fill(0).map((_, i) => Math.sin(text.length + i) * 0.01);
  }
}

/**
 * Index a cyclone record or prediction document into Pinecone
 */
async function upsertDocument(id, text, metadata = {}) {
  const index = getPineconeIndex();
  if (!index) {
    logger.debug(`[Pinecone] Skipping upsert for doc ${id} (Pinecone not configured)`);
    return false;
  }

  try {
    const values = await generateEmbedding(text);
    await index.upsert([
      {
        id,
        values,
        metadata: {
          ...metadata,
          text,
          updatedAt: new Date().toISOString(),
        },
      },
    ]);
    logger.info(`Successfully upserted document ${id} to Pinecone`);
    return true;
  } catch (err) {
    logger.error(`Failed to upsert doc ${id} to Pinecone:`, err);
    return false;
  }
}

module.exports = {
  getAIClient,
  generateEmbedding,
  upsertDocument,
};
