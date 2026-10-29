import React from 'react';
import { Link } from 'react-router-dom';
import { GitBranch, Shield, Heart, ExternalLink, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080b11] border-t border-slate-800/80 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-500 p-0.5">
                <div className="w-full h-full bg-[#101522] rounded-[6px] flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-brand-400" />
                </div>
              </div>
              <span className="font-bold text-white text-base">RepoPilot AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated developer platform for generating technical documentation and deploying repositories directly to GitHub in one click.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Zero server-side code retention</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/workspace" className="hover:text-white transition">Workspace Editor</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">Project Dashboard</Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition">Integrations & Settings</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition">Authentication</Link>
              </li>
            </ul>
          </div>

          {/* GitHub & Docs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">GitHub Integration</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1"
                >
                  <span>Contribution Graph Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.github.com/en/rest/git"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1"
                >
                  <span>Git Database API</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1"
                >
                  <span>Google Gemini Flash Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Contribution Explainer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>GitHub Accuracy Notice</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
              Commits created with RepoPilot are attributed to your authenticated identity. GitHub calculates green contribution squares according to its official rules (default branch, verified email, and commit authorship).
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} RepoPilot AI. Released under MIT Open Source.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for modern software developers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
