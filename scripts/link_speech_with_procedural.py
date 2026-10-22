import os

speech_path = "C:/Users/praty/Desktop/emo-girl/emosense-source/src/lib/speech.ts"

with open(speech_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add import if not present
if "from './emo-voice'" not in content and 'from "@/lib/emo-voice"' not in content:
    content = 'import { ProceduralSoundscape } from "./emo-voice";\n' + content

# In speakText: trigger theta entrainment on acute distress
old_speak_start = "export async function speakText(text: string, opts: SpeakOptions = {}): Promise<VoiceModulation> {"
new_speak_start = '''export async function speakText(text: string, opts: SpeakOptions = {}): Promise<VoiceModulation> {
  const soundscape = ProceduralSoundscape.getInstance();
  const isDistressed =
    opts.emotion === "crisis" ||
    opts.emotion === "sad" ||
    opts.emotion === "anxious" ||
    opts.emotion === "stress" ||
    (opts.valence != null && opts.valence <= -0.25) ||
    opts.riskLevel === "high";

  if (isDistressed) {
    soundscape.startThetaEntrainment(0.065, 1.8);
  } else {
    soundscape.stopThetaEntrainment(2.5);
  }'''

if old_speak_start in content and "const soundscape = ProceduralSoundscape.getInstance();" not in content:
    content = content.replace(old_speak_start, new_speak_start, 1)

with open(speech_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated speech.ts with closed-loop 432Hz/436Hz procedural audio integration!")
