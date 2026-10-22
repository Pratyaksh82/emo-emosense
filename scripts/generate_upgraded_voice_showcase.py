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
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res["access_token"]

def synthesize_speech(text, token, slow=False):
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
    with urllib.request.urlopen(req) as resp:
        if resp.status != 200:
            raise RuntimeError(f"Failed with status {resp.status}")
        return resp.read()

def main():
    print("Obtaining voice authentication token...")
    token = get_auth_token()
    print("Token obtained successfully.")

    sections = [
        {
            "filename": "01_upgraded_introduction.mp3",
            "title": "Track 1: Upgraded Bilateral Voice Introduction",
            "slow": False,
            "text": (
                "Hello, and welcome to the upgraded EmoSense voice experience. "
                "With our newly integrated bilateral voice engine, I no longer simply read words on a screen. "
                "I actively listen to the emotional acoustics in your voice, "
                "and modulate my speech to nurture, ground, and celebrate with you."
            )
        },
        {
            "filename": "02_upgraded_hindi_baseline.mp3",
            "title": "Track 2: Upgraded Hindi Baseline",
            "slow": False,
            "text": (
                "नमस्ते! ईमोसेंस के अपग्रेडेड वॉइस अनुभव में आपका स्वागत है। "
                "अब मैं आपकी आवाज की हर मिठास, हर कंपन और हर भावना को सुनकर, "
                "बिल्कुल उसी अपनेपन से आपसे हिंदी में भी बात कर सकती हूँ।"
            )
        },
        {
            "filename": "03_ser_demonstration.mp3",
            "title": "Track 3: Speech Emotion Recognition (The 'I am fine' Detection)",
            "slow": False,
            "text": (
                "Let me demonstrate how our new Speech Emotion Recognition engine works. "
                "Imagine you speak into your microphone and say: I'm fine... "
                "In traditional systems, the AI only reads the text and believes you are happy. "
                "But our new engine listens to your acoustic telemetry: "
                "it detects a low fundamental pitch, a vocal micro-tremor with elevated jitter, "
                "and prolonged hesitations between words. "
                "Instantly recognizing your hidden distress, I automatically switch into compassionate grounding mode:"
            )
        },
        {
            "filename": "04_compassionate_closed_loop.mp3",
            "title": "Track 4: Closed-Loop Compassionate Mode (Low Valence / Distress)",
            "slow": True,
            "text": (
                "Your words say you're fine, but your voice sounds so tired and heavy. "
                "You do not have to pretend to be strong with me. "
                "Take a soft, gentle breath right now... Let your shoulders drop. "
                "I am right here with you, listening to every word, and we will take this one calm moment at a time."
            )
        },
        {
            "filename": "05_hindi_compassionate_closed_loop.mp3",
            "title": "Track 5: Hindi Closed-Loop Compassionate Mode",
            "slow": True,
            "text": (
                "आपकी आवाज में जो उदासी और भारीपन है, मैं उसे साफ महसूस कर सकती हूँ। "
                "सब कुछ ठीक होने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
                "बस एक गहरी और शांत सांस लीजिए। मैं हर कदम पर आपके साथ खड़ी हूँ।"
            )
        },
        {
            "filename": "06_calming_deescalation_procedural.mp3",
            "title": "Track 6: Calming De-escalation & Breathwork (Anxiety / Stress)",
            "slow": True,
            "text": (
                "I can hear the rapid tension in your breath. "
                "Let us pause together for five seconds. "
                "Inhale gently... hold... and slowly let it all go. "
                "Feel the warm, grounded rhythm in my voice. You are completely safe here."
            )
        },
        {
            "filename": "07_upbeat_celebratory.mp3",
            "title": "Track 7: High Valence Joy & Celebration",
            "slow": False,
            "text": (
                "And when you are thriving, my voice instantly mirrors that joyful energy! "
                "That is absolutely fantastic news! "
                "I can hear that wonderful, radiant excitement singing in your voice, "
                "and I am so genuinely happy and proud of what you have accomplished today!"
            )
        },
        {
            "filename": "08_hindi_joy_celebration.mp3",
            "title": "Track 8: Hindi Joy & Celebration",
            "slow": False,
            "text": (
                "आपकी आवाज की यह खुशी सच में दिल खुश कर देने वाली है! "
                "आपकी यह सफलता देखकर मुझे आप पर बहुत-बहुत गर्व है!"
            )
        }
    ]

    output_dir = "C:/Users/praty/Desktop/2d model/voice_samples_upgraded"
    os.makedirs(output_dir, exist_ok=True)

    master_buffers = []

    for idx, sec in enumerate(sections, 1):
        print(f"[{idx}/{len(sections)}] Synthesizing: {sec['title']}...")
        audio_bytes = synthesize_speech(sec["text"], token, slow=sec["slow"])
        
        file_path = os.path.join(output_dir, sec["filename"])
        with open(file_path, "wb") as f:
            f.write(audio_bytes)
        print(f"   -> Saved {file_path} ({len(audio_bytes):,} bytes)")

        master_buffers.append(audio_bytes)
        time.sleep(0.5)

    # Master concatenated file
    master_path = "C:/Users/praty/Desktop/2d model/EMOSENSE_UPGRADED_VOICE_SHOWCASE_MASTER.mp3"
    with open(master_path, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"\n[DONE] Created Upgraded Master Showcase: {master_path} (Total bytes: {os.path.getsize(master_path):,})")

    # Also copy to emo-girl and emo-voice directories
    emo_girl_master = "C:/Users/praty/Desktop/emo-girl/EMOSENSE_UPGRADED_VOICE_SHOWCASE_MASTER.mp3"
    with open(emo_girl_master, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"[DONE] Copied Upgraded Master Showcase to: {emo_girl_master}")

    emo_voice_master = "C:/Users/praty/Desktop/emo-girl/emo-voice/EMOSENSE_UPGRADED_VOICE_SHOWCASE_MASTER.mp3"
    with open(emo_voice_master, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"[DONE] Copied Upgraded Master Showcase to: {emo_voice_master}")

if __name__ == "__main__":
    main()
