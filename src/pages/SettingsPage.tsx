import React, { useState } from 'react';
import {
  Key,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Save,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { GithubIcon } from '../components/icons/GithubIcon';
import { useAuth } from '../context/AuthContext';
import { useRepoPilot } from '../context/RepoPilotContext';

export const SettingsPage: React.FC = () => {
  const {
    user,
    githubConnection,
    githubAccessToken,
    connectGitHubUsername,
    connectGitHubWithToken,
    signInWithGitHubOAuth,
    disconnectGitHub,
    customGeminiApiKey,
    setCustomGeminiApiKey,
    signOut,
  } = useAuth();

  const { resetWorkspace } = useRepoPilot();

  const [ghTokenInput, setGhTokenInput] = useState('');
  const [tokenMsg, setTokenMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [isConnectingToken, setIsConnectingToken] = useState(false);

  const [apiKeyInput, setApiKeyInput] = useState(customGeminiApiKey || '');
  const [keySavedMsg, setKeySavedMsg] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<string | null>(null);

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghTokenInput.trim()) return;
    setIsConnectingToken(true);
    setTokenMsg(null);

    const res = await connectGitHubWithToken(ghTokenInput.trim());
    setIsConnectingToken(false);
    if (!res.success) {
      setTokenMsg({ text: res.error || 'Failed to verify token', error: true });
    } else {
      setTokenMsg({
        text: 'GitHub token verified successfully! Publishing to your account is now enabled.',
        error: false,
      });
      setGhTokenInput('');
    }
  };

  const handleSaveApiKey = () => {
    setCustomGeminiApiKey(apiKeyInput.trim());
    setKeySavedMsg(true);
    setTimeout(() => setKeySavedMsg(false), 2500);
  };

  const handleTestApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setKeyTestResult('Please enter an API key first.');
      return;
    }
    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      let verified = false;
      let lastErrorMessage = '';

      for (const model of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKeyInput.trim()}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Respond with the word "Connected" if you can read this.' }] }],
            }),
          });

          if (res.ok) {
            setKeyTestResult(`Success! Google Gemini (${model}) is connected and verified.`);
            verified = true;
            break;
          } else {
            const data = await res.json().catch(() => ({}));
            lastErrorMessage = data.error?.message || `Status ${res.status}`;
          }
        } catch (err) {
          lastErrorMessage = err instanceof Error ? err.message : 'Network error';
        }
      }

      if (!verified) {
        setKeyTestResult(`Error: ${lastErrorMessage || 'Invalid API key or quota exceeded'}`);
      }
    } catch (err) {
      setKeyTestResult(`Connection failed: ${err instanceof Error ? err.message : 'Network error'}`);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to clear your local publication history and reset workspace state?')) {
      localStorage.removeItem('repopilot_publications');
      resetWorkspace();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings &amp; Integrations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your GitHub authorization, AI documentation keys, and data privacy.
          </p>
        </div>

        {/* 1. Profile Information */}
        <div className="p-6 rounded-2xl bg-[#101522] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Developer Profile</h3>
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
              }
              alt="Avatar"
              className="w-12 h-12 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <p className="text-sm font-semibold text-white">{user?.displayName || 'Developer'}</p>
              <p className="text-xs text-slate-400">{user?.email || 'developer@repopilot.dev'}</p>
            </div>
          </div>
        </div>

        {/* 2. GitHub Connection Management */}
        <div className="p-6 rounded-2xl bg-[#101522] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GithubIcon className="w-5 h-5 text-white" />
              <h3 className="text-sm font-bold text-white">GitHub Integration</h3>
            </div>
            {githubConnection && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Connect your GitHub account to allow RepoPilot to create repositories and commit code directly under your profile.
          </p>

          {githubConnection ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {githubConnection.avatarUrl && (
                    <img
                      src={githubConnection.avatarUrl}
                      alt={githubConnection.githubUsername}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                  )}
                  <div>
                    <p className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <span>@{githubConnection.githubUsername}</span>
                      {githubAccessToken ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans border border-emerald-500/20">
                          Active &amp; Ready to Publish
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-sans border border-amber-500/20">
                          Token Needed for Publishing
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {githubConnection.githubProfileUrl}
                    </p>
                  </div>
                </div>
                <button
                  onClick={disconnectGitHub}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition self-start sm:self-auto"
                >
                  Disconnect GitHub
                </button>
              </div>

              {!githubAccessToken && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5">
                  <p className="text-xs text-amber-300 font-medium">
                    ⚠️ Enter your GitHub Token or Personal Access Token (PAT) with &lsquo;repo&rsquo; scope below to enable one-click publishing to @{githubConnection.githubUsername}:
                  </p>
                  <form onSubmit={handleConnectToken} className="flex gap-2">
                    <input
                      type="password"
                      value={ghTokenInput}
                      onChange={(e) => setGhTokenInput(e.target.value)}
                      placeholder="Paste token (ghp_... or github_pat_...)"
                      className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isConnectingToken}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      {isConnectingToken ? 'Verifying...' : 'Authorize Token'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <button
                  type="button"
                  onClick={signInWithGitHubOAuth}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition"
                >
                  <GithubIcon className="w-4 h-4 text-white" />
                  <span>Connect with GitHub OAuth</span>
                </button>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <p className="text-xs text-slate-400 mb-2">
                  Or connect with a Personal Access Token (PAT):
                </p>
                <form onSubmit={handleConnectToken} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={ghTokenInput}
                      onChange={(e) => setGhTokenInput(e.target.value)}
                      placeholder="Paste token (ghp_... or github_pat_... with 'repo' scope)"
                      className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isConnectingToken}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      {isConnectingToken ? 'Verifying...' : 'Connect Token'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {tokenMsg && (
            <p className={`text-xs ${tokenMsg.error ? 'text-rose-400' : 'text-emerald-400'}`}>
              {tokenMsg.text}
            </p>
          )}
        </div>

        {/* 3. AI Provider Configuration */}
        <div className="p-6 rounded-2xl bg-[#101522] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-bold text-white">AI Documentation Engine (Google Gemini Flash)</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            RepoPilot uses <strong>Google Gemini 1.5 Flash</strong> (which offers a genuinely free tier with up to 15 RPM). You can provide your own Gemini API key below, or rely on our deterministic stack analyzer fallback.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Google Gemini API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleTestApiKey}
                  disabled={isTestingKey}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-brand-400 text-xs font-semibold rounded-xl border border-brand-500/30 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin' : ''}`} />
                  <span>Test Key</span>
                </button>
              </div>
            </div>

            {keySavedMsg && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Key saved locally in your browser session.
              </p>
            )}

            {keyTestResult && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  keyTestResult.startsWith('Success')
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {keyTestResult}
              </div>
            )}

            <div className="text-[11px] text-slate-500">
              Get a free API key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 4. Privacy & Danger Zone */}
        <div className="p-6 rounded-2xl bg-[#101522] border border-rose-900/40 space-y-4">
          <h3 className="text-sm font-bold text-rose-300">Privacy &amp; Danger Zone</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            RepoPilot does not store your source code. You can purge local publication history and disconnect integrations at any time.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleDeleteAllData}
              className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Publication History</span>
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
