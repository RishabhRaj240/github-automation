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
    id: 'single-html',
    title: 'Single-File HTML Only',
    description: 'Clean, standalone HTML5 document with embedded modern CSS and interactive JavaScript.',
    badge: 'HTML',
    metadata: {
      name: 'html-landing-showcase',
      description: 'Responsive single-file HTML5 web application with modern CSS grid, dark theme, and interactive scripts.',
      visibility: 'public',
      license: 'MIT',
    },
    files: [
      {
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern HTML5 Showcase</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --text: #f8fafc;
      --accent: #38bdf8;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 2.5rem;
      max-width: 520px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
    }
    h1 {
      font-size: 2rem;
      color: var(--accent);
      margin-bottom: 0.75rem;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .btn {
      background: var(--accent);
      color: #0f172a;
      border: none;
      padding: 0.75rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
    }
    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .counter {
      margin-top: 1.5rem;
      font-family: monospace;
      font-size: 1.25rem;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>HTML5 Web Showcase</h1>
    <p>Published seamlessly to GitHub with RepoPilot AI. A lightweight, standalone web document with embedded CSS and modern JavaScript.</p>
    <button class="btn" id="clickBtn">Click Me</button>
    <div class="counter" id="counterDisplay">Clicks: 0</div>
  </div>

  <script>
    let count = 0;
    const btn = document.getElementById('clickBtn');
    const display = document.getElementById('counterDisplay');

    btn.addEventListener('click', () => {
      count++;
      display.textContent = 'Clicks: ' + count;
    });
  </script>
</body>
</html>
`,
      },
    ],
  },
  {
    id: 'cpp-app',
    title: 'Modern C++ Application',
    description: 'High-performance C++17/20 command line program with standard libraries and automated Makefile build.',
    badge: 'C++',
    metadata: {
      name: 'modern-cpp-app',
      description: 'High performance C++17 application utilizing STL algorithms, structured classes, and a standard Makefile.',
      visibility: 'public',
      license: 'MIT',
    },
    files: [
      {
        path: 'main.cpp',
        language: 'cpp',
        content: `#include <iostream>
#include <vector>
#include <string>
#include <numeric>
#include <algorithm>

class TaskRunner {
private:
    std::string appName;
    std::vector<std::string> steps;

public:
    TaskRunner(std::string name) : appName(std::move(name)) {}

    void addStep(const std::string& step) {
        steps.push_back(step);
    }

    void execute() const {
        std::cout << "========================================" << std::endl;
        std::cout << "🚀 Running: " << appName << std::endl;
        std::cout << "========================================" << std::endl;

        for (size_t i = 0; i < steps.size(); ++i) {
            std::cout << " [" << (i + 1) << "/" << steps.size() << "] " << steps[i] << std::endl;
        }

        std::cout << "\\n✨ Execution completed successfully!" << std::endl;
    }
};

int main(int argc, char* argv[]) {
    std::cout << "Starting C++ Application..." << std::endl;

    TaskRunner runner("RepoPilot C++ Engine");
    runner.addStep("Initialize core telemetry");
    runner.addStep("Parse command line arguments");
    runner.addStep("Execute parallel workload");
    runner.addStep("Clean up system resources");

    runner.execute();
    return 0;
}
`,
      },
      {
        path: 'Makefile',
        language: 'makefile',
        content: `CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2
TARGET = app

all: $(TARGET)

$(TARGET): main.cpp
\t$(CXX) $(CXXFLAGS) -o $(TARGET) main.cpp

clean:
\trm -f $(TARGET)

run: all
\t./$(TARGET)

.PHONY: all clean run
`,
      },
    ],
  },
  {
    id: 'react-vite',
    title: 'React + TypeScript SPA',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
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
  {
    id: 'node-api',
    title: 'Node.js Express REST API',
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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server listening on http://localhost:\${PORT}\`);
});
`,
      },
    ],
  },
];
