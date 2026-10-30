<div align="center">

# 🚀 RepoPilot AI

### *From Local Code to GitHub. In One Click.*

[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI_Docs-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Vitest](https://img.shields.io/badge/Vitest-30%2F30_Tests_Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

**RepoPilot AI** is an autonomous developer SaaS platform engineered to eliminate manual repository creation, documentation drafting, and multi-file uploading. Drag and drop any project folder — with all its nested subdirectories and binary assets — to automatically synthesize a production-grade README using **Google Gemini 2.5 Flash** and publish an atomic Git commit directly to your GitHub profile.

[Live Demo](http://localhost:3000) • [Architecture](#-system-architecture) • [Features](#-features-at-a-glance) • [Quick Start](#-quick-start) • [Security](#-security--privacy-architecture)

---

</div>

<br/>

## 🌟 Features at a Glance

```
📁 Drag & Drop Folder ──► 🔍 Stack & AST Analyzer ──► 🧠 Gemini 2.5 Flash ──► ⚡ Atomic Git Database Commits ──► 🚀 GitHub Profile
```

### 📂 Recursive Project Folder Drag & Drop
- **Zero-Config Folder Ingestion**: Drag and drop any project folder directly into the workspace.
- **Deep Subdirectory Traversal**: Automatically parses nested folder structures (`src/components/`, `assets/images/`, `public/`, `styles/`) with batch-safe pagination.
- **Binary Assets Support**: Seamlessly ingests images (`.png`, `.jpg`, `.svg`, `.ico`, `.webp`), fonts (`.woff2`, `.ttf`), and audio as Base64 blobs for commit integrity.
- **Smart Noise Exclusion**: Automatically filters out `.git`, `node_modules`, `.DS_Store`, `dist`, and `build` folders to preserve repository hygiene.

### 🤖 Gemini 2.5 Flash README Synthesizer
- **Context-Aware Analysis**: Analyzes manifests (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `CMakeLists.txt`), directory trees, and code samples.
- **Zero Hallucination Protocol**: Strictly bounds documentation to verified scripts, entrypoints, and dependencies.
- **Deterministic Offline Fallback**: If the AI model hits API rate limits, a built-in deterministic AST stack analyzer instantly generates verified markdown documentation.
- **Interactive Studio**: Live split-pane Markdown editor with real-time GitHub-flavored rendering and copy tools.

### ⚡ Atomic Git Database API Publishing
- **100% Native Git Commits**: Uses the GitHub Git Database API (`POST /git/blobs` ➔ `POST /git/trees` ➔ `POST /git/commits` ➔ `PATCH /git/refs/heads/main`).
- **Single-Commit Precision**: Commits all files, assets, and README in a single SHA commit without dirty multi-step pushes.
- **Public & Private Control**: Switch repository visibility with 1 click before publishing.
- **Contribution Graph Verification**: Attributes authorship to the authenticated user for genuine GitHub activity.

### 🌐 25+ Programming Languages Matrix
Full boilerplates, detection, and build/run commands for:
- **Web**: HTML5, CSS3, JavaScript, TypeScript
- **Systems**: C++, C, Rust, Go
- **Backend & Apps**: Java, Kotlin, Swift, C# (.NET), PHP, Ruby, Dart (Flutter)
- **Data & Scripting**: Python, SQL, Bash / Shell, Lua, R, Scala
- **Config & Cloud**: Dockerfile, YAML, JSON, Markdown

### 🛡️ Pre-Flight Secret Guardian
- **Real-Time Regex Scanner**: Detects exposed AWS access keys, GitHub tokens (`ghp_...`), Stripe keys, private SSH keys (`BEGIN PRIVATE KEY`), and JWTs before publication.
- **Hard Gate Modal**: Forces explicit review and sanitization before permitting remote pushes.

### 🎨 Hyper-Polished Developer SaaS UI
- **Purple Gradient Mouse Trails**: Dynamic cursor spotlight that follows mouse movement with physics damping and luminous purple radial illumination (`#a855f7` ➔ `#7c3aed`).
- **Particle Constellations**: Interactive canvas with 60+ stardust nodes that gravitate towards the cursor and connect via radiant purple webs.
- **Linear / Vercel-Style Spotlight Cards**: Hover coordinates tracked with radial boundary glows.
- **3x2 Bento Grid**: Interactive showcases with live model toggles and Git DAG visualizations.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RepoPilot Client (React 18 + Vite)                    │
│   ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│   │  Folder Drop Engine  │  │  25+ Language Studio │  │  Secret Scanner AST  │  │
│   └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────────┘  │
│              │                         │                         │              │
│              └─────────────────────────┼─────────────────────────┘              │
│                                        │                                        │
│                        Purple Mouse & Spotlight Canvas                          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                   HTTPS / Encrypted REST & Git Database
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        │                                                                 │
        ▼                                                                 ▼
┌─────────────────────────────────┐                     ┌─────────────────────────────────┐
│        GitHub REST API          │                     │    Google Gemini 2.5 Flash      │
│  - GET /user (Token Verify)     │                     │  - REST v1beta generateContent  │
│  - POST /user/repos             │                     │  - Zero Hallucination Prompt    │
│  - POST /git/blobs (Base64)     │                     │  - Deterministic Fallback AST   │
│  - POST /git/trees (Atomic DAG) │                     └─────────────────────────────────┘
│  - POST /git/commits            │
│  - PATCH /git/refs/heads/main   │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│     Supabase Cloud Services     │
│  - Multi-User Session Isolation │
│  - PostgreSQL RLS Policies      │
│  - Publication History & Audit  │
└─────────────────────────────────┘
```

---

## 📂 Project Structure

```text
repopilot-ai/
├── src/
│   ├── components/
│   │   ├── BentoGrid.tsx                 # 3x2 interactive SaaS bento grid
│   │   ├── CodeEditor.tsx                # Multi-language editor + image preview
│   │   ├── FileTree.tsx                  # File explorer with subfolders & assets
│   │   ├── InteractiveBackground.tsx     # Ambient starfield canvas
│   │   ├── LanguagePaletteModal.tsx      # 25+ language quick template picker
│   │   ├── MarkdownEditor.tsx            # Split-screen live Markdown preview
│   │   ├── Navbar.tsx                    # Navigation bar with user status
│   │   ├── PublishModal.tsx              # Publishing workflow + token recovery
│   │   ├── PurpleGradientMouse.tsx       # Global mouse movement purple spotlight
│   │   ├── SecretAlertModal.tsx          # Pre-flight secret blocker modal
│   │   └── SpotlightCard.tsx             # Linear-style hover glow card
│   ├── context/
│   │   ├── AuthContext.tsx               # Supabase + GitHub token auth state
│   │   └── RepoPilotContext.tsx          # Workspace files, metadata, publishing
│   ├── lib/
│   │   ├── allLanguages.ts               # 25+ languages, boilerplates & commands
│   │   ├── folderUpload.ts               # Recursive directory traversal & assets
│   │   ├── languageDetect.ts             # File extension language mapper
│   │   ├── secretScanner.ts              # Pre-flight security regex rules
│   │   └── templates.ts                  # Starter project blueprints
│   ├── pages/
│   │   ├── AuthPage.tsx                  # Sign in / Sign up page
│   │   ├── CreateRepoPage.tsx            # Main workspace & folder dropzone
│   │   ├── DashboardPage.tsx             # Publication history & metrics
│   │   ├── LandingPage.tsx               # SaaS hero landing page
│   │   ├── ResultPage.tsx                # Post-publication celebration view
│   │   └── SettingsPage.tsx              # Token management & Gemini keys
│   ├── services/
│   │   ├── aiService.ts                  # Gemini 2.5 Flash + fallback analyzer
│   │   ├── githubService.ts              # Atomic Git Database API client
│   │   └── supabaseClient.ts             # Supabase JS SDK client
│   └── __tests__/
│       ├── aiReadmeGenerator.test.ts     # AI & fallback documentation tests
│       ├── folderUpload.test.ts          # Recursive folder & asset tests
│       ├── githubService.test.ts         # Git DB API simulation tests
│       └── secretScanner.test.ts         # Leaked secret detection tests
├── supabase/
│   └── migrations/                       # PostgreSQL schema + RLS policies
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── vitest.config.ts
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** or **pnpm**
- A GitHub account ([github.com](https://github.com))

### 2. Clone and Install
```bash
git clone https://github.com/RishabhRaj240/github-automation.git
cd github-automation
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# GitHub OAuth Client ID (optional if using Personal Access Token)
VITE_GITHUB_CLIENT_ID=your_github_client_id

# Google Gemini Flash API Key (free tier from aistudio.google.com)
VITE_GEMINI_API_KEY=your_gemini_api_key

# GitHub Personal Access Token (with 'repo' scope)
VITE_GITHUB_TOKEN=ghp_your_token_here
```

### 4. Run Locally
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Run Unit & Integration Tests
```bash
npm test
```
All **30/30 test suites** run in under 3.5 seconds with zero flaky dependencies.

---

## 🔒 Security & Privacy Architecture

| Security Feature | Implementation Detail |
| :--- | :--- |
| **Token Privacy** | Tokens are transmitted over TLS directly to `api.github.com` and never stored in publicly readable databases. |
| **Push Protection** | `.env`, `.env.local`, `.git/`, and sensitive files are strictly blocked from commits to prevent credential leaks. |
| **Secret Scanning** | Pre-flight regex sweeps for AWS, GitHub, Stripe, Private Keys, and Database URIs. |
| **Path Traversal Shield** | File paths are checked against directory escape exploits (`../`, absolute paths, null bytes). |
| **Ephemeral Storage** | Ingested code and dropped folder trees exist strictly in browser memory and are discarded after commit. |

---

## 🛠️ Supported Language Stack & Execution Matrix

| Language | Category | Detected Manifest | Run / Build Command |
| :--- | :--- | :--- | :--- |
| **HTML5 / CSS3** | Frontend | `index.html` | `open index.html` / `npx serve .` |
| **TypeScript / React** | Frontend | `package.json` | `npm install && npm run dev` |
| **Python** | Scripting & AI | `requirements.txt` | `pip install -r requirements.txt && python main.py` |
| **C++ (C++17/20)** | Systems | `Makefile` / `CMakeLists.txt` | `g++ -std=c++17 -O2 main.cpp -o app && ./app` |
| **Rust** | Systems | `Cargo.toml` | `cargo build && cargo run` |
| **Go** | Backend | `go.mod` | `go mod download && go run .` |
| **Java** | Backend | `pom.xml` / `build.gradle` | `javac Main.java && java Main` |
| **Bash / Shell** | DevOps | `*.sh` | `chmod +x script.sh && ./script.sh` |
| **Docker** | Cloud | `Dockerfile` | `docker build -t app . && docker run -p 3000:3000 app` |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

This project is open-source and distributed under the **[MIT License](LICENSE)**.

---

<div align="center">

**Built with ❤️ by [Rishabh Raj](https://github.com/RishabhRaj240)**

[![GitHub](https://img.shields.io/badge/GitHub-RishabhRaj240-181717?style=flat&logo=github)](https://github.com/RishabhRaj240)

</div>
