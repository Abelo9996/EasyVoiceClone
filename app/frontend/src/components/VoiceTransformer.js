import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

function VoiceTransformer({ voices }) {
  const [sourceAudio, setSourceAudio] = useState(null);
  const [targetVoiceId, setTargetVoiceId] = useState('');
  const [transformedAudio, setTransformedAudio] = useState(null);
  const [transforming, setTransforming] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Tone and emotion controls
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [emotion, setEmotion] = useState('neutral');
  const [intensity, setIntensity] = useState(0.5);
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('voiceTransformHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  
  const chatEndRef = useRef(null);

  // Save history to localStorage
  React.useEffect(() => {
    localStorage.setItem('voiceTransformHistory', JSON.stringify(history));
  }, [history]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const emotions = [
    { value: 'neutral', label: '😐 Neutral', description: 'Standard tone' },
    { value: 'happy', label: '😊 Happy', description: 'Upbeat and cheerful' },
    { value: 'sad', label: '😢 Sad', description: 'Melancholic and somber' },
    { value: 'angry', label: '😠 Angry', description: 'Intense and forceful' },
    { value: 'excited', label: '🤩 Excited', description: 'Energetic and enthusiastic' },
    { value: 'calm', label: '😌 Calm', description: 'Peaceful and soothing' },
    { value: 'serious', label: '🧐 Serious', description: 'Professional and formal' }
  ];

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type.startsWith('audio/')) {
        setSourceAudio(file);
        setTransformedAudio(null);
        toast.success(`Audio file "${file.name}" loaded`);
      } else {
        toast.error('Please upload an audio file (WAV, MP3, etc.)');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.m4a', '.ogg', '.flac']
    },
    multiple: false,
    disabled: transforming
  });

  const handleTransform = async () => {
    if (!sourceAudio) {
      toast.error('Please upload a source audio file');
      return;
    }

    if (!targetVoiceId) {
      toast.error('Please select a target voice');
      return;
    }

    setTransforming(true);
    setProgress(10);
    setTransformedAudio(null);

    // Add to history - request
    const requestMessage = {
      id: Date.now(),
      type: 'user',
      sourceFile: sourceAudio.name,
      targetVoice: voices.find(v => v.id === targetVoiceId)?.name,
      speed,
      pitch,
      emotion,
      intensity,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [...prev, requestMessage]);

    try {
      setProgress(30);
      
      const formData = new FormData();
      formData.append('source_audio', sourceAudio);
      formData.append('target_voice_id', targetVoiceId);
      formData.append('speed', speed);
      formData.append('pitch', pitch);
      formData.append('emotion', emotion);
      formData.append('intensity', intensity);

      setProgress(60);
      
      const response = await axios.post('/api/voice-transform', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProgress(90);

      if (response.data.success) {
        setTransformedAudio(response.data.audio_url);
        setProgress(100);
        
        // Add to history - response
        const responseMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          audioUrl: response.data.audio_url,
          originalDuration: response.data.original_duration,
          transformedDuration: response.data.transformed_duration,
          settings: {
            speed,
            pitch,
            emotion,
            intensity
          },
          timestamp: new Date().toLocaleTimeString()
        };
        setHistory(prev => [...prev, responseMessage]);
        
        toast.success('Voice transformation complete!');
      } else {
        throw new Error(response.data.error || 'Transformation failed');
      }
    } catch (error) {
      console.error('Transformation error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to transform voice';
      toast.error(errorMsg);
      
      // Add error to history
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        error: errorMsg,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setTransforming(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleReset = () => {
    setSourceAudio(null);
    setTransformedAudio(null);
    setSpeed(1.0);
    setPitch(1.0);
    setEmotion('neutral');
    setIntensity(0.5);
    setProgress(0);
  };

  const clearHistory = () => {
    if (window.confirm('Clear all transformation history?')) {
      setHistory([]);
      toast.success('History cleared');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Control Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎛️ Transform Controls
          </h2>

          {/* Target Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Voice
            </label>
            <select
              value={targetVoiceId}
              onChange={(e) => setTargetVoiceId(e.target.value)}
              disabled={transforming}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
            >
              <option value="">Select voice...</option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.language})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Voice to transform into
            </p>
          </div>

          {/* Speed Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              disabled={transforming}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pitch: {pitch.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              disabled={transforming}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lower</span>
              <span>Higher</span>
            </div>
          </div>

          {/* Emotion Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emotion
            </label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              disabled={transforming}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
            >
              {emotions.map((emo) => (
                <option key={emo.value} value={emo.value}>
                  {emo.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {emotions.find(e => e.value === emotion)?.description}
            </p>
          </div>

          {/* Intensity Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emotion Intensity: {Math.round(intensity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              disabled={transforming}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Subtle</span>
              <span>Strong</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={transforming}
            className="w-full py-2 px-4 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            🔄 Reset Controls
          </button>

          {/* History Toggle */}
          {history.length > 0 && (
            <>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full py-2 px-4 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showHistory ? '🎙️ Show Transform' : '📜 View History'} ({history.length})
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

      {/* Main Transform Area */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">
            {showHistory ? '📜 Transformation History' : '🎤 Voice Transformer'}
          </h2>
          <p className="text-sm text-indigo-100 mt-1">
            {showHistory 
              ? `${history.length} total transformations` 
              : 'Convert one voice to another with emotion control'}
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {showHistory ? (
            /* History View */
            <div className="space-y-4">
              {history.slice().reverse().map((item) => (
                <div key={item.id}>
                  {item.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="max-w-3xl">
                        <div className="bg-indigo-600 text-white rounded-lg px-4 py-3 shadow">
                          <div className="font-medium">🎤 Transform Request</div>
                          <div className="text-sm mt-2">
                            <p><strong>Source:</strong> {item.sourceFile}</p>
                            <p><strong>Target Voice:</strong> {item.targetVoice}</p>
                            <p><strong>Speed:</strong> {item.speed}x | <strong>Pitch:</strong> {item.pitch}x</p>
                            <p><strong>Emotion:</strong> {emotions.find(e => e.value === item.emotion)?.label}</p>
                            <p><strong>Intensity:</strong> {Math.round(item.intensity * 100)}%</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          {item.timestamp}
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'assistant' && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl w-full">
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow">
                          <div className="font-medium text-green-800 mb-2">✅ Transformation Complete</div>
                          <audio controls src={item.audioUrl} className="w-full mb-2" />
                          <div className="text-xs text-gray-600">
                            <p>Original: {item.originalDuration}s → Transformed: {item.transformedDuration}s</p>
                            <p className="mt-1">
                              Applied: {emotions.find(e => e.value === item.settings.emotion)?.label} 
                              ({Math.round(item.settings.intensity * 100)}% intensity)
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.timestamp}
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'error' && (
                    <div className="flex justify-start">
                      <div className="max-w-3xl">
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 shadow">
                          <div className="font-medium">❌ Error</div>
                          <div className="text-sm mt-1">{item.error}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.timestamp}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          ) : (
            /* Transform View */
            <div className="space-y-6">
              {/* Warning if no voices */}
              {(!voices || voices.length === 0) && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">No Target Voices Available</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Please go to <strong>"Manage Voices"</strong> and upload at least one voice to use as a transformation target.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400'
                } ${transforming ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-3">
                  <svg className="h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M24 8v24m0 0l-8-8m8 8l8-8M8 36h32" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    {sourceAudio ? (
                      <div>
                        <p className="text-green-600 font-medium">✅ {sourceAudio.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Size: {(sourceAudio.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 font-medium">Drop your audio file here or click to browse</p>
                        <p className="text-sm text-gray-400 mt-1">WAV, MP3, M4A, OGG, FLAC supported</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Source Audio Preview */}
              {sourceAudio && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">🎵 Source Audio</h3>
                  <audio 
                    controls 
                    src={URL.createObjectURL(sourceAudio)}
                    className="w-full"
                  />
                </div>
              )}

              {/* Progress Bar */}
              {transforming && progress > 0 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-600">
                      {progress < 30 ? 'Uploading...' : progress < 60 ? 'Processing audio...' : progress < 90 ? 'Transforming voice...' : 'Finalizing...'}
                    </div>
                    <div className="text-sm font-medium text-indigo-600">{progress}%</div>
                  </div>
                </div>
              )}

              {/* Transformed Audio Result */}
              {transformedAudio && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🎧</span>
                      <div>
                        <h3 className="font-semibold text-green-900">Transformed Voice</h3>
                        <p className="text-sm text-green-700">Your voice transformation is ready!</p>
                      </div>
                    </div>
                  </div>
                  <audio 
                    controls 
                    src={transformedAudio}
                    className="w-full"
                  />
                  <div className="mt-3 flex space-x-3">
                    <a
                      href={transformedAudio}
                      download="transformed_voice.wav"
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                    >
                      💾 Download
                    </a>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      🔄 Transform Another
                    </button>
                  </div>
                </div>
              )}

              {/* Transform Button */}
              <button
                onClick={handleTransform}
                disabled={transforming || !sourceAudio || !targetVoiceId || !voices || voices.length === 0}
                className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-colors ${
                  transforming || !sourceAudio || !targetVoiceId || !voices || voices.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                }`}
              >
                {transforming ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Transforming...</span>
                  </div>
                ) : (
                  '🎭 Transform Voice'
                )}
              </button>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 How It Works</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Upload your source audio file</li>
                  <li>• Select a target voice from your library</li>
                  <li>• Adjust speed, pitch, emotion, and intensity</li>
                  <li>• Transform and download the result</li>
                  <li>• All transformations are saved in history</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceTransformer;
