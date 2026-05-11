<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Admin Access

- **Dev admin credentials**: `admin@cairocart.com` / `Admin@123`
- **Seed**: `npm run db:seed` — creates admin user if not exists
- **Promote existing user to ADMIN**: `npm run db:promote-admin <email>`
- **Guards**: `proxy.ts` blocks unauthenticated requests; `requireAdmin()` in layout redirects non-ADMIN to `/`

## Order Numbers

- **Backfill null orderNumbers**: `npm run db:backfill-order-numbers`
- **Display utility**: `formatOrderNumber(n)` → `ORD-{n}` or `"Order unavailable"` for nullish
- **Parse utility**: `parseOrderNumber(input)` → number from `ORD-1024` or `1024`
