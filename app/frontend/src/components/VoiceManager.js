import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

function VoiceManager({ voices, onVoiceCreated, onVoiceDeleted }) {
  const [uploading, setUploading] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [language, setLanguage] = useState('en');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/*': ['.wav', '.mp3', '.flac', '.m4a']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      const name = voiceName || file.name.replace(/\.[^/.]+$/, '');
      
      await uploadVoice(file, name);
    }
  });

  const uploadVoice = async (file, name) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', name);
    formData.append('language', language);

    try {
      await axios.post('/api/voices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setVoiceName('');
      onVoiceCreated();
    } catch (error) {
      toast.error('Failed to upload voice');
    } finally {
      setUploading(false);
    }
  };

  const deleteVoice = async (voiceId) => {
    if (!window.confirm('Are you sure you want to delete this voice?')) {
      return;
    }

    try {
      await axios.delete(`/api/voices/${voiceId}`);
      onVoiceDeleted(voiceId);
    } catch (error) {
      toast.error('Failed to delete voice');
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Add New Voice
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voice Name
            </label>
            <input
              type="text"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              placeholder="e.g., My Voice, John's Voice"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
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

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                {isDragActive ? (
                  <p className="font-medium text-purple-600">Drop audio file here</p>
                ) : (
                  <>
                    <p>
                      <span className="font-medium text-purple-600 hover:text-purple-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs">WAV, MP3, FLAC up to 100MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {uploading && (
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Uploading voice...</span>
            </div>
          )}
        </div>
      </div>

      {/* Voices List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Voices ({voices.length})
        </h2>

        {voices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="mt-2">No voices yet. Upload your first voice to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{voice.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Language: {voice.language.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Added {new Date(voice.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteVoice(voice.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceManager;
