import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function VoiceDesigner({ voices, onVoiceCreated }) {
  const [prompt, setPrompt] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [generatedVoiceId, setGeneratedVoiceId] = useState(null);

  const examplePrompts = [
    "A warm, friendly female voice with a slight British accent, mid-30s, professional but approachable",
    "Deep, authoritative male voice, American accent, 50s, like a news anchor",
    "Young, energetic female voice with a California accent, early 20s, upbeat and enthusiastic",
    "Calm, soothing male voice, soft British accent, 40s, like a meditation guide",
    "Elderly male voice with a wise tone, slight southern accent, 70s, storyteller quality",
    "Professional female voice, neutral American accent, 35-40s, corporate presentation style"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a voice description');
      return;
    }

    if (!voiceName.trim()) {
      toast.error('Please enter a name for your voice');
      return;
    }

    setGenerating(true);
    setProgress(10);
    setPreviewAudio(null);
    setGeneratedVoiceId(null);

    try {
      setProgress(30);
      const response = await axios.post('/api/voice-design/generate', {
        prompt: prompt,
        voice_name: voiceName
      });

      setProgress(80);
      
      if (response.data.success) {
        setGeneratedVoiceId(response.data.voice_id);
        setPreviewAudio(response.data.preview_url);
        setProgress(100);
        toast.success('Voice generated successfully! Listen to the preview below.');
        if (response.data.note) {
          toast.info(response.data.note, { duration: 5000 });
        }
      } else {
        throw new Error(response.data.error || 'Failed to generate voice');
      }
    } catch (error) {
      console.error('Voice generation error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to generate voice';
      const noteMsg = error.response?.data?.note;
      
      toast.error(errorMsg);
      if (noteMsg) {
        toast.info(noteMsg, { duration: 6000 });
      }
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleSaveVoice = async () => {
    if (!generatedVoiceId) {
      toast.error('No voice to save');
      return;
    }

    try {
      await axios.post('/api/voice-design/save', {
        voice_id: generatedVoiceId,
        voice_name: voiceName
      });

      toast.success(`Voice "${voiceName}" saved successfully!`);
      onVoiceCreated();
      
      // Reset form
      setPrompt('');
      setVoiceName('');
      setPreviewAudio(null);
      setGeneratedVoiceId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save voice');
    }
  };

  const handleReset = () => {
    setPrompt('');
    setVoiceName('');
    setPreviewAudio(null);
    setGeneratedVoiceId(null);
    setProgress(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Design Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🎨 Voice Designer</h2>
              <p className="text-sm text-gray-500 mt-1">
                Create custom AI voices from text descriptions
              </p>
            </div>
            <div className="text-4xl">✨</div>
          </div>

          {/* Warning if no voices exist */}
          {(!voices || voices.length === 0) && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No Base Voices Available
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Voice Designer requires at least one voice in your library to work. 
                    Please go to <strong>"Manage Voices"</strong> and upload a voice sample first.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Voice Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Name
            </label>
            <input
              type="text"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="e.g., Professional Sarah, News Anchor John"
              disabled={generating}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the voice you want to create... Include tone, accent, age, style, and any specific characteristics."
              rows={6}
              disabled={generating}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-gray-100"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>{prompt.length} characters</span>
              <span className="text-purple-600">
                💡 Be specific for better results
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {generating && progress > 0 && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-600">
                  {progress < 30 ? 'Initializing...' : progress < 80 ? 'Generating voice...' : 'Finalizing...'}
                </div>
                <div className="text-sm font-medium text-purple-600">{progress}%</div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {previewAudio && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎧</span>
                  <div>
                    <h3 className="font-semibold text-green-900">Voice Preview Ready</h3>
                    <p className="text-sm text-green-700">Listen to your generated voice</p>
                  </div>
                </div>
              </div>
              <audio 
                controls 
                src={previewAudio}
                className="w-full"
              />
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleSaveVoice}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  💾 Save Voice
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  🔄 Create New
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim() || !voiceName.trim() || !voices || voices.length === 0}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                generating || !prompt.trim() || !voiceName.trim() || !voices || voices.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {generating ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                (!voices || voices.length === 0) ? '⚠️ Upload Voice First' : '✨ Generate Voice'
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={generating}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Example Prompts Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Example Prompts
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click any example to use it as a starting point
          </p>
          <div className="space-y-3">
            {examplePrompts.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(example)}
                disabled={generating}
                className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm text-gray-700 disabled:opacity-50"
              >
                <span className="text-purple-600 font-medium">Example {idx + 1}:</span>
                <p className="mt-1 text-xs">{example}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">
              📝 Tips for Best Results
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Include age range (e.g., "mid-30s")</li>
              <li>• Specify accent (e.g., "British", "American")</li>
              <li>• Describe tone (e.g., "warm", "authoritative")</li>
              <li>• Add style context (e.g., "professional", "casual")</li>
              <li>• Be specific but concise</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 text-sm mb-2">
              ⚠️ Note
            </h4>
            <p className="text-xs text-yellow-800">
              Voice generation uses AI and may take 30-60 seconds. The quality depends on the description clarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceDesigner;
