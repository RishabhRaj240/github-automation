export interface LanguageDefinition {
  id: string;
  name: string;
  extension: string;
  defaultFilename: string;
  category: 'Frontend' | 'Backend' | 'Systems' | 'Scripting' | 'Data & Config' | 'Mobile';
  color: string;
  badgeBg: string;
  description: string;
  compileCommand?: string;
  runCommand: string;
  boilerplate: string;
}

export const ALL_LANGUAGES: LanguageDefinition[] = [
  // 1. HTML5
  {
    id: 'html',
    name: 'HTML5',
    extension: 'html',
    defaultFilename: 'index.html',
    category: 'Frontend',
    color: '#e34f26',
    badgeBg: 'rgba(227, 79, 38, 0.15)',
    description: 'Modern semantic web markup with embedded responsive styles and scripts.',
    runCommand: 'open index.html',
    boilerplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern HTML5 App</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .box {
      background: #1e293b;
      padding: 2.5rem;
      border-radius: 1rem;
      border: 1px solid #334155;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    h1 { color: #38bdf8; margin-bottom: 0.5rem; }
    p { color: #94a3b8; line-height: 1.6; }
    button {
      margin-top: 1.5rem;
      background: #38bdf8;
      color: #0f172a;
      border: none;
      padding: 0.75rem 1.75rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>HTML5 Web Showcase</h1>
    <p>Published seamlessly with RepoPilot AI.</p>
    <button onclick="alert('Hello from RepoPilot!')">Click Me</button>
  </div>
</body>
</html>`,
  },

  // 2. C++
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    defaultFilename: 'main.cpp',
    category: 'Systems',
    color: '#00599c',
    badgeBg: 'rgba(0, 89, 156, 0.15)',
    description: 'High-performance systems programming with modern C++17/20 STL.',
    compileCommand: 'g++ -std=c++17 -O2 main.cpp -o app',
    runCommand: './app',
    boilerplate: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

int main() {
    std::cout << "🚀 RepoPilot C++ Application Initialized" << std::endl;
    
    std::vector<std::string> tools = {"Git Engine", "AI Synthesizer", "Secret Scanner"};
    std::cout << "Active Modules:" << std::endl;
    for (const auto& tool : tools) {
        std::cout << " • " << tool << std::endl;
    }

    return 0;
}`,
  },

  // 3. C
  {
    id: 'c',
    name: 'C',
    extension: 'c',
    defaultFilename: 'main.c',
    category: 'Systems',
    color: '#a8b9cc',
    badgeBg: 'rgba(168, 185, 204, 0.15)',
    description: 'Low-level procedural programming and memory manipulation.',
    compileCommand: 'gcc -O2 main.c -o program',
    runCommand: './program',
    boilerplate: `#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    printf("==================================\\n");
    printf("  RepoPilot C Program Running     \\n");
    printf("==================================\\n");
    printf("Standard C execution completed successfully.\\n");
    return 0;
}`,
  },

  // 4. Python
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    defaultFilename: 'main.py',
    category: 'Scripting',
    color: '#3776ab',
    badgeBg: 'rgba(55, 118, 171, 0.15)',
    description: 'Concise, high-level automation, machine learning, and web backend.',
    runCommand: 'python3 main.py',
    boilerplate: `#!/usr/bin/env python3
"""
RepoPilot Automation Script
"""
import sys
import platform

def main():
    print(f"🐍 Python {platform.python_version()} environment ready.")
    print("✨ Project published seamlessly to GitHub with RepoPilot AI.")

if __name__ == "__main__":
    main()`,
  },

  // 5. JavaScript
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    defaultFilename: 'index.js',
    category: 'Frontend',
    color: '#f7df1e',
    badgeBg: 'rgba(247, 223, 30, 0.15)',
    description: 'Universal language of the web and Node.js asynchronous backend.',
    runCommand: 'node index.js',
    boilerplate: `/**
 * RepoPilot JavaScript Application
 */
console.log("⚡ JavaScript Node.js runtime active.");
const data = { app: "RepoPilot AI", status: "online", timestamp: new Date().toISOString() };
console.table(data);`,
  },

  // 6. TypeScript
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    defaultFilename: 'index.ts',
    category: 'Frontend',
    color: '#3178c6',
    badgeBg: 'rgba(49, 120, 198, 0.15)',
    description: 'Typed superset of JavaScript providing static typing and robust tooling.',
    compileCommand: 'npx tsc index.ts',
    runCommand: 'npx tsx index.ts',
    boilerplate: `interface ProjectConfig {
  name: string;
  version: string;
  features: string[];
}

const config: ProjectConfig = {
  name: "RepoPilot TypeScript Project",
  version: "1.0.0",
  features: ["Type Safety", "Auto Documentation", "Atomic Publishing"],
};

console.log(\`🚀 Loaded \${config.name} v\${config.version}\`);`,
  },

  // 7. Rust
  {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
    defaultFilename: 'main.rs',
    category: 'Systems',
    color: '#dea584',
    badgeBg: 'rgba(222, 165, 132, 0.15)',
    description: 'Blazingly fast, memory-safe systems programming language with zero-cost abstractions.',
    compileCommand: 'rustc main.rs -o app',
    runCommand: './app',
    boilerplate: `fn main() {
    println!("🦀 Hello from memory-safe Rust!");
    let features = vec!["Zero-cost abstractions", "Guaranteed memory safety", "Fearless concurrency"];
    for feature in &features {
        println!(" - {}", feature);
    }
}`,
  },

  // 8. Go
  {
    id: 'go',
    name: 'Go',
    extension: 'go',
    defaultFilename: 'main.go',
    category: 'Backend',
    color: '#00add8',
    badgeBg: 'rgba(0, 173, 216, 0.15)',
    description: 'Simple, fast, and concurrent cloud microservices language designed by Google.',
    compileCommand: 'go build -o app main.go',
    runCommand: 'go run main.go',
    boilerplate: `package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("🐹 Gopher microservice online!")
	fmt.Printf("Startup timestamp: %s\\n", time.Now().Format(time.RFC3339))
}`,
  },

  // 9. Java
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    defaultFilename: 'Main.java',
    category: 'Backend',
    color: '#f89820',
    badgeBg: 'rgba(248, 152, 32, 0.15)',
    description: 'Enterprise cross-platform object-oriented language running on the JVM.',
    compileCommand: 'javac Main.java',
    runCommand: 'java Main',
    boilerplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Java Enterprise Application Running");
        System.out.println("Java Version: " + System.getProperty("java.version"));
    }
}`,
  },

  // 10. Kotlin
  {
    id: 'kotlin',
    name: 'Kotlin',
    extension: 'kt',
    defaultFilename: 'Main.kt',
    category: 'Mobile',
    color: '#7f52ff',
    badgeBg: 'rgba(127, 82, 255, 0.15)',
    description: 'Modern concise language for Android, JVM server-side, and multiplatform.',
    compileCommand: 'kotlinc Main.kt -include-runtime -d Main.jar',
    runCommand: 'java -jar Main.jar',
    boilerplate: `fun main() {
    println("🎯 Hello from Kotlin!")
    val items = listOf("Android", "Coroutines", "Multiplatform")
    items.forEach { println(" • $it") }
}`,
  },

  // 11. Swift
  {
    id: 'swift',
    name: 'Swift',
    extension: 'swift',
    defaultFilename: 'main.swift',
    category: 'Mobile',
    color: '#f05138',
    badgeBg: 'rgba(240, 81, 56, 0.15)',
    description: 'Modern, fast, and safe programming language for iOS, macOS, and Linux.',
    compileCommand: 'swiftc main.swift -o app',
    runCommand: './app',
    boilerplate: `import Foundation

print("🍎 Swift Application Running")
let version = "6.0"
print("Swift version: \\(version)")`,
  },

  // 12. C#
  {
    id: 'csharp',
    name: 'C# / .NET',
    extension: 'cs',
    defaultFilename: 'Program.cs',
    category: 'Backend',
    color: '#239120',
    badgeBg: 'rgba(35, 145, 32, 0.15)',
    description: 'Versatile modern language for cloud web services, Windows, and Unity games.',
    runCommand: 'dotnet run',
    boilerplate: `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("✨ C# .NET Core Console Service Online");
        Console.WriteLine($"Current UTC Time: {DateTime.UtcNow:s}");
    }
}`,
  },

  // 13. PHP
  {
    id: 'php',
    name: 'PHP',
    extension: 'php',
    defaultFilename: 'index.php',
    category: 'Backend',
    color: '#777bb4',
    badgeBg: 'rgba(119, 123, 180, 0.15)',
    description: 'Server-side scripting powering millions of dynamic web applications.',
    runCommand: 'php -S localhost:8000 index.php',
    boilerplate: `<?php
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'Hello from modern PHP 8.x!',
    'time' => date('c')
]);`,
  },

  // 14. Ruby
  {
    id: 'ruby',
    name: 'Ruby',
    extension: 'rb',
    defaultFilename: 'main.rb',
    category: 'Backend',
    color: '#cc342d',
    badgeBg: 'rgba(204, 52, 45, 0.15)',
    description: 'Dynamic language focused on developer happiness and Rails web apps.',
    runCommand: 'ruby main.rb',
    boilerplate: `#!/usr/bin/env ruby

puts "💎 Hello from Ruby!"
[1, 2, 3].each do |num|
  puts "Step #{num}: RepoPilot AI publishing engine ready"
end`,
  },

  // 15. SQL
  {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    defaultFilename: 'schema.sql',
    category: 'Data & Config',
    color: '#e38c00',
    badgeBg: 'rgba(227, 140, 0, 0.15)',
    description: 'Relational database schema definitions, queries, and migrations.',
    runCommand: 'psql -f schema.sql',
    boilerplate: `-- Relational Database Schema
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);`,
  },

  // 16. Shell / Bash
  {
    id: 'bash',
    name: 'Bash / Shell',
    extension: 'sh',
    defaultFilename: 'script.sh',
    category: 'Scripting',
    color: '#4eaa25',
    badgeBg: 'rgba(78, 170, 37, 0.15)',
    description: 'Automated command scripts and pipeline orchestration.',
    runCommand: 'bash script.sh',
    boilerplate: `#!/usr/bin/env bash
set -euo pipefail

echo "==================================="
echo "🚀 RepoPilot Shell Script Execution"
echo "==================================="
echo "System Host: $(uname -s)"
echo "Current Directory: $(pwd)"
echo "Finished successfully!"`,
  },

  // 17. Dockerfile
  {
    id: 'dockerfile',
    name: 'Dockerfile',
    extension: 'dockerfile',
    defaultFilename: 'Dockerfile',
    category: 'Data & Config',
    color: '#2496ed',
    badgeBg: 'rgba(36, 150, 237, 0.15)',
    description: 'Container specifications for reproducible deployments across any cloud.',
    runCommand: 'docker build -t my-app . && docker run -p 8080:8080 my-app',
    boilerplate: `FROM alpine:latest

WORKDIR /app
COPY . .

RUN echo "Container build initialized"

CMD ["sh", "-c", "echo Container running successfully!"]`,
  },

  // 18. CSS3 / SCSS
  {
    id: 'css',
    name: 'CSS3',
    extension: 'css',
    defaultFilename: 'styles.css',
    category: 'Frontend',
    color: '#1572b6',
    badgeBg: 'rgba(21, 114, 182, 0.15)',
    description: 'Responsive layouts, variables, keyframe animations, and styling.',
    runCommand: 'Open alongside index.html',
    boilerplate: `/* Modern Responsive CSS Stylesheet */
:root {
  --primary: #8b5cf6;
  --secondary: #06b6d4;
  --bg-dark: #0a0d14;
  --text-light: #f8fafc;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-light);
}`,
  },

  // 19. JSON
  {
    id: 'json',
    name: 'JSON',
    extension: 'json',
    defaultFilename: 'data.json',
    category: 'Data & Config',
    color: '#cbcb41',
    badgeBg: 'rgba(203, 203, 65, 0.15)',
    description: 'Standard lightweight data interchange format.',
    runCommand: 'JSON configuration file',
    boilerplate: `{
  "name": "repopilot-configuration",
  "version": "1.0.0",
  "environment": "production",
  "features": {
    "aiDocumentation": true,
    "atomicCommit": true,
    "secretScanner": true
  }
}`,
  },

  // 20. YAML / GitHub Actions
  {
    id: 'yaml',
    name: 'YAML / CI/CD',
    extension: 'yml',
    defaultFilename: 'ci.yml',
    category: 'Data & Config',
    color: '#cb171e',
    badgeBg: 'rgba(203, 23, 30, 0.15)',
    description: 'Automated GitHub Actions CI/CD workflows and Docker Compose definitions.',
    runCommand: 'GitHub Actions workflow',
    boilerplate: `name: Build & Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run verification
        run: echo "Repository verified by RepoPilot AI"`,
  },

  // 21. Markdown
  {
    id: 'markdown',
    name: 'Markdown',
    extension: 'md',
    defaultFilename: 'NOTES.md',
    category: 'Data & Config',
    color: '#083fa1',
    badgeBg: 'rgba(8, 63, 161, 0.15)',
    description: 'Clean formatted technical documentation and project specifications.',
    runCommand: 'Rendered in markdown viewer',
    boilerplate: `# Project Architectural Specifications

## Goals
- Automate repository creation and README generation.
- Zero credential leakage guarantee.
- High-performance multi-language workspace.`,
  },

  // 22. Dart
  {
    id: 'dart',
    name: 'Dart / Flutter',
    extension: 'dart',
    defaultFilename: 'main.dart',
    category: 'Mobile',
    color: '#0175c2',
    badgeBg: 'rgba(1, 117, 194, 0.15)',
    description: 'Client-optimized language for fast apps on any platform (Flutter).',
    runCommand: 'dart run main.dart',
    boilerplate: `void main() {
  print('🎯 Dart CLI online!');
  final languages = ['Flutter', 'Web', 'Server'];
  for (final lang in languages) {
    print(' • $lang');
  }
}`,
  },

  // 23. Lua
  {
    id: 'lua',
    name: 'Lua',
    extension: 'lua',
    defaultFilename: 'main.lua',
    category: 'Scripting',
    color: '#000080',
    badgeBg: 'rgba(0, 0, 128, 0.15)',
    description: 'Lightweight embeddable scripting language for game engines and tools.',
    runCommand: 'lua main.lua',
    boilerplate: `print("🌙 Hello from Lua!")
local stats = { fps = 60, status = "running" }
for k, v in pairs(stats) do
    print(k .. ": " .. tostring(v))
end`,
  },

  // 24. R
  {
    id: 'r',
    name: 'R',
    extension: 'r',
    defaultFilename: 'analysis.R',
    category: 'Data & Config',
    color: '#276dc3',
    badgeBg: 'rgba(39, 109, 195, 0.15)',
    description: 'Statistical computing, data analysis, and graphical plots.',
    runCommand: 'Rscript analysis.R',
    boilerplate: `# Statistical Analysis Script
data <- c(12, 15, 23, 28, 35, 42)
mean_val <- mean(data)
cat("Calculated Mean:", mean_val, "\\n")`,
  },

  // 25. Scala
  {
    id: 'scala',
    name: 'Scala',
    extension: 'scala',
    defaultFilename: 'Main.scala',
    category: 'Backend',
    color: '#dc322f',
    badgeBg: 'rgba(220, 50, 47, 0.15)',
    description: 'Functional and object-oriented language for large-scale distributed systems.',
    compileCommand: 'scalac Main.scala',
    runCommand: 'scala Main',
    boilerplate: `object Main {
  def main(args: Array[String]): Unit = {
    println("⚡ Scala Functional Runtime Running")
    val nums = List(1, 2, 3, 4, 5)
    println(s"Sum: \${nums.sum}")
  }
}`,
  },
];
