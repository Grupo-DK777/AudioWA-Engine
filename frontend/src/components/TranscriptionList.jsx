import { useEffect, useState } from 'react';
import { RefreshCw, FileText, Globe, Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api';

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const icons = {
    PENDING: <Clock size={14} className="mr-1" />,
    PROCESSING: <Loader2 size={14} className="mr-1 animate-spin" />,
    COMPLETED: <CheckCircle size={14} className="mr-1" />,
    FAILED: <XCircle size={14} className="mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export default function TranscriptionList({ refreshTrigger }) {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchTranscriptions = async () => {
    try {
      const response = await api.get('/transcriptions');
      setTranscriptions(response.data);
    } catch (error) {
      console.error('Error fetching transcriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
    const interval = setInterval(fetchTranscriptions, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && transcriptions.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Historial de Transcripciones</h2>
        <button
          onClick={fetchTranscriptions}
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          title="Actualizar lista"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {transcriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No hay transcripciones aún.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transcriptions.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm transition-all duration-200 overflow-hidden ${
                expandedId === item.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {item.originalFilename}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {expandedId === item.id && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700 mt-2 bg-gray-50/50 dark:bg-gray-800/50">
                   <div className="pt-4 space-y-4">
                    {item.errorMessage ? (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{item.errorMessage}</span>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            <FileText size={12} className="mr-1" /> Transcripción
                            {item.detectedLanguage && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                {item.detectedLanguage}
                              </span>
                            )}
                          </h4>
                          <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {item.transcription || 'Esperando resultado...'}
                          </div>
                        </div>

                        {item.translatedText && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                              <Globe size={12} className="mr-1" /> Traducción
                            </h4>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                              {item.translatedText}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
