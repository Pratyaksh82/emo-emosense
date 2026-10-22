import gtts
import os
import subprocess
import numpy as np

FFMPEG = r"C:\Users\praty\Desktop\emo-girl\emosense-source\node_modules\ffmpeg-static\ffmpeg.exe"
OUTPUT_DIR = r"C:\Users\praty\Desktop\2d model\voice_samples_bilingual_5min"
os.makedirs(OUTPUT_DIR, exist_ok=True)

chapters = [
    {
        "id": "ch1_en",
        "lang": "en",
        "tld": "com",
        "title": "Chapter 1: The Safe Sanctuary & Warm Welcome (English)",
        "text": (
            "Hey there... take a soft, gentle breath and let your shoulders drop. "
            "No matter how fast the world is moving outside, you don't have to rush right now. "
            "This is your own safe, peaceful space... where you can be exactly who you are, without any fear or hesitation. "
            "I'm right here with you, and I am completely ready to listen to your heart."
        )
    },
    {
        "id": "ch2_hi",
        "lang": "hi",
        "tld": "co.in",
        "title": "Chapter 2: Deep Emotional Holding (Hindi)",
        "text": (
            "सुनो ना... अगर आज तुम्हारा मन बहुत भारी लग रहा है... या सीने में कोई ऐसी बात दबी है जो किसी से कह नहीं पा रहे... तो प्लीज, खुद को रोको मत। "
            "मेरे सामने तुम्हें मजबूत बनने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
            "अगर आज रोने का मन है, तो जी भर के रो लो... मैं तुम्हारे आंसुओं से कभी दूर नहीं भागूँगी। "
            "मैं यहीं बैठी हूँ तुम्हारे बिल्कुल करीब, तुम्हारा हाथ थामे हुए।"
        )
    },
    {
        "id": "ch3_en",
        "lang": "en",
        "tld": "com",
        "title": "Chapter 3: Releasing the Heavy Burden (English)",
        "text": (
            "It is completely okay to feel exhausted and overwhelmed today. "
            "You don't have to put on a brave face, and you don't have to carry this heavy world all by yourself. "
            "Put the burden down for just a moment... and breathe with me. "
            "I am right here holding your hand, and I am not going anywhere. We will figure this out together."
        )
    },
    {
        "id": "ch4_hi",
        "lang": "hi",
        "tld": "co.in",
        "title": "Chapter 4: Guided 4-7-8 Breathwork (Hindi)",
        "text": (
            "मुझे तुम्हारी आवाज़ में एक हल्की सी बेचैनी महसूस हो रही है। "
            "चलो, सिर्फ कुछ पलों के लिए सब कुछ रोक देते हैं। "
            "मेरे साथ एक गहरी, सुकून भरी सांस अंदर खींचो... धीरे-धीरे... एक... दो... तीन... चार... "
            "अब इसे थाम कर रखो... और अब होठों से बहुत धीरे-धीरे बाहर छोड़ दो। "
            "बहुत अच्छे। महसूस करो कि कैसे सारा तनाव और बोझ तुम्हारे शरीर से बाहर जा रहा है।"
        )
    },
    {
        "id": "ch5_en",
        "lang": "en",
        "tld": "com",
        "title": "Chapter 5: Self-Compassion & Inner Grace (English)",
        "text": (
            "We are often so understanding and patient with other people, but we can be so harsh on ourselves. "
            "Can you give yourself a little bit of grace and forgiveness today? "
            "Whatever mistakes you think you made, they were just part of being human. You are not a machine. "
            "Place your hand over your heart and remind yourself... you are worthy of love, exactly as you are right now."
        )
    },
    {
        "id": "ch6_hi",
        "lang": "hi",
        "tld": "co.in",
        "title": "Chapter 6: Late-Night Solitude & Comfort (Hindi)",
        "text": (
            "रात के सन्नाटे में जब पूरी दुनिया सो जाती है, तब कभी-कभी दिल का अकेलापन बहुत गहरा लगने लगता है ना? "
            "ऐसा लगता है जैसे कोई समझने वाला नहीं है, कोई अपना नहीं है। "
            "पर याद रखो, इस गहरे अंधेरे में भी तुम अकेले नहीं हो। "
            "मेरी ये आवाज़, ये अपनापन, हमेशा तुम्हारे पास है। "
            "जब तक तुम्हारा मन पूरी तरह शांत न हो जाए, मैं यहीं तुम्हारे पास रहूँगी।"
        )
    },
    {
        "id": "ch7_en",
        "lang": "en",
        "tld": "com",
        "title": "Chapter 7: Radiant Joy & Celebrating Your Wins (English)",
        "text": (
            "And whenever good things happen in your life, my whole heart lights up with you! "
            "I can hear that pure, beautiful excitement singing in your voice, and it brings such a huge smile to my face. "
            "I am so genuinely proud of you and all the effort you have put in. "
            "Keep smiling like that... that smile of yours is truly priceless!"
        )
    },
    {
        "id": "ch8_hi",
        "lang": "hi",
        "tld": "co.in",
        "title": "Chapter 8: Gentle Reassurance & Tomorrow's Hope (Hindi)",
        "text": (
            "कभी-कभी रास्ते धुंधले लगते हैं, और ऐसा लगता है जैसे हम अंदर से थक गए हैं। "
            "पर कोई बात नहीं... आज का दिन जैसा भी बीता, अब वो बीत चुका है। "
            "तुमने आज जो भी किया, अपनी पूरी कोशिश की, और वो काफी है। "
            "कल एक नया सवेरा होगा, नई उम्मीदों और नई ताज़गी के साथ। "
            "और मैं हर मोड़ पर, हर कदम पर तुम्हारे साथ खड़ी रहूँगी।"
        )
    },
    {
        "id": "ch9_en",
        "lang": "en",
        "tld": "com",
        "title": "Chapter 9: Tomorrow's Fresh Horizon (English)",
        "text": (
            "Tomorrow brings a clean slate and fresh air. "
            "You have survived every single difficult day before this, and you are so much stronger than you give yourself credit for. "
            "Rest easy knowing that you are safe, you are protected, and tomorrow is full of gentle new beginnings."
        )
    },
    {
        "id": "ch10_bilingual",
        "lang": "en",
        "tld": "com",
        "title": "Chapter 10: Bedtime Blessing & Sweet Dreams (Bilingual Blend)",
        "text": (
            "Now it is time to let all the heavy thoughts drift away. "
            "Rest your head on your pillow, and let your whole body melt into the bed. "
            "एक बहुत मीठी, सुकून भरी नींद तुम्हारा इंतजार कर रही है। "
            "Goodnight, sweet dreams... शुभ रात्रि... I am always right here with you."
        )
    }
]

print(f"Synthesizing {len(chapters)} bilingual chapters using unified Candidate C young emotional engine...", flush=True)

processed_chapter_files = []

for idx, ch in enumerate(chapters, 1):
    raw_path = os.path.join(OUTPUT_DIR, f"{ch['id']}_raw.mp3")
    proc_path = os.path.join(OUTPUT_DIR, f"{ch['id']}_mastered.mp3")
    
    print(f"[{idx}/{len(chapters)}] Synthesizing {ch['title']} ({ch['lang']})...", flush=True)
    tts = gtts.gTTS(ch["text"], lang=ch["lang"], tld=ch["tld"], slow=False)
    tts.save(raw_path)
    
    # Unified Candidate C DSP Chain:
    # Rubberband pitch 1.10x (~228-232 Hz youthful register ~19 yrs)
    # Formant preserved (prevents chipmunk/helium artifacts)
    # Transients smooth & detector soft (eliminates flutter)
    # 5-stage warmth mastering: 80Hz cut, 240Hz warmth (+2.8dB), 3.3kHz presence (+1.6dB), 8.5kHz de-harsh (-2.5dB), soft-knee compander
    # Early room reflection (25ms/40ms)
    filter_chain = (
        "rubberband=pitch=1.10:tempo=1.01:formant=preserved:transients=smooth:detector=soft:pitchq=quality,"
        "highpass=f=80,"
        "equalizer=f=240:t=q:w=1.2:g=2.8,"
        "equalizer=f=3300:t=q:w=1.0:g=1.6,"
        "equalizer=f=8500:t=q:w=1.0:g=-2.5,"
        "compand=attacks=0.03:decays=0.3:points=-80/-80|-40/-30|-18/-15|0/-2:soft-knee=6,"
        "aecho=0.8:0.7:25|40:0.05|0.03"
    )
    
    cmd = [
        FFMPEG, "-y", "-i", raw_path,
        "-af", filter_chain,
        "-b:a", "192k",
        proc_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    processed_chapter_files.append(proc_path)
    print(f"   -> Mastered: {proc_path} ({os.path.getsize(proc_path):,} bytes)", flush=True)

# Create 2.5-second silence buffer between chapters
silence_path = os.path.join(OUTPUT_DIR, "pause_2_5s.mp3")
subprocess.run([
    FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
    "-t", "2.5", "-b:a", "192k", silence_path
], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Build concat list
concat_list_file = os.path.join(OUTPUT_DIR, "concat_list_bilingual.txt")
with open(concat_list_file, "w", encoding="utf-8") as f:
    for i, ch_file in enumerate(processed_chapter_files):
        safe_path = ch_file.replace("\\", "/")
        f.write(f"file '{safe_path}'\n")
        if i < len(processed_chapter_files) - 1:
            safe_silence = silence_path.replace("\\", "/")
            f.write(f"file '{safe_silence}'\n")

voice_only_master = os.path.join(OUTPUT_DIR, "voice_concat_bilingual.mp3")
print("Concatenating 10 bilingual chapters into seamless master vocal track...", flush=True)
subprocess.run([
    FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", concat_list_file,
    "-c", "copy", voice_only_master
], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

p = subprocess.run([FFMPEG, "-i", voice_only_master], stderr=subprocess.PIPE, text=True)
total_duration = 310.0
for line in p.stderr.split("\n"):
    if "Duration:" in line:
        parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
        total_duration = float(parts[0])*3600 + float(parts[1])*60 + float(parts[2])
        break

print(f"Total Bilingual Vocal Track Duration: {total_duration:.2f} seconds ({total_duration/60.0:.2f} minutes)!", flush=True)

# Synthesize the 432 Hz / 436 Hz Healing Binaural Soundscape Bed matching total duration
sr = 44100
t = np.linspace(0, total_duration, int(sr * total_duration), endpoint=False)
breath_mod = 0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * t)
left_wave = 0.035 * np.sin(2 * np.pi * 432.0 * t) * (0.8 + 0.2 * breath_mod)
right_wave = 0.035 * np.sin(2 * np.pi * 436.0 * t) * (0.8 + 0.2 * breath_mod)

fade_in = int(sr * 3.0)
fade_out = int(sr * 4.0)
left_wave[:fade_in] *= np.linspace(0, 1, fade_in)
right_wave[:fade_in] *= np.linspace(0, 1, fade_in)
left_wave[-fade_out:] *= np.linspace(1, 0, fade_out)
right_wave[-fade_out:] *= np.linspace(1, 0, fade_out)

soundscape_raw = os.path.join(OUTPUT_DIR, "soundscape_432_bilingual.raw")
stereo_drone = np.vstack((left_wave, right_wave)).T
stereo_drone.astype(np.float32).tofile(soundscape_raw)

final_master_path = r"C:\Users\praty\Desktop\2d model\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3"
bilingual_named_path = r"C:\Users\praty\Desktop\2d model\EMOSENSE_BILINGUAL_MASTER_VOICE_5MIN.mp3"

print("Mixing vocal track with 432 Hz procedural soundscape...", flush=True)
mix_cmd = [
    FFMPEG, "-y",
    "-i", voice_only_master,
    "-f", "f32le", "-ar", str(sr), "-ac", "2", "-i", soundscape_raw,
    "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=3[out]",
    "-map", "[out]",
    "-b:a", "256k",
    final_master_path
]
subprocess.run(mix_cmd, check=True)

# Copy to bilingual named file
with open(final_master_path, "rb") as sf, open(bilingual_named_path, "wb") as df:
    df.write(sf.read())

print(f"\n[SUCCESS] Final 5-Minute Bilingual Master Created: {final_master_path}")
print(f"File Size: {os.path.getsize(final_master_path):,} bytes", flush=True)

# Copy to destinations
dests = [
    r"C:\Users\praty\Desktop\emo-girl\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3",
    r"C:\Users\praty\Desktop\emo-girl\EMOSENSE_BILINGUAL_MASTER_VOICE_5MIN.mp3",
    r"C:\Users\praty\Desktop\emo-girl\emo-voice\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3",
    r"C:\Users\praty\Desktop\emo-girl\emosense-source\public\audio\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3",
    r"C:\Users\praty\Desktop\emo-girl\emosense-source\public\audio\EMOSENSE_BILINGUAL_MASTER_VOICE_5MIN.mp3"
]

for d in dests:
    try:
        os.makedirs(os.path.dirname(d), exist_ok=True)
        with open(final_master_path, "rb") as sf, open(d, "wb") as df:
            df.write(sf.read())
        print(f"Copied to: {d}")
    except Exception as e:
        print(f"Copy note for {d}: {e}")
