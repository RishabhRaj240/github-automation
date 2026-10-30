import React, { useState } from 'react';
import {
  Sparkles,
  Eye,
  Edit3,
  Copy,
  Check,
  RotateCcw,
  Heading,
  Bold,
  Italic,
  List,
  Code,
} from 'lucide-react';
import { useRepoPilot } from '../context/RepoPilotContext';

export const MarkdownEditor: React.FC = () => {
  const { readmeContent, setReadmeContent, generateReadme, isGeneratingReadme } = useRepoPilot();
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(readmeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    setReadmeContent(readmeContent + `\n${prefix}Content${suffix}\n`);
    setViewMode('edit');
  };

  /**
   * Safe, responsive markdown-to-html renderer without heavy external deps
   */
  const renderSimpleMarkdown = (md: string) => {
    if (!md) return '<p class="text-slate-500 italic">No README generated yet. Click &quot;Generate with AI&quot; above.</p>';

    // Escape HTML first
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```([^\n`]*)\n([\s\S]*?)```/g, (_m, info, code) => {
      const language = String(info).trim().split(/\s+/)[0];
      const label = language ? `<span class="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">${language}</span>` : '';
      return `<pre class="my-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto">${label}<code>${code}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-brand-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-5 mb-3 pb-1 border-b border-slate-800">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-white mt-2 mb-4 pb-2 border-b border-slate-800">$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-brand-500 pl-3 my-2 text-slate-400 italic text-sm">$1</blockquote>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>');

    // Lists
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1 text-sm">$1</li>');

    // Images / Badges
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="inline-block my-1 mr-1.5" />');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-brand-400 hover:underline">$1</a>');

    // Line breaks
    html = html.replace(/\n\n/g, '<div class="h-2"></div>');

    return html;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] overflow-hidden border-l border-slate-800">
      {/* Markdown Toolbar */}
      <div className="h-10 bg-[#0d111a] border-b border-slate-800 px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'preview'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-brand-400" />
            Preview
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              viewMode === 'edit'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            Raw Markdown
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={generateReadme}
            disabled={isGeneratingReadme}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-brand-600/90 hover:bg-brand-500 text-white rounded transition shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingReadme ? 'animate-spin' : ''}`} />
            <span>{isGeneratingReadme ? 'Generating...' : 'Regenerate AI README'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0d14]">
        {viewMode === 'preview' ? (
          <div
            className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(readmeContent) }}
          />
        ) : (
          <textarea
            value={readmeContent}
            onChange={(e) => setReadmeContent(e.target.value)}
            spellCheck={false}
            className="w-full h-full min-h-[400px] bg-transparent text-slate-100 font-mono text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-none"
            placeholder="Type your README.md in markdown format..."
          />
        )}
      </div>
    </div>
  );
};

