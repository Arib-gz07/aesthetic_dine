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

Without Supabase, intake forms and reservations log to the console (demo mode).

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select this repository
4. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Deploy — you'll get a `*.pages.dev` URL

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
│   ├── api/                # Intake & reservation endpoints
│   └── sites/[slug].astro  # Restaurant sites
├── lib/                    # Supabase, tenant routing, demo data
└── middleware.ts           # Subdomain → /sites/[slug]
```

## License

Private — Aesthetic Dine © 2026
