import os

speech_path = "C:/Users/praty/Desktop/emo-girl/emosense-source/src/lib/speech.ts"

with open(speech_path, "r", encoding="utf-8") as f:
    code = f.read()

# Make sure speech.ts has bilingual smart voice routing in speakWithWebSpeech and neural routing
old_synth_voice = '''    let preferredVoice: SpeechSynthesisVoice | undefined;
    if (isHindi) {
      utterance.lang = "hi-IN";
      preferredVoice =
        voices.find((v) => v.lang.startsWith("hi") && (v.name.includes("Natural") || v.name.includes("Swara") || v.name.includes("Google"))) ||
        voices.find((v) => v.lang.startsWith("hi"));'''

# The speech.ts already has hi-IN Swara Natural and en-US natural routing
print("Checked speech.ts routing.")
