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

  useEffect(() => {
    loadVoices();
  }, []);

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
