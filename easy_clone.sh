#!/bin/bash
# Easiest Voice Cloning Script - Just run it!

set -e

echo "=========================================="
echo "🎙️  Easy Voice Cloning"
echo "=========================================="
echo ""

# Activate venv
source venv/bin/activate

# Default to test.wav if it exists
if [ -f "data/example_audio/test.wav" ]; then
    AUDIO="data/example_audio/test.wav"
else
    echo "❌ Please provide reference audio file"
    echo "Usage: $0 [audio_file] [\"text to speak\"]"
    exit 1
fi

# Use provided audio if given
if [ -n "$1" ]; then
    AUDIO="$1"
fi

# Default text
TEXT="Hello! This is a voice cloning test."

# Use provided text if given
if [ -n "$2" ]; then
    TEXT="$2"
fi

# Output file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT="output/clone_${TIMESTAMP}.wav"

echo "🎤 Reference: $AUDIO"
echo "💬 Text: $TEXT"
echo "📁 Output: $OUTPUT"
echo ""
echo "⏳ Cloning voice (first run downloads ~1.9GB model)..."
echo ""

# Do the voice cloning
python3 <<EOF
from TTS.api import TTS
import os

os.makedirs('output', exist_ok=True)

# Load XTTS-v2
tts = TTS('tts_models/multilingual/multi-dataset/xtts_v2', progress_bar=True, gpu=False)

# Clone voice
tts.tts_to_file(
    text='$TEXT',
    speaker_wav='$AUDIO',
    language='en',
    file_path='$OUTPUT'
)
EOF

if [ -f "$OUTPUT" ]; then
    echo ""
    echo "✅ Done! Playing now..."
    SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
    echo "📄 $OUTPUT ($SIZE)"
    echo ""
    afplay "$OUTPUT"
else
    echo "❌ Failed to generate audio"
    exit 1
fi
