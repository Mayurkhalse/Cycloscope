# Cycloscope — Integration Test Checklist

Companion to `cycloscope.http` (same folder). Run this once each of the three tabs (frontend/backend/ML) reports its own piece "done" — this is what actually proves the seams work, per README §5.

**How to run the `.http` file:**
- VS Code: install the "REST Client" extension, open `cycloscope.http`, click "Send Request" above each block.
- Postman: File → Import → select `cycloscope.http` (Postman parses `.http` files natively).
- No tooling: every request is plain enough to copy into `curl` manually.

---

## Prerequisites

Start in this order, each fully up before starting the next:
1. MongoDB (local or Atlas — `MONGODB_URI` reachable)
2. `backend/` — `npm run dev` (port 5000)
3. `ml/serving/` — `uvicorn app.main:app --reload` (port 8000)
4. `frontend/` — `npm run dev`

---

## Step-by-step

### Step 0 — ML service reachable directly
Request: `0a` in the `.http` file.
**Pass:** `GET /health` returns 200 with `models_loaded` populated.
**Fail signal:** connection refused → ML service isn't actually running; 503 → model failed to load at startup, check `ml/serving` logs before going further.

### Step 1 — Backend health
Request: Step 1.
**Pass:** 200, no Mongo connection errors in backend console.
**Fail signal:** if this fails, nothing downstream will work — fix `MONGODB_URI` first.

### Step 2 — Backend → ML connectivity
Request: Step 2.
**Pass:** response indicates the ML service is reachable (live, not fallback).
**Fail signal:** if Step 0 passed but this fails, check `ML_SERVICE_URL` in `backend/.env` matches where `ml/serving` is actually listening.

### Step 3 — Seed test data
Run the `mongosh` block in the `.http` file (not an HTTP call). This creates one active test cyclone and one climatology profile row. **Without the climatology row, Step 5 will error instead of demonstrating the fallback.**

### Step 4 — Full live chain
Requests: `4a` then `4b`.
**Pass:** `4a` returns `"source": "ml-model"` with detection/intensity/track populated; `4b` reads back the identical record from Mongo.
**Fail signal:**
- `4a` times out → check `ML_SERVICE_TIMEOUT_MS`, and whether `ml/serving`'s `/live/update-cyclone/:id` route exists yet (may still be a stub — see README §3 build order).
- `4a` succeeds but `4b` returns nothing → `predictionOrchestrator.js` isn't persisting via `savePredictionResult` correctly.

### Step 5 — Fallback path
Kill `ml/serving`, then re-send the same request as `4a`.
**Pass:**
- Client still gets a 200 (never a raw error) with `"source": "fallback-climatology"`.
- `fallbackReason` is `"ingestion-failure"` or `"model-failure"` (either is fine — this just confirms classification is happening at all).
- `uncertaintyRadiusKm` on the returned track points is visibly wider than in Step 4a's response.
- An `AlertLog` document was written — check via `mongosh`: `db.alertlogs.find({ cycloneId: "IO_2026_TEST" }).sort({ triggeredAt: -1 }).limit(1)`.

**Fail signal:** if the client gets a 500 instead of a graceful fallback response, the circuit breaker / try-catch in `predictionOrchestrator.js` isn't wrapping the ML call correctly — this is the single most important thing to get right before going live, since it's what keeps one ML outage from taking down the whole dashboard.

Restart `ml/serving` before continuing.

### Step 6 — Frontend-facing reads + visual check
Requests: `6a`, `6b`, then open the actual frontend dashboard in a browser.
**Pass:**
- Both requests return data consistent with what Steps 4/5 wrote.
- Dashboard renders the test cyclone with a risk badge.
- Cyclone Detail view shows the uncertainty cone and confidence bar (never a bare number — frontend doc §7).
- If you inspect the specific `PredictionResult` written during Step 5, confirm the frontend would have shown the amber fallback banner for that record.

### Step 7 — RAG chatbot
Requests: `7`, then `7b`.
**Pass:**
- `7`'s answer references the seeded test storm's actual data (not a generic or fabricated answer).
- `7b` shows both messages persisted, with `retrievedContextIds` populated (proves Pinecone retrieval actually ran, not just Gemini free-associating).

**Fail signal:** an answer with no grounding or empty `retrievedContextIds` means embeddings for the test cyclone were never upserted — check `embeddingService.js` is being called when `PredictionResult` documents are saved.

---

## After a clean run

Run the cleanup block at the bottom of `cycloscope.http` to remove test data before treating this as done.

## When something fails

Check in this order: **is it a contract mismatch or a bug?** Compare the actual request/response against the schemas in `backend/02_backend_architecture.md` §3 and `ml/03_ml_layer_architecture.md`. Most integration failures at this stage are a field name or shape that drifted between two tabs, not application logic — see README §1's note on contract drift.
