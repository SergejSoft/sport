# Google sign-in setup

SportHub supports **Sign in with Google** (OAuth) in addition to email/password. Configure both Google Cloud and Supabase once; the app already has the "Continue with Google" button on login and signup.

---

## 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Open **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**.
4. If prompted, configure the **OAuth consent screen** first:
   - User type: **External** (or Internal for workspace-only).
   - App name: e.g. **SportHub**. Add support email and developer contact.
   - Scopes: add **email**, **profile**, **openid** (Supabase needs these).
   - Save.
5. Back to **Credentials** → **Create credentials** → **OAuth client ID**:
   - Application type: **Web application**.
   - Name: e.g. **SportHub web**.
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (dev)
     - `https://<your-vercel-domain>` (prod)
   - **Authorized redirect URIs:** use the Supabase callback URL:
     - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
     - Find your project ref in Supabase Dashboard URL or in `NEXT_PUBLIC_SUPABASE_URL` (e.g. `https://xyz.supabase.co` → ref is `xyz`).
   - Create. Copy the **Client ID** and **Client secret**.

---

## 2. Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Providers** → **Google**.
3. Enable Google.
4. Paste **Client ID** and **Client secret** from step 1.
5. Save.

---

## 3. Redirect URLs (app)

In **Authentication** → **URL Configuration** → **Redirect URLs**, ensure your app URLs are listed so Supabase can redirect back after Google sign-in:

- `http://localhost:3000/**`
- `https://<your-vercel-domain>/**`

---

## 4. Test

1. Run the app (`npm run dev`) or open production.
2. Open **Sign in** or **Sign up**.
3. Click **Continue with Google**, choose an account, and approve.
4. You should be redirected back to the app and signed in. An `Account` row is created on first sign-in (same as email signup).

---

## Troubleshooting

- **Redirect URI mismatch:** The redirect URI in Google must be exactly the Supabase callback URL (`https://<ref>.supabase.co/auth/v1/callback`). No trailing slash.
- **"Access blocked" or consent screen:** Finish OAuth consent screen setup and add test users if the app is in "Testing" mode.
- **User not created in app:** Ensure auth callback runs (check Redirect URLs in Supabase). `getOrCreateAccount` runs when the layout loads; Supabase user id is used as `Account.id`.
