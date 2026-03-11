/**
 * Pain Quantification Algorithm
 * 
 * Each of the 6 physiological variables is calculated independently,
 * producing a sub-score. Sub-scores are summed, and the total is
 * mapped to a 0–10 pain scale.
 */

// ─── 1. Heart Rate ───────────────────────────────────────────────
// HR = 60 / RR (beats per minute)
// Normal resting HR: 60–100 bpm. Pain elevates HR.
// Sub-score: 0 at 60bpm, max ~166 at 200bpm
export function calculateHR(rrInterval) {
  if (!rrInterval || rrInterval <= 0) return { raw: 0, score: 0 };
  const hr = 60 / rrInterval;
  // Pain indicator: deviation above normal (60bpm baseline)
  // Score: how far above 60bpm, scaled so 200bpm ≈ 166
  const deviation = Math.max(0, hr - 60);
  const score = Math.min(166, (deviation / 140) * 166);
  return { raw: Math.round(hr * 10) / 10, score: Math.round(score * 10) / 10 };
}

// ─── 2. Heart Rate Variability (SDNN) ────────────────────────────
// SDNN = sqrt((1/(N-1)) * Σ(RRi - RRmean)²)
// Lower HRV → higher pain. Normal SDNN: 50–200ms
// Sub-score: 166 at SDNN=0, 0 at SDNN≥200ms (inverse relationship)
export function calculateHRV(sdnnValue) {
  if (sdnnValue === null || sdnnValue === undefined || sdnnValue < 0) return { raw: 0, score: 0 };
  // Lower SDNN = more pain
  const score = Math.min(166, Math.max(0, (1 - sdnnValue / 200) * 166));
  return { raw: Math.round(sdnnValue * 10) / 10, score: Math.round(score * 10) / 10 };
}

// ─── 3. Skin Temperature Change (ΔT) ────────────────────────────
// ΔT = Tlocal − Tbaseline
// Pain/inflammation increases local temperature
// Sub-score: 0 at ΔT=0, max 166 at ΔT≥5°C
export function calculateTempChange(tLocal, tBaseline) {
  if (tLocal === null || tBaseline === null) return { raw: 0, score: 0 };
  const deltaT = Math.abs(tLocal - tBaseline);
  const score = Math.min(166, (deltaT / 5) * 166);
  return { raw: Math.round(deltaT * 100) / 100, score: Math.round(score * 10) / 10 };
}

// ─── 4. Galvanic Skin Response (GSR) ────────────────────────────
// GSR = 1 / R (Siemens)
// Pain increases sweating → decreases resistance → increases conductance
// User enters resistance in kΩ. Normal: 100–500kΩ, pain: <100kΩ
// Sub-score: 0 at R≥500kΩ (low conductance), 166 at R≈1kΩ (high conductance)
export function calculateGSR(resistance) {
  if (!resistance || resistance <= 0) return { raw: 0, score: 0 };
  const gsr = 1 / (resistance * 1000); // convert kΩ to Ω, then to Siemens
  const gsrMicroS = gsr * 1e6; // convert to μS for readability
  // Higher GSR (lower resistance) = more pain
  // Normalize: 0 μS = no pain, 20 μS+ = max pain
  const score = Math.min(166, (gsrMicroS / 20) * 166);
  return { raw: Math.round(gsrMicroS * 100) / 100, score: Math.round(score * 10) / 10 };
}

// ─── 5. Electromyography RMS (EMG) ──────────────────────────────
// EMG_RMS = sqrt((1/N) * Σ(xi²))
// Higher RMS = muscle guarding/spasm = more pain
// User enters RMS value in μV. Normal: 0–50μV, pain: up to 500μV
// Sub-score: 0 at 0μV, 166 at 500μV
export function calculateEMG(rmsValue) {
  if (!rmsValue || rmsValue < 0) return { raw: 0, score: 0 };
  const score = Math.min(166, (rmsValue / 500) * 166);
  return { raw: Math.round(rmsValue * 10) / 10, score: Math.round(score * 10) / 10 };
}

// ─── 6. EEG Power ───────────────────────────────────────────────
// P(f) = |X(f)|²
// Alpha (8–12Hz): Inversely proportional — higher alpha = less pain
// Beta (13–30Hz): Directly proportional — higher beta = more pain
// Gamma (>30Hz): Directly proportional — higher gamma = more pain
// User enters power values in μV². Normal baseline ~5 each.
export function calculateEEG(alphaPower, betaPower, gammaPower) {
  const alpha = alphaPower || 0;
  const beta = betaPower || 0;
  const gamma = gammaPower || 0;
  // If no data entered at all, return zero score
  // (avoids alpha inverse formula producing score 56 when alpha=0)
  if (alpha === 0 && beta === 0 && gamma === 0) {
    return { raw: 0, score: 0 };
  }
  // Alpha is inversely proportional: high alpha (relaxed) = low pain
  // Score from alpha: 0 at alpha≥50, 56 at alpha=0
  const alphaScore = Math.min(56, Math.max(0, (1 - alpha / 50) * 56));
  // Beta is directly proportional: high beta = more pain
  const betaScore = Math.min(57, (beta / 50) * 57);
  // Gamma is directly proportional: high gamma = more pain
  const gammaScore = Math.min(57, (gamma / 50) * 57);
  const totalScore = alphaScore + betaScore + gammaScore;
  const totalPower = alpha + beta + gamma;
  return { raw: Math.round(totalPower * 10) / 10, score: Math.round(totalScore * 10) / 10 };
}

// ─── Composite Score ─────────────────────────────────────────────
// Sum all 6 sub-scores (max total ≈ 1000) and map to 0–10 pain scale
export function calculateTotalScore(subscores) {
  const total = subscores.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total * 10) / 10;
}

export function mapToPainLevel(totalScore) {
  // Linear interpolation within each range
  const painLevel = Math.min(10, Math.max(0, totalScore / 100));
  return Math.round(painLevel * 10) / 10;
}

export function getPainLabel(painLevel) {
  if (painLevel <= 1) return { label: 'No Pain', color: '#4ade80', emoji: '😊' };
  if (painLevel <= 2) return { label: 'Minimal', color: '#86efac', emoji: '🙂' };
  if (painLevel <= 3) return { label: 'Mild', color: '#a3e635', emoji: '😐' };
  if (painLevel <= 4) return { label: 'Mild-Moderate', color: '#facc15', emoji: '😕' };
  if (painLevel <= 5) return { label: 'Moderate', color: '#fb923c', emoji: '😣' };
  if (painLevel <= 6) return { label: 'Moderate-Severe', color: '#f97316', emoji: '😖' };
  if (painLevel <= 7) return { label: 'Severe', color: '#ef4444', emoji: '😫' };
  if (painLevel <= 8) return { label: 'Severe-Intense', color: '#dc2626', emoji: '😵' };
  if (painLevel <= 9) return { label: 'Intense', color: '#b91c1c', emoji: '😱' };
  return { label: 'Extreme', color: '#991b1b', emoji: '🤯' };
}

// ─── Variable metadata for UI ────────────────────────────────────
export const VARIABLES = [
  {
    id: 'hr',
    name: 'Heart Rate',
    icon: '♡',
    relationship: 'direct',
    description: 'Directly proportional — higher HR means more pain',
    formula: 'HR = 60 / RR',
    formulaDescription: 'HR = Heart rate (bpm), RR = Time interval between two heartbeats (seconds). Normal resting HR: 60–100 bpm. Pain elevates heart rate.',
    fields: [{ key: 'rrInterval', label: 'RR Interval', unit: 'seconds', placeholder: '0.8', min: 0.2, max: 3, step: 0.01 }],
  },
  {
    id: 'hrv',
    name: 'Heart Rate Variability',
    icon: '〜',
    relationship: 'inverse',
    description: 'Inversely proportional — lower HRV means more pain',
    formula: 'SDNN = √( (1/(N-1)) × Σ(RRi − RR̄)² )',
    formulaDescription: 'RRi = Individual RR interval, RR̄ = Mean RR interval, N = Number of intervals. Lower HRV is associated with higher stress and pain levels.',
    fields: [{ key: 'sdnn', label: 'SDNN Value', unit: 'ms', placeholder: '50', min: 0, max: 300, step: 1 }],
  },
  {
    id: 'temp',
    name: 'Skin Temperature',
    icon: '°',
    relationship: 'direct',
    description: 'Directly proportional — higher ΔT means more pain',
    formula: 'ΔT = T_local − T_baseline',
    formulaDescription: 'ΔT = Temperature difference, T_local = Measured skin temperature, T_baseline = Baseline skin temperature. Pain and inflammation cause localized temperature changes.',
    fields: [
      { key: 'tLocal', label: 'Local Temp', unit: '°C', placeholder: '37.8', min: 30, max: 45, step: 0.1 },
      { key: 'tBaseline', label: 'Baseline Temp', unit: '°C', placeholder: '36.5', min: 30, max: 45, step: 0.1 },
    ],
  },
  {
    id: 'gsr',
    name: 'Galvanic Skin Response',
    icon: '⚡',
    relationship: 'direct',
    description: 'Directly proportional — higher conductance means more pain',
    formula: 'GSR = 1 / R',
    formulaDescription: 'GSR = Skin conductance (Siemens), R = Skin resistance (Ohms). Pain increases sweating, decreasing resistance and increasing conductance.',
    fields: [{ key: 'resistance', label: 'Skin Resistance', unit: 'kΩ', placeholder: '200', min: 1, max: 1000, step: 1 }],
  },
  {
    id: 'emg',
    name: 'Electromyography',
    icon: '⫸',
    relationship: 'direct',
    description: 'Directly proportional — higher EMG means more pain',
    formula: 'EMG_RMS = √( (1/N) × Σ(xi²) )',
    formulaDescription: 'xi = EMG signal amplitude, N = Number of samples. Higher RMS values indicate muscle guarding or spasm associated with pain.',
    fields: [{ key: 'rmsValue', label: 'EMG RMS Value', unit: 'μV', placeholder: '150', min: 0, max: 1000, step: 1 }],
  },
  {
    id: 'eeg',
    name: 'EEG Power',
    icon: '🧠',
    relationship: 'mixed',
    description: 'Alpha ↓ pain, Beta ↑ pain, Gamma ↑ pain',
    formula: 'P(f) = |X(f)|²',
    formulaDescription: 'X(f) = Fourier transform of EEG signal, P(f) = Power at frequency f. Pain activity involves Theta (4–8 Hz), Beta (13–30 Hz), and Gamma (>30 Hz) bands.',
    fields: [
      { key: 'alphaPower', label: 'Alpha 8–12Hz', unit: 'μV²', placeholder: '10', min: 0, max: 100, step: 0.1 },
      { key: 'betaPower', label: 'Beta 13–30Hz', unit: 'μV²', placeholder: '15', min: 0, max: 100, step: 0.1 },
      { key: 'gammaPower', label: 'Gamma >30Hz', unit: 'μV²', placeholder: '5', min: 0, max: 100, step: 0.1 },
    ],
  },
];
