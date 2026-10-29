import React, { useState } from 'react';
import { Search, X, Code2, Plus, Sparkles, Check } from 'lucide-react';
import { ALL_LANGUAGES, LanguageDefinition } from '../lib/allLanguages';

interface LanguagePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (lang: LanguageDefinition) => void;
}

export const LanguagePaletteModal: React.FC<LanguagePaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Frontend', 'Backend', 'Systems', 'Scripting', 'Mobile', 'Data & Config'];

  const filtered = ALL_LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.extension.toLowerCase().includes(search.toLowerCase()) ||
      lang.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || lang.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add Language File</h3>
              <p className="text-[11px] text-slate-400">Choose from 25+ languages with automated boilerplates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Categories */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by language (e.g. C++, HTML, Rust, Swift, Go, Python)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-xs text-slate-500">
              No languages matched &ldquo;{search}&rdquo;. Try another term or create a custom file.
            </div>
          ) : (
            filtered.map((lang) => (
              <div
                key={lang.id}
                onClick={() => {
                  onSelectLanguage(lang);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-brand-500/60 hover:bg-slate-950 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 truncate mr-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs uppercase"
                    style={{ backgroundColor: lang.badgeBg, color: lang.color }}
                  >
                    .{lang.extension}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white group-hover:text-brand-300 transition flex items-center gap-1.5">
                      <span>{lang.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({lang.defaultFilename})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{lang.description}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-brand-600 text-slate-300 group-hover:text-white text-[11px] font-semibold transition shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
