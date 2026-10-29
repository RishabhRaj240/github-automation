# RepoPilot AI 🚀

> **From Code to GitHub. In One Click.**
> A production-oriented, multi-user developer SaaS application that analyzes source code, generates technically accurate documentation using AI, and publishes repositories directly to authenticated GitHub accounts with atomic Git Database commits.

---

## 🌟 Key Features

- **Real GitHub OAuth Authorization**: Authenticate directly with GitHub. No asking developers to paste insecure Personal Access Tokens (PATs).
- **Server-Side AES-256-GCM Token Encryption**: Access tokens are encrypted before saving in PostgreSQL and decrypted strictly in server-side Edge Functions.
- **AI-Powered README Studio**: Generates comprehensive README files using Google Gemini 1.5 Flash (free tier) with zero hallucinations.
- **Deterministic Non-AI Fallback**: Built-in stack analyzer automatically generates verified READMEs if the AI provider is rate-limited or unavailable.
- **Pre-Publish Secret Scanner**: Scans project files in real time for leaked AWS keys, GitHub tokens, private SSH keys, and database credentials before publishing.
- **Atomic Multi-File Commits**: Utilizes the GitHub Git Database API (`blobs` -> `trees` -> `commits` -> `refs`) to push all files in a single atomic commit.
- **Directory Traversal Protection**: Rejects unsafe paths (`../`, `.git/`, absolute `/`) and ensures strict multi-user Row Level Security (RLS) isolation.
- **GitHub Contribution Accuracy**: Fully compliant with GitHub's commit authorship rules without fake commits or manipulated timestamps.
- **Local Demo Mode**: Test drive the entire UI, workspace, and publishing pipeline offline without needing external credentials.

---

## 🏗️ Architecture & Technology Stack

```text
┌────────────────────────────────────────────────────────┐
│                   RepoPilot Frontend                   │
│   React 18 + TypeScript + Vite + Tailwind CSS + Lucide │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTPS / Supabase Client API
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Supabase Backend                    │
│  - PostgreSQL with Row Level Security (RLS)            │
│  - Supabase Auth (Multi-User Session Isolation)        │
│  - Edge Functions (TypeScript / Deno Runtime)          │
│    • github-oauth (AES-256 token exchange)             │
│    • github-status & github-disconnect                 │
│    • publish-repo (Server-side Git API Publisher)      │
│    • generate-readme (Gemini AI + Fallback)            │
└───────────────────────────┬────────────────────────────┘
                            │
              Secure Server-Side API Calls
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│    GitHub API    │                  │  Google Gemini   │
│  (REST & Git DB) │                  │ (1.5 Flash Free) │
└──────────────────┘                  └──────────────────┘
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router v6, Lucide icons.
- **Backend & Database**: Supabase Auth, PostgreSQL, Row Level Security (RLS), Supabase Edge Functions (Deno).
- **AI Documentation**: Google Gemini 1.5 Flash (free tier) + Deterministic Stack Analyzer fallback.
- **Deployment**: Vercel (Frontend) + Supabase (Backend).

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ (tested on v26)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/repopilot-ai.git
cd repopilot-ai
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GEMINI_API_KEY=AIzaSy...
VITE_GITHUB_CLIENT_ID=your_oauth_client_id
```

*(Note: If you leave these values empty, RepoPilot will automatically start in **Demo Mode**, allowing you to test the entire interface and simulation pipeline).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

RepoPilot includes comprehensive Vitest unit and integration tests covering secret detection, path traversal, repository name rules, stack detection, and publishing payloads:

```bash
npm test
```

Build verification:
```bash
npm run build
```

---

## 📊 Free-Tier Limits & Operational Costs

RepoPilot is engineered to run at **\$0/month** on genuinely free developer tiers:

| Component | Free Tier Provider | Limits | Overage Behavior |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel Hobby | 100 GB bandwidth / mo | Throttled / soft warning |
| **Backend & DB** | Supabase Free | 500 MB DB, 50k MAU | Email alerts at 80% & 100% |
| **AI Documentation** | Google Gemini 1.5 Flash | 15 RPM, 1,500 RPD | Automatic fallback to local Stack Analyzer |
| **GitHub Publishing** | GitHub REST API | 5,000 req/hr per user | HTTP 403 with `x-ratelimit-reset` header warning |

---

## 🔒 Security Model & Isolation

1. **Zero Raw Token Storage in Browser**: GitHub tokens are never stored in `localStorage`, cookies, or client-readable database fields.
2. **AES-256-GCM Encryption**: Stored tokens in `github_connections` are encrypted using AES-256-GCM with unique initialization vectors (IVs).
3. **Row Level Security (RLS)**: Enforced on all user tables (`profiles`, `github_connections`, `projects`, `publications`, `usage_events`).
4. **Zero Code Retention**: Source code is processed ephemerally in-memory during publishing and is never stored permanently in database records.
5. **Pre-Publish Secret Scanner**: Protects developers by intercepting accidental commits containing cloud API keys or private keys.

---

## 📚 Documentation Directory

- [GitHub OAuth & App Setup Guide](docs/GITHUB_SETUP.md)
- [Supabase Configuration & Database Setup Guide](docs/SUPABASE_SETUP.md)
- [AI Provider Setup & Free Tier Guide](docs/AI_PROVIDER_SETUP.md)
- [Vercel Deployment Guide](docs/VERCEL_DEPLOYMENT.md)
- [Production Security Checklist](docs/PRODUCTION_SECURITY_CHECKLIST.md)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

