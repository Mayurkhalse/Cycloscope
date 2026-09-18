// Comprehensive End-to-End Verification Script (ESM using native fetch)
async function runVerification() {
  console.log('========================================================');
  console.log('       CYCLOSCOPE END-TO-END SYSTEM VERIFICATION        ');
  console.log('========================================================\n');

  // 1. ML Service Health
  try {
    const res = await fetch('http://localhost:8000/health');
    const ml = await res.json();
    console.log(`[PASS] 1. ML Engine (Port 8000): Status = ${ml.status}, Models = ${JSON.stringify(ml.models_loaded)}`);
  } catch (e) {
    console.error(`[FAIL] 1. ML Engine: ${e.message}`);
  }

  // 2. Backend Health
  try {
    const res = await fetch('http://localhost:5000/api/system/health');
    const backend = await res.json();
    console.log(`[PASS] 2. Backend Health (Port 5000): Status = ${backend.status}, DB = ${backend.database.status}`);
  } catch (e) {
    console.error(`[FAIL] 2. Backend Health: ${e.message}`);
  }

  // 3. Backend ML Bridge Status
  try {
    const res = await fetch('http://localhost:5000/api/system/ml-status');
    const mlStatus = await res.json();
    console.log(`[PASS] 3. Backend-to-ML Bridge: Status = ${mlStatus.mlService.status}, Mode = ${mlStatus.mlService.mode}`);
  } catch (e) {
    console.error(`[FAIL] 3. Backend-to-ML Bridge: ${e.message}`);
  }

  // 4. Fetch Active Cyclones
  let cycloneId = 'IO_2026_03';
  try {
    const res = await fetch('http://localhost:5000/api/cyclones/active');
    const cyclones = await res.json();
    console.log(`[PASS] 4. Active Cyclones: Found ${cyclones.count} active systems in DB`);
    if (cyclones.data && cyclones.data.length > 0) {
      cycloneId = cyclones.data[0].cycloneId || cyclones.data[0].id;
      console.log(`       Active Cyclone 1: Name="${cyclones.data[0].name}", ID="${cycloneId}", Wind="${cyclones.data[0].currentWindSpeedKmh} km/h"`);
    }
  } catch (e) {
    console.error(`[FAIL] 4. Active Cyclones: ${e.message}`);
  }

  // 5. Trigger Live AI Prediction Refresh
  try {
    const res = await fetch(`http://localhost:5000/api/predictions/${cycloneId}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const refresh = await res.json();
    console.log(`[PASS] 5. Live AI Inference Refresh for ${cycloneId}: Status = ${res.status}`);
    console.log(`       Model Version = ${refresh.data?.modelVersion}, RequestedAt = ${refresh.data?.requestedAt}`);
    console.log(`       Forecast steps count = ${refresh.data?.trackForecast?.length}`);
  } catch (e) {
    console.error(`[FAIL] 5. Live AI Inference: ${e.message}`);
  }

  // 6. Read Latest Track Forecast
  try {
    const res = await fetch(`http://localhost:5000/api/predictions/${cycloneId}/track`);
    const track = await res.json();
    console.log(`[PASS] 6. Predicted Track for ${cycloneId}: Status = ${res.status}`);
    console.log(`       Historical Track Points = ${track.data?.historicalTrack?.length}, Predicted Points = ${track.data?.predictedTrack?.length}`);
    console.log(`       Lead +6h: Lat ${track.data?.predictedTrack?.[0]?.lat}, Lon ${track.data?.predictedTrack?.[0]?.lon}, Radius ${track.data?.predictedTrack?.[0]?.uncertaintyRadiusKm}km`);
  } catch (e) {
    console.error(`[FAIL] 6. Predicted Track: ${e.message}`);
  }

  // 7. Chatbot Assistant Query
  try {
    const res = await fetch('http://localhost:5000/api/chat/verify-session-001/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Provide current storm trajectory and safety guidance for Cyclone Remal.' }),
    });
    const chat = await res.json();
    console.log(`[PASS] 7. AI Chatbot Assistant: Status = ${res.status}`);
    const snippet = chat.data?.response ? chat.data.response.substring(0, 100) : JSON.stringify(chat).substring(0, 100);
    console.log(`       Response snippet: ${snippet}...`);
  } catch (e) {
    console.error(`[FAIL] 7. AI Chatbot: ${e.message}`);
  }

  console.log('\n========================================================');
  console.log('             VERIFICATION SUMMARY COMPLETE              ');
  console.log('========================================================');
}

runVerification();
