import os
import shutil

print("Integrating Unified English & Hindi Candidate C Voice System...", flush=True)

# 1. Update emo-voice/src/types/index.ts
types_path = r"C:\Users\praty\Desktop\emo-girl\emo-voice\src\types\index.ts"
with open(types_path, "r", encoding="utf-8") as f:
    types_content = f.read()

english_preset_def = """
export const CANDIDATE_C_ENGLISH_VOICE_PRESET: VoicePresetConfig = {
  name: "Candidate-C-Google-English-Young-Deep",
  language: "en",
  engine: "google-neural",
  targetPitchHz: 231.8,
  pitchMultiplier: 1.10,
  perceivedAgeYears: 19,
  formantPreserved: true,
  warmthCutoffHz: 8000,
  chestWarmthGainDb: 2.8,
  presenceGainDb: 1.6,
  highShelfReductionDb: -2.5,
  description: "Unified English neural companion voice, youthful (~19 yrs), sweet, vibration-free with intimate emotional warmth and 432 Hz soundscape integration."
};
"""

if "CANDIDATE_C_ENGLISH_VOICE_PRESET" not in types_content:
    with open(types_path, "a", encoding="utf-8") as f:
        f.write("\n" + english_preset_def)
    print("Added CANDIDATE_C_ENGLISH_VOICE_PRESET to emo-voice/src/types/index.ts")

# 2. Update emo-voice/src/AdaptiveVoiceEngine.ts
engine_path = r"C:\Users\praty\Desktop\emo-girl\emo-voice\src\AdaptiveVoiceEngine.ts"
with open(engine_path, "r", encoding="utf-8") as f:
    engine_content = f.read()

if "CANDIDATE_C_ENGLISH_VOICE_PRESET" not in engine_content:
    engine_content = engine_content.replace(
        'import { VoiceEmotionEstimate, VocalAcousticFeatures, TherapeuticAudioConfig, VoicePresetConfig, CANDIDATE_C_VOICE_PRESET } from "./types";',
        'import { VoiceEmotionEstimate, VocalAcousticFeatures, TherapeuticAudioConfig, VoicePresetConfig, CANDIDATE_C_VOICE_PRESET, CANDIDATE_C_ENGLISH_VOICE_PRESET } from "./types";'
    )
    # Add getVoicePresetForText helper
    helper_code = """  public getVoicePresetForText(text: string): VoicePresetConfig {
    const hasHindi = /[\\u0900-\\u097F]/.test(text);
    return hasHindi ? CANDIDATE_C_VOICE_PRESET : CANDIDATE_C_ENGLISH_VOICE_PRESET;
  }
"""
    if "getVoicePresetForText" not in engine_content:
        engine_content = engine_content.replace(
            "  public getActiveVoicePreset(): VoicePresetConfig {",
            helper_code + "\n  public getActiveVoicePreset(): VoicePresetConfig {"
        )
    with open(engine_path, "w", encoding="utf-8") as f:
        f.write(engine_content)
    print("Updated emo-voice/src/AdaptiveVoiceEngine.ts with bilingual preset resolver")

# 3. Sync emo-voice into emosense-source/src/lib/emo-voice/
src_emo_voice = r"C:\Users\praty\Desktop\emo-girl\emo-voice\src"
dest_emo_voice = r"C:\Users\praty\Desktop\emo-girl\emosense-source\src\lib\emo-voice"
shutil.copytree(src_emo_voice, dest_emo_voice, dirs_exist_ok=True)
print("Synced emo-voice into emosense-source/src/lib/emo-voice/")

print("[SUCCESS] Unified English and Hindi Voice System integration complete!")
