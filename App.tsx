
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import { AppState, Section, LoadingState, FileData } from './types';
import { analyzeDocument, generateSectionNotes } from './geminiService';

const STORAGE_KEY = 'noteorbit_session';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
        file: null,
        sections: [],
        selectedSectionId: null,
        notes: {},
        isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      };
    } catch (e) {
      return {
        file: null,
        sections: [],
        selectedSectionId: null,
        notes: {},
        isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      };
    }
  });

  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  // Auto-hide error after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, JPG, or PNG image.");
      return;
    }

    setLoading(LoadingState.ANALYZING);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const fileData: FileData = { name: file.name, type: file.type, base64 };

      try {
        const sections = await analyzeDocument(fileData);
        setState(prev => ({
          ...prev,
          file: fileData,
          sections,
          selectedSectionId: null,
          notes: {}
        }));
        setLoading(LoadingState.IDLE);
      } catch (err: any) {
        setError(err.message);
        setLoading(LoadingState.IDLE);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setLoading(LoadingState.IDLE);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSection = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, selectedSectionId: id }));
    
    if (state.notes[id] || !state.file) return;

    setLoading(LoadingState.GENERATING_NOTES);
    setError(null);

    try {
      const section = state.sections.find(s => s.id === id);
      if (section) {
        const generatedNotes = await generateSectionNotes(state.file, section);
        setState(prev => ({
          ...prev,
          notes: { ...prev.notes, [id]: generatedNotes }
        }));
      }
      setLoading(LoadingState.IDLE);
    } catch (err: any) {
      setError(err.message);
      setLoading(LoadingState.IDLE);
    }
  }, [state.file, state.sections, state.notes]);

  const toggleTheme = () => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  
  const resetApp = () => {
    setState({
      file: null,
      sections: [],
      selectedSectionId: null,
      notes: {},
      isDarkMode: state.isDarkMode
    });
    setError(null);
    setLoading(LoadingState.IDLE);
  };

  const selectedSection = state.sections.find(s => s.id === state.selectedSectionId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-700">
      <Header 
        isDarkMode={state.isDarkMode} 
        onToggleTheme={toggleTheme} 
        onReset={resetApp}
        file={state.file}
      />

      {error && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-in slide-in-from-right duration-300">
          <div className="bg-white dark:bg-gray-800 border-l-4 border-red-500 p-5 rounded-2xl shadow-2xl flex items-start gap-4 ring-1 ring-black/5">
            <div className="flex-shrink-0 mt-0.5">
              <i className="fas fa-circle-exclamation text-red-500 text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Analysis Failed</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        {!state.file ? (
          <div 
            key="upload-view"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 animate-zoom-entrance"
          >
            <div className="max-w-xl w-full text-center space-y-12">
              <div className="relative inline-block">
                <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-full blur-[60px] animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-900 p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-gray-800">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-blue-600/20 mx-auto mb-8 transform -rotate-6">
                    <i className="fas fa-brain-circuit"></i>
                  </div>
                  <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-none">
                    Smart Notes, <br/><span className="text-blue-600">Zero Effort.</span>
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
                    Upload textbooks or research papers. Our AI maps the structure and crafts human-like study guides instantly.
                  </p>
                  
                  <div className="mt-12">
                    <label className="cursor-pointer group block">
                      <div className="flex flex-col items-center justify-center py-10 px-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl group-hover:border-blue-500 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-all duration-300">
                        <i className="fas fa-plus-circle text-4xl text-gray-300 group-hover:text-blue-500 mb-4 transform group-hover:scale-110 transition-transform"></i>
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                          {loading === LoadingState.ANALYZING ? 'Processing Document...' : 'Select Document (PDF/Image)'}
                        </span>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">Max 20MB • PDF, JPG, PNG</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,image/jpeg,image/png" 
                        onChange={handleFileUpload} 
                        disabled={loading !== LoadingState.IDLE}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                <div className="flex flex-col items-center gap-3 p-4 bg-white/40 dark:bg-gray-800/20 rounded-2xl backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <i className="fas fa-microchip"></i>
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Gemini 3 Pro Engine</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 bg-white/40 dark:bg-gray-800/20 rounded-2xl backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Auto-Indexed Layers</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 bg-white/40 dark:bg-gray-800/20 rounded-2xl backdrop-blur-sm border border-white/20">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <i className="fas fa-highlighter"></i>
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Smart Highlighting</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            key="notes-view"
            className="absolute inset-0 flex flex-col md:flex-row overflow-hidden animate-zoom-entrance"
          >
            <Sidebar 
              sections={state.sections} 
              selectedId={state.selectedSectionId} 
              onSelect={handleSelectSection}
              isLoading={loading === LoadingState.ANALYZING}
            />
            <NoteEditor 
              content={state.selectedSectionId ? (state.notes[state.selectedSectionId] || '') : ''} 
              title={selectedSection?.title || 'Study Session'}
              isLoading={loading === LoadingState.GENERATING_NOTES}
            />
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.2);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        @keyframes zoom-entrance {
          0% {
            opacity: 0;
            transform: scale(1.08);
            filter: blur(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        .animate-zoom-entrance {
          animation: zoom-entrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity, filter;
        }
      `}</style>
    </div>
  );
};

export default App;
