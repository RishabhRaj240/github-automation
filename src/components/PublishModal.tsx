import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  Lock,
  Globe,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useRepoPilot } from '../context/RepoPilotContext';
import { useAuth } from '../context/AuthContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { githubConnection } = useAuth();
  const {
    metadata,
    files,
    readmeContent,
    publishProject,
    isPublishing,
    publishProgress,
  } = useRepoPilot();

  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const owner = githubConnection?.githubUsername || 'username';
  const totalFiles = files.length + 1; // including README.md
  const totalSizeKb = (files.reduce((acc, f) => acc + f.size, 0) + new Blob([readmeContent]).size) / 1024;

  const handlePublish = async () => {
    if (!confirmed) return;
    setErrorMsg(null);
    try {
      const result = await publishProject();
      if (result.success) {
        onClose();
        navigate('/result');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Publishing failed. Please check network or settings.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Review &amp; Publish to GitHub</h3>
              <p className="text-[11px] text-slate-400">Target: @{owner}/{metadata.name}</p>
            </div>
          </div>
          {!isPublishing && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Target Summary Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Repository:</span>
              <span className="font-mono font-semibold text-white">
                github.com/{owner}/{metadata.name}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Visibility:</span>
              <span className="flex items-center gap-1.5 font-medium">
                {metadata.visibility === 'public' ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400">Private</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Files to Commit:</span>
              <span className="text-slate-200">
                {totalFiles} files ({totalSizeKb.toFixed(1)} KB)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Branch &amp; Strategy:</span>
              <span className="text-slate-300 font-mono">
                main (Atomic Git Tree Commit)
              </span>
            </div>
          </div>

          {/* Files Preview Pill List */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Files Included in Commit:
            </div>
            <div className="max-h-28 overflow-y-auto bg-slate-950/40 border border-slate-800/80 rounded-lg p-2 space-y-1 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5 text-brand-400">
                <FileText className="w-3.5 h-3.5" />
                <span>README.md (AI Generated)</span>
              </div>
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-slate-400 pl-5">
                  <span className="truncate">{f.path}</span>
                  <span className="text-[10px] text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Publishing Progress State */}
          {isPublishing ? (
            <div className="bg-slate-950/80 border border-brand-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-300 font-medium flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                  {publishProgress.step || 'Publishing project...'}
                </span>
                <span className="font-mono text-brand-400 font-bold">{publishProgress.percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full transition-all duration-300 ease-out"
                  style={{ width: `${publishProgress.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Please wait while we create the repository and upload your code...
              </p>
            </div>
          ) : (
            /* Explicit Confirmation Checkbox */
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I authorize RepoPilot to create the repository <strong>{metadata.name}</strong> on GitHub account <strong>@{owner}</strong> and push the files listed above.
                </span>
              </label>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Error:</strong> {errorMsg}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={!confirmed || isPublishing}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-brand-500/25 transition disabled:opacity-40 flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Confirm &amp; Publish to GitHub
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
