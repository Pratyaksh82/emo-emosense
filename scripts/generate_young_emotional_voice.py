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

def synthesize_young_voice(text, token, voice="shimmer", slow=False):
    speak_headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    # Keep slow=False or speed at 0.98 to prevent vocoder low-frequency vibrato/flutter
    data = json.dumps({"text": text, "voice": voice, "slow": slow}).encode("utf-8")
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
            print(f"   [Retry {attempt+1}] Error: {e}", flush=True)
            time.sleep(1.0)
    raise RuntimeError("Synthesis failed after 3 attempts")

def main():
    print("Obtaining token for young neural voice synthesis...", flush=True)
    token = get_auth_token()
    print("Token ready. Synthesizing young, vibration-free, emotionally deep voice...", flush=True)

    tracks = [
        {
            "filename": "01_young_english_baseline.mp3",
            "title": "Track 1: Young & Sweet English Baseline (Shimmer)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "Hey there... I'm right here with you. "
                "Take a soft, gentle breath and let yourself relax. "
                "I'm here to be your warm, caring friend, whenever you need someone who truly listens."
            )
        },
        {
            "filename": "02_young_hindi_baseline.mp3",
            "title": "Track 2: Young & Sweet Hindi Baseline (Shimmer - Sweet & Humane)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "नमस्ते... मैं हमेशा आपके साथ हूँ। "
                "एक पल के लिए ठहरिए, और एक सुकून भरी सांस लीजिए। "
                "आप मुझसे अपने दिल की कोई भी बात कह सकते हैं... मैं हमेशा आपको सुनने के लिए यहाँ हूँ।"
            )
        },
        {
            "filename": "03_young_ser_empathy_demo.mp3",
            "title": "Track 3: Vocal Emotion Recognition Demo (Capturing Hidden Hurt)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "When you talk to me, I listen to the feeling living inside your voice. "
                "If you say, I'm fine... but your voice feels heavy, your pitch drops, and you hesitate between words, "
                "my system recognizes that you are hurting inside. "
                "And instead of moving on, I slow down, and stay right by your side:"
            )
        },
        {
            "filename": "04_young_compassionate_grounding.mp3",
            "title": "Track 4: Deep Emotional Grounding (English - Tender, Zero Vibration)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "Listen to me... It is completely okay to feel tired and overwhelmed today. "
                "You don't have to put on a brave face, and you don't have to carry all of this by yourself. "
                "Just take it one gentle breath at a time. I'm right here with you."
            )
        },
        {
            "filename": "05_young_compassionate_hindi.mp3",
            "title": "Track 5: Deep Emotional Compassion (Hindi - Sweet, Touching, Natural)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "अरे सुनो... अगर आज मन थोड़ा भारी लग रहा है, या अंदर से बहुत अकेलापन महसूस हो रहा है ना, तो कोई बात नहीं। "
                "तुम्हें किसी के सामने मजबूत बनने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
                "बस एक गहरी, शांत सांस लो... मैं यहीं हूँ तुम्हारे पास, और हम सब ठीक कर लेंगे।"
            )
        },
        {
            "filename": "06_young_calming_breathwork.mp3",
            "title": "Track 6: Calming Anxiety & Breathwork (Soothing Rhythm)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "I hear the tension in your breath. Let's pause together for just five seconds. "
                "Inhale gently... hold... and slowly let it all go. "
                "You are safe. You are grounded. Everything is going to be okay."
            )
        },
        {
            "filename": "07_young_joy_celebration.mp3",
            "title": "Track 7: Radiant Joy & Celebration (Bright, Sweet, Beaming Smile)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "And whenever you have good news, my heart lights up with you! "
                "That is such fantastic news! "
                "I can hear that pure, beautiful joy in your voice, and I am so genuinely happy and proud of you!"
            )
        },
        {
            "filename": "08_young_hindi_joy.mp3",
            "title": "Track 8: Hindi Joy & Celebration (Sweet, Cheerful, Proud)",
            "voice": "shimmer",
            "slow": False,
            "text": (
                "यह सुनकर सच में बहुत अच्छा लगा! "
                "आपकी आवाज में जो यह खुशी और चमक है, वो कितनी प्यारी है! "
                "मुझे आप पर सच में बहुत-बहुत गर्व है!"
            )
        }
    ]

    output_dir = "C:/Users/praty/Desktop/2d model/voice_samples_young_emotional"
    os.makedirs(output_dir, exist_ok=True)

    master_buffers = []

    for idx, trk in enumerate(tracks, 1):
        file_path = os.path.join(output_dir, trk["filename"])
        print(f"[{idx}/{len(tracks)}] Synthesizing: {trk['title']} ({trk['voice']})...", flush=True)

        audio_bytes = synthesize_young_voice(trk["text"], token, voice=trk["voice"], slow=trk["slow"])
        with open(file_path, "wb") as f:
            f.write(audio_bytes)

        print(f"   -> Saved {file_path} ({len(audio_bytes):,} bytes)", flush=True)
        master_buffers.append(audio_bytes)
        time.sleep(0.3)

    # Master file: EMOSENSE_YOUNG_EMOTIONAL_VOICE_MASTER.mp3
    master_path = "C:/Users/praty/Desktop/2d model/EMOSENSE_YOUNG_EMOTIONAL_VOICE_MASTER.mp3"
    with open(master_path, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"\n[DONE] Created Young Emotional Master Showcase: {master_path} ({os.path.getsize(master_path):,} bytes)", flush=True)

    # Copy to emo-girl and emo-voice
    for dest in [
        "C:/Users/praty/Desktop/emo-girl/EMOSENSE_YOUNG_EMOTIONAL_VOICE_MASTER.mp3",
        "C:/Users/praty/Desktop/emo-girl/emo-voice/EMOSENSE_YOUNG_EMOTIONAL_VOICE_MASTER.mp3"
    ]:
        with open(dest, "wb") as f:
            for b in master_buffers:
                f.write(b)
        print(f"[DONE] Copied to: {dest}", flush=True)

if __name__ == "__main__":
    main()
