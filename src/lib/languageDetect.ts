import { ProjectFile } from '../types';

export interface DetectedStack {
  primaryLanguage: string;
  framework?: string;
  runtime?: string;
  packageManager?: string;
  manifestFile?: string;
  dependencies: string[];
}

export function detectLanguageByExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cc: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    rb: 'ruby',
    php: 'php',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    sql: 'sql',
    dockerfile: 'dockerfile',
    toml: 'toml',
    xml: 'xml',
    env: 'shell',
  };

  if (filename.toLowerCase() === 'dockerfile') return 'dockerfile';
  if (filename.toLowerCase() === 'makefile') return 'makefile';

  return map[ext] || 'plaintext';
}

/**
 * Analyzes manifest files (package.json, requirements.txt, Cargo.toml, go.mod, etc.)
 * to identify framework, language, and dependencies without hallucination.
 */
export function analyzeProjectStack(files: ProjectFile[]): DetectedStack {
  const result: DetectedStack = {
    primaryLanguage: 'Unknown',
    dependencies: [],
  };

  // Check package.json
  const packageJsonFile = files.find((f) => f.path.toLowerCase() === 'package.json');
  if (packageJsonFile) {
    try {
      const parsed = JSON.parse(packageJsonFile.content);
      result.runtime = 'Node.js';
      result.packageManager = 'npm / yarn / pnpm';
      result.manifestFile = 'package.json';

      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      result.dependencies = Object.keys(deps);

      if (deps['react']) result.framework = 'React';
      if (deps['next']) result.framework = 'Next.js';
      if (deps['vue']) result.framework = 'Vue.js';
      if (deps['@angular/core']) result.framework = 'Angular';
      if (deps['express']) result.framework = result.framework ? `${result.framework} + Express` : 'Express.js';
      if (deps['fastify']) result.framework = 'Fastify';
      if (deps['nestjs'] || deps['@nestjs/core']) result.framework = 'NestJS';
      if (deps['tailwindcss']) result.framework = result.framework ? `${result.framework} (Tailwind CSS)` : 'Tailwind CSS';

      const hasTs = files.some((f) => f.path.endsWith('.ts') || f.path.endsWith('.tsx')) || deps['typescript'];
      result.primaryLanguage = hasTs ? 'TypeScript' : 'JavaScript';
      return result;
    } catch {
      // JSON parse error, continue
    }
  }

  // Check requirements.txt or pyproject.toml
  const reqFile = files.find((f) => f.path.toLowerCase() === 'requirements.txt');
  const pyprojectFile = files.find((f) => f.path.toLowerCase() === 'pyproject.toml');
  if (reqFile || pyprojectFile) {
    result.primaryLanguage = 'Python';
    result.runtime = 'Python 3';
    result.manifestFile = reqFile ? 'requirements.txt' : 'pyproject.toml';

    const content = reqFile ? reqFile.content : pyprojectFile!.content;
    const lines = content.split('\n');
    lines.forEach((l) => {
      const trimmed = l.trim().split(/[=><~]/)[0].trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('[')) {
        result.dependencies.push(trimmed);
      }
    });

    if (result.dependencies.includes('fastapi')) result.framework = 'FastAPI';
    else if (result.dependencies.includes('django')) result.framework = 'Django';
    else if (result.dependencies.includes('flask')) result.framework = 'Flask';

    return result;
  }

  // Check Cargo.toml (Rust)
  const cargoFile = files.find((f) => f.path.toLowerCase() === 'cargo.toml');
  if (cargoFile) {
    result.primaryLanguage = 'Rust';
    result.runtime = 'Rust / Cargo';
    result.manifestFile = 'Cargo.toml';
    if (cargoFile.content.includes('actix-web')) result.framework = 'Actix Web';
    if (cargoFile.content.includes('axum')) result.framework = 'Axum';
    if (cargoFile.content.includes('tokio')) result.framework = 'Tokio Async';
    return result;
  }

  // Check go.mod (Go)
  const goModFile = files.find((f) => f.path.toLowerCase() === 'go.mod');
  if (goModFile) {
    result.primaryLanguage = 'Go';
    result.runtime = 'Go 1.x';
    result.manifestFile = 'go.mod';
    if (goModFile.content.includes('github.com/gin-gonic/gin')) result.framework = 'Gin';
    if (goModFile.content.includes('github.com/gofiber/fiber')) result.framework = 'Fiber';
    return result;
  }

  // Fallback: frequency analysis by file extensions
  const extCounts: Record<string, number> = {};
  for (const f of files) {
    const lang = detectLanguageByExtension(f.path);
    if (lang !== 'plaintext' && lang !== 'markdown' && lang !== 'json') {
      extCounts[lang] = (extCounts[lang] || 0) + 1;
    }
  }

  let highestCount = 0;
  let topLang = 'Plaintext';
  for (const [lang, count] of Object.entries(extCounts)) {
    if (count > highestCount) {
      highestCount = count;
      topLang = lang.charAt(0).toUpperCase() + lang.slice(1);
    }
  }

  result.primaryLanguage = topLang;
  return result;
}
