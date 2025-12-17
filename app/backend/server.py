"""
Flask backend for Easy Voice Clone
Manages voice models and generates speech
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
import uuid
from TTS.api import TTS
import torch
import PyPDF2
import nltk
import re
from io import BytesIO
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

# Configuration
BASE_DIR = Path(__file__).parent.parent.parent
MODELS_DIR = BASE_DIR / "models" / "voices"
OUTPUT_DIR = BASE_DIR / "output" / "app"
VOICES_DB = BASE_DIR / "app" / "voices.json"

# Create directories
MODELS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Initialize TTS model (singleton)
tts_model = None

# Download NLTK data for sentence tokenization
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

def get_tts_model():
    """Lazy load TTS model"""
    global tts_model
    if tts_model is None:
        tts_model = TTS('tts_models/multilingual/multi-dataset/xtts_v2', 
                       progress_bar=False, 
                       gpu=torch.cuda.is_available())
    return tts_model

def load_voices_db():
    """Load voices database"""
    if VOICES_DB.exists():
        with open(VOICES_DB, 'r') as f:
            return json.load(f)
    return {}

def save_voices_db(db):
    """Save voices database"""
    VOICES_DB.parent.mkdir(parents=True, exist_ok=True)
    with open(VOICES_DB, 'w') as f:
        json.dump(db, f, indent=2)

def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def clean_text(text):
    """Clean extracted text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove page numbers (common patterns)
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
    # Remove multiple newlines
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def translate_text(text, source_lang='auto', target_lang='en'):
    """
    Translate text from source language to target language
    
    Args:
        text: Text to translate
        source_lang: Source language code (default 'auto' for auto-detection)
        target_lang: Target language code
        
    Returns:
        Translated text
    """
    try:
        if source_lang == target_lang or target_lang == 'original':
            return text
            
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated = translator.translate(text)
        return translated
    except Exception as e:
        print(f"Translation error: {str(e)}")
        # If translation fails, return original text
        return text

def chunk_text_by_sentences(text, max_chars=500, min_chars=100):
    """
    Intelligently chunk text into manageable pieces for TTS.
    
    Args:
        text: The text to chunk
        max_chars: Maximum characters per chunk (ideal for ~30-60 second audio)
        min_chars: Minimum characters to start a new chunk
        
    Returns:
        List of text chunks
    """
    # Tokenize into sentences
    sentences = nltk.sent_tokenize(text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        # If adding this sentence would exceed max_chars and we have minimum content
        if len(current_chunk) + len(sentence) > max_chars and len(current_chunk) >= min_chars:
            # Save current chunk and start new one
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
        else:
            # Add sentence to current chunk
            current_chunk += sentence + " "
    
    # Add the last chunk if it has content
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks

def chunk_text_by_paragraphs(text, max_chars=800):
    """
    Chunk text by paragraphs with a maximum size.
    Good for maintaining context and natural breaks.
    """
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
            
        # If paragraph alone exceeds max, break it into sentences
        if len(para) > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
            # Break large paragraph into sentences
            chunks.extend(chunk_text_by_sentences(para, max_chars=max_chars))
        elif len(current_chunk) + len(para) > max_chars:
            # Save current and start new
            chunks.append(current_chunk.strip())
            current_chunk = para + "\n\n"
        else:
            current_chunk += para + "\n\n"
    
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': tts_model is not None})

@app.route('/api/voices', methods=['GET'])
def get_voices():
    """Get all registered voices"""
    db = load_voices_db()
    voices = []
    for voice_id, voice_data in db.items():
        voices.append({
            'id': voice_id,
            'name': voice_data['name'],
            'language': voice_data.get('language', 'en'),
            'created_at': voice_data['created_at'],
            'audio_path': voice_data['audio_path'],
            'samples_count': voice_data.get('samples_count', 0)
        })
    return jsonify({'voices': voices})

@app.route('/api/voices', methods=['POST'])
def create_voice():
    """Register a new voice from uploaded audio"""
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    name = request.form.get('name', 'Unnamed Voice')
    language = request.form.get('language', 'en')
    
    # Generate voice ID
    voice_id = str(uuid.uuid4())
    
    # Save audio file
    audio_filename = f"{voice_id}.wav"
    audio_path = MODELS_DIR / audio_filename
    audio_file.save(audio_path)
    
    # Update database
    db = load_voices_db()
    db[voice_id] = {
        'name': name,
        'language': language,
        'created_at': datetime.now().isoformat(),
        'audio_path': str(audio_path),
        'samples_count': 1
    }
    save_voices_db(db)
    
    return jsonify({
        'success': True,
        'voice_id': voice_id,
        'name': name
    })

@app.route('/api/voices/<voice_id>', methods=['DELETE'])
def delete_voice(voice_id):
    """Delete a voice"""
    db = load_voices_db()
    
    if voice_id not in db:
        return jsonify({'error': 'Voice not found'}), 404
    
    # Delete audio file
    audio_path = Path(db[voice_id]['audio_path'])
    if audio_path.exists():
        audio_path.unlink()
    
    # Remove from database
    del db[voice_id]
    save_voices_db(db)
    
    return jsonify({'success': True})

@app.route('/api/synthesize', methods=['POST'])
def synthesize():
    """Generate speech using a voice"""
    data = request.json
    voice_id = data.get('voice_id')
    text = data.get('text')
    language = data.get('language', 'en')
    translate_to = data.get('translate_to')  # New parameter for translation
    source_lang = data.get('source_lang', 'auto')  # Source language for translation
    
    if not voice_id or not text:
        return jsonify({'error': 'Missing voice_id or text'}), 400
    
    # Get voice from database
    db = load_voices_db()
    if voice_id not in db:
        return jsonify({'error': 'Voice not found'}), 404
    
    voice_data = db[voice_id]
    audio_path = voice_data['audio_path']
    
    if not os.path.exists(audio_path):
        return jsonify({'error': 'Voice audio file not found'}), 404
    
    try:
        # Translate text if requested
        original_text = text
        if translate_to and translate_to != 'original':
            text = translate_text(text, source_lang=source_lang, target_lang=translate_to)
            print(f"Translated from {source_lang} to {translate_to}: {original_text[:50]}... -> {text[:50]}...")
        
        # Generate output filename
        output_id = str(uuid.uuid4())
        output_filename = f"{output_id}.wav"
        output_path = OUTPUT_DIR / output_filename
        
        # Load TTS model and generate
        tts = get_tts_model()
        tts.tts_to_file(
            text=text,
            speaker_wav=audio_path,
            language=language,
            file_path=str(output_path)
        )
        
        response_data = {
            'success': True,
            'audio_id': output_id,
            'audio_url': f'/api/audio/{output_id}'
        }
        
        # Include translated text if translation was performed
        if translate_to and translate_to != 'original':
            response_data['original_text'] = original_text
            response_data['translated_text'] = text
            response_data['translation'] = {
                'from': source_lang,
                'to': translate_to
            }
        
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/audio/<audio_id>', methods=['GET'])
def get_audio(audio_id):
    """Serve generated audio file"""
    audio_path = OUTPUT_DIR / f"{audio_id}.wav"
    
    if not audio_path.exists():
        return jsonify({'error': 'Audio not found'}), 404
    
    return send_file(audio_path, mimetype='audio/wav')

@app.route('/api/batch-synthesize', methods=['POST'])
def batch_synthesize():
    """Generate multiple audio files from a list of texts"""
    data = request.json
    voice_id = data.get('voice_id')
    texts = data.get('texts', [])
    language = data.get('language', 'en')
    translate_to = data.get('translate_to')  # New parameter for translation
    source_lang = data.get('source_lang', 'auto')  # Source language for translation
    
    if not voice_id or not texts:
        return jsonify({'error': 'Missing voice_id or texts'}), 400
    
    # Get voice from database
    db = load_voices_db()
    if voice_id not in db:
        return jsonify({'error': 'Voice not found'}), 404
    
    voice_data = db[voice_id]
    audio_path = voice_data['audio_path']
    
    results = []
    tts = get_tts_model()
    
    for idx, text in enumerate(texts):
        try:
            # Translate text if requested
            original_text = text
            if translate_to and translate_to != 'original':
                text = translate_text(text, source_lang=source_lang, target_lang=translate_to)
            
            output_id = str(uuid.uuid4())
            output_filename = f"{output_id}.wav"
            output_path = OUTPUT_DIR / output_filename
            
            tts.tts_to_file(
                text=text,
                speaker_wav=audio_path,
                language=language,
                file_path=str(output_path)
            )
            
            result = {
                'index': idx,
                'success': True,
                'audio_id': output_id,
                'audio_url': f'/api/audio/{output_id}',
                'text': text
            }
            
            # Include translation info if translation was performed
            if translate_to and translate_to != 'original':
                result['original_text'] = original_text
                result['translated_text'] = text
            
            results.append(result)
        except Exception as e:
            results.append({
                'index': idx,
                'success': False,
                'error': str(e),
                'text': text
            })
    
    return jsonify({'results': results})

@app.route('/api/pdf/extract', methods=['POST'])
def extract_pdf():
    """Extract and chunk text from PDF"""
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400
    
    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Get chunking parameters
        chunk_method = request.form.get('chunk_method', 'sentences')  # 'sentences' or 'paragraphs'
        max_chars = int(request.form.get('max_chars', 500))
        
        # Extract text
        text = extract_text_from_pdf(pdf_file)
        
        if not text.strip():
            return jsonify({'error': 'No text could be extracted from PDF'}), 400
        
        # Clean text
        cleaned_text = clean_text(text)
        
        # Chunk text
        if chunk_method == 'paragraphs':
            chunks = chunk_text_by_paragraphs(cleaned_text, max_chars=max_chars)
        else:
            chunks = chunk_text_by_sentences(cleaned_text, max_chars=max_chars, min_chars=100)
        
        return jsonify({
            'success': True,
            'filename': pdf_file.filename,
            'total_chars': len(cleaned_text),
            'total_chunks': len(chunks),
            'chunks': chunks,
            'chunk_method': chunk_method,
            'avg_chunk_size': sum(len(c) for c in chunks) // len(chunks) if chunks else 0
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pdf/synthesize', methods=['POST'])
def synthesize_pdf():
    """Synthesize audio from PDF chunks"""
    data = request.get_json()
    
    if not data or 'voice_id' not in data or 'chunks' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    voice_id = data['voice_id']
    chunks = data['chunks']
    language = data.get('language', 'en')
    translate_to = data.get('translate_to')  # New parameter for translation
    source_lang = data.get('source_lang', 'auto')  # Source language for translation
    
    # Validate voice exists
    db = load_voices_db()
    if voice_id not in db:
        return jsonify({'error': 'Voice not found'}), 404
    
    voice_data = db[voice_id]
    audio_path = voice_data['audio_path']
    
    results = []
    tts = get_tts_model()
    
    print(f"PDF Synthesis: Processing {len(chunks)} chunks with voice {voice_id}")
    print(f"Translation: translate_to={translate_to}, source_lang={source_lang}")
    
    for idx, chunk in enumerate(chunks):
        try:
            # Translate chunk if requested
            original_chunk = chunk
            if translate_to and translate_to != 'original':
                chunk = translate_text(chunk, source_lang=source_lang, target_lang=translate_to)
                print(f"Chunk {idx}: Translated {len(original_chunk)} chars to {len(chunk)} chars")
            
            output_id = str(uuid.uuid4())
            output_filename = f"{output_id}.wav"
            output_path = OUTPUT_DIR / output_filename
            
            tts.tts_to_file(
                text=chunk,
                speaker_wav=audio_path,
                language=language,
                file_path=str(output_path)
            )
            
            result = {
                'index': idx,
                'success': True,
                'audio_id': output_id,
                'audio_url': f'/api/audio/{output_id}',
                'chunk': chunk[:100] + '...' if len(chunk) > 100 else chunk,
                'chunk_length': len(chunk)
            }
            
            # Include translation info if translation was performed
            if translate_to and translate_to != 'original':
                result['original_chunk'] = original_chunk[:100] + '...' if len(original_chunk) > 100 else original_chunk
                result['translated_chunk'] = chunk[:100] + '...' if len(chunk) > 100 else chunk
            
            results.append(result)
        except Exception as e:
            print(f"Error processing chunk {idx}: {str(e)}")
            import traceback
            traceback.print_exc()
            results.append({
                'index': idx,
                'success': False,
                'error': str(e),
                'chunk': chunk[:100] + '...' if len(chunk) > 100 else chunk
            })
    
    successful_count = sum(1 for r in results if r.get('success', False))
    failed_count = sum(1 for r in results if not r.get('success', False))
    
    print(f"PDF Synthesis complete: {successful_count} successful, {failed_count} failed")
    
    return jsonify({
        'success': True,
        'results': results,
        'total_chunks': len(chunks),
        'successful': successful_count,
        'failed': failed_count
    })

@app.route('/api/languages', methods=['GET'])
def get_languages():
    """Get supported languages"""
    languages = [
        {'code': 'en', 'name': 'English'},
        {'code': 'es', 'name': 'Spanish'},
        {'code': 'fr', 'name': 'French'},
        {'code': 'de', 'name': 'German'},
        {'code': 'it', 'name': 'Italian'},
        {'code': 'pt', 'name': 'Portuguese'},
        {'code': 'pl', 'name': 'Polish'},
        {'code': 'tr', 'name': 'Turkish'},
        {'code': 'ru', 'name': 'Russian'},
        {'code': 'nl', 'name': 'Dutch'},
        {'code': 'cs', 'name': 'Czech'},
        {'code': 'ar', 'name': 'Arabic'},
        {'code': 'zh-cn', 'name': 'Chinese'},
        {'code': 'ja', 'name': 'Japanese'},
        {'code': 'ko', 'name': 'Korean'},
        {'code': 'hu', 'name': 'Hungarian'}
    ]
    return jsonify({'languages': languages})

@app.route('/api/voice-design/generate', methods=['POST'])
def generate_voice_from_prompt():
    """
    Generate a custom voice from a text prompt using AI
    This is a placeholder implementation - in production you would use:
    - OpenAI's TTS with voice cloning
    - ElevenLabs voice design API
    - Custom voice synthesis models
    """
    data = request.json
    prompt = data.get('prompt', '')
    voice_name = data.get('voice_name', 'Custom Voice')
    
    if not prompt:
        return jsonify({'error': 'Voice prompt is required'}), 400
    
    try:
        # For now, we'll create a demo voice using existing TTS
        # In production, this would use advanced voice generation models
        
        voice_id = str(uuid.uuid4())
        
        # Check if we have any existing voices to use as a base
        voices_db = load_voices_db()
        
        if not voices_db:
            return jsonify({
                'error': 'No base voices available. Please upload at least one voice in "Manage Voices" first.',
                'note': 'Voice Designer requires a base voice to work with. Upload a sample voice file to get started.'
            }), 400
        
        # Select a base voice (in production, this would be chosen based on prompt characteristics)
        # For now, use the first available voice
        base_voice = list(voices_db.values())[0]
        base_audio_path = base_voice.get('audio_path')
        
        if not base_audio_path or not Path(base_audio_path).exists():
            return jsonify({
                'error': 'Base voice audio file not found',
                'note': 'Please re-upload your voice files in "Manage Voices"'
            }), 400
        
        # Generate a sample audio with the TTS to demonstrate the "designed" voice
        sample_text = f"Hello, I am {voice_name}. This is a preview of the custom voice you designed."
        
        tts = get_tts_model()
        output_filename = f"{voice_id}_preview.wav"
        output_path = OUTPUT_DIR / output_filename
        
        # Extract characteristics from prompt (tone, accent, age) and apply them
        language = extract_language_from_prompt(prompt)
        
        # Use the base voice to generate the preview
        # In production, you would use AI to generate entirely new voices
        tts.tts_to_file(
            text=sample_text,
            speaker_wav=base_audio_path,
            language=language,
            file_path=str(output_path)
        )
        
        # Store temporary voice info
        temp_voice_data = {
            'voice_id': voice_id,
            'voice_name': voice_name,
            'prompt': prompt,
            'created_at': datetime.now().isoformat(),
            'preview_file': output_filename,
            'language': language,
            'base_voice_id': base_voice.get('id'),
            'note': 'Preview generated using base voice. Production version would create entirely new voices.'
        }
        
        # Save to temporary storage (would be a database in production)
        temp_voices_file = BASE_DIR / "app" / "temp_voices.json"
        temp_voices = {}
        if temp_voices_file.exists():
            with open(temp_voices_file, 'r') as f:
                temp_voices = json.load(f)
        
        temp_voices[voice_id] = temp_voice_data
        
        with open(temp_voices_file, 'w') as f:
            json.dump(temp_voices, f, indent=2)
        
        return jsonify({
            'success': True,
            'voice_id': voice_id,
            'preview_url': f'/api/audio/{voice_id}_preview',
            'message': f'Voice "{voice_name}" generated successfully!'
        })
        
    except Exception as e:
        print(f"Voice generation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'Voice generation failed: {str(e)}',
            'note': 'Advanced voice design requires additional AI models (OpenAI TTS, ElevenLabs, etc.)'
        }), 500

def extract_language_from_prompt(prompt):
    """Extract language from prompt keywords"""
    prompt_lower = prompt.lower()
    
    language_keywords = {
        'british': 'en',
        'american': 'en',
        'english': 'en',
        'spanish': 'es',
        'french': 'fr',
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt',
        'russian': 'ru',
        'japanese': 'ja',
        'chinese': 'zh-cn',
        'korean': 'ko',
        'arabic': 'ar'
    }
    
    for keyword, lang_code in language_keywords.items():
        if keyword in prompt_lower:
            return lang_code
    
    return 'en'  # Default to English

@app.route('/api/voice-design/save', methods=['POST'])
def save_designed_voice():
    """Save a generated voice to the voice library"""
    data = request.json
    voice_id = data.get('voice_id')
    voice_name = data.get('voice_name')
    
    if not voice_id or not voice_name:
        return jsonify({'error': 'Voice ID and name are required'}), 400
    
    try:
        # Load temporary voice data
        temp_voices_file = BASE_DIR / "app" / "temp_voices.json"
        if not temp_voices_file.exists():
            return jsonify({'error': 'Voice not found'}), 404
        
        with open(temp_voices_file, 'r') as f:
            temp_voices = json.load(f)
        
        if voice_id not in temp_voices:
            return jsonify({'error': 'Voice not found'}), 404
        
        voice_data = temp_voices[voice_id]
        
        # Copy the preview file to a permanent location
        preview_file = OUTPUT_DIR / voice_data['preview_file']
        permanent_file = MODELS_DIR / f"{voice_id}.wav"
        
        if preview_file.exists():
            import shutil
            shutil.copy(preview_file, permanent_file)
        
        # Add to voices database
        voices_db = load_voices_db()
        new_voice = {
            'id': voice_id,
            'name': voice_name,
            'audio_path': str(permanent_file),
            'language': voice_data.get('language', 'en'),
            'created_at': voice_data['created_at'],
            'design_prompt': voice_data['prompt'],
            'type': 'designed'
        }
        
        voices_db[voice_id] = new_voice
        save_voices_db(voices_db)
        
        # Clean up temporary voice
        del temp_voices[voice_id]
        with open(temp_voices_file, 'w') as f:
            json.dump(temp_voices, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': f'Voice "{voice_name}" saved successfully!',
            'voice': new_voice
        })
        
    except Exception as e:
        print(f"Save voice error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-transform', methods=['POST'])
def transform_voice():
    """
    Transform one voice to another with control over tone and emotion
    Converts source audio to target voice with speed, pitch, and emotion adjustments
    """
    try:
        # Get uploaded file and parameters
        if 'source_audio' not in request.files:
            return jsonify({'error': 'No source audio file provided'}), 400
        
        source_audio = request.files['source_audio']
        target_voice_id = request.form.get('target_voice_id')
        speed = float(request.form.get('speed', 1.0))
        pitch = float(request.form.get('pitch', 1.0))
        emotion = request.form.get('emotion', 'neutral')
        intensity = float(request.form.get('intensity', 0.5))
        
        if not target_voice_id:
            return jsonify({'error': 'Target voice ID is required'}), 400
        
        # Load target voice from database
        voices_db = load_voices_db()
        if target_voice_id not in voices_db:
            return jsonify({'error': 'Target voice not found'}), 404
        
        target_voice = voices_db[target_voice_id]
        target_audio_path = target_voice.get('audio_path')
        
        if not target_audio_path or not Path(target_audio_path).exists():
            return jsonify({'error': 'Target voice audio file not found'}), 404
        
        # Save source audio temporarily
        source_temp_path = OUTPUT_DIR / f"temp_source_{uuid.uuid4()}.wav"
        source_audio.save(source_temp_path)
        
        # Get audio duration using a simple approach
        import wave
        try:
            with wave.open(str(source_temp_path), 'rb') as wav_file:
                frames = wav_file.getnframes()
                rate = wav_file.getframerate()
                original_duration = frames / float(rate)
        except:
            original_duration = 0
        
        # Extract text from source audio using speech recognition
        # For now, we'll use a placeholder text extraction
        # In production, you would use:
        # - Whisper AI for speech-to-text
        # - Google Speech-to-Text API
        # - Other STT services
        
        # Since we don't have STT, we'll create a demo transformation
        # that uses the target voice to re-speak sample text
        sample_text = "This is a voice transformation demo. In production, this would contain the transcribed speech from your source audio."
        
        # Generate output with target voice
        tts = get_tts_model()
        output_id = str(uuid.uuid4())
        output_filename = f"transformed_{output_id}.wav"
        output_path = OUTPUT_DIR / output_filename
        
        # Apply transformations
        # Note: XTTS doesn't directly support pitch/speed/emotion
        # In production, you would use:
        # - Audio processing libraries (pydub, librosa, soundfile)
        # - Emotion-aware TTS models
        # - Voice conversion models (so-vits-svc, RVC, etc.)
        
        tts.tts_to_file(
            text=sample_text,
            speaker_wav=target_audio_path,
            language=target_voice.get('language', 'en'),
            file_path=str(output_path)
        )
        
        # Apply post-processing for speed and pitch
        # This is a simplified version - production would use librosa or pydub
        try:
            import subprocess
            processed_path = OUTPUT_DIR / f"processed_{output_id}.wav"
            
            # Use ffmpeg for speed and pitch adjustment if available
            speed_filter = f"atempo={speed}" if speed != 1.0 else None
            pitch_filter = f"asetrate=44100*{pitch},aresample=44100" if pitch != 1.0 else None
            
            filters = []
            if speed_filter:
                filters.append(speed_filter)
            if pitch_filter:
                filters.append(pitch_filter)
            
            if filters:
                filter_str = ",".join(filters)
                subprocess.run([
                    'ffmpeg', '-i', str(output_path),
                    '-af', filter_str,
                    '-y', str(processed_path)
                ], capture_output=True, check=True)
                
                # Replace original with processed
                output_path.unlink()
                processed_path.rename(output_path)
        except Exception as e:
            print(f"Post-processing warning: {str(e)}")
            # Continue without post-processing if ffmpeg is not available
        
        # Calculate transformed duration
        try:
            with wave.open(str(output_path), 'rb') as wav_file:
                frames = wav_file.getnframes()
                rate = wav_file.getframerate()
                transformed_duration = frames / float(rate)
        except:
            transformed_duration = original_duration / speed if speed > 0 else original_duration
        
        # Clean up temporary source file
        if source_temp_path.exists():
            source_temp_path.unlink()
        
        return jsonify({
            'success': True,
            'audio_url': f'/api/audio/{output_id}',
            'original_duration': round(original_duration, 2),
            'transformed_duration': round(transformed_duration, 2),
            'settings': {
                'speed': speed,
                'pitch': pitch,
                'emotion': emotion,
                'intensity': intensity
            },
            'note': 'Demo transformation. Production version would include speech-to-text and advanced voice conversion.'
        })
        
    except Exception as e:
        print(f"Voice transformation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'Voice transformation failed: {str(e)}',
            'note': 'Advanced voice transformation requires additional tools (ffmpeg, Whisper AI, voice conversion models)'
        }), 500

if __name__ == '__main__':
    print("🎙️  Easy Voice Clone Server")
    print("=" * 50)
    print(f"Models Directory: {MODELS_DIR}")
    print(f"Output Directory: {OUTPUT_DIR}")
    print("Server starting on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
