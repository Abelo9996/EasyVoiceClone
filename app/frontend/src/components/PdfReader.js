import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

function PdfReader({ voices, onVoicesUpdate }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [language, setLanguage] = useState('en');
  const [synthesizing, setSynthesizing] = useState(false);
  const [audioResults, setAudioResults] = useState([]);
  const [chunkMethod, setChunkMethod] = useState('sentences');
  const [maxChars, setMaxChars] = useState(500);
  const [languages, setLanguages] = useState([]);
  const [selectedChunks, setSelectedChunks] = useState([]);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('/api/languages');
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setExtractedData(null);
        setAudioResults([]);
        toast.success(`PDF loaded: ${file.name}`);
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
    multiple: false
  });

  const extractPdf = async () => {
    if (!pdfFile) {
      toast.error('Please upload a PDF file first');
      return;
    }

    setExtracting(true);
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('chunk_method', chunkMethod);
    formData.append('max_chars', maxChars);

    try {
      const response = await axios.post('/api/pdf/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setExtractedData(response.data);
      setSelectedChunks(response.data.chunks.map((_, idx) => idx)); // Select all by default
      toast.success(`Extracted ${response.data.total_chunks} chunks from PDF`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to extract PDF');
    } finally {
      setExtracting(false);
    }
  };

  const synthesizePdf = async () => {
    if (!selectedVoice) {
      toast.error('Please select a voice');
      return;
    }

    if (!extractedData || selectedChunks.length === 0) {
      toast.error('Please extract PDF and select chunks first');
      return;
    }

    setSynthesizing(true);
    
    // Only synthesize selected chunks
    const chunksToSynthesize = selectedChunks.map(idx => extractedData.chunks[idx]);

    try {
      const response = await axios.post('/api/pdf/synthesize', {
        voice_id: selectedVoice,
        chunks: chunksToSynthesize,
        language: language
      });

      setAudioResults(response.data.results);
      toast.success(`Generated ${response.data.successful} audio files`);
      
      if (response.data.failed > 0) {
        toast.error(`Failed to generate ${response.data.failed} audio files`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to synthesize PDF');
    } finally {
      setSynthesizing(false);
    }
  };

  const toggleChunkSelection = (idx) => {
    setSelectedChunks(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx].sort((a, b) => a - b);
      }
    });
  };

  const selectAllChunks = () => {
    if (extractedData) {
      setSelectedChunks(extractedData.chunks.map((_, idx) => idx));
    }
  };

  const deselectAllChunks = () => {
    setSelectedChunks([]);
  };

  const downloadAllAudio = () => {
    audioResults.forEach((result, idx) => {
      if (result.success) {
        setTimeout(() => {
          window.open(`http://localhost:5000${result.audio_url}`, '_blank');
        }, idx * 500); // Stagger downloads
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* PDF Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📚 PDF Book Reader</h2>
        <p className="text-gray-600 mb-4">
          Upload a PDF book or document, and convert it to audio in your custom voice.
          Perfect for creating audiobooks!
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {pdfFile ? (
              <p className="text-green-600 font-medium">📄 {pdfFile.name}</p>
            ) : (
              <>
                <p className="text-gray-600">Drop a PDF file here, or click to browse</p>
                <p className="text-sm text-gray-400">PDF files only</p>
              </>
            )}
          </div>
        </div>

        {/* Chunking Options */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chunking Method
            </label>
            <select
              value={chunkMethod}
              onChange={(e) => setChunkMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sentences">By Sentences (Recommended)</option>
              <option value="paragraphs">By Paragraphs</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Sentences: Better for consistent audio length<br/>
              Paragraphs: Better for maintaining context
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Characters per Chunk
            </label>
            <input
              type="number"
              value={maxChars}
              onChange={(e) => setMaxChars(parseInt(e.target.value))}
              min="200"
              max="1000"
              step="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              ~500 chars = 30-60 seconds of audio
            </p>
          </div>
        </div>

        <button
          onClick={extractPdf}
          disabled={!pdfFile || extracting}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {extracting ? '📖 Extracting Text...' : '📖 Extract & Chunk Text'}
        </button>
      </div>

      {/* Extracted Chunks */}
      {extractedData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Extracted Chunks ({extractedData.total_chunks})
            </h3>
            <div className="space-x-2">
              <button
                onClick={selectAllChunks}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Select All
              </button>
              <button
                onClick={deselectAllChunks}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Characters:</span>
                <span className="ml-2 font-semibold">{extractedData.total_chars.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Chunks:</span>
                <span className="ml-2 font-semibold">{extractedData.total_chunks}</span>
              </div>
              <div>
                <span className="text-gray-600">Avg Chunk Size:</span>
                <span className="ml-2 font-semibold">{extractedData.avg_chunk_size} chars</span>
              </div>
              <div>
                <span className="text-gray-600">Selected:</span>
                <span className="ml-2 font-semibold text-blue-600">{selectedChunks.length} chunks</span>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {extractedData.chunks.map((chunk, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  selectedChunks.includes(idx)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleChunkSelection(idx)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedChunks.includes(idx)}
                    onChange={() => toggleChunkSelection(idx)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-500">
                        Chunk {idx + 1}
                      </span>
                      <span className="text-xs text-gray-400">
                        {chunk.length} characters
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{chunk}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthesis Section */}
      {extractedData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">🎙️ Convert to Audio</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a voice...</option>
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.language})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={synthesizePdf}
            disabled={!selectedVoice || synthesizing || selectedChunks.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {synthesizing
              ? '🎵 Generating Audio...'
              : `🎵 Generate Audio for ${selectedChunks.length} Chunks`}
          </button>
        </div>
      )}

      {/* Audio Results */}
      {audioResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Generated Audio ({audioResults.filter(r => r.success).length}/{audioResults.length})
            </h3>
            <button
              onClick={downloadAllAudio}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              📥 Download All
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {audioResults.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Chunk {result.index + 1}
                      </span>
                      {result.success && (
                        <span className="ml-2 text-xs text-green-600">✓ Success</span>
                      )}
                      {!result.success && (
                        <span className="ml-2 text-xs text-red-600">✗ Failed</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.chunk}</p>
                    {result.success && (
                      <audio controls className="w-full mt-2">
                        <source src={`http://localhost:5000${result.audio_url}`} type="audio/wav" />
                      </audio>
                    )}
                    {!result.success && (
                      <p className="text-sm text-red-600">Error: {result.error}</p>
                    )}
                  </div>
                  {result.success && (
                    <a
                      href={`http://localhost:5000${result.audio_url}`}
                      download
                      className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      💾
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PdfReader;
