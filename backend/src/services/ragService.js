const { getAIClient, generateEmbedding } = require('./embeddingService');
const { getPineconeIndex } = require('../config/pinecone');
const ChatSession = require('../models/ChatSession');
const Cyclone = require('../models/Cyclone');
const PredictionResult = require('../models/PredictionResult');
const logger = require('../utils/logger');

const SYSTEM_PROMPT = `You are Cycloscope AI, an expert cyclone decision-support and meteorological assistant for the North Indian Ocean (Bay of Bengal and Arabian Sea).
Your role is to assist emergency planners, disaster managers, and researchers by analyzing cyclone intensity, track forecasts, and historical storm patterns.

CRITICAL OPERATIONAL RULES:
1. Ground your answers strictly in the provided Context and Cyclone Database facts.
2. If specific cyclone data, coordinates, or wind speeds are NOT available in the context or database, explicitly state that you do not have verified records rather than guessing.
3. NEVER fabricate storm names, landfall coordinates, or casualty/damage statistics.
4. Always remind users that Cycloscope supplements, but NEVER replaces, official bulletins issued by the India Meteorological Department (IMD) / RSMC New Delhi.
5. Keep explanations clear, actionable, and structured with concise meteorological reasoning.`;

async function retrieveContext(query, topK = 4) {
  const index = getPineconeIndex();
  let retrievedChunks = [];
  let retrievedIds = [];

  if (index) {
    try {
      const queryVector = await generateEmbedding(query);
      const queryResponse = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
      });

      if (queryResponse && queryResponse.matches) {
        retrievedChunks = queryResponse.matches
          .filter((m) => m.metadata && m.metadata.text)
          .map((m) => m.metadata.text);
        retrievedIds = queryResponse.matches.map((m) => m.id);
      }
    } catch (err) {
      logger.error('Error querying Pinecone index:', err);
    }
  }

  // If Pinecone returns nothing or is unconfigured, fall back to recent MongoDB active systems & predictions
  if (retrievedChunks.length === 0) {
    try {
      const activeCyclones = await Cyclone.find({ status: 'active' }).limit(5);
      const latestPredictions = await PredictionResult.find().sort({ requestedAt: -1 }).limit(3);

      if (activeCyclones.length > 0) {
        retrievedChunks.push(
          `Current Active Systems in DB: ` +
            activeCyclones
              .map(
                (c) =>
                  `Cyclone ${c.name} (${c.cycloneId}) in ${c.basin}, Category: ${c.currentCategory}, Wind: ${c.currentWindSpeedKmh} km/h, Location: [${c.currentLocation?.lat}, ${c.currentLocation?.lon}]`
              )
              .join('; ')
        );
        retrievedIds.push(...activeCyclones.map((c) => `cyclone-${c.cycloneId}`));
      }

      if (latestPredictions.length > 0) {
        retrievedChunks.push(
          `Latest Forecasts in DB: ` +
            latestPredictions
              .map(
                (p) =>
                  `Prediction for ${p.cycloneId} (Source: ${p.source}): Intensity ${p.intensity?.category} (${p.intensity?.windSpeedKmh} km/h), Next Track point: Lat ${p.trackForecast?.[0]?.lat}, Lon ${p.trackForecast?.[0]?.lon}`
              )
              .join('; ')
        );
      }
    } catch (dbErr) {
      logger.error('Error fetching fallback context from MongoDB:', dbErr);
    }
  }

  return { context: retrievedChunks.join('\n\n'), ids: retrievedIds };
}

async function handleChatMessage(sessionId, userMessage) {
  // 1. Fetch or initialize chat session
  let session = await ChatSession.findOne({ sessionId });
  if (!session) {
    session = await ChatSession.create({
      sessionId,
      messages: [],
    });
  }

  // 2. Retrieve grounded context from Pinecone & DB
  const { context, ids } = await retrieveContext(userMessage);

  // 3. Format conversation history
  const recentHistory = session.messages.slice(-6).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  // 4. Construct prompt
  const fullPrompt = `${SYSTEM_PROMPT}

CONTEXT INFORMATION:
${context || 'No specific historical context found for this query in the vector store.'}

PREVIOUS CONVERSATION:
${recentHistory || 'No previous messages.'}

USER QUESTION:
${userMessage}

GROUNDED METEOROLOGICAL RESPONSE:`;

  // 5. Call Gemini API or generate fallback response
  const genAI = getAIClient();
  let assistantReply = '';

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      assistantReply = response.text();
    } catch (err) {
      logger.error('Gemini generateContent error:', err);
      assistantReply = `I am currently operating in limited-connectivity mode. Based on current system tracking, please check the official IMD advisories at rsmcnewdelhi.imd.gov.in.`;
    }
  } else {
    assistantReply = `[Local Development Assistant] Received query: "${userMessage}". Active cyclone monitoring is operational. For official safety warnings, consult IMD bulletins. (Set GEMINI_API_KEY to activate live generative analysis).`;
  }

  // 6. Save message history to session
  session.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
    retrievedContextIds: ids,
  });

  session.messages.push({
    role: 'assistant',
    content: assistantReply,
    timestamp: new Date(),
    retrievedContextIds: ids,
  });

  await session.save();

  return {
    sessionId,
    reply: assistantReply,
    retrievedContextIds: ids,
    disclaimer: 'AI-generated decision support. Verify all operational alerts with official IMD bulletins.',
  };
}

module.exports = {
  retrieveContext,
  handleChatMessage,
};
