import os

paths = [
    "C:/Users/praty/Desktop/emo-girl/emo-voice/src/analyzer/AcousticFeatures.ts",
    "C:/Users/praty/Desktop/emo-girl/emosense-source/src/lib/emo-voice/analyzer/AcousticFeatures.ts"
]

code = r'''import { VocalAcousticFeatures } from "../types";
import { PitchDetector } from "./PitchDetector";

/**
 * Enhanced Acoustic Feature Extractor with Voice Activity Gating (VAD)
 * and Adaptive Ambient Noise Floor Calibration.
 * Eliminates false vocal micro-tremors caused by laptop cooling fans and room echo.
 */
export class AcousticFeatureExtractor {
  private pitchHistory: number[] = [];
  private amplitudeHistory: number[] = [];
  private noiseFloor = 0.015; // Initial calibrated noise floor
  private calibrationFrames = 0;
  private isCalibrated = false;

  private silenceFrames = 0;
  private totalFrames = 0;

  public extract(
    timeDomain: Float32Array,
    frequencyDomain: Uint8Array,
    sampleRate: number
  ): VocalAcousticFeatures {
    this.totalFrames++;

    // 1. RMS Energy (Volume)
    let sumSquares = 0;
    let zeroCrossings = 0;
    for (let i = 0; i < timeDomain.length; i++) {
      sumSquares += timeDomain[i] * timeDomain[i];
      if (i > 0 && ((timeDomain[i] >= 0 && timeDomain[i - 1] < 0) || (timeDomain[i] < 0 && timeDomain[i - 1] >= 0))) {
        zeroCrossings++;
      }
    }
    const rawRms = Math.sqrt(sumSquares / timeDomain.length);
    const rms = Math.min(1.0, rawRms * 4.5);
    const zcr = zeroCrossings / timeDomain.length;

    // Ambient Noise Floor Calibration (First 30 frames ~ 1.0s)
    if (!this.isCalibrated) {
      this.calibrationFrames++;
      this.noiseFloor = Math.max(0.008, (this.noiseFloor * 0.9) + (rawRms * 0.1));
      if (this.calibrationFrames >= 30) {
        this.isCalibrated = true;
      }
    }

    // Voice Activity Gate (VAD): Only process if energy exceeds 2.5x ambient noise floor
    const isVoiced = rawRms > this.noiseFloor * 2.5 && zcr > 0.02 && zcr < 0.45;

    // Silence detection for pause ratio
    if (!isVoiced) {
      this.silenceFrames++;
    }
    const pauseRatio = this.totalFrames > 0 ? this.silenceFrames / this.totalFrames : 0;

    // 2. Fundamental Frequency (F0)
    const f0 = isVoiced ? PitchDetector.detectPitch(timeDomain, sampleRate) : 0;
    if (f0 > 0) {
      this.pitchHistory.push(f0);
      this.amplitudeHistory.push(rms);
      if (this.pitchHistory.length > 50) this.pitchHistory.shift();
      if (this.amplitudeHistory.length > 50) this.amplitudeHistory.shift();
    }

    // 3. Jitter (Micro-pitch perturbation with VAD gating)
    let jitter = 0;
    if (isVoiced && this.pitchHistory.length >= 4) {
      let diffSum = 0;
      let f0Sum = 0;
      for (let i = 1; i < this.pitchHistory.length; i++) {
        diffSum += Math.abs(this.pitchHistory[i] - this.pitchHistory[i - 1]);
        f0Sum += this.pitchHistory[i];
      }
      const meanF0 = f0Sum / this.pitchHistory.length;
      jitter = meanF0 > 0 ? (diffSum / (this.pitchHistory.length - 1)) / meanF0 : 0;
    }

    // 4. Shimmer (Micro-amplitude perturbation with VAD gating)
    let shimmer = 0;
    if (isVoiced && this.amplitudeHistory.length >= 4) {
      let ampDiff = 0;
      let ampSum = 0;
      for (let i = 1; i < this.amplitudeHistory.length; i++) {
        ampDiff += Math.abs(this.amplitudeHistory[i] - this.amplitudeHistory[i - 1]);
        ampSum += this.amplitudeHistory[i];
      }
      const meanAmp = ampSum / this.amplitudeHistory.length;
      shimmer = meanAmp > 0 ? (ampDiff / (this.amplitudeHistory.length - 1)) / meanAmp : 0;
    }

    // 5. Pitch Variance
    let pitchVariance = 0;
    if (this.pitchHistory.length >= 2) {
      const mean = this.pitchHistory.reduce((a, b) => a + b, 0) / this.pitchHistory.length;
      const variance = this.pitchHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.pitchHistory.length;
      pitchVariance = Math.sqrt(variance);
    }

    // 6. Spectral Centroid
    let weightedSum = 0;
    let totalMagnitude = 0;
    const nyquist = sampleRate / 2;
    const binSize = nyquist / frequencyDomain.length;
    for (let i = 0; i < frequencyDomain.length; i++) {
      const mag = frequencyDomain[i];
      weightedSum += i * binSize * mag;
      totalMagnitude += mag;
    }
    const spectralCentroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;

    return {
      f0,
      pitchVariance,
      rms,
      zcr,
      jitter: Math.min(1.0, jitter),
      shimmer: Math.min(1.0, shimmer),
      spectralCentroid,
      pauseRatio,
    };
  }

  public reset(): void {
    this.pitchHistory = [];
    this.amplitudeHistory = [];
    this.silenceFrames = 0;
    this.totalFrames = 0;
    this.calibrationFrames = 0;
    this.isCalibrated = false;
  }
}
'''

for p in paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Updated {p}")
