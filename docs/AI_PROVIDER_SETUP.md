# AI Provider Configuration & Free Tier Guide

RepoPilot AI features a provider-independent AI architecture designed for low latency, zero prompt injection vulnerability, and high accuracy.

---

## 1. Supported AI Providers

### Primary Provider: Google Gemini 1.5 Flash (Free Tier)
- **Why Gemini Flash?** It includes a free tier (up to 15 Requests Per Minute, 1,500 Requests Per Day, and 1 million tokens per minute) without requiring a paid credit card upfront.
- **Provider URL:** [https://aistudio.google.com](https://aistudio.google.com)
- **Model Used:** `gemini-1.5-flash`

### Deterministic Stack Analyzer (Non-AI Fallback)
- **Zero Cost & Zero Network Dependency:** Runs locally in-memory or on server.
- Analyzes AST and package manifests (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, etc.).
- Never hallucinates non-existent commands or test results.
- Automatically activated if the AI provider encounters timeouts, rate limits, or is unconfigured.

---

## 2. Obtaining a Free Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Get API key** -> **Create API key in new project**.
4. Copy the generated key (`AIzaSy...`).
5. Configure the key:
   - For local development: Set `VITE_GEMINI_API_KEY=AIzaSy...` in your `.env.local`.
   - For end users: Paste the key directly in RepoPilot's **Settings** -> **Custom Google Gemini API Key** and click **Test Key**.
   - For Edge Functions: Run `supabase secrets set GEMINI_API_KEY=AIzaSy...`.

---

## 3. Rate Limits & Quotas

| Metric | Google Gemini 1.5 Flash Free Tier | RepoPilot Handling |
| :--- | :--- | :--- |
| **Requests Per Minute (RPM)** | 15 RPM | Throttling & Fallback |
| **Requests Per Day (RPD)** | 1,500 RPD | Automatic switch to Stack Analyzer |
| **Tokens Per Minute (TPM)** | 1,000,000 TPM | Request body length truncation |
| **Cost** | \$0.00 / month | Free |

### What happens when the quota is exceeded?
If the Gemini API returns status `429 Too Many Requests`, RepoPilot AI instantly and seamlessly falls back to the deterministic Stack Analyzer to deliver an accurate README.md without interrupting the user's publication flow.

