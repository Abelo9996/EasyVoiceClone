# Changelog

All notable changes to Easy Voice Clone will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-07

### 🎉 Initial Public Release

#### Added - Web Application
- **Complete React + Flask web interface**
  - Modern, responsive UI with Tailwind CSS
  - Voice management system with drag & drop upload
  - Single text synthesis with instant playback
  - Batch text processing with progress tracking
  - **PDF to Audiobook converter** with smart chunking
  - Multi-language support (16+ languages)
  - Audio download functionality (individual and bulk)

#### Added - PDF Reader Feature
- PDF text extraction using PyPDF2
- Intelligent text chunking (sentence-based and paragraph-based)
- Configurable chunk sizes (200-1000 characters)
- Selective chunk processing with checkbox selection
- Batch audio generation from PDF chunks
- Perfect for converting entire books to audiobooks

#### Added - Command Line Tools
- `easy_clone.sh` - Simple one-command voice cloning
- `clone_with_xtts.sh` - Advanced voice cloning with options
- Zero-training voice cloning using XTTS-v2
- Support for multiple audio formats (WAV, MP3, FLAC, OGG)

#### Added - Documentation
- Comprehensive README.md
- Contributing guidelines (CONTRIBUTING.md)
- Code of Conduct (CODE_OF_CONDUCT.md)
- Security policy (SECURITY.md)
- Environment variables example (.env.example)
- MIT License

#### Added - Infrastructure
- Automated setup script for web app (setup.sh)
- Startup script with tmux support (start.sh)
- Comprehensive .gitignore
- Backend Flask API with 10+ endpoints
- CORS support for frontend-backend communication

#### Technical Details
- **Backend**: Python 3.8+, Flask 3.0, Coqui TTS (XTTS-v2)
- **Frontend**: React 18.2, Tailwind CSS, Axios
- **AI Model**: XTTS-v2 (multilingual, zero-shot TTS)
- **Dependencies**: PyPDF2, NLTK, PyTorch 2.0+
- **Audio Output**: 22kHz, 16-bit WAV files

#### Features
- ✅ Zero-training voice cloning (10-30 seconds of audio)
- ✅ 16+ language support
- ✅ Local processing (no API keys needed)
- ✅ Batch processing
- ✅ PDF to audiobook conversion
- ✅ Drag & drop interface
- ✅ Instant audio playback
- ✅ Voice profile management
- ✅ CPU and GPU support

### Performance
- Model size: ~1.9GB (one-time download)
- Processing speed: 5-10 seconds per sentence (CPU), 1-2 seconds (GPU)
- Audio quality: Production-ready, 22kHz
- Supported platforms: macOS, Linux, Windows

### Use Cases
- 📖 Create personal audiobooks
- 🎓 Convert study materials to audio
- 🎮 Generate game character voices
- 🎬 Create video voiceovers
- 🌍 Accessibility applications
- 🗣️ Language learning tools
- 🎭 Voice acting prototypes
- 📺 Content creation

---

## [Unreleased]

### Planned Features
- [ ] OCR support for scanned PDFs
- [ ] M4B audiobook export format
- [ ] Chapter markers for audiobooks
- [ ] Background processing queue
- [ ] Resume interrupted processing
- [ ] Voice mixing and blending
- [ ] Emotion and style control
- [ ] Real-time voice cloning
- [ ] Browser extension
- [ ] Mobile app

### Under Consideration
- API endpoints for external integration
- Cloud deployment guides
- Docker containerization
- Voice preset library
- Collaborative voice projects
- Advanced text preprocessing
- Custom pronunciation dictionary
- Multi-speaker support

---

## Version History

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, minor improvements

### Release Schedule
- Major releases: As needed for significant features
- Minor releases: Monthly or as features are completed
- Patch releases: As needed for bug fixes

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to Easy Voice Clone.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

**Star History**: Help others discover Easy Voice Clone by [starring the repository](https://github.com/Abelo9996/EasyVoiceClone)! ⭐
