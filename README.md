# T&T Botanica — Shop (Next.js + Tailwind)

A branded storefront for T&T Botanica with a localStorage cart, Stripe Payment Links (optional), email-order fallback, and configurable shipping & tax.

## Quick start (local)

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Go to Vercel → **New Project** → Import your repo → **Deploy**.
3. That’s it. (No environment variables required.)

## Configure your shop

- Edit brand & social: `config/shopConfig.ts`
- Shipping rules: `config/shopConfig.ts` (`SHIPPING_RULES`)
- Tax rules: `config/shopConfig.ts` (`TAX_RULES`) — verify WA/Tacoma rates before launch.
- Product catalog: `components/Shop.tsx` (`INITIAL_PRODUCTS`). Replace images and add Stripe Payment Links in each product's `paymentLink` field.
- Logo: `public/logo.svg` (replace with your real logo when ready).

## How checkout works

- **If every item in the cart has a `paymentLink`**: clicking checkout opens each payment page (one per product) in a new tab.
- **Otherwise**: we generate a pre-filled email order to `hello@ttbotanica.com` including destination, shipping, and tax lines for quick manual invoicing.

> For full Stripe checkout (single session with line items), you'll eventually want a tiny API route + server-side integration. This MVP keeps it no-backend.

## Notes

- Cart and catalog edits persist in the user's browser via `localStorage`.
- Image domains allowed in `next.config.mjs` are limited to Unsplash; add your CDN as needed.
- Tailwind theme includes `brand`, `forest`, `moss`, `blush` colors to match your vibe.
