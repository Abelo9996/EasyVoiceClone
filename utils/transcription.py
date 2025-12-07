"""
transcription.py
Automatic transcription utilities using Whisper for Easy Voice Cloner.
"""
import os
import argparse
import whisper

def transcribe_audio(audio_files, model_name='base'):
    """Transcribe a list of audio files using Whisper."""
    model = whisper.load_model(model_name)
    transcripts = []
    for path in audio_files:
        result = model.transcribe(path)
        transcripts.append(result['text'])
    return transcripts

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transcribe audio files with Whisper.")
    parser.add_argument('--audio_dir', type=str, required=True, help='Directory with audio samples')
    parser.add_argument('--output', type=str, required=True, help='Output transcript file')
    args = parser.parse_args()
    files = [os.path.join(args.audio_dir, f) for f in os.listdir(args.audio_dir) if f.lower().endswith(('.wav', '.mp3'))]
    transcripts = transcribe_audio(files)
    with open(args.output, 'w') as f:
        for t in transcripts:
            f.write(t + '\n')
    print(f"Saved transcripts to {args.output}")
