# Frontend — Architecture & UI Specification
**Stack:** React (Vite) + Leaflet + OpenStreetMap + TailwindCSS

---

## 1. Purpose

The frontend is a **decision-support dashboard**, not a raw data viewer. Every screen must make clear:
- What the AI is confident about vs. uncertain about
- That this supplements, never replaces, IMD/official bulletins

---

## 2. Screens / Pages

### 2.1 Dashboard (Home)
The default landing screen after load.
- Map (full width, top) showing all currently tracked systems in North Indian Ocean
- Right-side panel: list of active systems with risk-level badges (Low/Moderate/High/Severe)
- Top banner: official disclaimer, dismissible but always re-appears per session
- Quick stats strip: number of active systems, highest current category, last data refresh time

### 2.2 Cyclone Detail View
Opened when a user clicks a system on the map or list.
- Latest satellite image (with detected system bounding box overlay)
- Detection confidence score (%) shown as a labeled bar, not just a number
- Current intensity category + estimated wind speed (range, not a single false-precise number)
- Historical track (solid line) vs predicted track (dashed line) on the map
- **Uncertainty cone** around the predicted track (polygon, opacity-graded — tighter near-term, wider at +24h)
- Strengthening/weakening trend arrow with confidence interval
- Environmental indicators panel: SST, wind shear, rainfall rate (if available for that system)
- "How this was calculated" expandable section — links to Methodology page
- Fallback banner (see §2.7) if ML output for this system used the statistical fallback instead of the trained model

### 2.3 Historical Explorer
- Filter bar: year range, basin (Bay of Bengal / Arabian Sea), category, storm name
- Table + map combo: selecting a row highlights that storm's full historical track
- Compare mode: overlay 2–3 historical storms for visual comparison

### 2.4 Cyclogenesis Watch
- Map layer showing candidate disturbances with formation-probability heatmap (next 48h)
- List sorted by probability, each with a short "why" (e.g., "high SST + low shear")

### 2.5 RAG Chatbot (persistent widget, not a separate page)
- Floating chat icon, bottom-right, available on every screen
- Expands into a side panel (desktop) or bottom sheet (mobile)
- Suggested starter prompts: "What's the current risk near Chennai?", "Compare this storm to Cyclone Fani", "What's the predicted track for the next 24h?"
- Every chatbot answer that cites a prediction must show a small "AI-generated, verify with IMD" tag
- Chat history persists per session (not necessarily per user unless auth is added later)

### 2.6 About / Methodology / Disclaimer
- Static page explaining data sources, model limitations, and that this is a supplementary tool
- Required — link this from the banner on every page

### 2.7 System status indicators (shown wherever relevant, not a separate page)
- Green: live ML prediction
- Amber: fallback statistical estimate in use (ML layer unreachable/degraded) — see backend doc for logic
- Red: no data available for this system right now

---

## 3. Map Behavior (Leaflet + OpenStreetMap)

- Base tile layer: OpenStreetMap standard tiles (no API key needed) — use a tile provider with reasonable usage limits (e.g. OSM standard, or a `.env`-configurable alternate provider if traffic grows)
- Layers (toggleable):
  - Active systems (icon markers, color-coded by category)
  - Historical track (polyline)
  - Predicted track (dashed polyline)
  - Uncertainty cone (polygon, `fillOpacity` scaled by lead time)
  - Cyclogenesis heatmap (Leaflet.heat plugin)
- Marker click → opens Cyclone Detail View (routed, not just a popup, so it's shareable via URL)
- Popup on hover: name, category, last updated timestamp

---

## 4. Tech Stack Detail

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | TailwindCSS |
| Maps | React-Leaflet + OpenStreetMap tiles |
| Data fetching/cache | TanStack Query (React Query) |
| Global state | Zustand (lightweight; avoid Redux boilerplate for this scope) |
| Charts (wind speed/track error over time) | Recharts |
| Forms/validation | React Hook Form + Zod |
| HTTP client | Axios (with a shared instance + interceptors for error/fallback banners) |
| Routing | React Router v6 |
| Real-time updates (optional, Phase 2) | Socket.IO client, for live system status pushes |

---

## 5. File Structure

```
frontend/
├── public/
│   └── favicon, static assets
├── src/
│   ├── api/
│   │   ├── axiosClient.js
│   │   ├── cyclones.api.js
│   │   ├── predictions.api.js
│   │   ├── chatbot.api.js
│   │   └── historical.api.js
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.jsx
│   │   │   ├── TrackLayer.jsx
│   │   │   ├── UncertaintyCone.jsx
│   │   │   ├── CyclogenesisHeatmap.jsx
│   │   │   └── SystemMarker.jsx
│   │   ├── dashboard/
│   │   │   ├── ActiveSystemsList.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   └── StatsStrip.jsx
│   │   ├── cyclone-detail/
│   │   │   ├── SatelliteImagePanel.jsx
│   │   │   ├── IntensityPanel.jsx
│   │   │   ├── TrendIndicator.jsx
│   │   │   ├── EnvironmentalIndicators.jsx
│   │   │   └── FallbackBanner.jsx
│   │   ├── chatbot/
│   │   │   ├── ChatWidget.jsx
│   │   │   ├── ChatMessageBubble.jsx
│   │   │   └── SuggestedPrompts.jsx
│   │   ├── common/
│   │   │   ├── DisclaimerBanner.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   └── ConfidenceBar.jsx
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── Footer.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── CycloneDetail.jsx
│   │   ├── HistoricalExplorer.jsx
│   │   ├── CyclogenesisWatch.jsx
│   │   └── About.jsx
│   ├── hooks/
│   │   ├── useActiveSystems.js
│   │   ├── useCycloneDetail.js
│   │   ├── useChatbot.js
│   │   └── useHistoricalData.js
│   ├── store/
│   │   └── uiStore.js        # Zustand: sidebar open, active filters, etc.
│   ├── utils/
│   │   ├── formatters.js     # wind speed units, dates, category labels
│   │   └── mapHelpers.js
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── vite.config.js
└── package.json
```

---

## 6. Environment Variables (`.env.example`)

```
VITE_BACKEND_API_URL=http://localhost:5000/api
VITE_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_ENABLE_SOCKET=false
```

---

## 7. What must NEVER happen on the frontend

- Never render a prediction as a bare number without a confidence/uncertainty indicator next to it.
- Never hide or auto-dismiss-permanently the disclaimer banner.
- Never let the chatbot answer appear visually identical to an official IMD styled alert.
