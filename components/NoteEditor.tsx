
import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

interface NoteEditorProps {
  content: string;
  title: string;
  isLoading: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ content, title, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const highlightText = useCallback((text: string) => {
    if (!searchQuery.trim()) return text;
    
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/60 dark:text-white rounded-sm px-0.5 shadow-sm border-b border-yellow-400 dark:border-yellow-300 transition-colors">{part}</mark> 
        : part
    );
  }, [searchQuery]);

  const components = {
    p: ({ children }: any) => <p className="mb-5 leading-relaxed text-gray-700 dark:text-gray-300">{React.Children.map(children, child => typeof child === 'string' ? highlightText(child) : child)}</p>,
    li: ({ children }: any) => <li className="mb-2 pl-2 border-l-2 border-blue-500/20 dark:border-blue-400/20">{React.Children.map(children, child => typeof child === 'string' ? highlightText(child) : child)}</li>,
    ul: ({ children }: any) => <ul className="list-disc list-outside ml-5 mb-6 space-y-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-outside ml-5 mb-6 space-y-2">{children}</ol>,
    h1: ({ children }: any) => <h1 className="text-3xl font-black mt-10 mb-6 text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-800 pb-3">{React.Children.map(children, child => typeof child === 'string' ? highlightText(child) : child)}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-extrabold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">{React.Children.map(children, child => typeof child === 'string' ? highlightText(child) : child)}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-100">{React.Children.map(children, child => typeof child === 'string' ? highlightText(child) : child)}</h3>,
    strong: ({ children }: any) => (
      <strong className="font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-1 rounded">
        {React.Children.map(children, child => typeof child === 'string' ? highlightText(child) : child)}
      </strong>
    ),
    code: ({ children }: any) => <code className="bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-600">{React.Children.map(children, child => typeof child === 'string' ? highlightText(child) : child)}</code>,
  };

  const SkeletonLoader = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/6"></div>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6"></div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 transition-colors">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 z-10 relative">
        {/* Subtle Linear Progress Bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-100 dark:bg-blue-900/30 overflow-hidden">
            <div className="w-full h-full bg-blue-600 animate-progress-slide"></div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="truncate max-w-md">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate">
              {title || "Select a chapter"}
            </h1>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 uppercase tracking-[0.2em] font-black">AI Study Assistant</p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/40 rounded-md border border-blue-100 dark:border-blue-800">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Synthesizing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-blue-500 transition-colors"></i>
            <input
              type="text"
              placeholder="Find in notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm text-gray-700 dark:text-gray-200 outline-none w-full sm:w-64 transition-all"
            />
          </div>
          <button
            onClick={handleCopy}
            disabled={!content || isLoading}
            title="Copy notes to clipboard"
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              copied 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' 
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-95'
            }`}
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-8 overflow-hidden relative">
        <div className="h-full w-full bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-inner overflow-y-auto p-6 sm:p-12 custom-scrollbar relative">
          {isLoading ? (
            <SkeletonLoader />
          ) : content ? (
            <div className="max-w-3xl mx-auto animate-zoom-entrance">
               <ReactMarkdown components={components as any}>
                 {content}
               </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 opacity-60 animate-zoom-entrance">
              <div className="w-20 h-20 mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <i className="fas fa-book-open text-4xl"></i>
              </div>
              <p className="text-xl font-bold tracking-tight">Workspace Ready</p>
              <p className="text-sm mt-1">Select a section from the index to generate smart notes</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-slide {
          animation: progress-slide 1.5s infinite linear;
        }
      `}</style>
    </main>
  );
};

export default NoteEditor;
