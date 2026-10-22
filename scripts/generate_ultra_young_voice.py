import asyncio
import edge_tts
import os
import time

async def main():
    print("Synthesizing Ultra-Young, Highly Feminine, Jitter-Free Voice Suite...", flush=True)

    tracks = [
        {
            "filename": "01_young_fem_english_baseline.mp3",
            "title": "Track 1: Young Feminine English Baseline (Emma - 18 yrs, Sweet & Gentle)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+0%",
            "pitch": "+2Hz",
            "text": (
                "Hey there... I'm right here with you. "
                "Take a soft, gentle breath and let yourself relax. "
                "I'm here to be your warm, caring friend, whenever you need someone who truly listens."
            )
        },
        {
            "filename": "02_young_fem_hindi_baseline.mp3",
            "title": "Track 2: Young Feminine Hindi Baseline (Emma - Sweet, Humane, Zero Vibration)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+0%",
            "pitch": "+2Hz",
            "text": (
                "नमस्ते... मैं हमेशा आपके साथ हूँ। "
                "एक पल के लिए ठहरिए, और एक सुकून भरी सांस लीजिए। "
                "आप मुझसे अपने दिल की कोई भी बात कह सकते हैं... मैं हमेशा आपको सुनने के लिए यहाँ हूँ।"
            )
        },
        {
            "filename": "03_young_fem_ser_empathy_demo.mp3",
            "title": "Track 3: Voice Emotion Recognition Demo (Detecting Hidden Hurt)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+0%",
            "pitch": "+2Hz",
            "text": (
                "When you talk to me, I listen to the feeling living inside your voice. "
                "If you say, I'm fine... but your voice feels heavy, your pitch drops, and you hesitate between words, "
                "my system recognizes that you are hurting inside. "
                "And instead of moving on, I stay right by your side:"
            )
        },
        {
            "filename": "04_young_fem_compassionate_english.mp3",
            "title": "Track 4: Deep Emotional Grounding (English - Tender, Intimate, Silky Smooth)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "-4%",
            "pitch": "+0Hz",
            "text": (
                "Listen to me... It is completely okay to feel tired and overwhelmed today. "
                "You don't have to put on a brave face, and you don't have to carry all of this by yourself. "
                "Just take it one gentle breath at a time. I'm right here with you."
            )
        },
        {
            "filename": "05_young_fem_compassionate_hindi.mp3",
            "title": "Track 5: Deep Emotional Compassion (Hindi - Sweet Young Girl, Zero Robotic Tone)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "-4%",
            "pitch": "+0Hz",
            "text": (
                "अरे सुनो... अगर आज मन थोड़ा भारी लग रहा है, या अंदर से बहुत अकेलापन महसूस हो रहा है ना, तो कोई बात नहीं। "
                "तुम्हें किसी के सामने मजबूत बनने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
                "बस एक गहरी, शांत सांस लो... मैं यहीं हूँ तुम्हारे पास, और हम सब ठीक कर लेंगे।"
            )
        },
        {
            "filename": "06_young_fem_calming_breathwork.mp3",
            "title": "Track 6: Calming Anxiety & Guided Breathwork (Soft & Grounded)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "-3%",
            "pitch": "+0Hz",
            "text": (
                "I hear the tension in your breath. Let's pause together for just five seconds. "
                "Inhale gently... hold... and slowly let it all go. "
                "You are safe. You are grounded. Everything is going to be okay."
            )
        },
        {
            "filename": "07_young_fem_joy_celebration.mp3",
            "title": "Track 7: Radiant Joy & Celebration (Sweet, Cheerful, Smiling Resonance)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+4%",
            "pitch": "+4Hz",
            "text": (
                "And whenever you have good news, my heart lights up with you! "
                "That is such fantastic news! "
                "I can hear that pure, beautiful joy in your voice, and I am so genuinely happy and proud of you!"
            )
        },
        {
            "filename": "08_young_fem_hindi_joy.mp3",
            "title": "Track 8: Hindi Joy & Celebration (Beaming Sweet Happiness)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+4%",
            "pitch": "+4Hz",
            "text": (
                "यह सुनकर सच में बहुत अच्छा लगा! "
                "आपकी आवाज में जो यह खुशी और चमक है, वो कितनी प्यारी है! "
                "मुझे आप पर सच में बहुत-बहुत गर्व है!"
            )
        }
    ]

    output_dir = "C:/Users/praty/Desktop/2d model/voice_samples_ultra_young"
    os.makedirs(output_dir, exist_ok=True)

    master_buffers = []

    for idx, trk in enumerate(tracks, 1):
        file_path = os.path.join(output_dir, trk["filename"])
        print(f"[{idx}/{len(tracks)}] Synthesizing: {trk['title']}...", flush=True)

        comm = edge_tts.Communicate(
            trk["text"],
            voice=trk["voice"],
            rate=trk["rate"],
            pitch=trk["pitch"]
        )
        await comm.save(file_path)

        with open(file_path, "rb") as f:
            audio_bytes = f.read()

        print(f"   -> Saved {file_path} ({len(audio_bytes):,} bytes)", flush=True)
        master_buffers.append(audio_bytes)
        time.sleep(0.3)

    # Master file: EMOSENSE_ULTRA_YOUNG_FEMININE_VOICE_MASTER.mp3
    master_path = "C:/Users/praty/Desktop/2d model/EMOSENSE_ULTRA_YOUNG_FEMININE_VOICE_MASTER.mp3"
    with open(master_path, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"\n[DONE] Created Ultra-Young Feminine Master Showcase: {master_path} ({os.path.getsize(master_path):,} bytes)", flush=True)

    # Copy to emo-girl and emo-voice
    for dest in [
        "C:/Users/praty/Desktop/emo-girl/EMOSENSE_ULTRA_YOUNG_FEMININE_VOICE_MASTER.mp3",
        "C:/Users/praty/Desktop/emo-girl/emo-voice/EMOSENSE_ULTRA_YOUNG_FEMININE_VOICE_MASTER.mp3"
    ]:
        with open(dest, "wb") as f:
            for b in master_buffers:
                f.write(b)
        print(f"[DONE] Copied to: {dest}", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
