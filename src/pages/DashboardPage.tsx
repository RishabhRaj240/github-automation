import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  GitBranch,
  ExternalLink,
  ShieldCheck,
  Globe,
  Lock,
  Calendar,
  CheckCircle2,
  FileCode,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { GithubIcon } from '../components/icons/GithubIcon';
import { useAuth } from '../context/AuthContext';
import { useRepoPilot } from '../context/RepoPilotContext';

export const DashboardPage: React.FC = () => {
  const { user, githubConnection, disconnectGitHub } = useAuth();
  const { publications } = useRepoPilot();

  const publicCount = publications.filter((p) => p.visibility === 'public').length;
  const privateCount = publications.filter((p) => p.visibility === 'private').length;
  const totalFiles = publications.reduce((acc, p) => acc + (p.filesCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Developer Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your connected GitHub identity, published repositories, and project workspaces.
            </p>
          </div>

          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create &amp; Publish Repository</span>
          </Link>
        </div>

        {/* Connected GitHub Profile Card */}
        <div className="p-5 rounded-2xl bg-[#101522] border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    githubConnection?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={githubConnection?.githubUsername || 'GitHub User'}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500/40 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-800">
                  <GithubIcon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {githubConnection ? `@${githubConnection.githubUsername}` : 'GitHub Not Connected'}
                  </h3>
                  {githubConnection && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  {githubConnection ? (
                    <>
                      <a
                        href={githubConnection.githubProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-brand-400 transition flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>{githubConnection.githubProfileUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-slate-600">•</span>
                      <span>Permissions: <code>repo</code>, <code>user:email</code></span>
                    </>
                  ) : (
                    <span>Connect your GitHub account to enable one-click publishing.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {githubConnection ? (
                <button
                  onClick={disconnectGitHub}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/80 hover:border-rose-500/30 transition"
                >
                  Disconnect
                </button>
              ) : (
                <Link
                  to="/settings"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
                >
                  Connect GitHub Account
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Analytics & Quota Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#101522] border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-brand-400" /> Total Published
            </span>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {publications.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#101522] border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Public Repos
            </span>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {publicCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#101522] border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Private Repos
            </span>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {privateCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#101522] border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Total Files Pushed
            </span>
            <div className="mt-2 text-2xl font-bold font-mono text-white">
              {totalFiles}
            </div>
          </div>
        </div>

        {/* Recently Published Repositories */}
        <div className="p-6 rounded-2xl bg-[#101522] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Publications</h3>
              <p className="text-[11px] text-slate-400">
                Repositories committed to your GitHub account using RepoPilot
              </p>
            </div>
            <Link
              to="/workspace"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>New Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {publications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-slate-500 mx-auto flex items-center justify-center">
                <GitBranch className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-300 font-medium">No repositories published yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Open the workspace editor to write or paste your code, generate an AI README, and publish to GitHub in one click.
              </p>
              <Link
                to="/workspace"
                className="inline-block mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold"
              >
                Open Workspace
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {publications.map((pub) => (
                <div
                  key={pub.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-white font-mono text-sm group-hover:text-brand-300 transition">
                        {pub.repositoryName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                          pub.visibility === 'public'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {pub.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {pub.visibility}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {pub.filesCount} files
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      {pub.commitSha && (
                        <span>Commit: <code>{pub.commitSha}</code></span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(pub.publishedAt || pub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={pub.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition"
                    >
                      <span>Open on GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
