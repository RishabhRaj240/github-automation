import React, { useState } from 'react';
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
  } = useRepoPilot();

  const [activeTab, setActiveTab] = useState<'code' | 'readme'>('code');
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const owner = githubConnection?.githubUsername || 'username';

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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0a0d14] text-slate-100 overflow-hidden">
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

