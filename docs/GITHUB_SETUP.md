# GitHub OAuth & GitHub App Configuration Guide

RepoPilot AI publishes repositories directly to the authenticated developer's GitHub account without requiring users to copy or paste Personal Access Tokens (PATs).

---

## 1. Creating a GitHub OAuth App

1. Log in to [GitHub](https://github.com) and navigate to **Settings** -> **Developer Settings** -> **OAuth Apps** -> **New OAuth App** (or go directly to: [https://github.com/settings/applications/new](https://github.com/settings/applications/new)).
2. Fill out the application details:
   - **Application Name:** `RepoPilot AI`
   - **Homepage URL:** `http://localhost:3000` (for local dev) or your production domain (e.g. `https://repopilot.vercel.app`).
   - **Application Description:** `Automated README documentation and atomic repository publisher.`
   - **Authorization callback URL:**
     - For local development: `http://localhost:3000/dashboard` or your Supabase OAuth callback URL:
       `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
3. Click **Register Application**.
4. On the next screen:
   - Copy the **Client ID** into `VITE_GITHUB_CLIENT_ID` in your `.env.local` and Supabase Dashboard.
   - Click **Generate a new client secret**.
   - Copy the **Client Secret** into your Supabase Edge Function secrets (`GITHUB_CLIENT_SECRET`).

---

## 2. Minimum Required Permissions & Scopes

RepoPilot follows the principle of least privilege:
- `repo` — Required to create public or private repositories, upload file blobs, create Git trees, and update branch references (`refs/heads/main`).
- `read:user` & `user:email` — Required to verify the account owner's identity, login name, and avatar.

---

## 3. GitHub App Alternative (Recommended for Enterprise)

If deploying as a GitHub App:
1. Navigate to **Developer Settings** -> **GitHub Apps** -> **New GitHub App**.
2. Set User authorization permissions:
   - **Administration:** Read & Write
   - **Contents:** Read & Write
   - **Metadata:** Read-only
3. Generate a Private Key (.pem) and copy the App ID / Client ID.

---

## 4. Rate Limits & Free Tier Policies

- **Standard GitHub REST API:** 5,000 authenticated requests per hour per user.
- **Git Database API:** Atomic tree and commit operations use approximately 3 to 6 API calls per repository publication (Blob uploads -> Tree -> Commit -> Ref update).
- **What happens when the rate limit is exceeded?** GitHub returns HTTP status `403 Forbidden` with the `x-ratelimit-remaining: 0` header. RepoPilot detects this header and alerts the developer with their exact reset timestamp.
