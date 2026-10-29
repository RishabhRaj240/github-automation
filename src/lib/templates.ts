import { ProjectFile, ProjectMetadata } from '../types';

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  badge: string;
  metadata: ProjectMetadata;
  files: Omit<ProjectFile, 'id' | 'size'>[];
}

export const STARTER_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'react-vite',
    title: 'React + TypeScript + Tailwind SPA',
    description: 'Modern frontend application with Vite, React 18, TypeScript, and clean responsive components.',
    badge: 'Frontend',
    metadata: {
      name: 'modern-react-spa',
      description: 'Lightning-fast React 18 single page application powered by Vite, Tailwind CSS, and TypeScript.',
      visibility: 'public',
      license: 'MIT',
    },
    files: [
      {
        path: 'package.json',
        language: 'json',
        content: JSON.stringify(
          {
            name: 'modern-react-spa',
            private: true,
            version: '1.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              preview: 'vite preview',
            },
            dependencies: {
              react: '^18.3.1',
              'react-dom': '^18.3.1',
              'lucide-react': '^1.16.0',
            },
            devDependencies: {
              '@types/react': '^18.3.18',
              '@types/react-dom': '^18.3.5',
              '@vitejs/plugin-react': '^4.3.4',
              tailwindcss: '^3.4.17',
              typescript: '^5.8.2',
              vite: '^6.2.1',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'src/App.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          RepoPilot Starter
        </h1>
        <p className="text-slate-400 mt-2">
          Your project was published to GitHub automatically with RepoPilot AI.
        </p>
        <div className="mt-6 flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <span className="text-sm font-medium text-slate-300">Counter State:</span>
          <span className="text-2xl font-mono font-bold text-cyan-400">{count}</span>
        </div>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          Increment Counter
        </button>
      </div>
    </div>
  );
}
`,
      },
      {
        path: 'src/main.tsx',
        language: 'typescript',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: 'src/index.css',
        language: 'css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
`,
      },
    ],
  },
  {
    id: 'node-api',
    title: 'Node.js + Express REST API',
    description: 'Clean backend microservice with health checks, structured routing, and environment validation.',
    badge: 'Backend',
    metadata: {
      name: 'express-rest-service',
      description: 'Production-ready Node.js REST API with health probes, error middleware, and modular routes.',
      visibility: 'public',
      license: 'MIT',
    },
    files: [
      {
        path: 'package.json',
        language: 'json',
        content: JSON.stringify(
          {
            name: 'express-rest-service',
            version: '1.0.0',
            main: 'src/server.js',
            scripts: {
              start: 'node src/server.js',
              dev: 'nodemon src/server.js',
            },
            dependencies: {
              express: '^4.21.2',
              cors: '^2.8.5',
              dotenv: '^16.4.7',
            },
          },
          null,
          2
        ),
      },
      {
        path: 'src/server.js',
        language: 'javascript',
        content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Sample API resource
app.get('/api/items', (req, res) => {
  res.json({
    data: [
      { id: '1', name: 'Developer Tooling', active: true },
      { id: '2', name: 'Automation Pipeline', active: true }
    ]
  });
});

app.listen(PORT, () => {
  console.log(\`Server listening on http://localhost:\${PORT}\`);
});
`,
      },
    ],
  },
  {
    id: 'python-cli',
    title: 'Python CLI Utility',
    description: 'Scriptable command-line tool with argument parsing, colorized logs, and virtualenv manifest.',
    badge: 'Python',
    metadata: {
      name: 'dev-pilot-cli',
      description: 'Automated Python 3 CLI for analyzing developer workflows and generating system telemetry.',
      visibility: 'public',
      license: 'MIT',
    },
    files: [
      {
        path: 'requirements.txt',
        language: 'plaintext',
        content: `requests>=2.31.0
click>=8.1.7
rich>=13.7.0
python-dotenv>=1.0.1
`,
      },
      {
        path: 'main.py',
        language: 'python',
        content: `#!/usr/bin/env python3
"""
Dev Pilot CLI Tool
Published with RepoPilot AI
"""
import sys
import argparse

def main():
    parser = argparse.ArgumentParser(description="RepoPilot CLI automation utility")
    parser.add_argument("--name", "-n", default="Developer", help="Name to greet")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logs")
    
    args = parser.parse_args()
    
    if args.verbose:
        print("[DEBUG] Verbose logging initialized.")
        
    print(f"🚀 Hello, {args.name}! Welcome to your freshly published GitHub repository.")

if __name__ == "__main__":
    main()
`,
      },
    ],
  },
];
