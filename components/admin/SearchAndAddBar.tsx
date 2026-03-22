import React, { useState } from 'react';
import { Search, X, Plus, Info } from 'lucide-react';

interface SearchAndAddBarProps {
  onSearch: (query: string) => void;
  onAdd: () => void;
}

const SearchAndAddBar: React.FC<SearchAndAddBarProps> = ({ onSearch, onAdd }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (val: string) => {
    setQuery(val);
    onSearch(val.trim());
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-8">
      {/* Search Input Container */}
      <div className="relative flex-1 group">
        <div className={`relative flex items-center bg-white border-2 rounded-2xl transition-all duration-300 ${isFocused ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg' : 'border-slate-200 shadow-sm'}`}>
          <Search className={`ml-4 w-5 h-5 transition-colors ${isFocused ? 'text-indigo-600' : 'text-slate-400'}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Cari kata kunci soal, mata pelajaran, atau ID..."
            className="w-full px-4 py-4 bg-transparent focus:outline-none text-slate-700 font-medium placeholder-slate-400"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="mr-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Integrated Tooltip below input */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[120] bg-slate-900 text-white text-[11px] sm:text-xs rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-indigo-500 rounded-lg shrink-0">
                <Info className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="font-black uppercase tracking-widest text-indigo-400 mb-1">Tips Pencarian:</p>
                <p className="text-slate-300 leading-relaxed">
                  Cari berdasarkan <span className="text-white font-bold">teks soal</span>, 
                  <span className="text-white font-bold ml-1">mata pelajaran</span>, atau 
                  <span className="text-white font-bold ml-1">ID soal</span>. Pencarian bersifat real-time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Button */}
      <button 
        onClick={onAdd}
        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 flex items-center justify-center gap-3 shrink-0"
      >
        <Plus className="w-5 h-5" />
        TAMBAH BARU
      </button>
    </div>
  );
};

export default SearchAndAddBar;
