import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  FileCode2,
  Zap,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does RepoPilot connect to my GitHub account securely?',
      a: 'RepoPilot uses GitHub OAuth. We never ask you to paste personal access tokens into ordinary text fields. Authorization tokens are encrypted using AES-256-GCM and stored exclusively in secure server-side vaults, never accessible to browser clients.',
    },
    {
      q: 'Does RepoPilot store my source code or project files?',
      a: 'No. RepoPilot processes your files ephemerally in-memory strictly to generate the README and create the GitHub Git Database commit. We have a strict zero-code-retention architecture: your source code is never permanently stored in our databases.',
    },
    {
      q: 'Will my commits immediately turn into green contribution squares on GitHub?',
      a: 'GitHub calculates green contribution squares based on its own official criteria: the commit must be made to the default branch (e.g. main), the commit email must match your verified GitHub account, and the repository must meet GitHub eligibility rules. Commits made through RepoPilot use your verified GitHub identity, but display timing depends entirely on GitHub.',
    },
    {
      q: 'What happens if the AI provider runs out of free-tier quota?',
      a: 'RepoPilot includes a built-in deterministic Stack Analyzer fallback. If the AI model is rate-limited or unavailable, our system analyzes your package manifests (package.json, requirements.txt, Cargo.toml) and generates a complete, accurate README without hallucinating fake commands or APIs.',
    },
    {
      q: 'Can I publish both public and private repositories?',
      a: 'Yes! You can toggle between Public and Private repository visibility before publishing. The repository is created with your chosen visibility directly on your GitHub account.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0d14] text-slate-100 overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-medium text-brand-300 mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>RepoPilot AI 1.0 — Production SaaS for Developers</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          From Code to GitHub.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            In One Click.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop manually creating empty repositories, writing repetitive README files, and running tedious git commands. RepoPilot generates professional technical documentation with AI and publishes your multi-file project directly to your GitHub account.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? '/workspace' : '/auth'}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-brand-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>Start Publishing for Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-sm transition-all"
          >
            See How It Works
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Tier Powered (Gemini Flash)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real GitHub OAuth (No Token Pasting)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Atomic Git Database Commits
          </span>
        </div>
      </section>

      {/* Interactive Live Preview Card */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="rounded-2xl bg-gradient-to-b from-slate-800/80 to-[#101522] p-1 shadow-2xl border border-slate-700/60">
          <div className="bg-[#0a0d14] rounded-[14px] overflow-hidden">
            {/* Mock Window Header */}
            <div className="h-10 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">repopilot-workspace &mdash; modern-react-spa</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-400 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI README Engine Ready</span>
              </div>
            </div>

            {/* Mock Editor Body Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs">
              {/* Left: Files */}
              <div className="p-4 bg-[#0d111a]/80 font-mono space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Project Files (4)
                </div>
                <div className="p-1.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/30 flex items-center justify-between">
                  <span>📄 package.json</span>
                  <span className="text-[10px] text-slate-400">1.2 KB</span>
                </div>
                <div className="p-1.5 text-slate-400 hover:text-white flex items-center justify-between">
                  <span>📄 src/App.tsx</span>
                  <span className="text-[10px] text-slate-500">2.4 KB</span>
                </div>
                <div className="p-1.5 text-slate-400 hover:text-white flex items-center justify-between">
                  <span>📄 src/main.tsx</span>
                  <span className="text-[10px] text-slate-500">0.8 KB</span>
                </div>
                <div className="p-1.5 text-slate-400 hover:text-white flex items-center justify-between">
                  <span>📄 src/index.css</span>
                  <span className="text-[10px] text-slate-500">0.4 KB</span>
                </div>
              </div>

              {/* Middle: Code Preview */}
              <div className="p-4 font-mono text-slate-300 leading-relaxed bg-[#0a0d14] overflow-hidden">
                <div className="text-slate-500 mb-2">// Detected React 18 + Tailwind CSS</div>
                <div className="text-cyan-400">export default function App() &#123;</div>
                <div className="pl-4 text-slate-300">const [status, setStatus] = useState(&quot;Ready&quot;);</div>
                <div className="pl-4 text-emerald-400">return &lt;div className=&quot;hero&quot;&gt;</div>
                <div className="pl-8 text-indigo-300">&lt;h1&gt;From Code to GitHub&lt;/h1&gt;</div>
                <div className="pl-4 text-emerald-400">&lt;/div&gt;;</div>
                <div className="text-cyan-400">&#125;</div>
              </div>

              {/* Right: AI README Result */}
              <div className="p-4 bg-slate-950/70 space-y-2">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Generated README.md
                </div>
                <div className="text-sm font-bold text-white"># modern-react-spa</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lightning-fast React 18 single page application powered by Vite and Tailwind CSS.
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-cyan-300">
                  npm install<br />npm run dev
                </div>
                <Link
                  to="/workspace"
                  className="mt-3 block text-center py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold text-xs transition"
                >
                  Open Live Workspace &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Simple 3-Step Flow</h2>
          <p className="mt-2 text-3xl font-bold text-white">How RepoPilot Works</p>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Everything you need to turn raw code files into a verified, beautifully documented GitHub repository in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition relative">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Connect &amp; Drop Code</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authenticate your GitHub account via OAuth. Paste single-file code or drop entire project folders directly into the browser editor.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition relative">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Generate AI Documentation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our AI engine inspects your manifests, libraries, and code structure to write an accurate README with installation and run instructions without hallucinations.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Atomic GitHub Publish</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click &quot;Publish.&quot; RepoPilot creates the repository, pushes all file blobs, and creates an atomic Git commit directly under your personal GitHub profile.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Secret Scanner Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#111625] to-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-medium text-rose-300 mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero Secret Leakage Guarantee</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Pre-Publish Secret Scanner &amp; Strict User Isolation
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed space-y-2">
                RepoPilot automatically checks your code for leaked API keys (AWS, GitHub PATs, OpenAI, Google API, Private Keys) before publishing.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>AES-256-GCM server-side token encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Row Level Security (RLS) guarantees complete multi-user data isolation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Path traversal prevention and sanitize guards on every file</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
              <div className="text-[11px] text-slate-500 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>SECURITY AUDIT SCAN</span>
                <span className="text-emerald-400">PASSED</span>
              </div>
              <div className="text-slate-400">✔ GitHub OAuth token stored in server vault</div>
              <div className="text-slate-400">✔ Ephemeral memory parsing (0 code retained)</div>
              <div className="text-slate-400">✔ AES-256 encrypted authentication exchange</div>
              <div className="text-slate-400">✔ Live AST and manifest analyzer</div>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Contribution Accuracy Notice */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-4">
          <HelpCircle className="w-6 h-6 text-brand-400 shrink-0 mt-1" />
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <h3 className="font-bold text-white text-sm">GitHub Contribution Accuracy Statement</h3>
            <p>
              RepoPilot creates real git commits authored directly by your authenticated GitHub identity. We never create fake commits or spoof commit timestamps.
            </p>
            <p className="text-slate-400">
              GitHub determines green square eligibility based on its own documented rules (commits must be made to the default branch, the commit author email must match your verified GitHub account, and the repository must not be an unmerged fork).
            </p>
            <a
              href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-400 hover:underline pt-1"
            >
              <span>Read GitHub&apos;s Official Contribution Guidelines</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 mt-1">Everything you need to know about RepoPilot AI</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-brand-300 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-brand-900/40 to-slate-900 border border-brand-500/30 shadow-2xl space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Ready to publish your first repository?</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Join hundreds of developers using RepoPilot AI to turn raw scripts and projects into production GitHub repositories.
          </p>
          <div className="pt-2">
            <Link
              to={user ? '/workspace' : '/auth'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/30 transition hover:scale-[1.02]"
            >
              <span>Get Started Now &mdash; It&apos;s Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

