import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function SynthesisPanel({ voices, selectedVoice, onVoiceSelect }) {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [translateTo, setTranslateTo] = useState('original');
  const [sourceLang, setSourceLang] = useState('auto');
  const [synthesizing, setSynthesizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState(() => {
    // Load history from localStorage on component mount
    const saved = localStorage.getItem('synthesisHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('synthesisHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSynthesize = async () => {
    if (!selectedVoice) {
      toast.error('Please select a voice first');
      return;
    }

    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    const inputText = text;
    const inputLanguage = language;
    const inputTranslateTo = translateTo;
    const inputSourceLang = sourceLang;
    setText(''); // Clear input immediately

    setSynthesizing(true);
    setProgress(0);

    // Add user message to history
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      language: inputLanguage,
      translateTo: inputTranslateTo !== 'original' ? inputTranslateTo : null,
      sourceLang: inputSourceLang,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [...prev, userMessage]);

    // Split text by newlines to detect if it's a batch or single synthesis
    const textLines = inputText
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      let results = [];
      
      if (textLines.length === 1) {
        // Single synthesis
        setProgress(50);
        const response = await axios.post('/api/synthesize', {
          voice_id: selectedVoice.id,
          text: textLines[0],
          language: inputLanguage,
          translate_to: inputTranslateTo,
          source_lang: inputSourceLang
        });
        setProgress(100);

        results = [{
          index: 0,
          text: response.data.translated_text || textLines[0],
          original_text: response.data.original_text,
          translated_text: response.data.translated_text,
          success: true,
          audio_url: response.data.audio_url
        }];
        toast.success('Audio generated successfully!');
      } else {
        // Batch synthesis
        setProgress(30);
        const response = await axios.post('/api/batch-synthesize', {
          voice_id: selectedVoice.id,
          texts: textLines,
          language: inputLanguage,
          translate_to: inputTranslateTo,
          source_lang: inputSourceLang
        });
        setProgress(100);

        results = response.data.results;
        const successCount = response.data.results.filter(r => r.success).length;
        toast.success(`Generated ${successCount}/${textLines.length} audio files`);
      }

      // Add assistant response to history
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        results: results,
        voice: selectedVoice.name,
        language: inputLanguage,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [...prev, assistantMessage]);

    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate audio');
      
      // Add error message to history
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        error: error.response?.data?.error || 'Failed to generate audio',
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setSynthesizing(false);
      setProgress(0);
    }
  };

  const downloadAudio = (audioUrl, index = 0, isMultiple = false) => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = isMultiple ? `audio_${index + 1}.wav` : 'generated_audio.wav';
      link.click();
    }
  };

  const downloadAll = (results) => {
    results.filter(r => r.success).forEach((result, idx) => {
      setTimeout(() => {
        downloadAudio(result.audio_url, result.index, true);
      }, idx * 100); // Stagger downloads
    });
    toast.success('Downloading all files...');
  };

  const clearHistory = () => {
    if (window.confirm('Clear all conversation history?')) {
      setHistory([]);
      toast.success('History cleared');
    }
  };

  const lineCount = text.split('\n').filter(t => t.trim()).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
      {/* Voice Selection Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Voice
          </h2>

          {voices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No voices available</p>
              <p className="text-sm mt-2">Add a voice in the Manage Voices tab</p>
            </div>
          ) : (
            <div className="space-y-2">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => onVoiceSelect(voice)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedVoice?.id === voice.id
                      ? 'bg-purple-100 border-2 border-purple-500 text-purple-900'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-gray-500">
                    {voice.language.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Language (Voice)
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
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
              <option value="zh-CN">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="hu">Hungarian</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌐 Translate To
            </label>
            <select
              value={translateTo}
              onChange={(e) => setTranslateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
              <option value="zh-CN">Chinese (Simplified)</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="ur">Urdu</option>
              <option value="vi">Vietnamese</option>
              <option value="th">Thai</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Translate text before synthesis
            </p>
          </div>

          {translateTo !== 'original' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Language
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
                <option value="zh-CN">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
            </div>
          )}

          {history.length > 0 && (
            <>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="mt-4 w-full py-2 px-4 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showHistory ? '💬 Show Chat' : '📜 View Full History'} ({history.length})
              </button>
              <button
                onClick={clearHistory}
                className="mt-2 w-full py-2 px-4 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">
            {showHistory ? '📜 Full History' : '🎤 Voice Synthesis Chat'}
          </h2>
          <p className="text-sm text-purple-100 mt-1">
            {showHistory 
              ? `${history.length} total interactions` 
              : (selectedVoice ? `Using ${selectedVoice.name}` : 'Select a voice to start')}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {history.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-md">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Start a Conversation
                </h3>
                <p className="text-gray-500">
                  Enter your text below and generate speech. Your conversation history will appear here.
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  💡 Tip: Use multiple lines for batch synthesis
                </div>
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
                  {message.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="max-w-3xl">
                        <div className="bg-purple-600 text-white rounded-lg px-4 py-3 shadow">
                          <div className="whitespace-pre-wrap">{message.text}</div>
                          {message.translateTo && (
                            <div className="mt-2 pt-2 border-t border-purple-400 text-xs text-purple-100">
                              🌐 Translating to {message.translateTo.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {message.timestamp} • {message.language.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  )}

                  {message.type === 'assistant' && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl w-full">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-gray-700">
                              🎵 Generated {message.results.length} audio{message.results.length > 1 ? ' files' : ''}
                            </div>
                            {message.results.length > 1 && (
                              <button
                                onClick={() => downloadAll(message.results)}
                                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                              >
                                Download All
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {message.results.map((result) => (
                              <div
                                key={result.index}
                                className={`p-3 rounded-lg ${
                                  result.success
                                    ? 'bg-purple-50 border border-purple-100'
                                    : 'bg-red-50 border border-red-200'
                                }`}
                              >
                                {message.results.length > 1 && (
                                  <div className="text-xs text-gray-600 mb-1 font-medium">
                                    Audio {result.index + 1}: {result.original_text || result.text}
                                  </div>
                                )}
                                {result.translated_text && result.original_text && (
                                  <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                    <div className="font-medium text-blue-800 mb-1">🌐 Translation:</div>
                                    <div className="text-gray-600">
                                      <span className="font-medium">Original:</span> {result.original_text}
                                    </div>
                                    <div className="text-gray-600">
                                      <span className="font-medium">Translated:</span> {result.translated_text}
                                    </div>
                                  </div>
                                )}
                                {result.success ? (
                                  <audio
                                    src={result.audio_url}
                                    controls
                                    className="w-full"
                                  />
                                ) : (
                                  <div className="text-sm text-red-600">
                                    ✗ Failed: {result.error}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp} • {message.voice}
                        </div>
                      </div>
                    </div>
                  )}

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

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSynthesize();
                  }
                }}
                placeholder="Enter text to synthesize... (Shift+Enter for new line, Enter to send)"
                rows={3}
                disabled={synthesizing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-gray-100"
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{text.length} characters</span>
                {lineCount > 1 && (
                  <span className="text-purple-600 font-medium">
                    {lineCount} lines (batch mode)
                  </span>
                )}
              </div>
              {/* Progress Bar */}
              {synthesizing && progress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-1">
                    {progress < 100 ? 'Processing...' : 'Complete!'}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSynthesize}
              disabled={synthesizing || !selectedVoice || !text.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors h-[60px] ${
                synthesizing || !selectedVoice || !text.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {synthesizing ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                lineCount > 1 ? '⚡ Send' : '🎤 Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SynthesisPanel;
