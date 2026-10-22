# Dashboard (shared admin)

Multi-tenant admin for all Techxudo storefronts (Sab Pehno, Warqu, NovaMart, Veya).  
Also hosts the NovaMart public shop for the `ecommerce` tenant.

## Dev

```bash
# From E-Commerce/
npm run dev:dashboard
# or
npm --prefix dashboard run dev
```

Open [http://localhost:3001/admin](http://localhost:3001/admin) (defaults to Sab Pehno / `store`).

Full stack:

```bash
npm run dev:api
npm run dev:dashboard
npm run dev:store    # :3000 — admin redirect ?store=store
npm run dev:warqu    # :3002 — catalog from ?store=warqu
```

Env: copy [`.env.example`](.env.example) → `.env.local`, or use [`../shared/env.dashboard.example`](../shared/env.dashboard.example).

Integration contract: [`../shared/ADMIN.md`](../shared/ADMIN.md).

## Vercel

Set project **Root Directory** to `dashboard`, then redeploy.
