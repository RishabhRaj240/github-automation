import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitPullRequest,
  Lock,
  Globe,
  AlertCircle,
  FileText,
  ShieldCheck,
  Loader2,
  X,
  Key,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useRepoPilot } from '../context/RepoPilotContext';
import { useAuth } from '../context/AuthContext';
import { getReadmeRepositoryName } from '../lib/readmeRepositoryName';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    githubConnection,
    githubAccessToken,
    setGithubAccessToken,
    connectGitHubWithToken,
  } = useAuth();

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
  const [modalToken, setModalToken] = useState('');
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Read active token
  const currentToken = githubAccessToken || localStorage.getItem('repopilot_gh_token');
  const hasToken = Boolean(currentToken);
  const owner = githubConnection?.githubUsername || 'RishabhRaj240';
  const targetRepoName = getReadmeRepositoryName(readmeContent) || metadata.name;
  const totalFiles = files.length + 1; // including README.md
  const totalSizeKb = (files.reduce((acc, f) => acc + f.size, 0) + new Blob([readmeContent]).size) / 1024;

  const isBadCredentials =
    Boolean(errorMsg?.toLowerCase().includes('bad credentials')) ||
    Boolean(errorMsg?.includes('401'));

  // If bad credentials occur, automatically open token input drawer and clear bad token
  useEffect(() => {
    if (isBadCredentials) {
      setShowTokenInput(true);
      localStorage.removeItem('repopilot_gh_token');
      setGithubAccessToken(null);
    }
  }, [isBadCredentials, setGithubAccessToken]);

  if (!isOpen) return null;

  const handleAuthorizeToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalToken.trim()) return;
    setIsVerifyingToken(true);
    setTokenError(null);
    setTokenSuccess(null);

    const res = await connectGitHubWithToken(modalToken.trim());
    setIsVerifyingToken(false);
    if (!res.success) {
      setTokenError(res.error || 'Failed to verify token with GitHub');
    } else {
      setTokenSuccess('Token verified successfully! Ready to publish.');
      setErrorMsg(null);
      setConfirmed(true);
      setShowTokenInput(false);
      setModalToken('');
    }
  };

  const handlePublish = async () => {
    if (!hasToken) {
      setShowTokenInput(true);
      setErrorMsg('GitHub Personal Access Token is required to create repositories on your account.');
      return;
    }

    if (!confirmed) return;
    setErrorMsg(null);

    try {
      const result = await publishProject();
      if (result.success) {
        onClose();
        navigate('/result');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Publishing failed. Please check network or settings.';
      setErrorMsg(message);
      if (message.toLowerCase().includes('bad credentials') || message.includes('401')) {
        setShowTokenInput(true);
        localStorage.removeItem('repopilot_gh_token');
        setGithubAccessToken(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Review &amp; Publish to GitHub</h3>
              <p className="text-[11px] text-slate-400">Target: @{owner}/{targetRepoName}</p>
            </div>
          </div>
          {!isPublishing && (
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Target Summary Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Repository:</span>
              <span className="font-mono font-semibold text-white">
                github.com/{owner}/{targetRepoName}
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
              <span className="font-mono text-slate-200">
                {totalFiles} files ({totalSizeKb.toFixed(1)} KB)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">GitHub Authorization:</span>
              <div className="flex items-center gap-2">
                {hasToken ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected as @{owner}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" />
                    Token Needed
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowTokenInput((prev) => !prev)}
                  className="text-[11px] text-brand-400 hover:text-brand-300 underline font-medium"
                >
                  {showTokenInput ? 'Close' : hasToken ? 'Change Token' : 'Enter Token'}
                </button>
              </div>
            </div>
          </div>

          {/* Token Input Drawer (Shown if no token, bad credentials, or user clicked change token) */}
          {(showTokenInput || !hasToken) && (
            <div className="bg-gradient-to-br from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>GitHub Personal Access Token</span>
                </div>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=RepoPilot+AI"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 hover:underline"
                >
                  <span>1-Click Generate Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                To create repositories and commit code directly under <strong>@{owner}</strong>, generate a token with the <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">repo</code> scope and paste it below:
              </p>

              <form onSubmit={handleAuthorizeToken} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={modalToken}
                    onChange={(e) => setModalToken(e.target.value)}
                    placeholder="Paste token: ghp_... or github_pat_..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={isVerifyingToken || !modalToken.trim()}
                    className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isVerifyingToken ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify &amp; Save</span>
                    )}
                  </button>
                </div>

                {tokenError && (
                  <div className="text-[11px] text-rose-400 flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/60 p-2 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{tokenError}</span>
                  </div>
                )}

                {tokenSuccess && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/60 p-2 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{tokenSuccess}</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                  <p>&bull; Need a token? Click the <strong>1-Click Generate Token</strong> link above (pre-selects the &apos;repo&apos; scope).</p>
                  <p>&bull; Click &quot;Generate token&quot; at the bottom of the GitHub page, copy it, and paste it here.</p>
                </div>
              </form>
            </div>
          )}

          {/* Files List Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Files Included in Commit:
            </span>
            <div className="max-h-36 overflow-y-auto bg-slate-950/50 rounded-xl border border-slate-800/80 p-2.5 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-brand-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>README.md (AI Generated)</span>
                </span>
                <span className="text-[10px] text-slate-500">{(new Blob([readmeContent]).size / 1024).toFixed(1)} KB</span>
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
                  disabled={!hasToken}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500 disabled:opacity-50"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I authorize RepoPilot to create the repository <strong>{metadata.name}</strong> on GitHub account <strong>@{owner}</strong> and push the files listed above.
                </span>
              </label>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl text-xs text-rose-300 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Publishing Error:</strong> {errorMsg}
                </div>
              </div>
              {isBadCredentials && (
                <p className="text-[11px] text-rose-200/90 pl-6">
                  Your token was rejected by GitHub. Please paste a valid Personal Access Token (classic) with <code className="bg-rose-950 px-1 py-0.5 rounded text-white font-mono">repo</code> scope above.
                </p>
              )}
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
            disabled={!confirmed || !hasToken || isPublishing}
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
