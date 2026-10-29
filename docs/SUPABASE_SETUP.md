# Supabase Configuration & Database Setup Guide

RepoPilot AI utilizes Supabase for multi-user authentication, PostgreSQL database storage, strict Row Level Security (RLS), and server-side Edge Functions.

---

## 1. Creating a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **New Project**.
3. Choose a name (e.g. `repopilot-prod`) and a secure database password.
4. Select the region closest to your users.
5. Wait ~2 minutes for the database cluster to initialize.

---

## 2. Applying Schema Migrations

1. In your Supabase Dashboard, open the **SQL Editor** in the left navigation.
2. Open `supabase/migrations/20250101000000_repopilot_schema.sql` from this repository.
3. Paste the entire SQL script into the SQL Editor and click **Run**.
4. Verify that the following tables exist under **Table Editor**:
   - `profiles`
   - `github_connections`
   - `projects`
   - `publications`
   - `usage_events`
   - View: `user_github_connections`

---

## 3. Configuring Supabase Authentication & GitHub Provider

1. In your Supabase Dashboard, navigate to **Authentication** -> **Providers** -> **GitHub**.
2. Toggle the switch to **Enabled**.
3. Paste your GitHub OAuth **Client ID** and **Client Secret** (from `docs/GITHUB_SETUP.md`).
4. Under **Scopes**, enter: `repo read:user user:email`.
5. Click **Save**.

---

## 4. Deploying Supabase Edge Functions

Install the Supabase CLI:
```bash
npm install -g supabase
```

Log in and link your project:
```bash
supabase login
supabase link --project-ref <your-supabase-project-id>
```

Set server-side secrets in your Supabase project vault:
```bash
supabase secrets set GITHUB_CLIENT_ID=your_client_id
supabase secrets set GITHUB_CLIENT_SECRET=your_client_secret
supabase secrets set TOKEN_ENCRYPTION_SECRET=your_32_character_aes_secret_key!
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

Deploy edge functions:
```bash
supabase functions deploy github-oauth
supabase functions deploy github-status
supabase functions deploy github-disconnect
supabase functions deploy publish-repo
```

---

## 5. Free Tier Limits & Capacity

- **Supabase Free Tier:**
  - 500 MB database storage (plenty for thousands of users since source code is never permanently stored).
  - 50,000 monthly active users (MAU).
  - 500,000 Edge Function invocations per month.
- **When limits are approached:** Supabase provides email notifications at 80% and 100% capacity. No unexpected charges are incurred on the free plan; non-critical write requests are temporarily throttled until the billing cycle rolls over or upgrading to Pro (\$25/mo).

