
import React from 'react';
import { FileData } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onReset: () => void;
  file: FileData | null;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme, onReset, file }) => {
  const handleDownload = () => {
    if (!file) return;
    const link = document.createElement('a');
    link.href = file.base64;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onReset}
          className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-md">N</span>
          <span className="tracking-tight italic font-serif">NoteOrbit</span>
        </button>
        {file && (
          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            <i className="fas fa-file-alt text-blue-500"></i>
            <span className="truncate max-w-[200px] font-medium">{file.name}</span>
            <button 
              onClick={handleDownload}
              title="Download original file"
              className="ml-2 w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-600 rounded-full shadow-sm text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500 hover:text-blue-700 dark:hover:text-white transition-all"
            >
              <i className="fas fa-download text-[10px]"></i>
            </button>
            <div className="w-px h-3 bg-gray-300 dark:bg-gray-500 mx-1"></div>
            <button onClick={onReset} className="hover:text-red-500 transition-colors" title="Close document">
              <i className="fas fa-times-circle"></i>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-sm border border-gray-200 dark:border-gray-600"
          aria-label="Toggle Theme"
        >
          <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-blue-600'}`}></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
