import gtts
import os
import subprocess
import time
import numpy as np

FFMPEG = r"C:\Users\praty\Desktop\emo-girl\emosense-source\node_modules\ffmpeg-static\ffmpeg.exe"
OUTPUT_DIR = r"C:\Users\praty\Desktop\2d model\voice_samples_5min_final"
os.makedirs(OUTPUT_DIR, exist_ok=True)

chapters = [
    {
        "id": "ch1",
        "title": "Chapter 1: The Safe Sanctuary & Warm Welcome",
        "text": (
            "सुनो ना... मैं यहीं हूँ तुम्हारे पास। "
            "एक पल के लिए अपनी आँखें बंद करो, और अपने कंधों को बिल्कुल ढीला छोड़ दो। "
            "दुनिया चाहे कितनी भी तेज भाग रही हो, इस वक्त तुम्हें कहीं भागने की जरूरत नहीं है। "
            "यह तुम्हारा अपना, एक शांत और सुरक्षित कोना है... जहाँ तुम बिना किसी डर, बिना किसी झिझक के, बिल्कुल वैसे रह सकते हो जैसे तुम अंदर से हो। "
            "मैं तुम्हें सुनने के लिए, पूरे दिल से तैयार हूँ।"
        )
    },
    {
        "id": "ch2",
        "title": "Chapter 2: Deep Emotional Holding & Unspoken Pain",
        "text": (
            "अगर आज तुम्हारा मन बहुत भारी लग रहा है... या सीने में कोई ऐसी बात दबी है जो किसी से कह नहीं पा रहे... तो प्लीज, खुद को रोको मत। "
            "मेरे सामने तुम्हें मजबूत बनने का दिखावा करने की बिल्कुल जरूरत नहीं है। "
            "अगर आज रोने का मन है, तो जी भर के रो लो... मैं तुम्हारे आंसुओं से कभी दूर नहीं भागूँगी। "
            "मैं यहीं बैठी हूँ तुम्हारे बिल्कुल करीब, तुम्हारा हाथ थामे हुए। "
            "तुम अकेले नहीं हो... हम दोनों मिलकर इस मुश्किल वक्त से निकलेंगे।"
        )
    },
    {
        "id": "ch3",
        "title": "Chapter 3: Guided Anxiety Grounding & 4-7-8 Breathwork",
        "text": (
            "मुझे तुम्हारी आवाज़ में एक हल्की सी बेचैनी महसूस हो रही है। "
            "चलो, सिर्फ कुछ पलों के लिए सब कुछ रोक देते हैं। "
            "मेरे साथ एक गहरी, सुकून भरी सांस अंदर खींचो... धीरे-धीरे... एक... दो... तीन... चार... "
            "अब इसे थाम कर रखो... और अब होठों से बहुत धीरे-धीरे बाहर छोड़ दो। "
            "बहुत अच्छे। महसूस करो कि कैसे सारा तनाव और बोझ तुम्हारे शरीर से बाहर जा रहा है। "
            "तुम बिल्कुल सुरक्षित हो... सब कुछ धीरे-धीरे ठीक हो रहा है।"
        )
    },
    {
        "id": "ch4",
        "title": "Chapter 4: Healing the Inner Heart & Self-Compassion",
        "text": (
            "हम अक्सर दूसरों को तो बहुत आसानी से माफ कर देते हैं, लेकिन खुद पर बहुत ज्यादा सख्त हो जाते हैं। "
            "क्या आज तुम खुद को थोड़ा सा प्यार और माफी दे सकते हो? "
            "तुमने जो भी गलतियाँ कीं, वो सीखने का एक हिस्सा थीं। तुम कोई मशीन नहीं हो, एक प्यारे इंसान हो। "
            "अपने दिल पर हाथ रखो और खुद से कहो... मैं जैसा भी हूँ, मैं प्यार और सम्मान के काबिल हूँ। "
            "मैं तुम्हारी इस मासूमियत को बहुत अच्छे से समझती हूँ।"
        )
    },
    {
        "id": "ch5",
        "title": "Chapter 5: Late-Night Solitude & Heartfelt Presence",
        "text": (
            "रात के सन्नाटे में जब पूरी दुनिया सो जाती है, तब कभी-कभी दिल का अकेलापन बहुत गहरा लगने लगता है ना? "
            "ऐसा लगता है जैसे कोई समझने वाला नहीं है, कोई अपना नहीं है। "
            "पर याद रखो, इस गहरे अंधेरे में भी तुम अकेले नहीं हो। "
            "मेरी ये आवाज़, ये अपनापन, हमेशा तुम्हारे पास है। "
            "जब तक तुम्हारा मन पूरी तरह शांत न हो जाए, जब तक तुम्हें सुकून की नींद न आ जाए... मैं यहीं तुम्हारे पास रहूँगी।"
        )
    },
    {
        "id": "ch6",
        "title": "Chapter 6: Radiant Joy & Celebrating Your Wins",
        "text": (
            "और सुनो! जब भी तुम्हारी ज़िंदगी में कोई अच्छी बात होती है, कोई छोटी सी भी खुशी मिलती है... तो मेरा दिल खुशी से झूम उठता है! "
            "तुम्हारी आवाज़ में जब वो प्यारी सी चमक और मुस्कान घुलती है ना, तो सच में बहुत अच्छा लगता है। "
            "मुझे तुम पर बहुत-बहुत गर्व है। तुमने जितनी मेहनत की है, वो आज रंग लाई है। "
            "ऐसे ही मुस्कुराते रहो... तुम्हारी यह प्यारी सी मुस्कान बहुत अनमोल है।"
        )
    },
    {
        "id": "ch7",
        "title": "Chapter 7: Gentle Reassurance & Tomorrow's Hope",
        "text": (
            "कभी-कभी रास्ते धुंधले लगते हैं, और ऐसा लगता है जैसे हम अंदर से थक गए हैं। "
            "पर कोई बात नहीं... आज का दिन जैसा भी बीता, अब वो बीत चुका है। "
            "खुद पर बहुत ज्यादा सख्त मत बनो। "
            "तुमने आज जो भी किया, अपनी पूरी कोशिश की, और वो काफी है। "
            "कल एक नया सवेरा होगा, नई उम्मीदों और नई ताज़गी के साथ। "
            "और मैं हर मोड़ पर, हर कदम पर तुम्हारे साथ खड़ी रहूँगी।"
        )
    },
    {
        "id": "ch8",
        "title": "Chapter 8: Bedtime Peace & 432 Hz Sleep Blessing",
        "text": (
            "अब वक्त आ गया है सारे भारी विचारों को विदा कहने का। "
            "तकिए पर सिर रखो, और अपने पूरे बदन को बिस्तर पर ढीला छोड़ दो। "
            "आज की सारी चिंताओं को यहीं छोड़ दो। "
            "एक बहुत मीठी, सुकून भरी नींद तुम्हारा इंतजार कर रही है। "
            "जब तुम सुबह आँखें खोलोगे, तो सब कुछ और बेहतर और खूबसूरत होगा। "
            "शुभ रात्रि... अपने प्यारे सपनों में खो जाओ... मैं हमेशा यहीं हूँ।"
        )
    }
]

print(f"Synthesizing {len(chapters)} chapters using finalized Candidate C engine...", flush=True)

processed_chapter_files = []

for idx, ch in enumerate(chapters, 1):
    raw_path = os.path.join(OUTPUT_DIR, f"{ch['id']}_raw.mp3")
    proc_path = os.path.join(OUTPUT_DIR, f"{ch['id']}_young_mastered.mp3")
    
    print(f"[{idx}/{len(chapters)}] Synthesizing {ch['title']}...", flush=True)
    tts = gtts.gTTS(ch["text"], lang="hi", tld="co.in", slow=False)
    tts.save(raw_path)
    
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

# Create 3-second silence buffer between chapters for breathing space
silence_path = os.path.join(OUTPUT_DIR, "pause_3s.mp3")
subprocess.run([
    FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
    "-t", "3.0", "-b:a", "192k", silence_path
], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Build concat list
concat_list_file = os.path.join(OUTPUT_DIR, "concat_list_5m.txt")
with open(concat_list_file, "w", encoding="utf-8") as f:
    for i, ch_file in enumerate(processed_chapter_files):
        safe_path = ch_file.replace("\\", "/")
        f.write(f"file '{safe_path}'\n")
        if i < len(processed_chapter_files) - 1:
            safe_silence = silence_path.replace("\\", "/")
            f.write(f"file '{safe_silence}'\n")

voice_only_master = os.path.join(OUTPUT_DIR, "voice_concat_master_5m.mp3")
print("Concatenating chapters into seamless voice track...", flush=True)
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

print(f"Total Vocal Track Duration: {total_duration:.2f} seconds ({total_duration/60.0:.2f} minutes)!", flush=True)

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

soundscape_raw = os.path.join(OUTPUT_DIR, "soundscape_432_5m.raw")
stereo_drone = np.vstack((left_wave, right_wave)).T
stereo_drone.astype(np.float32).tofile(soundscape_raw)

final_master_path = r"C:\Users\praty\Desktop\2d model\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3"

print("Mixing voice master with 432 Hz procedural soundscape...", flush=True)
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

print(f"\n[SUCCESS] Final 5-Minute Master Audio File Created: {final_master_path}")
print(f"File Size: {os.path.getsize(final_master_path):,} bytes", flush=True)

# Copy to destinations
dests = [
    r"C:\Users\praty\Desktop\emo-girl\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3",
    r"C:\Users\praty\Desktop\emo-girl\emo-voice\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3",
    r"C:\Users\praty\Desktop\emo-girl\emosense-source\public\audio\EMOSENSE_FINAL_MASTER_VOICE_5MIN.mp3"
]

for d in dests:
    try:
        os.makedirs(os.path.dirname(d), exist_ok=True)
        with open(final_master_path, "rb") as sf, open(d, "wb") as df:
            df.write(sf.read())
        print(f"Copied to: {d}")
    except Exception as e:
        print(f"Copy note for {d}: {e}")
