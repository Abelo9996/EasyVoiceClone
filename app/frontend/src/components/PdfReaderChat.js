import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

function PdfReaderChat({ voices, onVoicesUpdate }) {
  const [selectedVoice, setSelectedVoice] = useState('');
  const [language, setLanguage] = useState('en');
  const [translateTo, setTranslateTo] = useState('original');
  const [sourceLang, setSourceLang] = useState('auto');
  const [languages, setLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'ru', name: 'Russian' },
    { code: 'nl', name: 'Dutch' },
    { code: 'cs', name: 'Czech' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh-cn', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hu', name: 'Hungarian' }
  ]);
  const [history, setHistory] = useState(() => {
    // Load history from localStorage on component mount
    const saved = localStorage.getItem('pdfReaderHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef(null);

  // Dropzone state
  const [currentPdf, setCurrentPdf] = useState(null);
  const [chunkMethod, setChunkMethod] = useState('sentences');
  const [maxChars, setMaxChars] = useState(500);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  // Saves history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pdfReaderHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('/api/languages');
      if (response.data.languages && response.data.languages.length > 0) {
        setLanguages(response.data.languages);
      }
      // If API fails or returns empty, keep the default languages
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // Keep the default languages set in state initialization
    }
  };

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf') {
        setCurrentPdf(file);
        await handlePdfUpload(file);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: processing
  });

  const handlePdfUpload = async (file) => {
    setProcessing(true);
    setProgress(10);
    setProgressText('Uploading PDF...');

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      action: 'upload',
      filename: file.name,
      chunkMethod,
      maxChars,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [...prev, userMessage]);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('chunk_method', chunkMethod);
    formData.append('max_chars', maxChars);

    try {
      setProgress(30);
      setProgressText('Extracting text from PDF...');
      const response = await axios.post('/api/pdf/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProgress(100);
      setProgressText('Extraction complete!');
      
      // Add assistant response with extracted data
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        action: 'extracted',
        data: response.data,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [...prev, assistantMessage]);
      toast.success(`Extracted ${response.data.total_chunks} chunks from PDF`);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        error: error.response?.data?.error || 'Failed to extract PDF',
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [...prev, errorMessage]);
      toast.error(error.response?.data?.error || 'Failed to extract PDF');
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const handleSynthesizeChunks = async (chunks, messageId) => {
    if (!selectedVoice) {
      toast.error('Please select a voice');
      return;
    }

    setProcessing(true);
    setProgress(10);
    setProgressText('Preparing synthesis...');

    // Add user synthesis request
    const userMessage = {
      id: Date.now(),
      type: 'user',
      action: 'synthesize',
      chunkCount: chunks.length,
      voice: voices.find(v => v.id === selectedVoice)?.name,
      translateTo: translateTo !== 'original' ? translateTo : null,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [...prev, userMessage]);

    try {
      setProgress(40);
      setProgressText(`Synthesizing ${chunks.length} chunks...`);
      const response = await axios.post('/api/pdf/synthesize', {
        voice_id: selectedVoice,
        chunks: chunks,
        language: language,
        translate_to: translateTo,
        source_lang: sourceLang
      });

      setProgress(100);
      setProgressText('Synthesis complete!');
      
      // Add assistant response with audio results
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        action: 'synthesized',
        results: response.data.results,
        successful: response.data.successful,
        failed: response.data.failed,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [...prev, assistantMessage]);
      
      toast.success(`Generated ${response.data.successful} audio files`);
      if (response.data.failed > 0) {
        toast.error(`Failed to generate ${response.data.failed} audio files`);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        error: error.response?.data?.error || 'Failed to synthesize PDF',
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [...prev, errorMessage]);
      toast.error(error.response?.data?.error || 'Failed to synthesize PDF');
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const downloadAllAudio = (results) => {
    results.forEach((result, idx) => {
      if (result.success) {
        setTimeout(() => {
          window.open(`http://localhost:5000${result.audio_url}`, '_blank');
        }, idx * 500);
      }
    });
    toast.success('Downloading all files...');
  };

  const clearHistory = () => {
    if (window.confirm('Clear all conversation history?')) {
      setHistory([]);
      setCurrentPdf(null);
      toast.success('History cleared');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
      {/* Settings Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            PDF Settings
          </h2>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select voice...</option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.language})
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Translation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌐 Translate To
            </label>
            <select
              value={translateTo}
              onChange={(e) => setTranslateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="original">No Translation</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="pl">Polish</option>
              <option value="tr">Turkish</option>
              <option value="ru">Russian</option>
              <option value="nl">Dutch</option>
              <option value="cs">Czech</option>
              <option value="ar">Arabic</option>
              <option value="zh-cn">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="hi">Hindi</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Translate PDF text before synthesis
            </p>
          </div>

          {translateTo !== 'original' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Language
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="auto">Auto-Detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ar">Arabic</option>
                <option value="zh-cn">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
            </div>
          )}

          {/* Chunking Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chunking
            </label>
            <select
              value={chunkMethod}
              onChange={(e) => setChunkMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="sentences">By Sentences</option>
              <option value="paragraphs">By Paragraphs</option>
            </select>
          </div>

          {/* Max Characters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Characters: {maxChars}
            </label>
            <input
              type="range"
              value={maxChars}
              onChange={(e) => setMaxChars(parseInt(e.target.value))}
              min="200"
              max="1000"
              step="50"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              ~{Math.round(maxChars / 10)} seconds
            </p>
          </div>

          {history.length > 0 && (
            <>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full py-2 px-4 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors mb-2"
              >
                {showHistory ? '📚 Show Chat' : '📜 View Full History'} ({history.length})
              </button>
              <button
                onClick={clearHistory}
                className="w-full py-2 px-4 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ Clear History
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">
            {showHistory ? '📜 Full History' : '📚 PDF Reader Chat'}
          </h2>
          <p className="text-sm text-blue-100 mt-1">
            {showHistory 
              ? `${history.length} total interactions` 
              : 'Upload PDFs and convert them to audio'}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="max-w-md text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Upload a PDF to Start
                </h3>
                <p className="text-gray-500 mb-4">
                  Drag and drop a PDF file below or click to browse
                </p>
              </div>
            </div>
          ) : (
            <>
              {!showHistory && history.length > 10 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-yellow-800">
                    📜 Showing last 10 interactions. Click "View Full History" to see all {history.length} items.
                  </p>
                </div>
              )}
              {(showHistory ? history : history.slice(-10)).map((message) => (
                <div key={message.id}>
                  {/* User Messages */}
                  {message.type === 'user' && message.action === 'upload' && (
                    <div className="flex justify-end">
                      <div className="max-w-3xl">
                        <div className="bg-blue-600 text-white rounded-lg px-4 py-3 shadow">
                          <div className="font-medium">📤 Uploaded PDF</div>
                          <div className="text-sm mt-1">{message.filename}</div>
                          <div className="text-xs mt-2 opacity-75">
                            Method: {message.chunkMethod} | Max: {message.maxChars} chars
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === 'user' && message.action === 'synthesize' && (
                    <div className="flex justify-end">
                      <div className="max-w-3xl">
                        <div className="bg-blue-600 text-white rounded-lg px-4 py-3 shadow">
                          <div className="font-medium">🎤 Synthesize Request</div>
                          <div className="text-sm mt-1">
                            {message.chunkCount} chunks using {message.voice}
                          </div>
                          {message.translateTo && (
                            <div className="mt-2 pt-2 border-t border-blue-400 text-xs text-blue-100">
                              🌐 Translating to {message.translateTo.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assistant Messages */}
                  {message.type === 'assistant' && message.action === 'extracted' && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl w-full">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow">
                          <div className="font-medium text-gray-800 mb-3">
                            ✅ Extracted {message.data.total_chunks} chunks
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-600 text-xs">Characters</div>
                              <div className="font-semibold">{message.data.total_chars.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-600 text-xs">Avg Chunk</div>
                              <div className="font-semibold">{message.data.avg_chunk_size} chars</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSynthesizeChunks(message.data.chunks, message.id)}
                            disabled={!selectedVoice || processing}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                              !selectedVoice || processing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {processing ? '⏳ Processing...' : `🎵 Convert to Audio`}
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === 'assistant' && message.action === 'synthesized' && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl w-full">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-gray-800">
                              🎵 Generated {message.successful} audio files
                            </div>
                            <button
                              onClick={() => downloadAllAudio(message.results)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Download All
                            </button>
                          </div>

                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {message.results.filter(r => r.success).map((result, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-green-50 border border-green-100"
                              >
                                <div className="text-xs text-gray-600 mb-1 font-medium">
                                  Chunk {result.index + 1}
                                </div>
                                {result.original_chunk && result.translated_chunk && (
                                  <div className="mb-2 p-2 bg-blue-50 rounded text-xs">
                                    <div className="text-gray-600 mb-1">
                                      <span className="font-semibold">Original:</span> {result.original_chunk}
                                    </div>
                                    <div className="text-blue-700">
                                      <span className="font-semibold">🌐 Translated:</span> {result.translated_chunk}
                                    </div>
                                  </div>
                                )}
                                {!result.translated_chunk && (
                                  <div className="text-xs text-gray-500 mb-2 line-clamp-1">
                                    {result.chunk}
                                  </div>
                                )}
                                <audio
                                  controls
                                  className="w-full"
                                  src={`http://localhost:5000${result.audio_url}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Messages */}
                  {message.type === 'error' && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl">
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 shadow">
                          <div className="font-medium">❌ Error</div>
                          <div className="text-sm mt-1">{message.error}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Upload Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center space-x-3">
              <svg className="h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                {currentPdf ? (
                  <p className="text-green-600 font-medium">📄 {currentPdf.name}</p>
                ) : (
                  <>
                    <p className="text-gray-600">Drop PDF here or click to browse</p>
                    <p className="text-sm text-gray-400 mt-1">PDF files only</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {processing && progress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-600">{progressText}</div>
                <div className="text-sm font-medium text-blue-600">{progress}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PdfReaderChat;
