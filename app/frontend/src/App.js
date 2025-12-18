import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import VoiceManager from './components/VoiceManager';
import SynthesisPanel from './components/SynthesisPanel';
import PdfReaderChat from './components/PdfReaderChat';
import VoiceDesigner from './components/VoiceDesigner';
import VoiceTransformer from './components/VoiceTransformer';

function App() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [activeTab, setActiveTab] = useState('synthesis'); // synthesis, pdf, voices
  const [loading, setLoading] = useState(false);
  const [starCount, setStarCount] = useState(null);

  useEffect(() => {
    loadVoices();
    loadGitHubStars();
  }, []);

  const loadGitHubStars = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/Abelo9996/EasyVoiceClone');
      const data = await response.json();
      setStarCount(data.stargazers_count);
    } catch (error) {
      console.error('Failed to load GitHub stars:', error);
      setStarCount(0);
    }
  };

  const loadVoices = async () => {
    try {
      const response = await axios.get('/api/voices');
      setVoices(response.data.voices);
      if (response.data.voices.length > 0 && !selectedVoice) {
        setSelectedVoice(response.data.voices[0]);
      }
    } catch (error) {
      toast.error('Failed to load voices');
    }
  };

  const handleVoiceCreated = () => {
    loadVoices();
    toast.success('Voice added successfully!');
  };

  const handleVoiceDeleted = (voiceId) => {
    if (selectedVoice && selectedVoice.id === voiceId) {
      setSelectedVoice(null);
    }
    loadVoices();
    toast.success('Voice deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🎙️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Easy Voice Clone
                </h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Voice Synthesis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* GitHub Star Button */}
              <a
                href="https://github.com/Abelo9996/EasyVoiceClone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg group"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="mr-1">Star</span>
                {starCount !== null && (
                  <span className="mx-1 px-2 py-0.5 bg-gray-800 rounded-md text-xs font-semibold">
                    {starCount.toLocaleString()}
                  </span>
                )}
                <svg
                  className="w-4 h-4 text-yellow-300 group-hover:text-yellow-200 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </a>
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('synthesis')}
              className={`${
                activeTab === 'synthesis'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              🎤 Synthesize
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`${
                activeTab === 'pdf'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              📚 PDF Reader
            </button>
            <button
              onClick={() => setActiveTab('designer')}
              className={`${
                activeTab === 'designer'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              🎨 Voice Designer
            </button>
            <button
              onClick={() => setActiveTab('transformer')}
              className={`${
                activeTab === 'transformer'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              🎭 Voice Transform
            </button>
            <button
              onClick={() => setActiveTab('voices')}
              className={`${
                activeTab === 'voices'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Manage Voices ({voices.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'synthesis' && (
          <SynthesisPanel
            voices={voices}
            selectedVoice={selectedVoice}
            onVoiceSelect={setSelectedVoice}
          />
        )}
        
        {activeTab === 'pdf' && (
          <PdfReaderChat
            voices={voices}
            onVoicesUpdate={loadVoices}
          />
        )}
        
        {activeTab === 'designer' && (
          <VoiceDesigner
            voices={voices}
            onVoiceCreated={handleVoiceCreated}
          />
        )}
        
        {activeTab === 'transformer' && (
          <VoiceTransformer
            voices={voices}
          />
        )}
        
        {activeTab === 'voices' && (
          <VoiceManager
            voices={voices}
            onVoiceCreated={handleVoiceCreated}
            onVoiceDeleted={handleVoiceDeleted}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>Made with ❤️ by Abel Yagubyan • Powered by Coqui XTTS-v2</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
