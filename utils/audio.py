"""
audio.py
Audio preprocessing and I/O utilities for Easy Voice Cloner.
"""
import os
import librosa
import soundfile as sf

def preprocess_audio(audio_dir, target_sr=16000):
    """Normalize and resample all audio files in a directory to target_sr."""
    audio_files = []
    for fname in os.listdir(audio_dir):
        if fname.lower().endswith(('.wav', '.mp3')):
            path = os.path.join(audio_dir, fname)
            y, sr = librosa.load(path, sr=None)
            y = librosa.util.normalize(y)
            if sr != target_sr:
                y = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
            out_path = os.path.join(audio_dir, f"norm_{fname.split('.')[0]}.wav")
            sf.write(out_path, y, target_sr)
            audio_files.append(out_path)
    return audio_files

def save_audio(audio_array, out_path, sr=16000):
    """Save a numpy array as a WAV file."""
    sf.write(out_path, audio_array, sr)
