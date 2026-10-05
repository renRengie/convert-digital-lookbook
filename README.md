# Shopify Lookbook Feature — Convert Digital Technical Assessment

## Submission

- **Repo:** https://github.com/renRengie/convert-digital-lookbook
- **Store:** https://convert-digital-techinical-assesment.myshopify.com
- **Admin access:** available on request

---

## What this is

This is my submission for the Convert Digital technical assessment. The task was to build a Lookbook feature for a fashion client's Shopify store using only native Shopify features — no third-party apps.

The feature lets merchants create lookbooks through Shopify's admin, display them on the homepage via the Theme Customiser, and automatically show them on product pages when a product belongs to a lookbook.

---

## How it works

Lookbooks are stored as **metaobjects** in the Shopify admin. Each lookbook holds a title, description, a list of product handles, and a priority number.

When a page loads, **Liquid** reads the metaobject data and passes it to the page as a JSON config. **React** picks that up, calls the **Storefront API** to get the actual product data (title, image, price), and renders the lookbook on the page.

The reason product handles are stored instead of direct product references is to keep things simple and human-readable. Any null products — deleted, unpublished, or a typo in the handle — are just skipped silently without breaking anything.

```
Liquid reads metaobjects → outputs JSON config to page
React reads config → fetches products from Storefront API → renders
```

---

## Metaobject schema

**Type:** `lookbook`

| Field | Type | Notes |
|---|---|---|
| Title | Single line text | Required |
| Description | Multi-line text | Optional |
| Product Handles | List of single line text | One handle per line, regex validated |
| Priority | Integer | Default 0, higher = shown first on PDP |

---

## Sections

### Homepage (`sections/lookbook.liquid`)
The merchant picks a specific lookbook from a dropdown in the Theme Customiser. The section is restricted to the homepage template.

### Product page (`sections/lookbook-product.liquid`)
No lookbook picker here. Liquid loops through all lookbooks and checks if the current product's handle appears in any of them. If it does, that lookbook gets rendered. Capped at 2 lookbooks — if a product is in 3 or more, only the top 2 by priority are shown.

### Shared settings (both sections)
- Layout — grid or horizontal scroll
- Columns on desktop (2–5)
- Columns on mobile (1–2)
- Show description
- Show compare-at price
- Padding top and bottom

These settings are duplicated across both section schemas because Liquid doesn't support shared schema files. If something changes, both need to be updated.

---

## Markets

The store has four active markets — **United States (USD)**, **Canada (CAD)**, **Australia (AUD)**, and **Japan (JPY)**. US and Canada are the store defaults. Australia and Japan were added specifically to demonstrate multi-currency support.

The Storefront API query uses `@inContext(country: $country, language: $language)` to return prices in the right currency for whoever is browsing. The country and language are read from Liquid's localisation object and passed through to React.

Currency formatting is handled by the browser's built-in `Intl.NumberFormat` — this automatically knows that JPY has no decimal places without needing any custom logic.

---

## Storefront API

- Token is stored in Theme Settings → Lookbook (public, read-only token from the Headless sales channel)
- API version: `2026-07`
- Products must be published to the Headless sales channel to appear

Since the Storefront API doesn't support fetching multiple products by handle in one go, the query uses **GraphQL aliases** to request all products in a single request regardless of how many there are.

---

## Build setup

The React source lives in `frontend/src/` and is compiled to `assets/` using Vite. The built files (`assets/lookbook.js` and `assets/lookbook.css`) are committed to the repo because Shopify's GitHub integration doesn't run a build step.

```sh
npm install       # install dependencies
npm run dev       # watch mode + shopify theme dev
npm run build     # build only
npm run check     # shopify theme check
```

---

## Admin setup checklist

1. **Metaobject definition** — Settings → Custom data → Metaobjects → type `lookbook` with the fields above. Enable Storefronts API access.
2. **Headless channel** — install from the Shopify App Store, create a storefront, copy the public token
3. **Theme settings** — Theme Customiser → Theme settings → Lookbook → paste the token
4. **Markets** — Settings → Markets → add Australia (AUD) and Japan (JPY)
5. **Publish products** — each product in a lookbook needs to be published to the Headless sales channel
6. **Create lookbooks** — Content → Metaobjects → Lookbook → Add entry

---

## Testing

**Homepage lookbook**
- Add the Lookbook section to the homepage in the Theme Customiser
- Pick a lookbook from the dropdown
- Try switching layouts and column settings

**Product page lookbook**
- Add the Lookbook section to the product template
- Visit any product page whose handle is in a lookbook — it should auto-render
- To test the 2-lookbook cap, visit **The Videographer Snowboard** — it's in 3 lookbooks but only 2 should show, sorted by priority

**Market pricing**
- Use the country selector on the storefront to switch between Australia and Japan
- Prices should update to AUD and JPY respectively
