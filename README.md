# Easy Voice Cloner

Easy Voice Cloner is a minimal, open-source toolkit for few-shot voice cloning using Python and PyTorch. It enables users to fine-tune a pretrained TTS model (Coqui TTS or VITS) on a small set of audio samples and generate speech in the cloned voice.

## Features
- Few-shot speaker adaptation (30–90 seconds of audio)
- Optional automatic transcription using Whisper
- Fine-tuning of pretrained TTS backbones
- Simple inference: synthesize speech from text
- Outputs WAV or MP3 audio
- Modular, extensible codebase

## Installation
```bash
# Clone the repository
git clone https://github.com/Abelo9996/easy-voice-cloner.git
cd easy-voice-cloner

# Install dependencies
pip install -r requirements.txt
```

## Quickstart
### 1. Add Audio Samples
Place your speaker audio samples (WAV/MP3, 16 kHz recommended) in `data/example_audio/`.

### 2. (Optional) Transcribe Audio
Run automatic transcription:
```bash
python utils/transcription.py --audio_dir data/example_audio/ --output data/transcripts.txt
```

### 3. Train Voice Clone
```bash
python train.py --audio_dir data/example_audio/ --transcript data/transcripts.txt --output models/my_voice_clone.pt
```

### 4. Run Inference
```bash
python infer.py --text "Hello world" --voice models/my_voice_clone.pt --output output.wav
```

## Model Choices
- **Coqui TTS**: Flexible, open-source TTS backbone
- **VITS**: High-quality neural vocoder

## Use Cases
- Personalized TTS for accessibility
- Voice assistants
- Research in speech synthesis

## Ethical Guidelines
- **For ethical use only.** Do not use this tool for impersonation, fraud, or any malicious activity.
- Respect privacy and obtain consent before cloning any voice.

## TODO
- Prosody control
- Model-agnostic backends
- Web UI

---
Minimal emoji use: 🗣️🔊 (for clarity only)
