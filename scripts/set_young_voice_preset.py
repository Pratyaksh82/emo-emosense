import os

speech_path = "C:/Users/praty/Desktop/emo-girl/emosense-source/src/lib/speech.ts"

with open(speech_path, "r", encoding="utf-8") as f:
    code = f.read()

# Replace voice fetch body to use shimmer young voice preset with clean speed
old_fetch_body = 'body: JSON.stringify({ text, slow }),'
new_fetch_body = 'body: JSON.stringify({ text, voice: "shimmer", slow: false }),'

if old_fetch_body in code:
    code = code.replace(old_fetch_body, new_fetch_body)

with open(speech_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Updated speech.ts with young shimmer voice preset and vibration-free cadence!")
