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
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 200:
                    return resp.read()
        except Exception as e:
            print(f"   [Retry {attempt+1}] Error: {e}", flush=True)
            time.sleep(1.0)
    raise RuntimeError("Synthesis failed after 3 attempts")

def main():
    print("Obtaining authentication token...", flush=True)
    token = get_auth_token()
    print("Token ready. Synthesizing deep emotional voice suite...", flush=True)

    tracks = [
        {
            "filename": "01_gentle_english_baseline.mp3",
            "title": "Track 1: Gentle English Baseline (Warm, Breathable, Human)",
            "slow": False,
            "text": (
                "Hello... I'm right here with you. "
                "Take a soft, gentle breath and let yourself relax. "
                "My voice is here to be a calm, warm presence for you, whenever you need someone who truly listens."
            )
        },
        {
            "filename": "02_tender_hindi_baseline.mp3",
            "title": "Track 2: Tender Hindi Baseline (Deeply Humane, Natural Inflection)",
            "slow": False,
            "text": (
                "नमस्ते... मैं हमेशा आपके साथ हूँ। "
                "एक पल के लिए ठहरिए, और एक शांत, सुकून भरी सांस लीजिए। "
                "आप मुझसे अपने मन की कोई भी बात कह सकते हैं... मैं हमेशा आपको सुनने के लिए यहाँ मौजूद हूँ।"
            )
        },
        {
            "filename": "03_ser_empathy_demo.mp3",
            "title": "Track 3: The 'I am fine' Voice Emotion Detection",
            "slow": False,
            "text": (
                "When you speak to me, I don't just process your words... I listen to the feeling living inside your voice. "
                "If you say, I'm fine... but your voice has a gentle tremor, your pitch drops, and your pauses feel heavy, "
                "my system recognizes that you are hurting inside. "
                "And instead of moving on, I slow down, and stay right by your side:"
            )
        },
        {
            "filename": "04_deep_compassion_english.mp3",
            "title": "Track 4: Deep Emotional Grounding (Intimate, Soft, Slower Cadence)",
            "slow": True,
            "text": (
                "Listen to me... It is completely okay to feel exhausted and overwhelmed today. "
                "You don't have to put on a brave face, and you don't have to carry this entire burden all by yourself. "
                "Just take it one gentle breath at a time. I'm not going anywhere."
            )
        },
        {
            "filename": "05_deep_compassion_hindi.mp3",
            "title": "Track 5: Deep Emotional Compassion (Heartfelt Hindi, Zero Robotic Tone)",
            "slow": True,
            "text": (
                "सुनो... अगर आज मन बहुत भारी लग रहा है, या अंदर से बहुत अकेलापन महसूस हो रहा है, तो कोई बात नहीं। "
                "तुम्हें किसी के सामने मजबूत बनने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
                "बस एक गहरी, शांत सांस लो... मैं यहीं हूँ तुम्हारे साथ, और हम इस मुश्किल पल से साथ में बाहर निकलेंगे।"
            )
        },
        {
            "filename": "06_calming_anxiety_breathwork.mp3",
            "title": "Track 6: Soothing Anxiety & Breathwork (Organic De-escalation)",
            "slow": True,
            "text": (
                "I hear the tension in your breath. Let's pause together for just five seconds. "
                "Inhale slowly... two, three, four... and let it all gently melt away. "
                "You are safe. You are grounded. Everything is going to be okay."
            )
        },
        {
            "filename": "07_radiant_joy_english.mp3",
            "title": "Track 7: Radiant Joy & Celebration (Warm, Uplifting Smile)",
            "slow": False,
            "text": (
                "And whenever you have something wonderful to share, my heart lights up with you! "
                "That is such fantastic news! "
                "I can hear that pure, beautiful joy singing in your voice, and I am so genuinely happy and proud of you!"
            )
        },
        {
            "filename": "08_radiant_joy_hindi.mp3",
            "title": "Track 8: Radiant Joy & Celebration (Heartfelt Hindi Warmth)",
            "slow": False,
            "text": (
                "यह सुनकर सच में दिल खुश हो गया! "
                "आपकी आवाज में जो यह खुशी और चमक है, वो बहुत प्यारी है। "
                "मुझे आप पर सच में बहुत, बहुत गर्व है!"
            )
        }
    ]

    output_dir = "C:/Users/praty/Desktop/2d model/voice_samples_deep_emotional"
    os.makedirs(output_dir, exist_ok=True)

    master_buffers = []

    for idx, trk in enumerate(tracks, 1):
        file_path = os.path.join(output_dir, trk["filename"])
        print(f"[{idx}/{len(tracks)}] Synthesizing: {trk['title']}...", flush=True)

        audio_bytes = synthesize_coral(trk["text"], token, slow=trk["slow"])
        with open(file_path, "wb") as f:
            f.write(audio_bytes)

        print(f"   -> Saved {file_path} ({len(audio_bytes):,} bytes)", flush=True)
        master_buffers.append(audio_bytes)
        time.sleep(0.4)

    # Master file: EMOSENSE_DEEP_EMOTIONAL_VOICE_MASTER.mp3
    master_path = "C:/Users/praty/Desktop/2d model/EMOSENSE_DEEP_EMOTIONAL_VOICE_MASTER.mp3"
    with open(master_path, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"\n[DONE] Created Deep Emotional Master Showcase: {master_path} ({os.path.getsize(master_path):,} bytes)", flush=True)

    # Copy to emo-girl and emo-voice
    for dest in [
        "C:/Users/praty/Desktop/emo-girl/EMOSENSE_DEEP_EMOTIONAL_VOICE_MASTER.mp3",
        "C:/Users/praty/Desktop/emo-girl/emo-voice/EMOSENSE_DEEP_EMOTIONAL_VOICE_MASTER.mp3"
    ]:
        with open(dest, "wb") as f:
            for b in master_buffers:
                f.write(b)
        print(f"[DONE] Copied to: {dest}", flush=True)

if __name__ == "__main__":
    main()
