# PROJECT_MAP — E-Commerce MVP

> Last updated: 2026-05-11
> Status: M12 + M13 (UX Polish) + M14 (Final Cleanup & Tracking UX) complete

---

## [TECH_STACK]

### Selected Technologies

| Technology | Version | Choice Rationale |
|---|---|---|
| Next.js | 16.2.6 | App Router, Server Actions, React 19 support. Full-stack framework. |
| React | 19.2.6 | Required by Next.js 16. |
| TypeScript | Strict | No `any` types. |
| Tailwind CSS | 4 | v4 uses CSS-first configuration. |
| Prisma | 7.8.0 | Type-safe ORM, auto-generated types, migration system. |
| Zustand | 5.0.13 | 1KB, minimal boilerplate. Cart-only client state. |
| Zod | 4.4.3 | Schema validation shared between client and server. |
| React Hook Form | 7.75.0 | Performant forms with RHF + Zod resolver pattern. |
| Auth.js (next-auth) | 5.0.0-beta.31 | Auth framework with Prisma adapter + JWT strategy. Credentials provider (email/password). |
| bcryptjs | Latest | Password hashing — pure JS, no native dependencies. |
| shadcn/ui | Selective | shadcn-style: Button, Input, Dialog, Sheet, Select, Toast only. |
| PostgreSQL (Supabase) | Latest | Managed Postgres via pooler connection. |

### Non-Stack Decisions

| Technology | Rejection Reason |
|---|---|
| tRPC | Redundant with Server Actions. |
| TanStack Query | Server-driven data, no client cache needed. |
| next-safe-action | Raw Server Actions + Zod are sufficient. |
| i18n libraries | Single locale for MVP. |
| Redis / Bull | No background jobs in MVP. |
| Supabase Auth | Auth.js keeps everything in existing DB — no new infra. |

---

## [SYSTEM_FLOW]

### Store Flow

```
Home (/) → Full Product Feed → [Search | Category Filter | Pagination]
                                    ↓
                              Product Details (/products/[slug])
                                    ↓
                        Cart (Zustand localStorage) → Checkout
                                    ↓
                         Order Created (state-driven success screen)
                         Shows: order number (ORD-{N}), items
                         CTA → /track-order?order=ID&email=EMAIL
                                     ↓
                   ┌─────────────────┴─────────────────┐
                   ↓                                   ↓
         Signed-in user: /account/orders/[id]    Guest: /track-order (auto-loads from params)
                   ↓                                      ↓
         Admin: /admin/orders/[id] → Update status    Manual visit: shows lookup form
```

### Auth Flow

```
Login (/auth/login)     → email + password → Auth.js credentials → JWT session
Register (/auth/register) → name + email + password → bcrypt hash → create user → auto sign in
                          → also links guest orders (by email) to new user
Logout (/auth/logout)   → signOut() → redirect to /
Proxy (src/proxy.ts)    → Checks `authjs.session-token` cookie → protects /admin/* + /account/*
Desktop navbar          → Signed-in: avatar initials → dropdown (My Account, Orders, Admin, Sign Out)
                        → Signed-out: "Sign In" link
Mobile navbar           → Hamburger → Sheet drawer with all navigation links + sign in/out
```

### Admin Flow

```
Dashboard → Products List → [Create | Edit | Delete] Product
          → Orders List → Order Detail → Update Status (with lifecycle timestamps)
```

### Server / Data Flow

```
Browser → Server Action (Zod validate) → Prisma → PostgreSQL
                ↓
          revalidatePath() → Fresh RSC
```

---

## [ARCHITECTURE]

### Actual Folder Structure

```
src/
├── app/
│   ├── (store)/                          # Storefront route group
│   │   ├── _components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CartSheet.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── UserMenu.tsx              # Desktop avatar dropdown + mobile sheet drawer
│   │   ├── layout.tsx                    # Header (logo, search, cart, UserMenu desktop avatar + mobile hamburger)
│   │   ├── page.tsx                      # Home = full product feed (search/filter/pagination)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── products/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # PDP — images, details, add-to-cart, SEO
│   │   │       ├── AddToCartButton.tsx
│   │   │       └── loading.tsx
│   │   ├── track-order/                  # Guest order lookup
│   │   │   ├── page.tsx
│   │   │   └── TrackOrderForm.tsx        # Dual-mode: form or auto-load from ?order=&email=, progress visualization
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   ├── CheckoutForm.tsx          # RHF + Zod (with email field)
│   │   │   └── loading.tsx
│   │   └── account/                      # Auth-required user dashboard
│   │       ├── layout.tsx                # Auth guard + sidebar (Profile, Order History)
│   │       ├── page.tsx                  # Profile overview (avatar, order count, edit name form)
│   │       ├── ProfileForm.tsx           # Client component: update name via PATCH /api/auth/profile
│   │       └── orders/
│   │           ├── page.tsx              # Order history
│   │           └── [id]/page.tsx         # Order detail
│   ├── admin/                            # Auth-required admin panel
│   │   ├── _components/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── OrderTable.tsx
│   │   ├── layout.tsx                    # requireAdmin() guard + sidebar
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── DeleteProductButton.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── UpdateOrderStatus.tsx
│   ├── auth/                             # Public auth pages
│   │   ├── layout.tsx                    # Brand header (logo → home, sticky)
│   │   ├── login/
│   │   │   ├── page.tsx                  # Server component + Suspense
│   │   │   └── LoginForm.tsx             # Client: signIn("credentials"), card UI
│   │   ├── register/
│   │   │   └── page.tsx                  # Client: fetch to /api/auth/register, card UI
│   │   └── logout/
│   ├── api/auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.ts                  # Auth.js API (GET + POST)
│   │   ├── register/
│   │   │   └── route.ts                  # POST: creates user with bcrypt hash
│   │   └── profile/
│   │       └── route.ts                  # PATCH: update user name
│   │       └── route.ts                  # Server: signOut() redirect
│   ├── api/auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.ts                  # Auth.js API (GET + POST)
│   │   └── register/
│   │       └── route.ts                  # POST: creates user with bcrypt hash
│   ├── globals.css
│   ├── layout.tsx                        # Root: fonts, metadata, ToastProvider
│   ├── error.tsx
│   └── not-found.tsx
├── components/ui/                        # shadcn/ui primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── select.tsx
│   └── toast.tsx
├── lib/
│   ├── auth.ts                           # Auth.js config (Credentials provider, JWT, Prisma adapter, AUTH_SECRET validation)
│   ├── authorize.ts                      # requireAdmin(), requireAuth() helpers
│   ├── db.ts                             # Prisma client
│   ├── env.ts
│   ├── logger.ts
│   ├── utils.ts
│   ├── slug.ts
│   ├── actions/
│   │   ├── product.ts
│   │   ├── order.ts                       # createOrder — validates stock, creates in transaction, returns {orderId, orderNumber}
│   │   ├── order-lookup.ts                # lookupOrderByNumber — queries by orderNumber, case-insensitive email
│   │   └── admin.ts
│   ├── schemas/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── shipping.ts                   # Email field with .transform(trim+lowercase) — used for guest tracking lookup
│   │   └── index.ts
│   └── dto/
│       ├── product.ts
│       └── order.ts
├── store/
│   └── cart.ts
├── types/
│   ├── index.ts
│   └── next-auth.d.ts                    # Auth.js type augmentation (role, id)
├── proxy.ts                              # Route protection (/admin/*, /account/*)
├── .env                                   # Env vars: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL
└── .env.example                           # Documented env var template
```

### Rendering Strategy

| Page | Strategy | Rationale |
|---|---|---|
| Home (/) | SSR (dynamic) | Full product feed with search/filter/pagination |
| PDP | SSR (dynamic) | Stock must be fresh; SEO via generateMetadata |
| Cart | Client component | Zustand client state + localStorage |
| Checkout | Mixed: form is client, submission is Server Action | Form interactivity needs client |
| Track Order | Mixed: Server Component + Client Form | Server renders initial props; client auto-loads or shows form |
| Admin | SSR (dynamic) + requireAdmin() guard | Always fresh data; auth check in layout |
| Account | SSR (dynamic) + requireAuth() guard | User-specific order data |
| Auth pages | Client components | Form interactivity + signIn API; card UI matching tracking page |

### State Management

| State | Solution | Persistence |
|---|---|---|
| Cart items | Zustand | localStorage via persist middleware |
| Product/Order data | Server (RSC) | Fetched per request |
| Form state | React Hook Form | Ephemeral |
| UI state | useState / shadcn | Ephemeral |
| Auth session | Auth.js JWT | Cookie-based |

---

## [Prisma Schema]

```prisma
enum Role { USER ADMIN }
enum OrderStatus { PENDING CONFIRMED SHIPPED DELIVERED }

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String?             // bcrypt hash
  name      String?
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  orders    Order[]
  accounts  Account[]
  sessions  Session[]
}

model Account     { /* Auth.js adapter: userId, provider, tokens */ }
model Session     { /* Auth.js adapter: sessionToken, userId, expires */ }
model VerificationToken { /* Auth.js adapter: identifier, token, expires */ }

model Product {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String
  price       Decimal     @db.Decimal(10, 2)
  images      String[]
  category    String
  stock       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orders      OrderItem[]
}

model Order {
  id           String        @id @default(cuid())
  total        Decimal       @db.Decimal(10, 2)
  status       OrderStatus   @default(PENDING)
  confirmedAt  DateTime?                    // Set when status → CONFIRMED
  shippedAt    DateTime?                    // Set when status → SHIPPED
  deliveredAt  DateTime?                    // Set when status → DELIVERED
  userId       String?                      // Optional link to User
  user         User?         @relation(fields: [userId], references: [id])
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  items        OrderItem[]
  shippingInfo ShippingInfo?
}

model OrderItem {
  id        String   @id @default(cuid())
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  productId String
  orderId   String
  product   Product  @relation(fields: [productId], references: [id])
  order     Order    @relation(fields: [orderId], references: [id])
}

model ShippingInfo {
  id      String @id @default(cuid())
  email   String                         // For guest confirmation + tracking
  name    String
  phone   String
  address String
  city    String
  orderId String @unique
  order   Order  @relation(fields: [orderId], references: [id])
}
```

---

## [ROUTE MAP]

| Path | Type | Auth | Description |
|---|---|---|---|
| `/` | SSR | Public | Full product feed with search/filter/pagination |
| `/products` | Redirect | — | 301 → `/` |
| `/products/[slug]` | SSR | Public | Product detail page |
| `/checkout` | Mixed | Public | Checkout form + order summary |
| `/auth/login` | Client | Public | Sign in form with brand header + card UI |
| `/auth/register` | Client | Public | Register form with brand header + card UI |
| `/api/auth/profile` | API | Auth | `PATCH` — update user name |
| `/auth/logout` | Server | Public | Sign out + redirect |
| `/account` | SSR | Auth | Profile overview — avatar, order count, edit name form |
| `/account/orders` | SSR | Auth | Order history |
| `/account/orders/[id]` | SSR | Auth | Single order detail (user-owned only) |
| `/admin` | SSR | Admin | Dashboard |
| `/admin/products` | SSR | Admin | Product CRUD |
| `/admin/orders` | SSR | Admin | Order list |
| `/admin/orders/[id]` | SSR | Admin | Order detail + status update |
| `/track-order` | Mixed | Public | Guest order lookup by order ID + email; supports `?order=&email=` auto-load from checkout success |

**Removed**: public `/orders/[id]` — guest tracking now via `/track-order`.
**Removed**: `/products` listing page — replaced by home page feed.

---

## [AUTH ARCHITECTURE]

### Protection Layers

1. **Proxy** (`src/proxy.ts`): Checks for session cookie on `/admin/*` and `/account/*` routes. Redirects to login if missing.
2. **Server Component guard** (`requireAdmin()` / `requireAuth()`): Verifies session + role in admin layout and account pages. Redirects if unauthorized.
3. **Server Action guard** (future): Each admin action should verify session + role.

### Auth.js Config

- Provider: Credentials (email + password)
- Adapter: Prisma (User, Account, Session, VerificationToken models)
- Session strategy: JWT (no database sessions)
- Secret: `AUTH_SECRET` env var; validated at module load in `src/lib/auth.ts`
- JWT callback: Injects `user.role` and `user.id` into token
- Session callback: Propagates `role` and `id` to session object
- `.env.example` documents all required auth env vars

### Cookie-based Proxy Check

The proxy checks for `authjs.session-token` (or `__Secure-authjs.session-token` on HTTPS) prefix across all cookies. This is a lightweight check — full role validation happens at the Server Component level via `requireAdmin()`.

---

## [UX POLISH NOTES]

### Order Number Rendering

All order references now use the user-friendly `ORD-{orderNumber}` format:

| Location | Before | After |
|---|---|---|
| Confirmation page | `Order #{orderNumber}` (correct) | `Order #{orderNumber}` (unchanged) |
| Tracking page | `Order #{id.slice(0, 8)}` | `Order ORD-{orderNumber}` |
| Account order list | `#{id.slice(0, 8)}` | `ORD-{orderNumber}` |
| Account order detail | `Order #{id.slice(0, 8)}` | `Order ORD-{orderNumber}` |
| Admin order list | `{id.slice(0, 8)}...` | `ORD-{orderNumber}` |
| Admin order detail | `Order {id.slice(0, 8)}...` | `Order ORD-{orderNumber}` |
| Email subject | `#${orderId.slice(0, 8)}` | `ORD-${orderNumber}` |
| Email body | `#${orderId.slice(0, 8)}` | `ORD-${orderNumber}` |

### Confirmation Message Layout

- Split into two separate lines for readability
- Email confirmation note on first line
- Tracking CTA on second line with cleaner hierarchy

### Auth Page Design

Both login and register pages now:
- Use the same `max-w-lg` container as the tracking page
- Have an icon circle (LogIn / UserPlus) matching the tracking page's Package icon
- Wrap form in `rounded-xl border border-border bg-white p-6` card
- Share same `py-12 sm:py-16` vertical spacing
- Display brand header (CC logo + "CairoCart", clickable to home) via shared `auth/layout.tsx`

### Button Alignment

- Tracking page action buttons and Continue Shopping now use `flex justify-center gap-3`

---

## [TRACKING FLOW]

All order tracking now uses public order numbers only:

1. Checkout success → `/track-order?orderno=1024&email=user@example.com`
2. Auto-load parses `orderno` param, queries by `order.orderNumber`
3. Manual form accepts `ORD-1024` or `1024`, normalizes via `parseOrderNumber()`
4. `lookupOrderByNumber(orderNumber, email)` queries Prisma by `orderNumber` unique field
5. No internal `cuid` values exposed anywhere in the UI

Utilities:
- `formatOrderNumber(n)` → `ORD-${n}`
- `parseOrderNumber(input)` → `n` (extracts numeric from `ORD-1024` or `1024`)

---

## [INVENTORY RULES]

1. Negative stock is forbidden — enforced by Server Action + schema default.
2. Stock validation during checkout via `prisma.$transaction`.
3. Decrement immediately on order creation.

---

## [ORPHANS & PENDING]

### Completed in M12 UX Polish (Round 1)

| Item | Status | Notes |
|---|---|---|
| Order number consistency | ✅ | All surfaces use `formatOrderNumber()` → `ORD-{N}` |
| Confirmation message layout | ✅ | Split into clean stacked text |
| Tracking page button alignment | ✅ | Centered `justify-center` |
| Auth page redesign | ✅ | Card UI matching tracking page design system |
| Brand logo on auth pages | ✅ | Shared `auth/layout.tsx` |

### Completed in M12 UX Polish (Round 2) — Auth/Admin/Nav Overhaul

| Item | Status | Notes |
|---|---|---|
| Email system removed | ✅ | Deleted `email.ts`, uninstalled `resend`, removed env vars |
| Email UI copy removed | ✅ | No "confirmation email sent" text anywhere |
| UserMenu (avatar+dropdown) | ✅ | Desktop: initials avatar, dropdown with My Account, Orders, Admin, Sign Out |
| Mobile hamburger menu | ✅ | Sheet drawer from left with all nav links (Home, Track Order, Account, Orders, Admin, Sign Out) |
| Profile page | ✅ | `/account` shows avatar, order count, name edit form, avatar upload placeholder |
| Admin seed user | ✅ | `admin@cairocart.com` / `Admin@123` created in seed, documented |
| `formatOrderNumber` utility | ✅ | Centralized in `utils.ts`, used on all pages |
| `parseOrderNumber` utility | ✅ | Parses `ORD-1024` or `1024`, returns numeric portion |
| `resend` dependency removed | ✅ | Uninstalled, no remaining references |
| Tracking by orderNumber only | ✅ | `lookupOrder` → `lookupOrderByNumber`, queries by `order.orderNumber`, no internal IDs in UI |
| User avatar shows first name | ✅ | Desktop: initials avatar + first name beside it on lg+ |
| Profile page polished | ✅ | Avatar header, recent orders summary, edit form with better spacing |

### Deferred Decisions

| Item | Status | Notes |
|---|---|---|
| Category model | Deferred | String field on Product. Extract when needed. |
| Image upload | Deferred | External URLs for MVP. |
| Order tracking guest page | ✅ | `/track-order` with dual-mode: auto-load from checkout success or manual form. |
| Email system | ❌ Removed | Was too early for MVP. Removed Resend, email.ts, all UI copy. Revisit when transactional email infra is ready. |
| User profile management | ✅ (partial) | Name editing via `/account`. Deferred: password reset, avatar upload. |
| Admin user management | ✅ (seed) | Admin seed user created. Deferred: admin user list UI, role management. |
| Pagination limit config | Deferred | Hardcoded 12. |
| Server Action auth guards | Deferred | Currently relying on layout-level guards. Add per-action checks when needed. |

### Intentional Technical Debt

1. Offset-based pagination (skip/take) — simpler than cursor for MVP.
2. No image optimization queue — Next.js `<Image>` handles optimization.
3. No order audit log — status changes are simple updates.
4. Proxy checks only session cookie existence — fine-grained role check happens in Server Components.
5. Register API route (`/api/auth/register`) is a plain route handler — not a Server Action. Acceptable since it's a one-time setup call from the client.

---

## [MILESTONES]

| # | Name | Status | Notes |
|---|---|---|---|
| M1 | Foundation | ✅ | Prisma, Zod, DTO, slug, logger, seed |
| M2 | Shared UI | ✅ | Button, Input, Dialog, Sheet, Select, Toast |
| M3 | Storefront | ✅ | Home (now full feed), PDP, search/filter/pagination |
| M4 | Cart | ✅ | Zustand + persist, CartSheet |
| M5 | Checkout | ✅ | Shipping form (with email), COD order creation |
| M6 | Admin Dashboard | ✅ | Product CRUD, Order list/detail, Status update |
| M7 | Polish | ✅ | Error boundaries, skeletons, SEO, responsive |
| M8 | Auth Foundation | ✅ | Auth.js, Prisma adapter, login/register, proxy guard, account pages |
| M8b | Store Restructure | ✅ | Home = full feed, /products redirect, /account routes |
| M9 | Email + Tracking | ✅ | Phase 3: Resend, order confirmation email, guest tracking |
| M10 | Order Lifecycle | ✅ | Phase 3b: Lifecycle timestamp updates on status change |
| M11 | Mobile Audit | ✅ | Phase 2.3: Global responsive pass — fixed broken links, updated revalidates |
| M12 | UX Polish (R1) | ✅ | Order number consistency, confirmation layout, auth pages redesign, brand logo on auth |
| M13 | UX Polish (R2) | ✅ | Email removal, UserMenu (avatar+drowpdown), mobile hamburger, profile page, admin seed, formatOrderNumber utility |
| M14 | Final Cleanup | ✅ | parseOrderNumber, tracking by orderNumber only, avatar name label, profile polish, unused import cleanup |
