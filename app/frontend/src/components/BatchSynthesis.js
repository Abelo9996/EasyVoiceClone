import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function BatchSynthesis({ voices, selectedVoice, onVoiceSelect }) {
  const [texts, setTexts] = useState('');
  const [language, setLanguage] = useState('en');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  const handleBatchSynthesize = async () => {
    if (!selectedVoice) {
      toast.error('Please select a voice first');
      return;
    }

    const textList = texts
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (textList.length === 0) {
      toast.error('Please enter at least one line of text');
      return;
    }

    setProcessing(true);
    setResults([]);

    try {
      const response = await axios.post('/api/batch-synthesize', {
        voice_id: selectedVoice.id,
        texts: textList,
        language: language
      });

      setResults(response.data.results);
      
      const successCount = response.data.results.filter(r => r.success).length;
      toast.success(`Generated ${successCount}/${textList.length} audio files`);
    } catch (error) {
      toast.error('Batch synthesis failed');
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = () => {
    results.filter(r => r.success).forEach(result => {
      const link = document.createElement('a');
      link.href = result.audio_url;
      link.download = `audio_${result.index + 1}.wav`;
      link.click();
    });
    toast.success('Downloading all files...');
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

      {/* Batch Processing Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Batch Text Processing
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Lines (one per line)
              </label>
              <textarea
                value={texts}
                onChange={(e) => setTexts(e.target.value)}
                placeholder="Enter each text on a new line:&#10;Line 1: Hello world&#10;Line 2: This is a test&#10;Line 3: Another example"
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <div className="mt-1 text-sm text-gray-500">
                {texts.split('\n').filter(t => t.trim()).length} lines
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
              </select>
            </div>

            <button
              onClick={handleBatchSynthesize}
              disabled={processing || !selectedVoice}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                processing || !selectedVoice
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {processing ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : (
                '⚡ Generate All'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Results ({results.filter(r => r.success).length}/{results.length})
              </h2>
              <button
                onClick={downloadAll}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Download All
              </button>
            </div>

            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Line {result.index + 1}
                        </span>
                        {result.success ? (
                          <span className="text-green-600 text-xs">✓ Success</span>
                        ) : (
                          <span className="text-red-600 text-xs">✗ Failed</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {result.text}
                      </p>
                      {result.success && (
                        <audio
                          src={result.audio_url}
                          controls
                          className="w-full mt-2"
                        />
                      )}
                      {!result.success && result.error && (
                        <p className="text-xs text-red-600 mt-1">{result.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BatchSynthesis;
