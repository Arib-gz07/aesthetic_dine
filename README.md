# Aesthetic Dine

Restaurant website platform for Bangladesh — beautiful marketing site, client restaurant sites on subdomains, and intake forms.

## Stack

- **Astro 5** + TypeScript
- **Cloudflare Pages/Workers** (hosting)
- **Supabase** (database, optional for now)

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

Copy `.env.example` to `.env` and add Supabase keys when ready:

```bash
cp .env.example .env
```

Without Supabase, intake forms log to the console (demo mode).

## Deploy to Cloudflare

You have two options. **Option A (Pages)** is simpler if you're new to Cloudflare.

### Option A — Cloudflare Pages (recommended)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select **Arib-gz07/aesthetic-dine** (or your repo)
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Deploy command:** leave **empty** (do not use `npx wrangler deploy`)
4. Deploy

### Option B — Workers Builds (what you set up)

If using Workers Builds with a deploy command:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`

The repo `wrangler.toml` must **not** use `pages_build_output_dir` — that causes a deploy conflict. The current config is fixed for Workers deploy.

After a failed build, open the log, click **Download log**, and check the red error at the bottom of the **Deploying** step.

### Environment variables on Cloudflare

Add the same vars from `.env.example` in Pages → Settings → Environment variables.

### Custom domain (later)

1. Buy `aestheticdine.com` on Cloudflare Registrar
2. Pages → Custom domains → add `aestheticdine.com` and `*.aestheticdine.com`
3. Set `PUBLIC_MAIN_DOMAIN=aestheticdine.com` in environment variables

## Subdomain routing

When a custom domain is connected, `joes-kitchen.aestheticdine.com` automatically serves that restaurant's site via middleware.

For local testing, use `/sites/demo` or add `127.0.0.1 demo.localhost` to `/etc/hosts`.

## Project structure

```
src/
├── components/marketing/   # Aesthetic Dine business site (test2 theme)
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
