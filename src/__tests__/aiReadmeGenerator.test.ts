import { describe, it, expect } from 'vitest';
import { generateDeterministicReadme } from '../services/aiService';
import { analyzeProjectStack } from '../lib/languageDetect';
import { ProjectFile, ProjectMetadata } from '../types';

describe('AI & Stack Detection: Manifest Analysis', () => {
  it('accurately identifies Node.js / React projects from package.json without hallucinations', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'package.json',
        content: JSON.stringify({
          name: 'my-react-app',
          dependencies: {
            react: '^18.2.0',
            tailwindcss: '^3.4.0',
          },
        }),
        size: 150,
        language: 'json',
      },
      {
        id: '2',
        path: 'src/App.tsx',
        content: 'export default function App() { return <div>Hello</div>; }',
        size: 80,
        language: 'typescript',
      },
    ];

    const stack = analyzeProjectStack(files);
    expect(stack.primaryLanguage).toBe('TypeScript');
    expect(stack.framework).toContain('React');
    expect(stack.runtime).toBe('Node.js');
    expect(stack.packageManager).toContain('npm');
    expect(stack.dependencies).toContain('react');
    expect(stack.dependencies).toContain('tailwindcss');
  });

  it('accurately identifies Python / FastAPI projects from requirements.txt', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'requirements.txt',
        content: 'fastapi==0.110.0\nuvicorn>=0.28.0\npydantic>=2.6.0\n',
        size: 70,
        language: 'plaintext',
      },
      {
        id: '2',
        path: 'main.py',
        content: 'from fastapi import FastAPI\napp = FastAPI()',
        size: 50,
        language: 'python',
      },
    ];

    const stack = analyzeProjectStack(files);
    expect(stack.primaryLanguage).toBe('Python');
    expect(stack.framework).toBe('FastAPI');
    expect(stack.runtime).toBe('Python 3');
  });

  it('accurately identifies Rust projects from Cargo.toml', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'Cargo.toml',
        content: '[package]\nname = "rust-service"\nversion = "0.1.0"\n[dependencies]\nactix-web = "4"',
        size: 80,
        language: 'toml',
      },
    ];

    const stack = analyzeProjectStack(files);
    expect(stack.primaryLanguage).toBe('Rust');
    expect(stack.framework).toBe('Actix Web');
  });
});

describe('AI & Stack Detection: README Generation Quality', () => {
  it('generates a clean, comprehensive markdown README matching detected stack', () => {
    const metadata: ProjectMetadata = {
      name: 'super-analytics',
      description: 'Real-time telemetry and dashboard utility',
      visibility: 'public',
      license: 'MIT',
    };

    const files: ProjectFile[] = [
      {
        id: '1',
        path: 'package.json',
        content: JSON.stringify({
          dependencies: { express: '^4.19.0' },
        }),
        size: 100,
        language: 'json',
      },
      {
        id: '2',
        path: 'src/server.js',
        content: 'const express = require("express");',
        size: 50,
        language: 'javascript',
      },
    ];

    const readme = generateDeterministicReadme(metadata, files, 'octodev');

    expect(readme).toContain('# super-analytics');
    expect(readme).toContain('Real-time telemetry and dashboard utility');
    expect(readme).toContain('https://github.com/octodev/super-analytics.git');
    expect(readme).toContain('npm install');
    expect(readme).toContain('npm run dev');
    expect(readme).toContain('## 📂 Project Structure');
    expect(readme).toContain('├── package.json');
    expect(readme).toContain('└── src/server.js');
    expect(readme).toContain('MIT');
  });
});

