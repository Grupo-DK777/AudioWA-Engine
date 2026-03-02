import { useState } from 'react';
import { Layout, Headphones } from 'lucide-react';
import UploadForm from './components/UploadForm';
import TranscriptionList from './components/TranscriptionList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg">
              <Headphones size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AudioWA Engine
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-sm font-medium hover:text-blue-600 transition-colors">Dashboard</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">Documentación</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Transcribe tus audios
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Sube tus notas de voz de WhatsApp y obtén transcripciones precisas impulsadas por IA en segundos.
            </p>
          </div>
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <TranscriptionList refreshTrigger={refreshTrigger} />
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AudioWA Engine. Powered by OpenAI & BullMQ.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
