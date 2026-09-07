# Cycloscope

AI-assisted cyclone decision-support platform for the North Indian Ocean (Bay of Bengal + Arabian Sea). Supplements, never replaces, IMD official bulletins.

```
cycloscope/
├── frontend/    # React + Vite + Leaflet dashboard
├── backend/     # Node/Express orchestrator + MongoDB + RAG chatbot
├── ml/          # Python/FastAPI detection, intensity, track, cyclogenesis models
└── README.md    # you are here
```

Each subfolder contains its own architecture spec (`*_architecture.md`). This file is the map between them — read this first if you're working across more than one part.

---

## 1. How this is being built

Three independent AI dev sessions (Antigravity tabs), one per folder, each working from that folder's architecture MD. This works because the three services are deliberately decoupled:

- Frontend never talks to the ML layer directly — only to the backend's REST API.
- Backend never touches satellite imagery or loads models — it sends a cyclone ID or region name and stores whatever JSON comes back.
- ML never touches MongoDB or the frontend — it only answers HTTP requests from the backend.

**Ground rule for all three tabs: the architecture MDs are the contract, not a draft.** If a tab thinks a field name, route, or schema should change, that change has to be reflected in *all* affected MDs and re-synced across tabs before any tab implements it — not decided unilaterally mid-build. Silent drift here is the main way this workflow breaks.

---

## 2. The three integration seams

### 2.1 Frontend ↔ Backend

- Frontend calls `VITE_BACKEND_API_URL` (default `http://localhost:5000/api`) via the shared Axios instance in `frontend/src/api/axiosClient.js`.
- Full route list: `backend/02_backend_architecture.md` §4 (Cyclones, Predictions, Cyclogenesis, Chatbot, System).
- Response shapes the frontend must render around: `PredictionResult`, `TrackPoint`, `Cyclone` — schemas in the backend doc §3. In particular:
  - Every prediction has `source: "ml-model" | "fallback-climatology"` — the frontend's amber fallback banner (`FallbackBanner.jsx`) keys off this, not off any ML-specific field.
  - Every predicted `TrackPoint` carries `uncertaintyRadiusKm` and `confidence` — these are required for the uncertainty cone and confidence bar; nothing should render a prediction number without them (frontend doc §7).
- System status (green/amber/red, frontend §2.7) maps to backend `/system/ml-status` — confirm this route is live before wiring the status indicators.

### 2.2 Backend ↔ ML

- Backend calls `ML_SERVICE_URL` (default `http://localhost:8000`) via `backend/src/services/mlClient.js`.
- Live routes (no image payload — ML fetches its own imagery):
  - `POST /live/scan-regions` — no body
  - `POST /live/update-cyclone/:cycloneId` — body: `{ lastKnownLat, lastKnownLon }`
- Non-live/testing routes (useful before `ingestion/` exists — see §3 below):
  - `POST /predict/intensity` — body: `{ cyclone_id, image_base64, channel }`
  - `GET /health` — polled by the backend's circuit breaker before/alongside prediction calls
- Failure contract: any ML failure must come back as an HTTP 4xx/5xx with a clear error body (ML doc §3 Step 5) — never a malformed 200. The backend classifies the failure as `ingestion-failure` or `model-failure` and routes both to the same climatology fallback (backend §6), but logs them separately in `AlertLog`.

### 2.3 Scheduling (ties backend + ML together in time)

- Backend runs a node-cron job at `0 0,6,12,18 * * *` UTC (backend §6A) — scans regions, then updates every active system, sequentially.
- This assumes the ML service is reachable at those ticks. During local dev with three tabs running independently, **the ML tab's service needs to actually be running** (even a stub) for the scheduler to exercise anything beyond the fallback path.

---

## 3. Recommended build order (so no tab blocks on another)

MOSDAC access approval (ML doc §1A) is the one hard external blocker, and it only blocks the *live satellite* path — not everything else. Sequence work so that's true in practice:

1. **ML tab**: build `training/` against TCIR first (no MOSDAC needed), export `v0.1`, stand up `serving/` with `/predict/intensity` and `/health` working against manually-supplied test images. Submit MOSDAC registration in parallel — don't wait on it to start.
2. **Backend tab**: build against the ML tab's `/predict/intensity` + `/health` (or a hand-rolled stub returning the `PredictionResult` shape) instead of waiting for `/live/*`. This unblocks schemas, fallback logic, scheduler, and chatbot work immediately.
3. **Frontend tab**: build against the backend's endpoints using mock/fixture JSON matching the schemas in §3 of the backend doc — doesn't need a live backend running to build most screens.
4. Once MOSDAC is approved: ML tab builds `ingestion/` and wires `/live/*`. Backend tab swaps its stub calls for the real `/live/*` routes — no schema change needed if the contract was followed.
5. **Integration pass** (see §5) once all three are individually "done."

---

## 4. Environment variables (combined)

Keep each service's own `.env`, but these values must agree across files:

| Variable | Where | Value (local dev) |
|---|---|---|
| Backend port | `backend/.env` → `PORT` | `5000` |
| ML service port | `ml/serving/.env` → (uvicorn port) | `8000` |
| Frontend → Backend | `frontend/.env` → `VITE_BACKEND_API_URL` | `http://localhost:5000/api` |
| Backend → ML | `backend/.env` → `ML_SERVICE_URL` | `http://localhost:8000` |
| Backend → ML timeout | `backend/.env` → `ML_SERVICE_TIMEOUT_MS` | `5000` |
| Scheduler cadence | `backend/.env` → `PREDICTION_CRON_SCHEDULE` | `0 0,6,12,18 * * *` |
| Mongo | `backend/.env` → `MONGODB_URI` | your Atlas URI |
| Pinecone / Gemini | `backend/.env` | your keys |
| MOSDAC creds | `ml/ingestion/.env` (or `serving/.env`) | set once account is approved |

If any tab changes a port or URL convention, update this table — it's the one place all three should check before assuming a default.

---

## 5. Local integration checklist

Run this once each track has its own piece working in isolation:

1. Start MongoDB, then `backend/` (`npm run dev`), then `ml/serving/` (`uvicorn app.main:app --reload`), then `frontend/` (`npm run dev`).
2. Hit backend `/api/system/health` — confirms Mongo connection and that the backend process is up.
3. Hit backend `/api/system/ml-status` — confirms the backend can reach the ML service's `/health`.
4. Manually trigger `POST /api/predictions/:cycloneId/refresh` for a seeded test cyclone — confirms the full chain: backend → ML `/live/update-cyclone` (or stub) → `PredictionResult` written to Mongo → readable via `/predictions/:cycloneId/latest`.
5. Kill the ML service and repeat step 4 — confirm the fallback path fires (`source: "fallback-climatology"`, `fallbackReason: "ingestion-failure"` or `"model-failure"`), gets logged to `AlertLog`, and the frontend renders the amber banner instead of erroring.
6. Load the frontend dashboard end-to-end against the real backend (not fixtures) — confirm the map, risk badges, and Cyclone Detail view all render from live data, and the uncertainty cone/confidence bar never render without their supporting numbers.
7. Send a chatbot message — confirms Pinecone retrieval + Gemini call + `ChatSession` storage + the "AI-generated, verify with IMD" tag on the frontend.

If any step fails, the fix almost always belongs in the *contract* (a schema or route mismatch between two MDs), not in one service's internal logic — check the relevant MD before debugging code.

---

## 6. Known open items (carried over from planning, not yet resolved)

- **Detection cadence**: currently detection runs on the same 6h tick as intensity/track/cyclogenesis. Running detection more frequently (every 30–60 min) so a new system isn't missed for up to 6h was raised but never decided — revisit if detection latency turns out to matter in practice.
- **MOSDAC product format**: HDF5 vs GeoTIFF vs other, and exact channel layout, is unconfirmed until the specific INSAT-3D/3DR product is ordered — don't hardcode a parser in `ingestion/` before confirming this against the actual product page.
- **v0.1 accuracy caveat**: any model metrics from the TCIR-bootstrapped model should be labeled as pipeline validation, not North Indian Ocean-representative accuracy, until retrained on real HURSAT/IBTrACS NIO data (v0.2).
