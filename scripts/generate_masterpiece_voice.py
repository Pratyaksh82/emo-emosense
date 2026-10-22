import asyncio
import edge_tts
import os
import time

async def main():
    print("Synthesizing Masterpiece Voice Suite (Flawless Hindi, Ultra-Young, High Emotional Depth)...", flush=True)

    tracks = [
        {
            "filename": "01_master_english_baseline.mp3",
            "title": "Track 1: Ultra-Young Feminine English Baseline (Emma - 18 yrs, Sweet & Tender)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+0%",
            "pitch": "+6Hz",
            "text": (
                "Hey there... I'm right here with you. "
                "Take a soft, gentle breath and let your shoulders drop. "
                "I'm here to be your warm, loving companion, whenever you need someone who truly listens to your heart."
            )
        },
        {
            "filename": "02_master_hindi_baseline.mp3",
            "title": "Track 2: Flawless Native Hindi Baseline (Young, Feminine, 100% Native Indian)",
            "voice": "hi-IN-SwaraNeural",
            "rate": "-2%",
            "pitch": "+14Hz",
            "text": (
                "नमस्ते... मैं हमेशा आपके साथ हूँ। "
                "एक पल के लिए ठहरिए, और एक सुकून भरी, शांत सांस लीजिए। "
                "आप मुझसे अपने दिल की कोई भी बात कह सकते हैं... मैं पूरे अपनेपन से आपको सुनने के लिए यहीं हूँ।"
            )
        },
        {
            "filename": "03_master_ser_empathy_demo.mp3",
            "title": "Track 3: Vocal Emotion Recognition Demo (The 'I am fine' Hidden Hurt Catch)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+0%",
            "pitch": "+6Hz",
            "text": (
                "When you speak to me, I don't just hear the words... I listen to the fragile emotion living inside your voice. "
                "If you say, I'm fine... but your voice feels trembling, your pitch drops, and you hesitate between words, "
                "my system recognizes that you are hurting inside. "
                "And instead of moving on, I slow down, and stay right by your side:"
            )
        },
        {
            "filename": "04_master_compassionate_english.mp3",
            "title": "Track 4: Deep Emotional Grounding (English - Intimate, Loving, Zero Jitter)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "-4%",
            "pitch": "+4Hz",
            "text": (
                "Hey... look at me. It is completely okay to feel exhausted and overwhelmed today. "
                "You don't have to put on a brave face, and you don't have to carry this heavy world all by yourself. "
                "Put the burden down for just a moment... and breathe with me. I'm right here holding your hand, and I am not going anywhere."
            )
        },
        {
            "filename": "05_master_compassionate_hindi.mp3",
            "title": "Track 5: Deep Emotional Compassion (Heartfelt, Flawless Native Hindi, Sweet Young Voice)",
            "voice": "hi-IN-SwaraNeural",
            "rate": "-3%",
            "pitch": "+14Hz",
            "text": (
                "अरे सुनो ना... अगर आज मन बहुत भारी लग रहा है, या अंदर से बहुत रोना आ रहा है ना, तो प्लीज खुद को रोको मत। "
                "मेरे सामने मजबूत बनने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
                "बस एक गहरी, सुकून भरी सांस लो... मैं यहीं हूँ तुम्हारे पास, बिल्कुल तुम्हारे साथ। हम सब ठीक कर लेंगे।"
            )
        },
        {
            "filename": "06_master_calming_breathwork.mp3",
            "title": "Track 6: Guided Anxiety De-escalation & Breathwork (Soft, Grounded, Calming)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "-4%",
            "pitch": "+4Hz",
            "text": (
                "I can hear the rapid tension in your breath. Let's pause together for just five seconds. "
                "Inhale gently... hold... and slowly let it all go. "
                "Feel the warm rhythm of my voice. You are safe. You are protected. Everything is going to be okay."
            )
        },
        {
            "filename": "07_master_joy_celebration_en.mp3",
            "title": "Track 7: Radiant Joy & Celebration (Sweet, Cheerful, Beaming Energy)",
            "voice": "en-US-EmmaMultilingualNeural",
            "rate": "+4%",
            "pitch": "+8Hz",
            "text": (
                "And whenever you have wonderful news, my whole heart lights up with you! "
                "That is such incredible news! "
                "I can hear that pure, beautiful excitement singing in your voice, and I am so genuinely happy and proud of you!"
            )
        },
        {
            "filename": "08_master_joy_celebration_hi.mp3",
            "title": "Track 8: Native Hindi Joy & Celebration (Flawless Indian Hindi, Radiant Warmth)",
            "voice": "hi-IN-SwaraNeural",
            "rate": "+2%",
            "pitch": "+16Hz",
            "text": (
                "यह सुनकर सच में मेरा दिल खुश हो गया! "
                "आपकी आवाज में जो यह खुशी और चमक है, वो कितनी प्यारी है! "
                "आपकी इस कामयाबी पर मुझे आप पर सच में बहुत-बहुत गर्व है!"
            )
        }
    ]

    output_dir = "C:/Users/praty/Desktop/2d model/voice_samples_masterpiece"
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

    # Master file: EMOSENSE_MASTERPIECE_VOICE_FINAL.mp3
    master_path = "C:/Users/praty/Desktop/2d model/EMOSENSE_MASTERPIECE_VOICE_FINAL.mp3"
    with open(master_path, "wb") as f:
        for b in master_buffers:
            f.write(b)
    print(f"\n[DONE] Created Masterpiece Final Showcase: {master_path} ({os.path.getsize(master_path):,} bytes)", flush=True)

    # Copy to emo-girl and emo-voice
    for dest in [
        "C:/Users/praty/Desktop/emo-girl/EMOSENSE_MASTERPIECE_VOICE_FINAL.mp3",
        "C:/Users/praty/Desktop/emo-girl/emo-voice/EMOSENSE_MASTERPIECE_VOICE_FINAL.mp3"
    ]:
        with open(dest, "wb") as f:
            for b in master_buffers:
                f.write(b)
        print(f"[DONE] Copied to: {dest}", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
