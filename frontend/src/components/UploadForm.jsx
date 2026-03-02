import { useState, useRef } from 'react';
import { Upload, FileAudio, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

export default function UploadForm({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/webm'];
    if (validTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(mp3|wav|ogg|webm)$/i)) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Formato de archivo no soportado. Usa MP3, WAV, OGG o WEBM.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);
    // Optional: add target language selector if needed
    // formData.append('targetLanguage', 'es');

    try {
      await api.post('/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      setError('Error al subir el archivo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center justify-center text-center">
          {file ? (
            <div className="flex items-center space-x-3 text-green-600 dark:text-green-400 mb-4">
              <FileAudio size={48} />
              <div className="text-left">
                <p className="font-medium text-lg">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                Arrastra tu audio aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Soporta MP3, WAV, OGG, WEBM (Max 25MB)
              </p>
            </>
          )}

          {error && (
            <div className="mt-4 flex items-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            {file ? (
              <>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Transcribir
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
              >
                Seleccionar archivo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
