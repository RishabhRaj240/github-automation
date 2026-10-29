import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  Zap,
  Lock,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { ALL_LANGUAGES } from '../lib/allLanguages';

export const BentoGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'html' | 'cpp' | 'python'>('html');

  const previewSnippets: Record<string, { title: string; code: string; readmePreview: string }> = {
    html: {
      title: 'index.html',
      code: '<!DOCTYPE html>\n<html>\n  <head><title>App</title></head>\n  <body>\n    <h1>Hello Web</h1>\n  </body>\n</html>',
      readmePreview: '# Modern Web App\n\n> Static HTML5 showcase\n\n### Running:\n`open index.html`',
    },
    cpp: {
      title: 'main.cpp',
      code: '#include <iostream>\n\nint main() {\n  std::cout << "Fast C++20" << std::endl;\n  return 0;\n}',
      readmePreview: '# C++ High Performance App\n\n### Compile:\n`g++ -std=c++17 main.cpp -o app`',
    },
    python: {
      title: 'main.py',
      code: 'import os\n\ndef run():\n    print("Automation active")\n\nif __name__ == "__main__":\n    run()',
      readmePreview: '# Python Automation Tool\n\n### Usage:\n`python3 main.py`',
    },
  };

  const previewLanguages = ALL_LANGUAGES.slice(0, 16);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-300 mb-4">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Developer Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Engineered for developers who{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            value their time.
          </span>
        </h2>
        <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
          From single-file HTML landing pages to full multi-module C++ or Python codebases, RepoPilot AI handles the entire documentation and deployment pipeline.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: AI README Synthesizer (2 Columns Wide) */}
        <SpotlightCard className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    Gemini 2.5 Flash README Studio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time manifest parsing, zero hallucination AST analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>15 RPM Free Tier</span>
              </div>
            </div>

            {/* Language Toggle Pills */}
            <div className="flex gap-2 my-4">
              {(['html', 'cpp', 'python'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition ${
                    activeTab === tab
                      ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'html' ? 'HTML5' : tab === 'cpp' ? 'C++20' : 'Python'}
                </button>
              ))}
            </div>

            {/* Split Visual: Code -> Markdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* Left Code */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-[10px] text-slate-500 flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <span>INPUT: {previewSnippets[activeTab].title}</span>
                  <span className="text-cyan-400">ANALYZED</span>
                </div>
                <pre className="text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
                  {previewSnippets[activeTab].code}
                </pre>
              </div>

              {/* Right Output */}
              <div className="bg-gradient-to-br from-slate-950 to-brand-950/30 p-4 rounded-xl border border-brand-500/30 font-mono text-xs text-slate-200 space-y-2">
                <div className="text-[10px] text-brand-300 flex items-center justify-between border-b border-brand-500/20 pb-1.5">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> GENERATED README.md
                  </span>
                  <span className="text-[10px] text-slate-400">Instant</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
                  {previewSnippets[activeTab].readmePreview}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Includes auto stack badges, prerequisites, run commands, and MIT license.</span>
            <span className="text-brand-400 font-semibold flex items-center gap-1">
              Deterministic fallback built-in &rarr;
            </span>
          </div>
        </SpotlightCard>

        {/* Card 2: Atomic Git Database Engine (1 Column) */}
        <SpotlightCard className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Atomic Git Commits</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              No multiple messy commits. RepoPilot uses GitHub&apos;s low-level Git Database API to upload blobs, create a tree, and commit in one atomic step.
            </p>

            {/* Visual Git Tree Diagram */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
                <span className="text-white font-semibold">refs/heads/main</span>
              </div>
              <div className="pl-1.5 border-l-2 border-dashed border-slate-700 ml-1.5 space-y-2 py-1 text-[11px]">
                <div className="text-slate-400 pl-3">↳ Blob Hash: <code>a4f7e2</code> (README.md)</div>
                <div className="text-slate-400 pl-3">↳ Tree SHA: <code>98c21a</code> (Atomic)</div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 pt-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Single Commit SHA Generated</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-[11px] text-slate-500">
            Fully compatible with GitHub contribution authorship criteria.
          </div>
        </SpotlightCard>

        {/* Card 3: Pre-Flight Threat Guardian (1 Column) */}
        <SpotlightCard className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Pre-Flight Secret Scanner</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Prevents accidental leaks of AWS credentials, GitHub PATs, private SSH keys, and database passwords before anything touches GitHub.
            </p>

            {/* Scanner Visualizer */}
            <div className="mt-6 p-3.5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">SCAN STATUS:</span>
                <span className="text-emerald-400 font-mono font-bold">MONITORED</span>
              </div>
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Intercepts: ghp_*, AKIA*, RSA KEY</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-[11px] text-slate-500">
            Client-side regex scanning with zero payload logging.
          </div>
        </SpotlightCard>

        {/* Card 4: Polyglot Language Matrix (2 Columns Wide) */}
        <SpotlightCard className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    25+ Language Support Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    HTML5, C++, C, Python, JavaScript, TypeScript, Rust, Go, Java, Swift &amp; more
                  </p>
                </div>
              </div>
              <span className="text-xs text-brand-400 font-mono font-semibold">
                Single or Multi-File
              </span>
            </div>

            {/* Language Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
              {previewLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-brand-500/50 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: lang.color }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-mono font-semibold text-white group-hover:text-brand-300 transition">
                      {lang.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{lang.defaultFilename}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Includes tailored execution commands &amp; compilation guides for every stack.</span>
            <span className="text-cyan-400 font-semibold font-mono text-[11px]">
              Ready for immediate publishing
            </span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
};

