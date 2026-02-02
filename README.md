# Collections Dashboard

A React + Vite website that lists curated collections with search and filters. The UI includes a responsive grid, status badges, and summary stats.

## Getting Started

1. Install dependencies:
	- `npm install`
2. Start the dev server:
	- `npm run dev`

## Environment Variables

This app calls the Shopify Storefront API from the browser. Add these variables to your local environment file (for Vite):

```
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
```

If you already have `NEXT_PUBLIC_` variables, create the `VITE_` equivalents for this frontend.

## Customization

- Update the data in [src/App.jsx](src/App.jsx) to match your real collections.
- Adjust styling in [src/App.css](src/App.css) and [src/index.css](src/index.css).
