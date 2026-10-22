import os
import shutil

print("Preparing Candidate C Voice System Integration...", flush=True)

# 1. Update emo-voice/src/types/index.ts
types_path = r"C:\Users\praty\Desktop\emo-girl\emo-voice\src\types\index.ts"
with open(types_path, "r", encoding="utf-8") as f:
    types_content = f.read()

candidate_c_type_def = """
export interface VoicePresetConfig {
  name: string;
  language: "hi" | "en" | "hinglish";
  engine: "google-neural" | "openai-coral" | "azure-neural";
  targetPitchHz: number;
  pitchMultiplier: number;
  perceivedAgeYears: number;
  formantPreserved: boolean;
  warmthCutoffHz: number;
  chestWarmthGainDb: number;
  presenceGainDb: number;
  highShelfReductionDb: number;
  description: string;
}

export const CANDIDATE_C_VOICE_PRESET: VoicePresetConfig = {
  name: "Candidate-C-Google-Hindi-Young-Deep",
  language: "hi",
  engine: "google-neural",
  targetPitchHz: 227.5,
  pitchMultiplier: 1.10,
  perceivedAgeYears: 19,
  formantPreserved: true,
  warmthCutoffHz: 8000,
  chestWarmthGainDb: 2.8,
  presenceGainDb: 1.6,
  highShelfReductionDb: -2.5,
  description: "Native Indian Hindi neural voice, youthful (~19 yrs), sweet, vibration-free with intimate emotional warmth and 432 Hz soundscape integration."
};
"""

if "CANDIDATE_C_VOICE_PRESET" not in types_content:
    with open(types_path, "a", encoding="utf-8") as f:
        f.write("\n" + candidate_c_type_def)
    print("Updated emo-voice/src/types/index.ts")

# 2. Update WarmthFilter.ts with full mastering DSP chain
warmth_path = r"C:\Users\praty\Desktop\emo-girl\emo-voice\src\synthesis\WarmthFilter.ts"
warmth_code = """import { AudioContextManager } from "../analyzer/AudioContextManager";

/**
 * Real-time Web Audio DSP Warmth Filter & Mastering Chain
 * Calibrated specifically for Candidate C (Google Hindi Neural Young Deep):
 * - High-pass 80 Hz (removes bottom thump)
 * - Peaking 240 Hz (+2.8 dB chest warmth)
 * - Peaking 3300 Hz (+1.6 dB emotional vocal presence)
 * - High-shelf 8000 Hz (-2.5 dB de-harshing)
 * - Soft-knee dynamic compander (intimate near-field presence)
 */
export class WarmthFilter {
  public static createChain(ctx: AudioContext): { inputNode: AudioNode; outputNode: AudioNode } {
    // 1. High-Pass filter at 80 Hz
    const highPass = ctx.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.setValueAtTime(80, ctx.currentTime);
    highPass.Q.setValueAtTime(0.707, ctx.currentTime);

    // 2. Chest Warmth Peaking filter: 240 Hz (+2.8 dB)
    const chestWarmth = ctx.createBiquadFilter();
    chestWarmth.type = "peaking";
    chestWarmth.frequency.setValueAtTime(240, ctx.currentTime);
    chestWarmth.Q.setValueAtTime(1.2, ctx.currentTime);
    chestWarmth.gain.setValueAtTime(2.8, ctx.currentTime);

    // 3. Clarity & Intimacy Presence Peaking filter: 3300 Hz (+1.6 dB)
    const clarityPresence = ctx.createBiquadFilter();
    clarityPresence.type = "peaking";
    clarityPresence.frequency.setValueAtTime(3300, ctx.currentTime);
    clarityPresence.Q.setValueAtTime(1.0, ctx.currentTime);
    clarityPresence.gain.setValueAtTime(1.6, ctx.currentTime);

    // 4. De-harshing High-Shelf: 8000 Hz (-2.5 dB)
    const deHarsh = ctx.createBiquadFilter();
    deHarsh.type = "highshelf";
    deHarsh.frequency.setValueAtTime(8000, ctx.currentTime);
    deHarsh.gain.setValueAtTime(-2.5, ctx.currentTime);

    // 5. Dynamics Compressor for soft-knee intimate vocal leveling
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);
    compressor.knee.setValueAtTime(30, ctx.currentTime);
    compressor.ratio.setValueAtTime(3.0, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);

    // Chain: highPass -> chestWarmth -> clarityPresence -> deHarsh -> compressor
    highPass.connect(chestWarmth);
    chestWarmth.connect(clarityPresence);
    clarityPresence.connect(deHarsh);
    deHarsh.connect(compressor);

    return { inputNode: highPass, outputNode: compressor };
  }
}
"""
with open(warmth_path, "w", encoding="utf-8") as f:
    f.write(warmth_code)
print("Updated emo-voice/src/synthesis/WarmthFilter.ts with Candidate C DSP chain")

# 3. Update AdaptiveVoiceEngine.ts with default Candidate C preset
engine_path = r"C:\Users\praty\Desktop\emo-girl\emo-voice\src\AdaptiveVoiceEngine.ts"
with open(engine_path, "r", encoding="utf-8") as f:
    engine_content = f.read()

if "CANDIDATE_C_VOICE_PRESET" not in engine_content:
    engine_content = engine_content.replace(
        'import { VoiceEmotionEstimate, VocalAcousticFeatures, TherapeuticAudioConfig } from "./types";',
        'import { VoiceEmotionEstimate, VocalAcousticFeatures, TherapeuticAudioConfig, VoicePresetConfig, CANDIDATE_C_VOICE_PRESET } from "./types";'
    )
    # Add getter for active voice preset
    engine_content = engine_content.replace(
        "  private constructor() {}",
        """  private activePreset: VoicePresetConfig = CANDIDATE_C_VOICE_PRESET;

  private constructor() {}

  public getActiveVoicePreset(): VoicePresetConfig {
    return this.activePreset;
  }

  public setVoicePreset(preset: VoicePresetConfig): void {
    this.activePreset = preset;
  }"""
    )
    with open(engine_path, "w", encoding="utf-8") as f:
        f.write(engine_content)
    print("Updated emo-voice/src/AdaptiveVoiceEngine.ts with Candidate C preset integration")

# 4. Sync emo-voice files into emosense-source/src/lib/emo-voice/
src_emo_voice = r"C:\Users\praty\Desktop\emo-girl\emo-voice\src"
dest_emo_voice = r"C:\Users\praty\Desktop\emo-girl\emosense-source\src\lib\emo-voice"
shutil.copytree(src_emo_voice, dest_emo_voice, dirs_exist_ok=True)
print("Synced emo-voice into emosense-source/src/lib/emo-voice/")

print("[SUCCESS] Candidate C voice system integration completed successfully!")
