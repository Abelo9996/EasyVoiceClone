<div[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg)](CODE_OF_CONDUCT.md)
[![Stars](https://img.shields.io/github/stars/Abelo9996/EasyVoiceClone?style=social)](https://github.com/Abelo9996/EasyVoiceClone)gn="center">

# 🎙️ Easy Voice Clone

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://reactjs.org/)
[![Stars](https://img.shields.io/github/stars/Abelo9996/EasyVoiceClone?style=social)](https://github.com/Abelo9996/EasyVo## 📚 Documentation

- 📖 [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- 🛡️ [Security Policy](SECURITY.md) - Security and responsible disclosure
- 🤝 [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines
- 📋 [Changelog](CHANGELOG.md) - Version history and updates
- ⚖️ [License](LICENSE) - MIT License detailsne)

**Clone any voice with just one command.** The simplest voice cloning toolkit powered by Coqui XTTS-v2.

🚀 **Zero training required** • 🎯 **Production quality** • ⚡ **Lightning fast setup** • 🎨 **Beautiful Web UI** • 📚 **PDF to Audiobook**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎨 Two Ways to Use

### 1️⃣ Web Application (NEW!)
Modern React + Flask web interface with voice management, batch processing, and beautiful UI.

```bash
cd app && ./setup.sh && ./start.sh
```

Then open **http://localhost:3000** in your browser!

### 2️⃣ Command Line
Quick and simple - perfect for scripts and automation.

```bash
./easy_clone.sh your_audio.wav "Your text here"
```

---

## ✨ Features

### Web Application
- 🎨 **Modern UI** - Beautiful, responsive interface built with React + Tailwind
- 📤 **Voice Management** - Upload, organize, and manage multiple voice profiles
- ⚡ **Batch Processing** - Generate multiple audio files at once
- 📚 **PDF Reader** - Convert entire books/documents to audiobooks with smart chunking
- 🎵 **Instant Playback** - Listen to generated audio immediately
- 💾 **Easy Downloads** - Download individual or batch files
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

### Command Line
- 🎤 **Instant Voice Cloning** - No training, just provide 10-30 seconds of audio
- 🌍 **Multilingual Support** - Works with multiple languages
- 🔊 **High Quality** - Natural-sounding voice synthesis
- 💻 **Simple API** - One command to clone any voice
- 🆓 **100% Free & Open Source** - MIT licensed

---

## 🎬 Quick Start

### Command Line (30 seconds)
```bash
git clone https://github.com/Abelo9996/EasyVoiceClone.git
cd EasyVoiceClone
./easy_clone.sh your_audio.wav "Hello! This is your cloned voice speaking."
```

### Web Application (2 minutes)
```bash
git clone https://github.com/Abelo9996/EasyVoiceClone.git
cd EasyVoiceClone/app
./setup.sh
./start.sh
# Open http://localhost:3000
```

---

## 🎯 Use Cases

- 📖 **Create Audiobooks** - Convert PDFs to audiobooks in your own voice
- 🎓 **Educational Content** - Generate study materials with custom narration
- 🎮 **Game Development** - Create character voices for indie games
- 🎬 **Content Creation** - Generate voiceovers for videos and podcasts
- 🌍 **Accessibility** - Help visually impaired users with custom narration
- 🗣️ **Language Learning** - Practice with texts in your target language
- 🎭 **Voice Acting** - Prototype and test character voices quickly
- 📺 **Prototyping** - Quick voiceover demos for presentations

---

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- ffmpeg (for audio processing)
- espeak-ng (for phoneme processing)

### Step 1: Install System Dependencies

**macOS:**
```bash
brew install ffmpeg espeak-ng
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg espeak-ng
```

**Windows:**
- Download [ffmpeg](https://ffmpeg.org/download.html) and add to PATH
- Download [espeak-ng](https://github.com/espeak-ng/espeak-ng/releases) and add to PATH

### Step 2: Install Node.js (for Web App)

**macOS:**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
- Download from [nodejs.org](https://nodejs.org/)

### Step 4: Clone Repository

```bash
git clone https://github.com/Abelo9996/EasyVoiceClone.git
cd EasyVoiceClone
```

### Step 5A: Setup Web Application

```bash
cd app
./setup.sh  # Installs both backend and frontend dependencies
```

### Step 5B: Setup Command Line Only

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Make scripts executable (macOS/Linux)
chmod +x easy_clone.sh clone_with_xtts.sh
```

---

## 🚀 Usage

### Web Application

```bash
cd app
./start.sh  # Starts both backend and frontend
```

Then open **http://localhost:3000** in your browser!

**Features:**

#### 🎤 Voice Management
- Drag & drop voice sample upload
- Support for WAV, MP3, FLAC, OGG formats
- Organize multiple voice profiles
- Preview and delete voices

#### 🎵 Single Synthesis
- Generate audio from any text
- Real-time voice selection
- 16+ language support
- Instant browser playback
- One-click download

#### 📦 Batch Processing
- Process multiple texts at once
- Progress tracking per text
- Bulk download all files
- Success/failure indicators

#### 📚 PDF to Audiobook (NEW!)
- Upload any PDF document
- Smart text chunking (sentence or paragraph-based)
- Configurable chunk sizes (200-1000 chars)
- Selective chunk processing
- Convert entire books to audio
- Perfect for creating personal audiobooks

**Manual Start (without tmux):**
```bash
# Terminal 1 - Backend
cd app/backend
source venv/bin/activate
python server.py

# Terminal 2 - Frontend
cd app/frontend
npm start
```

See [app/README.md](app/README.md) for detailed documentation.

### Command Line - Basic Usage

```bash
# Activate virtual environment
source venv/bin/activate

# Clone a voice
./easy_clone.sh path/to/audio.wav "Text to speak in the cloned voice"
```

### Command Line - Advanced Usage

```bash
# Use clone_with_xtts.sh for more control
./clone_with_xtts.sh input.wav "Custom text" output/custom_name.wav

# Python API
python3 -c "
from TTS.api import TTS
tts = TTS('tts_models/multilingual/multi-dataset/xtts_v2', gpu=False)
tts.tts_to_file(
    text='Your text here',
    speaker_wav='path/to/audio.wav',
    language='en',
    file_path='output.wav'
)
"
```

### Multiple Languages

```bash
# Supported: en, es, fr, de, it, pt, pl, tr, ru, nl, cs, ar, zh-cn, ja, ko, hu
./clone_with_xtts.sh audio.wav "Bonjour le monde" output.wav
```

---

## 📖 How It Works

1. **Provide Reference Audio** - 10-30 seconds of clean audio from the target voice
2. **XTTS-v2 Analysis** - The model analyzes voice characteristics (pitch, tone, accent)
3. **Text Synthesis** - Generates speech in the cloned voice with your custom text
4. **Output** - High-quality audio file ready to use

**Under the hood:** Easy Voice Clone uses Coqui XTTS-v2, a state-of-the-art neural TTS model with zero-shot voice cloning capabilities. No training or fine-tuning required!

---

## 💡 Tips for Best Results

### Audio Quality
- ✅ Use clear, high-quality audio (no background noise)
- ✅ Single speaker only
- ✅ 10-30 seconds of audio is ideal
- ✅ Normal speaking pace and volume
- ✅ WAV format recommended (MP3/FLAC also work)

### Text Generation
- ✅ Natural sentence structure works best
- ✅ Proper punctuation improves prosody
- ✅ Avoid very long sentences (split them up)
- ✅ Test with different texts for variety

---

## 📁 Project Structure

```
EasyVoiceClone/
├── easy_clone.sh           # Main script (simplest usage)
├── clone_with_xtts.sh      # Advanced script (more options)
├── requirements.txt        # Python dependencies
├── data/                   # Input audio files
├── output/                 # Generated audio files
└── models/                 # Downloaded models cache
```

---

## 🎯 Examples

### Example 1: Quick Test
```bash
./easy_clone.sh data/example_audio/test.wav "This is a test"
```

### Example 2: Custom Output
```bash
./clone_with_xtts.sh my_voice.wav "Welcome to my podcast!" output/intro.wav
```

### Example 3: Batch Processing
```bash
# Clone multiple texts with same voice
for text in "Hello" "Goodbye" "Thank you"; do
    ./easy_clone.sh voice.wav "$text"
done
```

### Example 4: Different Languages
```bash
# English
./easy_clone.sh voice.wav "Hello world"

# Spanish
./easy_clone.sh voice.wav "Hola mundo"

# French
./easy_clone.sh voice.wav "Bonjour le monde"
```

---

## ⚙️ Configuration

### GPU Acceleration

To enable GPU (if available), edit the scripts and change:

```python
tts = TTS('...', gpu=False)
# To:
tts = TTS('...', gpu=True)
```

---

## 🔧 Troubleshooting

### First run is slow?
**Normal!** The first run downloads the XTTS-v2 model (~1.9GB). Subsequent runs are fast.

### Audio sounds robotic?
- Check reference audio quality
- Use 15-30 seconds of reference audio (not too short)
- Ensure single speaker with no background noise

### Installation errors?
```bash
# Reinstall in clean environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Model download fails?
- Check internet connection
- Restart the script (downloads resume automatically)
- Models are cached in `~/.local/share/tts/`

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Model Size | 1.9 GB (one-time download) |
| First Run | ~2-3 minutes (model download) |
| Subsequent Runs | ~5-10 seconds per sentence |
| Audio Quality | 22kHz, 16-bit WAV |
| Languages | 16+ languages supported |

---

## ❓ FAQ

### How much audio do I need?
**10-30 seconds** of clear speech is ideal. Longer samples (up to 60 seconds) can improve quality.

### Does it work with any language?
Yes! Supports **16+ languages** including English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, and more.

### Do I need a GPU?
No, but it helps! Works fine on CPU, just takes a bit longer (5-10 seconds per sentence vs 1-2 seconds on GPU).

### Can I use this commercially?
Yes! MIT license allows commercial use. Just ensure ethical use and proper consent.

### How accurate is the voice clone?
Very accurate with good reference audio. Best results with:
- Clear, noise-free audio
- Single speaker
- Natural speaking pace
- 15-30 seconds duration

### Can I clone famous voices?
Technically possible, but **ethically questionable**. Always obtain consent before cloning someone's voice.

### What's the audio quality?
Output is 22kHz, 16-bit WAV files - suitable for most use cases including audiobooks and videos.

### How large is the download?
First run downloads ~1.9GB model (one-time). Subsequent runs use cached model.

---

## 🤝 Contributing

We love contributions! Here's how you can help:

### Ways to Contribute
- 🐛 **Report bugs** - Open an issue with reproduction steps
- 💡 **Suggest features** - Share your ideas in discussions
- 📝 **Improve docs** - Fix typos, add examples, clarify instructions
- 🔧 **Submit PRs** - Fix bugs or add features
- ⭐ **Star the repo** - Help others discover the project
- 📢 **Share** - Tell others about Easy Voice Clone

### Development Setup
```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/EasyVoiceClone.git
cd EasyVoiceClone

# Create a branch
git checkout -b feature/your-feature-name

# Make your changes and test

# Commit and push
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

### Code Style
- Python: Follow PEP 8
- JavaScript: Use Prettier/ESLint
- Comments: Write clear, helpful comments
- Tests: Add tests for new features

---

## � Documentation

- 📖 [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- 🛡️ [Security Policy](SECURITY.md) - Security and responsible disclosure
- 🤝 [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines
- ⚖️ [License](LICENSE) - MIT License details

## �📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Important Notes
- ✅ Free for personal and commercial use
- ✅ Modify and distribute freely
- ⚠️ **Ethical use required** - Do not use for impersonation, fraud, or illegal activities
- ⚠️ Always obtain consent before cloning someone's voice
- 📜 Review our [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md)

---

## 🙏 Acknowledgments

- [Coqui TTS](https://github.com/coqui-ai/TTS) - The amazing TTS library powering this project
- [XTTS-v2](https://arxiv.org/abs/2406.04904) - State-of-the-art voice cloning model
- [OpenAI Whisper](https://github.com/openai/whisper) - Automatic transcription support

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

## 📞 Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/Abelo9996/EasyVoiceClone/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Abelo9996/EasyVoiceClone/discussions)

---

**Made with ❤️ by [Abel Yagubyan](https://github.com/Abelo9996)**

*Clone responsibly. Use ethically.* 🎤
