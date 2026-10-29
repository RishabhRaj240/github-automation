# Vercel Frontend Deployment Guide

RepoPilot AI is engineered to run seamlessly on Vercel's global Edge network.

---

## 1. Quick Deploy with Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Run deployment from the project root:
   ```bash
   vercel
   ```
3. Link to your Vercel account and project name `repopilot-ai`.
4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 2. Deploying via GitHub Git Integration

1. Push your RepoPilot AI repository to GitHub.
2. Log into the [Vercel Dashboard](https://vercel.com).
3. Click **Add New...** -> **Project**.
4. Import your RepoPilot AI repository.
5. In **Build and Output Settings**:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

## 3. Configuring Environment Variables in Vercel

In the Vercel Project Settings, navigate to **Environment Variables** and add:

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase project API URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public client anon key | `eyJhbGciOi...` |
| `VITE_GEMINI_API_KEY` | Optional default Gemini key | `AIzaSy...` |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth client ID | `Ov23li...` |

> **Security Note:** Never configure `SUPABASE_SERVICE_ROLE_KEY` or `GITHUB_CLIENT_SECRET` in Vercel frontend environment variables. Those secrets must only be stored in Supabase Edge Function secrets.

---

## 4. Single-Page Application (SPA) Routing Configuration

A `vercel.json` file is included in this repository to route all HTML requests to `index.html` for React Router:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
