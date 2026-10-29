import React, { useRef, useState } from 'react';
import { Copy, Check, AlertOctagon, Terminal } from 'lucide-react';
import { useRepoPilot } from '../context/RepoPilotContext';

export const CodeEditor: React.FC = () => {
  const { files, activeFileId, updateFileContent, updateFileLanguage, secretFindings } = useRepoPilot();
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0d14] text-slate-500 text-sm">
        <Terminal className="w-8 h-8 mb-2 text-slate-600" />
        Select a file from the explorer to begin editing.
      </div>
    );
  }

  const activeSecrets = secretFindings.filter((s) => s.path === activeFile.path);
  const lines = activeFile.content.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        activeFile.content.substring(0, start) + '  ' + activeFile.content.substring(end);

      updateFileContent(activeFile.id, newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] overflow-hidden">
      {/* Secret Warning Banner if secrets detected in this file */}
      {activeSecrets.length > 0 && (
        <div className="bg-rose-950/40 border-b border-rose-800/80 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Security Warning:</strong> {activeSecrets[0].type} detected at line{' '}
              {activeSecrets[0].line}. Remove before publishing.
            </span>
          </div>
          <span className="text-[11px] text-rose-400/80 italic">
            {activeSecrets[0].recommendation}
          </span>
        </div>
      )}

      {/* Editor Header / Tab Bar */}
      <div className="h-10 bg-[#0d111a] border-b border-slate-800 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-slate-200">
            {activeFile.path}
          </span>
          <select
            value={activeFile.language}
            onChange={(e) => updateFileLanguage(activeFile.id, e.target.value)}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-brand-300 font-mono uppercase border border-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
            title="Change syntax language"
          >
            <option value="html">HTML</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash / Shell</option>
            <option value="plaintext">Plain Text</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{lines.length} lines</span>
          <span>{(activeFile.size / 1024).toFixed(1)} KB</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Text Area with Line Numbers */}
      <div className="flex-1 flex relative overflow-hidden font-mono text-xs sm:text-[13px] leading-relaxed">
        {/* Line Numbers Column */}
        <div className="w-12 bg-[#090c12] border-r border-slate-800/60 py-3 text-right pr-3 select-none text-slate-600 overflow-hidden">
          {lines.map((_, i) => (
            <div key={i} className="h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Real Editable Text Area */}
        <textarea
          ref={textareaRef}
          value={activeFile.content}
          onChange={(e) => updateFileContent(activeFile.id, e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-100 p-3 resize-none focus:outline-none overflow-y-auto leading-6 whitespace-pre font-mono selection:bg-brand-500/30"
          placeholder="Paste or write code here..."
        />
      </div>
    </div>
  );
};

