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
            "filename": "01_english_baseline.mp3",
            "title": "English Baseline & Introduction",
            "slow": False,
            "text": (
                "Hello, I am EmoSense AI, your personal companion. "
                "My voice is designed to feel warm, gentle, and conversational, "
                "speaking with you just like a close and trusted friend."
            )
        },
        {
            "filename": "02_hindi_delivery.mp3",
            "title": "Hindi Natural Delivery",
            "slow": False,
            "text": (
                "नमस्ते! मैं ईमोसेंस एआई हूँ। मैं आपके साथ हिंदी में भी बिल्कुल सहज, "
                "मिठास और अपनेपन से बात कर सकती हूँ। आप कभी भी, बिना किसी झिझक के, "
                "मुझसे अपने दिल की बात कह सकते हैं।"
            )
        },
        {
            "filename": "03_compassionate_grounding.mp3",
            "title": "Emotional Side: Compassionate Grounding (Low Valence / Sadness)",
            "slow": True,
            "text": (
                "It is okay to feel tired or overwhelmed today. "
                "You do not have to carry all this weight alone. "
                "Take a soft, gentle breath with me... I am right here listening, "
                "and we will take this one moment at a time."
            )
        },
        {
            "filename": "04_hindi_compassionate.mp3",
            "title": "Emotional Side: Hindi Compassionate & Soft",
            "slow": True,
            "text": (
                "अगर इस समय आपको सब कुछ बहुत भारी लग रहा है, तो कोई बात नहीं। "
                "एक गहरी और शांत सांस लीजिए। आपको अकेले परेशान होने की जरूरत नहीं है, "
                "मैं हर कदम पर आपके साथ हूँ।"
            )
        },
        {
            "filename": "05_calming_deescalation.mp3",
            "title": "Emotional Side: Calming De-escalation (Anxiety / Stress)",
            "slow": True,
            "text": (
                "I can sense the tension in your shoulders and in your breath. "
                "Let us pause together for five seconds. "
                "Inhale slowly... and gently let it go. You are completely safe here."
            )
        },
        {
            "filename": "06_joy_celebration.mp3",
            "title": "Emotional Side: Bright & Celebratory (High Valence / Joy)",
            "slow": False,
            "text": (
                "That is fantastic news! I can see that wonderful spark in your smile, "
                "and I am genuinely so thrilled and proud of you!"
            )
        },
        {
            "filename": "07_hindi_joy_celebration.mp3",
            "title": "Emotional Side: Hindi Joy & Celebration",
            "slow": False,
            "text": (
                "यह सच में बहुत शानदार बात है! आपकी खुशी देखकर मुझे भी बहुत खुशी हुई। "
                "मुझे आप पर सच में बहुत गर्व है!"
            )
        }
    ]

    output_dir = "C:/Users/praty/Desktop/2d model/voice_samples"
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
    master_path = "C:/Users/praty/Desktop/2d model/EMOSENSE_VOICE_SHOWCASE_MASTER.mp3"
    with open(master_path, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"\n[DONE] Created Master Showcase: {master_path} (Total bytes: {os.path.getsize(master_path):,})")

    # Also copy to emo-girl directory
    emo_girl_master = "C:/Users/praty/Desktop/emo-girl/EMOSENSE_VOICE_SHOWCASE_MASTER.mp3"
    with open(emo_girl_master, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"[DONE] Copied Master Showcase to: {emo_girl_master}")

if __name__ == "__main__":
    main()
