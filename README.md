# Aesthetic Dine

Restaurant website platform for Bangladesh — beautiful marketing site, AI-generated previews, and (later) hosted restaurant sites.

## Stack

- **Astro** + TypeScript
- **Vercel** (hosting)
- **Google Sheets + Drive** (intake / CRM — reconnecting after Vercel migrate)
- **v0 API** (AI website generation — later)
- **Supabase** (optional later)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

- Marketing site: `/`
- Pricing: `/pricing`
- Intake form: `/get-started`
- Demo restaurant: `/sites/demo`

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required for the form:

- *(none right now — form runs in demo mode)*

Later, when reconnecting Google:

- `GOOGLE_SHEETS_WEBAPP_URL` — Apps Script web app `/exec` URL

## Deploy to Vercel

1. Push this repo to GitHub (already: `Arib-gz07/aesthetic-dine`)
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the repo
3. Framework: **Astro** (auto-detected)
4. Add Environment Variables (Production + Preview):
   - `PUBLIC_MAIN_DOMAIN` = `aestheticdine.com` (when you have a custom domain)
   - *(add `GOOGLE_SHEETS_WEBAPP_URL` later when we reconnect Sheets)*
5. Click **Deploy**
6. You’ll get a free URL like `https://aesthetic-dine.vercel.app`

### Or from the terminal

```bash
npx vercel login
npx vercel
```

For production:

```bash
npx vercel --prod
```

### Custom domain (later)

1. Vercel project → **Settings** → **Domains** → add `aestheticdine.com` and `www`
2. Set `PUBLIC_MAIN_DOMAIN=aestheticdine.com` in Vercel env vars and redeploy

## Subdomain routing

When a custom domain is connected, `joes-kitchen.aestheticdine.com` can serve that restaurant’s site via middleware.

For local testing, use `/sites/demo` or add `127.0.0.1 demo.localhost` to `/etc/hosts`.

## Project structure

```
src/
├── components/marketing/   # Aesthetic Dine business site
├── components/restaurant/  # Client restaurant components
├── layouts/
├── pages/
│   ├── api/                # Intake endpoint
│   └── sites/[slug].astro  # Restaurant sites
├── lib/                    # Supabase, tenant routing, demo data
└── middleware.ts           # Subdomain → /sites/[slug]
```

## License

Private — Aesthetic Dine © 2026
