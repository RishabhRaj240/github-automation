import React, { useRef, useState } from 'react';
import {
  FileCode,
  FileText,
  FileJson,
  FilePlus,
  Trash2,
  Edit2,
  AlertTriangle,
  Upload,
  FolderOpen,
  Sparkles,
  Plus,
  Eraser,
} from 'lucide-react';
import { useRepoPilot } from '../context/RepoPilotContext';
import { STARTER_TEMPLATES } from '../lib/templates';

export const FileTree: React.FC = () => {
  const {
    files,
    activeFileId,
    setActiveFileId,
    addFile,
    addLanguageFile,
    deleteFile,
    renameFile,
    clearAllFiles,
    secretFindings,
    loadStarterTemplate,
    handleFileUpload,
  } = useRepoPilot();

  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = addFile(newFilePath);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create file');
      return;
    }
    setNewFilePath('');
    setIsAddingFile(false);
  };

  const handleStartRename = (id: string, currentPath: string) => {
    setEditingFileId(id);
    setRenameInput(currentPath);
    setErrorMsg(null);
  };

  const handleSaveRename = (id: string) => {
    const result = renameFile(id, renameInput);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to rename file');
      return;
    }
    setEditingFileId(null);
  };

  const getFileIcon = (path: string) => {
    const p = path.toLowerCase();
    if (p.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    if (p.endsWith('.md') || p.endsWith('.txt')) return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (p.endsWith('.html') || p.endsWith('.htm')) return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
    if (p.endsWith('.cpp') || p.endsWith('.cc') || p.endsWith('.cxx') || p.endsWith('.h') || p.endsWith('.hpp')) {
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    if (p.endsWith('.py')) return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
    return <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d111a] border-r border-slate-800 select-none">
      {/* File Tree Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Files ({files.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsAddingFile(true);
              setNewFilePath('');
            }}
            title="New Custom File"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Files from Computer"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <Upload className="w-4 h-4" />
          </button>
          {files.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all files in workspace?')) {
                  clearAllFiles();
                }
              }}
              title="Clear all files"
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
            >
              <Eraser className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden Upload Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFileUpload(e.target.files);
        }}
      />

      {/* Starter Templates Dropdown Bar */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-400" />
            Preset:
          </span>
          <select
            onChange={(e) => loadStarterTemplate(e.target.value)}
            className="text-[11px] bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 focus:outline-none focus:border-brand-500"
          >
            {STARTER_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Add Language Buttons */}
      <div className="px-2 py-1.5 border-b border-slate-800/60 bg-slate-950/40">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
          + Add Language File:
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => addLanguageFile('html')}
            title="Add index.html file"
            className="px-1.5 py-1 text-[10px] font-mono rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 transition text-center"
          >
            + HTML
          </button>
          <button
            onClick={() => addLanguageFile('cpp')}
            title="Add main.cpp file"
            className="px-1.5 py-1 text-[10px] font-mono rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition text-center"
          >
            + C++
          </button>
          <button
            onClick={() => addLanguageFile('python')}
            title="Add main.py file"
            className="px-1.5 py-1 text-[10px] font-mono rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 transition text-center"
          >
            + Python
          </button>
          <button
            onClick={() => addLanguageFile('javascript')}
            title="Add index.js file"
            className="px-1.5 py-1 text-[10px] font-mono rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition text-center"
          >
            + JS
          </button>
        </div>
      </div>

      {/* Inline New File Form */}
      {isAddingFile && (
        <form onSubmit={handleCreateFile} className="p-2 bg-slate-800/60 border-b border-slate-700">
          <input
            type="text"
            autoFocus
            placeholder="e.g. index.html or main.cpp"
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            className="w-full text-xs px-2 py-1 bg-slate-900 text-white border border-slate-700 rounded focus:border-brand-500 focus:outline-none font-mono"
          />
          {errorMsg && <p className="text-[10px] text-rose-400 mt-1">{errorMsg}</p>}
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingFile(false);
                setErrorMsg(null);
              }}
              className="text-[11px] px-2 py-0.5 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[11px] px-2.5 py-0.5 bg-brand-600 hover:bg-brand-500 text-white rounded font-medium"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Files List */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="p-5 text-center space-y-3">
            <div className="text-xs text-slate-400 font-medium">Workspace is empty.</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upload your files, or quickly create an HTML or C++ file:
            </p>
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => addLanguageFile('html')}
                className="w-full py-1.5 px-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create index.html</span>
              </button>
              <button
                onClick={() => addLanguageFile('cpp')}
                className="w-full py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create main.cpp</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Local Files</span>
              </button>
            </div>
          </div>
        ) : (
          files.map((file) => {
            const isActive = file.id === activeFileId;
            const fileSecrets = secretFindings.filter((s) => s.path === file.path);
            const hasSecrets = fileSecrets.length > 0;
            const isEditing = file.id === editingFileId;

            return (
              <div
                key={file.id}
                onClick={() => !isEditing && setActiveFileId(file.id)}
                className={`group flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition border-l-2 ${
                  isActive
                    ? 'bg-slate-800/90 text-white border-brand-500 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-transparent'
                }`}
              >
                {isEditing ? (
                  <div
                    className="flex-1 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(file.id);
                        if (e.key === 'Escape') setEditingFileId(null);
                      }}
                      className="w-full text-xs px-1.5 py-0.5 bg-slate-900 border border-brand-500 rounded text-white font-mono"
                    />
                    <button
                      onClick={() => handleSaveRename(file.id)}
                      className="text-[10px] text-brand-400 px-1 hover:underline"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate mr-2">
                      {getFileIcon(file.path)}
                      <span className="truncate font-mono">{file.path}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {hasSecrets && (
                        <span
                          title={`${fileSecrets.length} potential secret(s) detected in this file`}
                          className="flex items-center text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          <AlertTriangle className="w-3 h-3 mr-0.5" />
                          {fileSecrets.length}
                        </span>
                      )}

                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(file.id, file.path);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-300"
                          title="Rename file"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Delete file"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Drag & Drop Prompt footer */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Drop files or choose a preset above
      </div>
    </div>
  );
};
