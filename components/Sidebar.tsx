
import React, { useState, useMemo } from 'react';
import { Section } from '../types';

interface SidebarProps {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ sections, selectedId, onSelect, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    return sections.filter(
      (section) =>
        section.title.toLowerCase().includes(term) ||
        section.summary.toLowerCase().includes(term)
    );
  }, [sections, searchTerm]);

  return (
    <aside className="w-full md:w-80 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <i className="fas fa-list-ul text-blue-500"></i>
          Index
        </h2>

        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <i className={`fas fa-search text-xs transition-colors ${searchTerm ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}></i>
          </div>
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <i className="fas fa-times-circle text-xs"></i>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-transparent">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg mt-0.5"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Analyzing Document Structure...
                </p>
              </div>
            </div>
          </div>
        ) : filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSelect(section.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-95 group relative overflow-hidden ${
                selectedId === section.id
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-800'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm border border-gray-100 dark:border-gray-600'
              }`}
              aria-pressed={selectedId === section.id}
            >
              <div className="flex items-start gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-md mt-0.5 ${
                  selectedId === section.id ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {sections.indexOf(section) + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">{section.title}</h3>
                  <p className={`text-[10px] mt-1 line-clamp-2 leading-relaxed opacity-70`}>
                    {section.summary}
                  </p>
                </div>
              </div>
              {selectedId === section.id && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <i className="fas fa-chevron-right text-blue-200 animate-pulse"></i>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <i className={`fas ${searchTerm ? 'fa-search-minus' : 'fa-file-import'} text-4xl mb-3 opacity-20`}></i>
            <p className="text-sm">
              {searchTerm ? `No results for "${searchTerm}"` : 'Upload a document to see the index'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
