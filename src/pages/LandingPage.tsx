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
  Code2,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SpotlightCard } from '../components/SpotlightCard';
import { BentoGrid } from '../components/BentoGrid';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activePreviewLang, setActivePreviewLang] = useState<'html' | 'cpp' | 'python'>('html');

  const faqs = [
    {
      q: 'Can I upload pure HTML code without React or Node.js?',
      a: 'Yes, 100%! RepoPilot AI fully supports single-file HTML, multi-file HTML5/CSS websites, and zero-build static pages. Our AI and stack analyzer detect it automatically, configure opening in browsers, and provide GitHub Pages instructions.',
    },
    {
      q: 'Which programming languages are supported in the workspace?',
      a: 'RepoPilot supports 25+ programming languages out of the box, including HTML5, C++, C, Python, JavaScript, TypeScript, Rust, Go, Java, Kotlin, Swift, C#, PHP, Ruby, SQL, Bash/Shell, Dockerfile, YAML, and more — with automated boilerplates and compilation commands.',
    },
    {
      q: 'How does RepoPilot connect to my GitHub account securely?',
      a: 'RepoPilot connects directly through GitHub OAuth or your authorized Personal Access Token. Authorization tokens are encrypted using AES-256-GCM and stored exclusively in secure server vaults. We never expose tokens to browser logs or database queries.',
    },
    {
      q: 'Does RepoPilot store my source code or project files?',
      a: 'No. RepoPilot processes your files ephemerally in-memory strictly to generate the README and create the GitHub Git Database commit. We operate a strict zero-code-retention architecture: your source code is never permanently stored in our databases.',
    },
    {
      q: 'Will my commits immediately turn into green contribution squares on GitHub?',
      a: 'GitHub calculates green contribution squares based on its own official criteria: the commit must be made to the default branch (e.g. main), the commit email must match your verified GitHub account, and the repository must meet GitHub eligibility rules. Commits made through RepoPilot use your verified GitHub identity, but display timing depends entirely on GitHub.',
    },
    {
      q: 'What happens if the AI provider runs out of free-tier quota?',
      a: 'RepoPilot includes a built-in deterministic Stack Analyzer fallback. If the AI model is rate-limited or unavailable, our system analyzes your package manifests (package.json, requirements.txt, Cargo.toml) and generates a complete, accurate README without hallucinating fake commands or APIs.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-100 overflow-x-hidden relative">
      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Release Pill with Gradient Border */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-brand-500/40 text-xs font-semibold text-brand-300 mb-8 shadow-lg shadow-brand-500/10 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>RepoPilot AI 2.0 &mdash; 25+ Languages &amp; Google Gemini 2.5 Flash</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          From Code to GitHub.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            In One Click.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Stop manually creating empty repositories, writing repetitive README files, and running tedious git commands. RepoPilot generates professional technical documentation with AI and publishes your multi-file project directly to your GitHub account.
        </p>

        {/* Interactive Floating Language Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-mono">
            HTML5
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
            C++20
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-mono">
            Python 3
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-600/10 border border-amber-600/30 text-amber-300 text-xs font-mono">
            Rust
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            Go
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            TypeScript
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
            Java
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            +18 More
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? '/workspace' : '/auth'}
            className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 hover:from-brand-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-2xl shadow-brand-500/25 transition-all hover:scale-[1.03] flex items-center justify-center gap-2 group"
          >
            <span>Start Publishing for Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#bento-features"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-sm transition-all backdrop-blur"
          >
            Explore Bento Architecture &darr;
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-xs">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur">
            <div className="text-xl font-bold font-mono text-cyan-400">0$</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Free Tier Powered</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur">
            <div className="text-xl font-bold font-mono text-emerald-400">1-Click</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Atomic Git Commits</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur">
            <div className="text-xl font-bold font-mono text-brand-400">25+</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Languages Supported</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur">
            <div className="text-xl font-bold font-mono text-rose-400">0 KB</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Code Retained</div>
          </div>
        </div>
      </section>

      {/* Live Interactive Workspace Card */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <SpotlightCard className="p-1.5 shadow-2xl">
          <div className="bg-[#0a0d14] rounded-xl overflow-hidden">
            {/* Window Header */}
            <div className="h-11 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  repopilot-workspace &mdash; polyglot repository publisher
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini 2.5 Flash Online
                </span>
              </div>
            </div>

            {/* Split Visual Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs">
              {/* Left: Files */}
              <div className="p-4 bg-[#0d111a]/90 font-mono space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Workspace Files
                </div>
                <div className="p-2 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30 flex items-center justify-between">
                  <span>📄 index.html</span>
                  <span className="text-[10px] text-orange-400 font-mono">HTML5</span>
                </div>
                <div className="p-2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center justify-between">
                  <span>📄 main.cpp</span>
                  <span className="text-[10px] text-blue-400 font-mono">C++20</span>
                </div>
                <div className="p-2 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 flex items-center justify-between">
                  <span>📄 main.py</span>
                  <span className="text-[10px] text-yellow-400 font-mono">Python</span>
                </div>
                <div className="p-2 rounded text-slate-400 flex items-center justify-between">
                  <span>📄 Makefile</span>
                  <span className="text-[10px] text-slate-500 font-mono">Build</span>
                </div>
              </div>

              {/* Middle: Code Preview */}
              <div className="p-4 font-mono text-slate-300 leading-relaxed bg-[#0a0d14] overflow-hidden">
                <div className="text-slate-500 mb-2">// index.html (Clean HTML5 Web App)</div>
                <div className="text-cyan-400">&lt;!DOCTYPE html&gt;</div>
                <div className="text-cyan-400">&lt;html lang=&quot;en&quot;&gt;</div>
                <div className="pl-4 text-emerald-400">&lt;head&gt;</div>
                <div className="pl-8 text-slate-300">&lt;title&gt;My Application&lt;/title&gt;</div>
                <div className="pl-4 text-emerald-400">&lt;/head&gt;</div>
                <div className="pl-4 text-indigo-300">&lt;body&gt;</div>
                <div className="pl-8 text-white">&lt;h1&gt;Published with RepoPilot AI&lt;/h1&gt;</div>
                <div className="pl-4 text-indigo-300">&lt;/body&gt;</div>
                <div className="text-cyan-400">&lt;/html&gt;</div>
              </div>

              {/* Right: AI README Result */}
              <div className="p-4 bg-slate-950/70 space-y-3">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Auto-Generated README.md
                </div>
                <div className="text-sm font-bold text-white font-mono"># html-landing-showcase</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Standalone single-file web document with responsive styling and interactive JavaScript.
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 space-y-1">
                  <div>open index.html</div>
                  <div className="text-slate-500"># or serve via GitHub Pages</div>
                </div>
                <Link
                  to="/workspace"
                  className="mt-3 block text-center py-2 bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white rounded-lg font-semibold text-xs shadow-md shadow-brand-500/20 transition"
                >
                  Open Live Workspace &rarr;
                </Link>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* Bento Grid Architecture Section */}
      <div id="bento-features">
        <BentoGrid />
      </div>

      {/* Simple 3-Step Flow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Effortless Workflow</h2>
          <p className="mt-2 text-3xl font-bold text-white">How RepoPilot Works</p>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Turn raw code files into a verified, beautifully documented GitHub repository in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpotlightCard className="p-6">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Connect &amp; Pick Code</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authenticate your GitHub account. Paste single-file HTML or C++, upload directories, or pick from our 25+ language templates.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Synthesize Documentation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Gemini 2.5 Flash analyzes your code and package manifests to write a verified README with execution commands and no hallucinations.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Atomic GitHub Publish</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click &quot;Publish.&quot; RepoPilot creates the repository, pushes all file blobs, and creates an atomic Git commit directly under your personal GitHub profile.
            </p>
          </SpotlightCard>
        </div>
      </section>

      {/* GitHub Contribution Accuracy Notice */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <SpotlightCard className="p-6 flex items-start gap-4">
          <HelpCircle className="w-6 h-6 text-brand-400 shrink-0 mt-1" />
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <h3 className="font-bold text-white text-sm">GitHub Contribution Accuracy Statement</h3>
            <p>
              RepoPilot creates real git commits authored directly by your authenticated GitHub identity. We never create fake commits or spoof commit timestamps.
            </p>
            <p className="text-slate-400">
              GitHub determines green square eligibility based on its official rules (commits must be made to the default branch, the commit author email must match your verified GitHub account, and the repository must not be an unmerged fork).
            </p>
            <a
              href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-400 hover:underline pt-1 font-semibold"
            >
              <span>Read GitHub&apos;s Official Contribution Guidelines</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </SpotlightCard>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto relative z-10">
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
                className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden transition"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-brand-900/40 via-slate-900 to-[#0a0d14] border border-brand-500/40 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to publish your first repository?</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Join developers publishing HTML, C++, Python, Rust, and Go code to GitHub in seconds with AI-synthesized documentation.
          </p>
          <div className="pt-2">
            <Link
              to={user ? '/workspace' : '/auth'}
              className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-brand-500/30 transition hover:scale-[1.03]"
            >
              <span>Get Started Now &mdash; It&apos;s 100% Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
