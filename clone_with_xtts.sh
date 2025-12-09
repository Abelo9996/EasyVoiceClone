#!/bin/bash
# WORKING Voice Cloning with XTTS-v2
# This actually clones your voice (unlike VITS which cannot)

set -e

echo "=========================================="
echo "Voice Cloning with XTTS-v2"
echo "=========================================="
echo ""

# Activate virtual environment
source venv/bin/activate

# Parse arguments
REFERENCE=${1:-"data/example_audio/test.wav"}
TEXT=${2:-"Hello! This is a test of real voice cloning with XTTS."}
OUTPUT=${3:-"output/cloned_voice.wav"}

# Validate reference audio exists
if [ ! -f "$REFERENCE" ]; then
    echo "❌ Error: Reference audio not found: $REFERENCE"
    echo ""
    echo "Usage: $0 <reference_audio> <text> [output_file]"
    echo "Example: $0 data/example_audio/test.wav \"Hello world\" output/my_clone.wav"
    exit 1
fi

echo "🎙️  Voice Cloning Configuration:"
echo "  Reference Audio: $REFERENCE"
echo "  Text to Synthesize: $TEXT"
echo "  Output File: $OUTPUT"
echo ""
echo "📥 Loading XTTS-v2 model..."
echo "  (Downloads ~1.9GB on first run - this is normal)"
echo ""

# Run voice cloning with XTTS-v2
python3 <<EOF
from TTS.api import TTS
import os
import sys

try:
    # Create output directory
    os.makedirs(os.path.dirname('$OUTPUT') if os.path.dirname('$OUTPUT') else '.', exist_ok=True)
    
    # Load XTTS-v2 - best model for voice cloning
    # Note: Requires accepting CPML license on first run
    tts = TTS('tts_models/multilingual/multi-dataset/xtts_v2', progress_bar=True, gpu=False)
    
    print()
    print('✓ Model loaded successfully')
    print('🎤 Analyzing reference voice and synthesizing...')
    print()
    
    # Clone the voice and synthesize text
    tts.tts_to_file(
        text='$TEXT',
        speaker_wav='$REFERENCE',
        language='en',
        file_path='$OUTPUT'
    )
    
    print('✅ Voice cloning complete!')
    
except Exception as e:
    print(f'❌ Error during voice cloning: {e}', file=sys.stderr)
    sys.exit(1)
EOF

if [ $? -eq 0 ] && [ -f "$OUTPUT" ]; then
    echo ""
    echo "=========================================="
    echo "✅ Success!"
    echo "=========================================="
    echo ""
    SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
    echo "📄 Generated File: $OUTPUT"
    echo "📊 Size: $SIZE"
    echo ""
    echo "🔊 To play the audio:"
    echo "  afplay $OUTPUT"
    echo ""
    echo "💡 This uses XTTS-v2 which ACTUALLY clones your voice"
    echo "   (Unlike VITS/LJSpeech which only have one default voice)"
else
    echo ""
    echo "❌ Voice cloning failed"
    exit 1
fi
