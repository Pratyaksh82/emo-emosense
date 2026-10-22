import asyncio
import edge_tts
import urllib.request
import json
import os
import time

SUPABASE_URL = "https://wzuivhmhlozdaslpwlzt.supabase.co"
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dWl2aG1obG96ZGFzbHB3bHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODQzMjUsImV4cCI6MjA5MzA2MDMyNX0."
    "N5aHVVjnymkk4AlyANSPpPd0i56qFKFtxmy7ZTfU7sc"
)

def get_auth_token():
    login_data = json.dumps({
        "email": "guest_voice_client@emosense.ai",
        "password": "EmoSenseVoice2026!"
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": ANON_KEY, "Content-Type": "application/json"},
        data=login_data,
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res["access_token"]

def synthesize_coral(text, token, slow=False):
    speak_headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = json.dumps({"text": text, "slow": slow}).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/functions/v1/speak",
        headers=speak_headers,
        data=data,
        method="POST"
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                if resp.status == 200:
                    return resp.read()
        except Exception as e:
            print(f"   [Retry {attempt+1}] Coral error: {e}", flush=True)
            time.sleep(1.0)
    raise RuntimeError("Coral synthesis failed after 3 attempts")

async def synthesize_native_hindi(text, file_path, slow=False):
    # Native North Indian Hindi with SwaraNeural: authentic phonetics, zero foreign accent
    rate = "-8%" if slow else "+0%"
    pitch = "-3Hz" if slow else "+0Hz"
    volume = "-5%" if slow else "+0%"
    communicate = edge_tts.Communicate(text, voice="hi-IN-SwaraNeural", rate=rate, pitch=pitch, volume=volume)
    await communicate.save(file_path)

async def main_async():
    print("Obtaining Supabase token for OpenAI Coral English tracks...", flush=True)
    token = get_auth_token()
    print("Token ready.", flush=True)

    tracks = [
        {
            "filename": "01_upgraded_english_intro.mp3",
            "title": "Track 1: Upgraded English Overview (OpenAI Coral Neural)",
            "engine": "coral",
            "slow": False,
            "text": (
                "Hello, and welcome to the upgraded EmoSense voice experience. "
                "With our newly refined voice engine, I now feature dual-engine bilingual routing, "
                "hardware-adaptive calming frequencies, and full-duplex conversational awareness. "
                "I actively listen to the emotional acoustics in your voice, and modulate my tone to support and celebrate with you."
            )
        },
        {
            "filename": "02_native_hindi_baseline.mp3",
            "title": "Track 2: Authentic Native Hindi Baseline (Swara Neural - 0% Foreign Accent)",
            "engine": "swara",
            "slow": False,
            "text": (
                "नमस्ते! ईमोसेंस के अपग्रेडेड वॉइस अनुभव में आपका स्वागत है। "
                "अब मेरी हिंदी पूरी तरह से शुद्ध, स्वाभाविक और भारतीय उच्चारण के साथ तैयार है। "
                "अब इसमें कोई विदेशी लहजा नहीं है। मैं बिल्कुल आपके अपने की तरह, बड़ी सहजता और मिठास से आपसे बात कर सकती हूँ।"
            )
        },
        {
            "filename": "03_ser_demonstration.mp3",
            "title": "Track 3: Noise-Gated Speech Emotion Recognition Demo",
            "engine": "coral",
            "slow": False,
            "text": (
                "Let me demonstrate how our enhanced Speech Emotion Recognition works in real time. "
                "With our new adaptive noise gating, room fans and keyboard clicks are completely filtered out. "
                "When you speak into your microphone and say: I am fine... "
                "our engine analyzes your vocal acoustics: detecting pitch drop, elevated micro-jitter tremor, "
                "and prolonged hesitation. Instantly recognizing your hidden distress, I automatically switch into therapeutic grounding mode:"
            )
        },
        {
            "filename": "04_compassionate_grounding.mp3",
            "title": "Track 4: Therapeutic Compassionate Mode (English Grounding)",
            "engine": "coral",
            "slow": True,
            "text": (
                "Your words say you're fine, but your voice sounds so exhausted and heavy. "
                "You do not have to pretend to be strong with me. "
                "Take a soft, gentle breath right now... Let your shoulders drop. "
                "I am right here with you, listening to every word, and we will take this one calm moment at a time."
            )
        },
        {
            "filename": "05_native_hindi_compassionate.mp3",
            "title": "Track 5: Native Indian Hindi Compassionate Grounding (Swara Neural)",
            "engine": "swara",
            "slow": True,
            "text": (
                "आपकी आवाज में जो उदासी और भारीपन है, मैं उसे साफ महसूस कर सकती हूँ। "
                "सब कुछ ठीक होने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
                "बस एक गहरी और शांत सांस लीजिए। मैं हर कदम पर आपके साथ खड़ी हूँ।"
            )
        },
        {
            "filename": "06_calming_deescalation.mp3",
            "title": "Track 6: Calming De-escalation & Breathwork (432 Hz Cadence)",
            "engine": "coral",
            "slow": True,
            "text": (
                "I can hear the rapid tension in your breathing. "
                "Let us pause together for five seconds. "
                "Inhale gently... hold... and slowly let it all go. "
                "Feel the warm, grounded rhythm in my voice. You are completely safe here."
            )
        },
        {
            "filename": "07_upbeat_celebratory.mp3",
            "title": "Track 7: High Valence Joy & Celebration (English - Bright & Radiant)",
            "engine": "coral",
            "slow": False,
            "text": (
                "And when you are thriving, my voice instantly mirrors that joyful energy! "
                "That is absolutely fantastic news! "
                "I can hear that wonderful, radiant excitement singing in your voice, "
                "and I am so genuinely happy and proud of what you have accomplished today!"
            )
        },
        {
            "filename": "08_native_hindi_joy.mp3",
            "title": "Track 8: Native Indian Hindi Joy & Celebration (Swara Neural)",
            "engine": "swara",
            "slow": False,
            "text": (
                "आपकी आवाज की यह खुशी सच में दिल खुश कर देने वाली है! "
                "आपकी यह सफलता देखकर मुझे आप पर बहुत-बहुत गर्व है!"
            )
        }
    ]

    output_dir = "C:/Users/praty/Desktop/2d model/voice_samples_native_upgraded"
    os.makedirs(output_dir, exist_ok=True)

    master_buffers = []

    for idx, trk in enumerate(tracks, 1):
        file_path = os.path.join(output_dir, trk["filename"])
        print(f"[{idx}/{len(tracks)}] Synthesizing: {trk['title']}...", flush=True)

        if trk["engine"] == "coral":
            audio_bytes = synthesize_coral(trk["text"], token, slow=trk["slow"])
            with open(file_path, "wb") as f:
                f.write(audio_bytes)
        else:
            await synthesize_native_hindi(trk["text"], file_path, slow=trk["slow"])
            with open(file_path, "rb") as f:
                audio_bytes = f.read()

        print(f"   -> Saved {file_path} ({len(audio_bytes):,} bytes)", flush=True)
        master_buffers.append(audio_bytes)
        time.sleep(0.3)

    # Master concatenated file
    master_path = "C:/Users/praty/Desktop/2d model/EMOSENSE_NATIVE_UPGRADED_VOICE_SHOWCASE_MASTER.mp3"
    with open(master_path, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"\n[DONE] Created Master Showcase: {master_path} (Total bytes: {os.path.getsize(master_path):,})", flush=True)

    # Copy to emo-girl and emo-voice
    for dest in [
        "C:/Users/praty/Desktop/emo-girl/EMOSENSE_NATIVE_UPGRADED_VOICE_SHOWCASE_MASTER.mp3",
        "C:/Users/praty/Desktop/emo-girl/emo-voice/EMOSENSE_NATIVE_UPGRADED_VOICE_SHOWCASE_MASTER.mp3"
    ]:
        with open(dest, "wb") as f:
            for b in master_buffers:
                f.write(b)
        print(f"[DONE] Copied to: {dest}", flush=True)

if __name__ == "__main__":
    asyncio.run(main_async())
