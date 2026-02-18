"""
audio_predictor.py
──────────────────
Audio deepfake detection using mo-thecreator/Deepfake-audio-detection.
Includes pydub for MP3 conversion and forensic calibration for noisy audio.
"""

import io
import time
import requests
import torch
import numpy as np

# ── Optional heavy imports ──────────────────────────────────────────────────
try:
    import torchaudio
    TORCHAUDIO_OK = True
except ImportError:
    TORCHAUDIO_OK = False

try:
    from transformers import pipeline as hf_pipeline
    TRANSFORMERS_OK = True
except ImportError:
    TRANSFORMERS_OK = False

try:
    import soundfile as sf
    SOUNDFILE_OK = True
except ImportError:
    SOUNDFILE_OK = False

# ── Constants ───────────────────────────────────────────────────────────────
MODEL_ID  = "mo-thecreator/Deepfake-audio-detection"
TARGET_SR = 16_000   # wav2vec2 expects 16 kHz mono
MAX_SECS  = 10       # truncate long clips
DEVICE    = 0 if torch.cuda.is_available() else -1

# ── Singleton state ─────────────────────────────────────────────────────────
_audio_state = {
    "pipe":  None,
    "ready": False,
}


# ── Model loader ────────────────────────────────────────────────────────────
def load_audio_model() -> bool:
    if _audio_state["ready"]:
        return True

    if not TRANSFORMERS_OK or not TORCHAUDIO_OK:
        print("⚠️  [Audio] Missing dependencies: transformers or torchaudio")
        return False

    try:
        print(f"🔊 Loading audio deepfake model: {MODEL_ID} …")
        pipe = hf_pipeline(
            task="audio-classification",
            model=MODEL_ID,
            device=DEVICE,
        )
        _audio_state["pipe"]  = pipe
        _audio_state["ready"] = True
        print("✅ Audio deepfake model loaded.")
        return True

    except Exception as exc:
        print(f"❌ Failed to load audio model: {exc}")
        return False


# ── Audio download + decode ─────────────────────────────────────────────────
def _download_and_prepare(url: str):
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    raw_bytes = resp.content

    # MP3 → WAV via pydub (avoids torchcodec issues)
    is_mp3 = (url.lower().endswith(".mp3") or 
              raw_bytes[:3] == b'ID3' or 
              raw_bytes[:2] == b'\xff\xfb')

    if is_mp3:
        try:
            from pydub import AudioSegment
            audio_seg = AudioSegment.from_mp3(io.BytesIO(raw_bytes))
            wav_buf = io.BytesIO()
            audio_seg.export(wav_buf, format="wav")
            wav_buf.seek(0)
            buf = wav_buf
        except Exception:
            buf = io.BytesIO(raw_bytes)
    else:
        buf = io.BytesIO(raw_bytes)

    # Load audio - try soundfile first, then torchaudio
    waveform = None
    sr = None

    if SOUNDFILE_OK:
        try:
            buf.seek(0)
            data, sr = sf.read(buf, dtype="float32", always_2d=True)
            waveform = torch.from_numpy(data.T)
        except Exception:
            pass

    if waveform is None:
        try:
            buf.seek(0)
            waveform, sr = torchaudio.load(buf)
        except Exception as e:
            raise RuntimeError(f"Cannot load audio: {e}")

    # Convert to mono & resample
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    if sr != TARGET_SR:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=TARGET_SR)
        waveform  = resampler(waveform)

    # Truncate
    max_samples = TARGET_SR * MAX_SECS
    waveform = waveform[:, :max_samples]

    # NOTE: No amplitude normalization - preserves dynamic range features
    return waveform.squeeze(0).numpy()


# ── Main inference function ─────────────────────────────────────────────────
def predict_audio(file_url: str) -> dict:
    t0 = time.time()

    if not _audio_state["ready"]:
        if not load_audio_model():
            raise RuntimeError("Audio model not available.")

    waveform_np = _download_and_prepare(file_url)

    # Run inference
    pipe = _audio_state["pipe"]
    raw_results = pipe(
        {"array": waveform_np, "sampling_rate": TARGET_SR},
        top_k=2,
    )

    # Parse scores (id 0=fake, id 1=real)
    model_fake = 0.0
    model_real = 0.0
    for r in raw_results:
        lbl = r["label"].lower().strip()
        if lbl in ("fake", "spoof", "label_0", "ai", "synthetic"):
            model_fake = r["score"]
        elif lbl in ("real", "bonafide", "label_1", "human"):
            model_real = r["score"]
    
    if model_fake == 0 and model_real > 0: model_fake = 1.0 - model_real
    if model_real == 0 and model_fake > 0: model_real = 1.0 - model_fake

    # ── Forensic Calibration ───────────────────────────────────────────────
    # Dampen fake score if significant noise is detected (common in real audio)
    noise_floor = float(waveform_np.std())
    calibration_factor = 1.0
    
    if noise_floor > 0.05:  
        # Very high noise -> moderate dampening
        calibration_factor = 0.4
    elif noise_floor > 0.02:
        # Moderate noise -> slight dampening
        calibration_factor = 0.8

    final_fake = model_fake * calibration_factor
    final_real = 1.0 - final_fake

    # Classification
    label      = "Fake" if final_fake >= 0.55 else "Real"
    confidence = final_fake if final_fake >= 0.5 else final_real
    elapsed_ms = int((time.time() - t0) * 1000)

    print(f"🎙️  Audio: {label} | RawFake={model_fake:.4f} Noise={noise_floor:.4f} -> FinalFake={final_fake:.4f}")

    return {
        "real_probability":   round(final_real, 4),
        "fake_probability":   round(final_fake, 4),
        "label":              label,
        "confidence":         round(confidence, 4),
        "processing_time_ms": elapsed_ms,
    }
