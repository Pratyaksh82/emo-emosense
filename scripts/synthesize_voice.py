import sys
import os
import hashlib
import asyncio
import re
import shutil

# Ensure edge_tts is importable
import edge_tts

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_CACHE_DIR = os.path.join(ROOT_DIR, "public", "audio_cache")
DIST_CACHE_DIR = os.path.join(ROOT_DIR, "dist", "audio_cache")
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)
os.makedirs(DIST_CACHE_DIR, exist_ok=True)

def is_devanagari(text: str) -> bool:
    return bool(re.search(r'[\u0900-\u097F]', text))

def is_hinglish_or_indian(text: str) -> bool:
    if is_devanagari(text):
        return True
    indian_keywords = r'\b(namaste|kya|hai|hain|kaise|kaisi|kaisa|aap|tum|mera|meri|mere|mujhe|hum|theek|nahi|shukriya|alvida|baat|dil|suno|kaho|man|pyar|accha|achha|bohot|bahut|dhanyawad|pranam|shanti|sukoon|dard|pareshan|madad|chinta|khayal|chetana|ji)\b'
    return bool(re.search(indian_keywords, text, re.IGNORECASE))

async def synthesize(text: str, voice_override: str = None) -> str:
    text = text.strip()
    if not text:
        return ""
    
    # Clean markdown / symbols
    clean = re.sub(r'[*_#`~]', '', text).strip()
    
    # Determine voice hierarchy with authentic Indian accent calibration
    if voice_override:
        candidate_voices = [voice_override]
    elif is_devanagari(clean):
        # Native Devanagari Hindi: Swara neural voice
        candidate_voices = ["hi-IN-SwaraNeural", "hi-IN-MadhurNeural", "en-IN-NeerjaExpressiveNeural"]
    elif is_hinglish_or_indian(clean):
        # Hinglish / Romanized Hindi: Indian neural voice for authentic native inflection
        candidate_voices = ["en-IN-NeerjaExpressiveNeural", "en-IN-NeerjaNeural", "hi-IN-SwaraNeural"]
    else:
        # Indian English Companion: Neerja Expressive (authentic Indian accent) with Emma fallback
        candidate_voices = ["en-IN-NeerjaExpressiveNeural", "en-IN-NeerjaNeural", "en-US-EmmaMultilingualNeural", "hi-IN-SwaraNeural"]
    
    # Check cache based on clean text hash
    key = hashlib.md5(f"chetana_voice:{clean}".encode("utf-8")).hexdigest()
    rel_url = f"/audio_cache/{key}.mp3"
    pub_path = os.path.join(AUDIO_CACHE_DIR, f"{key}.mp3")
    dist_path = os.path.join(DIST_CACHE_DIR, f"{key}.mp3")
    
    if os.path.exists(pub_path) and os.path.getsize(pub_path) > 100:
        if not os.path.exists(dist_path):
            try:
                shutil.copyfile(pub_path, dist_path)
            except Exception:
                pass
        return rel_url
    
    # Attempt generation through candidate voices
    last_err = None
    for voice in candidate_voices:
        try:
            comm = edge_tts.Communicate(clean, voice)
            await comm.save(pub_path)
            if os.path.exists(pub_path) and os.path.getsize(pub_path) > 200:
                try:
                    shutil.copyfile(pub_path, dist_path)
                except Exception:
                    pass
                return rel_url
        except Exception as e:
            last_err = e
            continue
            
    if last_err:
        raise last_err
    return ""

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python synthesize_voice.py <text> [voice]")
        sys.exit(1)
    
    input_text = sys.argv[1]
    v_override = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        result = asyncio.run(synthesize(input_text, v_override))
        print(result)
    except Exception as err:
        print(f"ERROR: {err}", file=sys.stderr)
        sys.exit(1)
