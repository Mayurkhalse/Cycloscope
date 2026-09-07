const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');

let pineconeClient = null;

function getPineconeClient() {
  if (!process.env.PINECONE_API_KEY) {
    logger.warn('PINECONE_API_KEY is not configured in environment variables');
    return null;
  }
  if (!pineconeClient) {
    try {
      pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
      logger.info('Pinecone client initialized successfully');
    } catch (err) {
      logger.error('Failed to initialize Pinecone client:', err);
      return null;
    }
  }
  return pineconeClient;
}

function getPineconeIndex() {
  const client = getPineconeClient();
  if (!client) return null;
  const indexName = process.env.PINECONE_INDEX || 'cyclone-rag';
  try {
    return client.index(indexName);
  } catch (err) {
    logger.error(`Failed to get Pinecone index '${indexName}':`, err);
    return null;
  }
}

module.exports = { getPineconeClient, getPineconeIndex };
