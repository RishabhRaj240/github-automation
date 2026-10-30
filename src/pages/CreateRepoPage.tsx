import React, { useRef, useState } from 'react';
import {
  GitPullRequest,
  Sparkles,
  Lock,
  Globe,
  AlertTriangle,
  Layers,
  Code,
  FileText,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  FolderUp,
  FolderCheck,
  Loader2,
  X,
  FileBox,
} from 'lucide-react';
import { useRepoPilot } from '../context/RepoPilotContext';
import { useAuth } from '../context/AuthContext';
import { FileTree } from '../components/FileTree';
import { CodeEditor } from '../components/CodeEditor';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { SecretAlertModal } from '../components/SecretAlertModal';
import { PublishModal } from '../components/PublishModal';
import { validateRepositoryName } from '../lib/secretScanner';

export const CreateRepoPage: React.FC = () => {
  const { githubConnection } = useAuth();
  const {
    metadata,
    setMetadata,
    files,
    secretFindings,
    readmeContent,
    isGeneratingReadme,
    generateReadme,
    folderUploadStats,
    setFolderUploadStats,
    handleFolderDrop,
  } = useRepoPilot();

  const [activeTab, setActiveTab] = useState<'code' | 'readme'>('code');
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const dragCounterRef = useRef(0);

  const owner = githubConnection?.githubUsername || 'username';

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      setIsDraggingOver(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer) {
      setIsProcessingDrop(true);
      const res = await handleFolderDrop(e.dataTransfer);
      setIsProcessingDrop(false);
      if (!res.success && res.error) {
        alert(res.error);
      }
    }
  };

  const handleNameChange = (val: string) => {
    // Sanitize to valid characters
    const sanitized = val.replace(/\s+/g, '-');
    setMetadata((prev) => ({ ...prev, name: sanitized }));

    const check = validateRepositoryName(sanitized);
    if (!check.valid) {
      setNameError(check.error || 'Invalid name');
    } else {
      setNameError(null);
    }
  };

  const handleInitiatePublish = () => {
    const check = validateRepositoryName(metadata.name);
    if (!check.valid) {
      setNameError(check.error || 'Invalid name');
      return;
    }

    if (secretFindings.length > 0) {
      setShowSecretModal(true);
    } else {
      setShowPublishModal(true);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col h-[calc(100vh-4rem)] bg-transparent text-slate-100 overflow-hidden relative z-10"
    >
      {/* Drag & Drop Purple Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-[#0a0d14]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 border-2 border-dashed border-brand-400/80 animate-in fade-in duration-150">
          <div className="w-20 h-20 rounded-3xl bg-brand-500/20 text-brand-400 border border-brand-500/40 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(168,85,247,0.5)] animate-bounce">
            <FolderUp className="w-10 h-10 text-brand-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Drop Project Folder Here</h2>
          <p className="text-sm text-slate-300 max-w-md text-center mb-4">
            Uploads all nested subfolders, code files, and binary assets. Automatically configures repository metadata and synthesizes README.
          </p>
          <div className="flex items-center gap-2.5 text-xs text-brand-300 bg-brand-950/80 border border-brand-800/80 px-4 py-2 rounded-xl shadow-lg shadow-brand-500/10">
            <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Recursive subfolder extraction &bull; Binary asset support &bull; AI README generation</span>
          </div>
        </div>
      )}

      {/* Processing Drop Spinner */}
      {isProcessingDrop && (
        <div className="absolute inset-0 z-50 bg-[#0a0d14]/85 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-100">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin mb-4" />
          <h3 className="text-base font-semibold text-white mb-1">Reading Project Folder &amp; Subdirectories...</h3>
          <p className="text-xs text-slate-400">Extracting files, assets, and analyzing stack for README synthesis.</p>
        </div>
      )}

      {/* Top Project Configuration Bar */}
      <div className="bg-[#0e1320] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project Name & Target Owner */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400">@{owner}</span>
            <span className="text-slate-600">/</span>
            <div className="relative">
              <input
                type="text"
                value={metadata.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="repository-name"
                className={`w-44 sm:w-56 px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-900 border text-white focus:outline-none ${
                  nameError ? 'border-rose-500' : 'border-slate-700 focus:border-brand-500'
                }`}
              />
              {nameError && (
                <span className="absolute -bottom-4 left-0 text-[10px] text-rose-400 whitespace-nowrap">
                  {nameError}
                </span>
              )}
            </div>
          </div>

          {/* Visibility Selector */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => setMetadata((prev) => ({ ...prev, visibility: 'public' }))}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                metadata.visibility === 'public'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public</span>
            </button>
            <button
              type="button"
              onClick={() => setMetadata((prev) => ({ ...prev, visibility: 'private' }))}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                metadata.visibility === 'private'
                  ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Private</span>
            </button>
          </div>
        </div>

        {/* Center / Right: Tabs & Publish Button */}
        <div className="flex items-center gap-3">
          {/* Secret Findings Badge Alert */}
          {secretFindings.length > 0 && (
            <button
              onClick={() => setShowSecretModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium hover:bg-rose-500/20 transition animate-pulse"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{secretFindings.length} Secret(s) Flagged</span>
            </button>
          )}

          {/* View Mode Toggle: Code Files vs README Studio */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>Source Files ({files.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                activeTab === 'readme'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>AI README Studio</span>
            </button>
          </div>

          {/* Primary Publish Action */}
          <button
            onClick={handleInitiatePublish}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition hover:scale-[1.02]"
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Publish to GitHub</span>
          </button>
        </div>
      </div>

      {/* Uploaded Project Folder Status Banner */}
      {folderUploadStats && (
        <div className="bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-brand-950/60 border-b border-purple-500/30 px-4 py-2 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/40">
              <FolderCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">
                Folder "{folderUploadStats.projectName}"
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-purple-300 font-mono">
                {folderUploadStats.totalFiles} files
              </span>
              {folderUploadStats.subfolders.length > 0 && (
                <>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-300 font-mono">
                    {folderUploadStats.subfolders.length} subfolder{folderUploadStats.subfolders.length > 1 ? 's' : ''}
                  </span>
                </>
              )}
              {folderUploadStats.totalAssets > 0 && (
                <>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-cyan-300 font-mono">
                    {folderUploadStats.totalAssets} asset{folderUploadStats.totalAssets > 1 ? 's' : ''}
                  </span>
                </>
              )}
              <span className="text-slate-400">&bull;</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                {isGeneratingReadme ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing folder &amp; generating README...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>AI README Synthesized</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== 'readme' && !isGeneratingReadme && (
              <button
                onClick={() => setActiveTab('readme')}
                className="px-2.5 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-medium transition"
              >
                Review README
              </button>
            )}
            <button
              onClick={() => setFolderUploadStats(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Split Workspace Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Explorer Sidebar */}
        <div className="w-64 sm:w-72 shrink-0 h-full">
          <FileTree />
        </div>

        {/* Right Working Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {activeTab === 'code' ? (
            <div className="flex-1 flex h-full overflow-hidden">
              <CodeEditor />
            </div>
          ) : (
            <div className="flex-1 flex h-full overflow-hidden">
              <MarkdownEditor />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SecretAlertModal
        isOpen={showSecretModal}
        findings={secretFindings}
        onClose={() => setShowSecretModal(false)}
        onProceedAnyway={() => {
          setShowSecretModal(false);
          setShowPublishModal(true);
        }}
      />

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
      />
    </div>
  );
};

