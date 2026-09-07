# Backend — Architecture, Schemas & API Specification
**Stack:** Node.js + Express + MongoDB (MERN backend) — kept fully separate from the ML/FastAPI layer

---

## 1. Responsibilities

The backend is the **orchestrator**, not a model host and not a data fetcher. It:
1. Serves cyclone/prediction/historical data to the frontend
2. Tells the ML FastAPI service *what* to check (a cyclone ID + last known position, or "scan regions") — it never sources or passes satellite imagery itself, since `ingestion/` lives inside the ML service (see ML doc, §1A)
3. Applies the **fallback layer** when the ML service fails, whether from an ingestion failure (no satellite frame obtained) or a model failure (inference itself failed)
4. Stores predictions, historical data, and chat sessions in MongoDB
5. Orchestrates the RAG chatbot: retrieves context from Pinecone, calls Gemini, returns grounded answers
6. Exposes Swagger UI for API documentation (see §7)

The backend **never trains or loads ML models, and never touches raw satellite imagery** — it only makes lightweight HTTP calls to the ML service and stores whatever structured JSON comes back.

---

## 2. High-Level Architecture

```
                     ┌────────────────────┐
                     │      Frontend       │
                     └─────────┬───────────┘
                               │ REST (Axios)
                               ▼
                     ┌────────────────────┐
                     │   Express Backend   │
                     │  (Node.js, MERN)    │
                     ├────────────────────┤
                     │ Controllers         │
                     │ Services            │
                     │ Fallback Layer      │
                     │ RAG Orchestrator    │
                     │ Prediction Scheduler│
                     └───┬─────────┬──────┘
                         │         │  lightweight calls:
                         │         │  cycloneId + last known position,
                         │         │  or "scan regions" — no imagery
         ┌───────────────┘         └───────────────┐
         ▼                                          ▼
┌─────────────────┐                      ┌─────────────────────────┐
│  MongoDB Atlas   │                      │  ML FastAPI Service      │
│ (cyclones,       │                      │  ┌─────────────────────┐│
│  predictions,    │◄────stores results───│  │ ingestion/           ││
│  chat sessions)  │                      │  │ (MOSDAC fetch+crop)  ││
└─────────────────┘                      │  └─────────┬───────────┘│
                                          │            ▼             │
                                          │  ┌─────────────────────┐│
                                          │  │ serving/ (inference) ││
                                          │  └─────────────────────┘│
                                          │  (separate service,      │
                                          │   see ML doc)             │
                                          └─────────────────────────┘
         ▲
         │ embeddings + retrieval
         ▼
┌─────────────────┐        ┌─────────────────┐
│  Pinecone        │        │  Gemini API      │
│  (vector DB)     │        │  (free tier LLM) │
└─────────────────┘        └─────────────────┘
```

---

## 3. Database Schemas (MongoDB / Mongoose)

### 3.1 `Cyclone`
```js
{
  cycloneId: String,          // unique, e.g. "IO_2026_03"
  name: String,
  basin: String,               // "Bay of Bengal" | "Arabian Sea"
  season: Number,               // year
  status: String,               // "active" | "dissipated" | "historical"
  currentCategory: String,      // IMD category
  currentWindSpeedKmh: Number,
  currentPressureHpa: Number,
  lastUpdated: Date,
  currentLocation: { lat: Number, lon: Number },
  source: String                 // "IBTrACS" | "live-feed"
}
```

### 3.2 `TrackPoint` (historical + predicted, one collection, discriminated by `type`)
```js
{
  cycloneId: String,           // ref -> Cyclone.cycloneId
  timestamp: Date,
  type: String,                 // "observed" | "predicted"
  leadTimeHours: Number,        // null for observed; 6/12/24 for predicted
  lat: Number,
  lon: Number,
  windSpeedKmh: Number,
  pressureHpa: Number,
  uncertaintyRadiusKm: Number,  // for predicted points, drives the uncertainty cone
  confidence: Number            // 0-1
}
```

### 3.3 `PredictionResult`
```js
{
  cycloneId: String,
  requestedAt: Date,
  source: String,                // "ml-model" | "fallback-climatology"
  modelVersion: String,          // null if fallback
  detection: {
    present: Boolean,
    confidence: Number
  },
  intensity: {
    category: String,
    windSpeedKmh: Number,
    confidence: Number
  },
  trackForecast: [ /* array of TrackPoint-shaped predicted entries */ ],
  cyclogenesisProbability48h: Number,
  fallbackReason: String          // populated only if source == fallback
}
```

### 3.4 `ClimatologyProfile` (used by the fallback layer — see §6)
```js
{
  basin: String,
  month: Number,                  // 1-12, seasonal profile
  avgWindSpeedKmh: Number,
  avgPressureHpa: Number,
  avgTrackBearingDeg: Number,     // typical direction of movement
  avgTrackSpeedKmh: Number,
  sampleSize: Number               // how many historical storms this is based on
}
```

### 3.5 `ChatSession`
```js
{
  sessionId: String,
  createdAt: Date,
  messages: [
    {
      role: String,             // "user" | "assistant"
      content: String,
      timestamp: Date,
      retrievedContextIds: [String]   // Pinecone doc IDs used for grounding
    }
  ]
}
```

### 3.6 `AlertLog` (audit trail — important for a safety-adjacent system)
```js
{
  cycloneId: String,
  riskLevel: String,
  triggeredAt: Date,
  predictionSource: String,     // "ml-model" | "fallback"
  fallbackReason: String,        // "ingestion-failure" | "model-failure" | null
  notes: String
}
```

---

## 4. API Endpoints

All routes prefixed `/api`.

### Cyclones
| Method | Route | Description |
|---|---|---|
| GET | `/cyclones/active` | List currently active systems |
| GET | `/cyclones/:cycloneId` | Full detail for one system |
| GET | `/cyclones/historical` | Query historical storms (filters: year, basin, category) |

### Predictions
| Method | Route | Description |
|---|---|---|
| POST | `/predictions/:cycloneId/refresh` | Trigger a new inference call to the ML layer (with fallback logic applied) |
| GET | `/predictions/:cycloneId/latest` | Get latest stored prediction |
| GET | `/predictions/:cycloneId/history` | Prediction history for that system (for accuracy tracking) |

### Cyclogenesis
| Method | Route | Description |
|---|---|---|
| GET | `/cyclogenesis/watch` | List of candidate disturbances with formation probability |

### Chatbot (RAG)
| Method | Route | Description |
|---|---|---|
| POST | `/chat/:sessionId/message` | Send a user message, get a grounded answer |
| GET | `/chat/:sessionId/history` | Retrieve chat history |
| DELETE | `/chat/:sessionId` | Clear a session |

### System
| Method | Route | Description |
|---|---|---|
| GET | `/system/health` | Backend + ML layer health status |
| GET | `/system/ml-status` | Whether live ML or fallback is currently active |

---

## 5. Example Request/Response

**POST `/api/predictions/IO_2026_03/refresh`**

Response:
```json
{
  "cycloneId": "IO_2026_03",
  "source": "ml-model",
  "modelVersion": "intensity-v1.2",
  "detection": { "present": true, "confidence": 0.94 },
  "intensity": { "category": "Severe Cyclonic Storm", "windSpeedKmh": 115, "confidence": 0.81 },
  "trackForecast": [
    { "leadTimeHours": 6, "lat": 15.2, "lon": 88.1, "windSpeedKmh": 118, "uncertaintyRadiusKm": 40, "confidence": 0.78 },
    { "leadTimeHours": 24, "lat": 16.9, "lon": 87.0, "windSpeedKmh": 105, "uncertaintyRadiusKm": 120, "confidence": 0.55 }
  ],
  "cyclogenesisProbability48h": null
}
```

---

## 6. Fallback Layer (ML unavailable → statistical/climatology estimate)

**Trigger conditions — now two distinct categories, logged separately:**

*Ingestion failures* (the ML service couldn't get a satellite frame at all):
- MOSDAC standing order expired or not yet approved
- MOSDAC account temporarily locked or login failed
- Live feed outage / no frame available near the requested timestamp

*Model/inference failures* (a frame was obtained but prediction failed):
- ML FastAPI call times out (recommend 5s timeout, 1 retry)
- ML service returns 5xx or a malformed response
- ML service reports low internal confidence below a configurable threshold (optional, Phase 2)

Both categories route to the same climatology fallback and the same amber "fallback in use" banner on the frontend — the distinction only matters for `AlertLog` and your own debugging, not for what the user sees.

**Fallback logic (`services/fallbackService.js`):**
1. Look up the system's current `basin` and current `month`.
2. Query `ClimatologyProfile` for that basin+month.
3. Estimate wind speed / pressure as the climatological average for storms at a similar stage (use `currentCategory` if known from last good observation).
4. Project the track forward using the climatological average bearing + speed from the storm's last known position — **not** a straight line, but not a false-precision AI output either.
5. Mark `source: "fallback-climatology"` and `fallbackReason` (now specifically `"ingestion-failure"` or `"model-failure"`) on the stored `PredictionResult`.
6. Set a wider `uncertaintyRadiusKm` than the ML model would (fallback should visibly communicate "less certain than usual").
7. Log the fallback event to `AlertLog`, including the failure category — you want to know whether MOSDAC access or the model itself is the more frequent culprit.

**Circuit breaker pattern:** wrap ML calls with a simple circuit breaker (e.g. `opossum` npm package) so repeated ML failures don't cascade into slow responses for every user — it should trip after N consecutive failures and serve fallback immediately for a cool-down window.

```js
// pseudocode
async function getPrediction(cycloneId) {
  try {
    return await mlClient.updateCyclone(cycloneId, { timeout: 5000 });
  } catch (err) {
    const reason = classifyFailure(err); // "ingestion-failure" | "model-failure"
    logger.warn(`ML layer failed for ${cycloneId} (${reason}), using fallback`, err);
    return await fallbackService.estimate(cycloneId, reason);
  }
}
```

---

## 6A. Prediction Scheduling (6-hour synoptic cadence)

Predictions run on a fixed schedule, not just on-demand. The cadence is tied to the standard **synoptic times used in meteorology and in IBTrACS itself: 00:00, 06:00, 12:00, 18:00 UTC**. Running on this exact cadence — rather than an arbitrary "every 6 hours from server start" — matters because it keeps every prediction directly comparable to the official advisory it will eventually be validated against.

**Important change:** the backend no longer sources or passes any satellite imagery. Since `ingestion/` now lives inside the ML service (see the ML layer doc, §1A), the backend's job shrinks to *telling the ML service what to check* — a cyclone ID plus its last known position, or a region name — and storing whatever structured result comes back.

### 6A.1 Scheduler setup

```js
// src/services/predictionScheduler.js
const cron = require('node-cron');
const Cyclone = require('../models/Cyclone');
const { scanForNewSystems, updateActiveSystem } = require('./predictionOrchestrator');
const logger = require('../utils/logger');

// Runs at 00:00, 06:00, 12:00, 18:00 UTC daily
const SCHEDULE = '0 0,6,12,18 * * *';

function startScheduler() {
  cron.schedule(SCHEDULE, async () => {
    logger.info('Starting scheduled prediction run');

    // 1. Scan fixed regions for brand-new systems
    try {
      await scanForNewSystems();
    } catch (err) {
      logger.error('Region scan failed entirely', err);
    }

    // 2. Update every already-confirmed active system
    const activeSystems = await Cyclone.find({ status: 'active' });
    for (const system of activeSystems) {
      try {
        await updateActiveSystem(system.cycloneId, system.currentLocation);
      } catch (err) {
        logger.error(`Scheduled update failed entirely for ${system.cycloneId}`, err);
      }
    }
    logger.info(`Scheduled run complete: ${activeSystems.length} active systems processed`);
  }, { timezone: 'UTC' });
}

module.exports = { startScheduler };
```

```js
// src/server.js (add alongside existing startup code)
const { startScheduler } = require('./services/predictionScheduler');
// ... after DB connection is established
startScheduler();
```

### 6A.2 What runs, in what order, per system

The orchestrator now makes lightweight calls — no image payload, since `mlClient.js` calls the ML service's `/live/*` routes, which fetch and preprocess imagery internally:

```js
// src/services/mlClient.js
const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

async function scanRegions() {
  return axios.post(`${ML_SERVICE_URL}/live/scan-regions`, {}, {
    timeout: Number(process.env.ML_SERVICE_TIMEOUT_MS) || 5000,
  });
}

async function updateCyclone(cycloneId, lastKnownLat, lastKnownLon) {
  return axios.post(
    `${ML_SERVICE_URL}/live/update-cyclone/${cycloneId}`,
    { lastKnownLat, lastKnownLon },
    { timeout: Number(process.env.ML_SERVICE_TIMEOUT_MS) || 5000 }
  );
}

module.exports = { scanRegions, updateCyclone };
```

```js
// src/services/predictionOrchestrator.js
const mlClient = require('./mlClient');
const fallbackService = require('./fallbackService');
const Cyclone = require('../models/Cyclone');

async function scanForNewSystems() {
  let scanResults;
  try {
    scanResults = (await mlClient.scanRegions()).data;
  } catch (err) {
    scanResults = await fallbackService.estimateRegionScan('ingestion-failure');
  }

  for (const result of scanResults) {
    if (result.present && result.confidence > 0.7) {
      await Cyclone.findOneAndUpdate(
        { basin: result.region },
        { status: 'active', currentLocation: result.estimatedCenter, source: result.source },
        { upsert: true, new: true }
      );
    }
  }
}

async function updateActiveSystem(cycloneId, lastKnownLocation) {
  let result;
  try {
    result = (await mlClient.updateCyclone(cycloneId, lastKnownLocation.lat, lastKnownLocation.lon)).data;
  } catch (err) {
    const reason = err.response?.status ? 'model-failure' : 'ingestion-failure';
    result = await fallbackService.estimate(cycloneId, reason);
  }
  return savePredictionResult(cycloneId, result);
}

module.exports = { scanForNewSystems, updateActiveSystem };
```

Cyclogenesis runs as a **separate scheduled job**, on the same 6h cadence but iterating over candidate disturbance regions rather than confirmed active systems (it has no `Cyclone` document yet by definition — that's the whole point of the prediction). It calls its own lightweight ML route (`/predict/cyclogenesis`) once that pipeline exists, following the same "no image payload" pattern.

### 6A.3 Why 6h and not more frequent

- Matches IBTrACS/IMD synoptic reporting times — predictions are directly comparable to ground truth at the same timestamps
- A single inference pass is sub-second; the constraint here was never compute, it's alignment with meaningful new information
- Detection latency (a brand-new system not being caught until the next 6h tick) is an accepted tradeoff for a decision-support tool that supplements, not replaces, IMD

### 6A.4 On-demand refresh still exists alongside this

The existing `POST /predictions/:cycloneId/refresh` route stays as-is for when a user wants a fresh read outside the schedule (e.g. opening the Cyclone Detail view) — it simply calls `updateActiveSystem()` directly. Both paths — scheduled and on-demand — funnel through the same `predictionOrchestrator.js` and the same fallback logic, so there's only one code path to maintain.

### 6A.5 Environment variable

```
PREDICTION_CRON_SCHEDULE=0 0,6,12,18 * * *
```

Keeping this in `.env` rather than hardcoded means the cadence can be tightened later (e.g. to hourly for detection specifically) without a code change.

---

## 7. Swagger UI — yes, add it

You can absolutely add Swagger UI to the Express/MERN backend, separately from FastAPI's built-in Swagger:

- `swagger-jsdoc` — generates an OpenAPI spec from JSDoc comments above each route
- `swagger-ui-express` — serves the interactive docs UI at a route like `/api-docs`

```js
// app.js
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Cyclone Backend API', version: '1.0.0' },
  },
  apis: ['./routes/*.js'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

This gives you two separate Swagger UIs — one for the Node backend (`/api-docs`) and one auto-generated by FastAPI for the ML service (`/docs`) — which is fine and actually clearer, since they're genuinely separate services.

---

## 8. File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                # Mongo connection
│   │   ├── pinecone.js
│   │   └── swagger.js
│   ├── models/
│   │   ├── Cyclone.js
│   │   ├── TrackPoint.js
│   │   ├── PredictionResult.js
│   │   ├── ClimatologyProfile.js
│   │   ├── ChatSession.js
│   │   └── AlertLog.js
│   ├── controllers/
│   │   ├── cyclone.controller.js
│   │   ├── prediction.controller.js
│   │   ├── cyclogenesis.controller.js
│   │   ├── chat.controller.js
│   │   └── system.controller.js
│   ├── routes/
│   │   ├── cyclone.routes.js
│   │   ├── prediction.routes.js
│   │   ├── cyclogenesis.routes.js
│   │   ├── chat.routes.js
│   │   └── system.routes.js
│   ├── services/
│   │   ├── mlClient.js          # axios wrapper for calling the ML FastAPI service
│   │   ├── fallbackService.js   # climatology-based fallback logic
│   │   ├── predictionScheduler.js   # node-cron job, 6h synoptic cadence
│   │   ├── predictionOrchestrator.js # runs detection→intensity→track chain per system
│   │   ├── ragService.js        # Pinecone retrieval + Gemini call orchestration
│   │   ├── embeddingService.js  # generates/upserts embeddings for historical+prediction data
│   │   └── circuitBreaker.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── validateRequest.js   # Zod/Joi schema validation
│   │   └── rateLimiter.js
│   ├── utils/
│   │   └── logger.js
│   ├── app.js
│   └── server.js
├── .env.example
└── package.json
```

---

## 9. RAG Chatbot Orchestration (backend side)

Flow for `POST /chat/:sessionId/message`:
1. Receive user message.
2. Generate an embedding for the query.
3. Query Pinecone for top-k relevant chunks from indexed historical cyclone data + recent `PredictionResult` documents (embeddings are upserted into Pinecone whenever new historical data or predictions are stored — via `embeddingService.js`).
4. Build a grounded prompt: system instructions + retrieved context + conversation history + user question.
5. Call Gemini API with that prompt.
6. Store both the user message and assistant response in `ChatSession`, along with which Pinecone doc IDs were used (for traceability/debugging).
7. Return the answer, tagged so the frontend can show the "AI-generated, verify with IMD" label.

**Important:** the RAG layer only answers from retrieved cyclone data — the prompt should explicitly instruct Gemini not to fabricate storm details not present in the retrieved context, and to say so if it doesn't have relevant data for a query.

---

## 10. Environment Variables (`.env.example`)

```
PORT=5000
MONGODB_URI=mongodb+srv://...
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT_MS=5000
PINECONE_API_KEY=
PINECONE_INDEX=cyclone-rag
GEMINI_API_KEY=
```
