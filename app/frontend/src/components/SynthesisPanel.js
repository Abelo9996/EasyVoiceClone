import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function SynthesisPanel({ voices, selectedVoice, onVoiceSelect }) {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  const handleSynthesize = async () => {
    if (!selectedVoice) {
      toast.error('Please select a voice first');
      return;
    }

    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setSynthesizing(true);
    setAudioUrl(null);

    try {
      const response = await axios.post('/api/synthesize', {
        voice_id: selectedVoice.id,
        text: text,
        language: language
      });

      const newAudioUrl = response.data.audio_url;
      setAudioUrl(newAudioUrl);
      toast.success('Audio generated successfully!');

      // Auto-play
      if (audioElement) {
        audioElement.src = newAudioUrl;
        audioElement.play();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate audio');
    } finally {
      setSynthesizing(false);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'generated_audio.wav';
      link.click();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Voice Selection */}
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
        </div>
      </div>

      {/* Synthesis Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Generate Speech
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text to Synthesize
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="mt-1 text-sm text-gray-500">
                {text.length} characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <option value="zh-cn">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="hu">Hungarian</option>
              </select>
            </div>

            <button
              onClick={handleSynthesize}
              disabled={synthesizing || !selectedVoice}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                synthesizing || !selectedVoice
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {synthesizing ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </span>
              ) : (
                '🎤 Generate Speech'
              )}
            </button>

            {audioUrl && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Generated Audio</h3>
                  <button
                    onClick={downloadAudio}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    Download
                  </button>
                </div>
                <audio
                  ref={setAudioElement}
                  src={audioUrl}
                  controls
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SynthesisPanel;
