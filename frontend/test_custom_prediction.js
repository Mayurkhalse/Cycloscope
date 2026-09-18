// Test script showing how custom satellite imagery generates dynamic ML predictions
async function testCustomSatelliteInference() {
  console.log('Testing ML Model with dynamic satellite image payloads...\n');

  // Test 1: Baseline call (default frame)
  const res1 = await fetch('http://localhost:8000/predict/intensity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel: 'IR' }),
  });
  const data1 = await res1.json();
  console.log('1. Default Frame Prediction:', data1);

  // Test 2: Dense Convective Core (Simulated Category-3 / VSCS Cloud Pattern)
  // 201x201 float32 buffer encoded as base64
  const numFloats = 201 * 201;
  const floatArr = new Float32Array(numFloats);
  for (let i = 0; i < numFloats; i++) {
    const x = (i % 201) - 100;
    const y = Math.floor(i / 201) - 100;
    const r = Math.sqrt(x * x + y * y);
    // Eyewall cold brightness temperature (-80°C) ring
    floatArr[i] = Math.exp(-Math.pow(r - 30, 2) / 100) * 3.5 + Math.random() * 0.5;
  }
  const base64Data = Buffer.from(floatArr.buffer).toString('base64');

  const res2 = await fetch('http://localhost:8000/predict/intensity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: base64Data, channel: 'IR' }),
  });
  const data2 = await res2.json();
  console.log('\n2. Strong Convective Eyewall Prediction:', data2);

  // Test 3: Weak Dissipating Remnant Pattern
  const floatArr3 = new Float32Array(numFloats);
  for (let i = 0; i < numFloats; i++) {
    floatArr3[i] = Math.random() * 0.1;
  }
  const base64Data3 = Buffer.from(floatArr3.buffer).toString('base64');

  const res3 = await fetch('http://localhost:8000/predict/intensity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: base64Data3, channel: 'IR' }),
  });
  const data3 = await res3.json();
  console.log('\n3. Weak Remnant Pattern Prediction:', data3);
}

testCustomSatelliteInference();
