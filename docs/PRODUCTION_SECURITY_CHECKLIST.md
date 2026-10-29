# Production Security Checklist

Use this checklist before taking RepoPilot AI to a live public domain.

---

## 1. Authentication & OAuth Security
- [x] **No Personal Access Token (PAT) text fields:** Users authenticate only via official GitHub OAuth flow.
- [x] **AES-256-GCM token encryption:** GitHub tokens are encrypted before being written to Postgres and decrypted only in server-side memory.
- [x] **Zero Browser Token Exposure:** Browser clients can never query `encrypted_access_token` or raw credentials.
- [x] **CSRF / State Validation:** OAuth token exchanges validate state parameters to prevent authorization hijacking.
- [x] **Secure Disconnect:** Disconnecting immediately revokes grants and deletes database records.

---

## 2. Row Level Security & Multi-User Isolation
- [x] **RLS Enabled on All Tables:** `profiles`, `github_connections`, `projects`, `publications`, `usage_events` have active RLS.
- [x] **User Ownership Verification:** All policies enforce `auth.uid() = user_id`.
- [x] **No Trusting Client User IDs:** User IDs are derived strictly from the verified JWT on the server.

---

## 3. Pre-Publish Secret Scanner & Input Sanitization
- [x] **Active Secret Detection:** Scans for AWS keys, GitHub PATs, private SSH/RSA keys, OpenAI keys, Google API keys, Stripe tokens, and connection passwords before publishing.
- [x] **Path Traversal Protection:** Every file path is validated; `../`, `/`, and `.git` paths are strictly rejected.
- [x] **File Size & Count Quotas:** File sizes are limited (max 5 MB per file) and request body sizes are enforced.
- [x] **Repository Name Validation:** Validates according to GitHub rules (`^[a-zA-Z0-9_.-]+$`) and detects collisions.

---

## 4. AI & Prompt Injection Defenses
- [x] **Data as Code, Not Instructions:** Source code comments and text are treated strictly as data in AI prompts.
- [x] **Deterministic Fallback:** Non-AI fallback ensures zero downtime if provider rate limits or outages occur.
- [x] **No Secret Leakage in Documentation:** Generated README files are checked to ensure no secrets or sensitive keys are exposed.
- [x] **No Hallucinations:** AI prompts enforce strict constraints against fabricating unverified commands, tests, or APIs.

---

## 5. Deployment & Secrets Hygiene
- [x] **No Privileged Keys in Client Bundles:** `SUPABASE_SERVICE_ROLE_KEY` and `GITHUB_CLIENT_SECRET` are never exposed in `VITE_` variables.
- [x] **HTTPS Enforcement:** All production traffic enforced over TLS.
- [x] **Strict Content Security Policy (CSP)** and CORS headers configured on Edge Functions.

