import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  Terminal,
  FileCode,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useRepoPilot } from '../context/RepoPilotContext';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { lastPublishResult, files, resetWorkspace } = useRepoPilot();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);

  // Fallback demo result if navigated directly
  const result = lastPublishResult || {
    success: true,
    repoUrl: 'https://github.com/octopilot-demo/modern-react-spa',
    repoName: 'modern-react-spa',
    owner: 'octopilot-demo',
    commitSha: 'a7c491f',
    branch: 'main',
    filesPublished: 4,
  };

  const cloneCommand = `git clone ${result.repoUrl}.git`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(result.repoUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleCreateAnother = () => {
    resetWorkspace();
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Repository Published Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Your source code and AI-generated README have been committed to GitHub under your authenticated account.
          </p>
        </div>

        {/* Repository Link Card */}
        <div className="p-6 rounded-2xl bg-[#101522] border border-slate-800 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                GitHub Repository
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-white">
                  {result.owner}/{result.repoName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-500/10 text-brand-300 border border-brand-500/30 font-medium">
                  branch: {result.branch}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={result.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-500/20 flex items-center gap-1.5"
              >
                <span>Open on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleCopyUrl}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
                title="Copy repository URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Clone Terminal Box */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Clone Command:
            </span>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
              <span className="truncate mr-2">{cloneCommand}</span>
              <button
                onClick={handleCopyClone}
                className="p-1 hover:text-white text-slate-400 transition shrink-0"
                title="Copy command"
              >
                {copiedClone ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Commit Summary Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Commit SHA
              </span>
              <p className="mt-1 text-xs font-mono font-bold text-white">
                {result.commitSha}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Files Committed
              </span>
              <p className="mt-1 text-xs font-mono font-bold text-white">
                {result.filesPublished} files
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Publication Mode
              </span>
              <p className="mt-1 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Atomic Git Tree
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Contribution Accuracy Notice */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
          <HelpCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-300">GitHub Contribution Graph Note:</strong> Contributions are attributed to your authenticated account. Displaying green squares depends on GitHub&apos;s processing queue and your account&apos;s verified email settings.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleCreateAnother}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Another Repository</span>
          </button>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <span>View All Projects in Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
