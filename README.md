# @studio/admin-kit

Shared, themeable admin/CRM UI for Next.js App Router projects: nav shell, stat cards, modals/side panels, an attention-tile pattern, a responsive table, and the small API-client/server conventions an admin panel needs. No build step — Next's `transpilePackages` compiles the JSX straight from `node_modules`.

This is **presentation only**. Availability/pricing engines, Prisma schemas, auth, and page-level data fetching stay in each app — the "adapter" is simply each app's own page code mapping its own API responses into these components' props.

## Install

```json
// package.json
"dependencies": {
  "@studio/admin-kit": "github:bzavydovskyi/studio-admin-kit#v0.1.0"
}
```

```js
// next.config.mjs
const nextConfig = {
  transpilePackages: ["@studio/admin-kit"],
};
```

```bash
npm install
```

## Use

```jsx
import { AdminChrome, Modal, StatCard, AdminTable } from "@studio/admin-kit";
import { useFocusTrap, useLockBodyScroll } from "@studio/admin-kit/hooks";
import { createAdminApi } from "@studio/admin-kit/client";
import { withErrors, errorResponse, json, assertSameOrigin } from "@studio/admin-kit/server";
import "@studio/admin-kit/styles.css"; // once, in your admin layout — import BEFORE your theme file
import "./my-brand-theme.css";
```

`createAdminApi({ csrfHeaderName })` returns `{ adminGet, adminPost, adminPatch, adminPut, adminDelete, adminUpload }` — pick a header name unique to your app (e.g. `x-lh-admin`) and use the exact same string in your server routes' `assertSameOrigin(req, "x-lh-admin")` call.

## Theming

Every component reads semantic CSS custom properties — never a raw color. Define these on `:root` (or any ancestor of the element carrying `.admin-app`) in your own theme file, loaded *after* `styles.css`:

| Token | Used for |
|---|---|
| `--surface`, `--surface-raised` | page background / card background |
| `--text`, `--text-soft` | primary / muted text |
| `--accent`, `--accent-deep`, `--accent-pale` | brand color, its hover/active shade, its pale wash |
| `--on-accent` | text color placed on a solid `--accent`/`--accent-deep` fill (usually `#fff` on a light theme, a dark ink on a light-accent theme) |
| `--border` | hairlines, card borders |
| `--success`, `--success-bg` | confirmed/positive states |
| `--warning`, `--warning-bg` | awaiting/needs-attention states |
| `--danger`, `--danger-bg` | errors, destructive actions |
| `--font-display`, `--font-body` | heading font, body/UI font |
| `--radius-s`, `--radius-m`, `--radius-l` | corner radii, small → large |
| `--dur-fast`, `--dur-med`, `--ease`, `--ease-out` | transition timing |

Success/warning/danger must each read clearly as *that* meaning regardless of your accent color — don't reuse `--accent` for `--success` unless your accent genuinely reads as "positive" on its own (check contrast in both your light and dark states if you have both).

See `levins-house-theme.css` and `poseidon-theme.css` in each consuming app's repo for two real, shipped examples of a complete token set.

## Onboarding a third client

1. New Next.js app, its own Prisma schema/DB/auth/env vars/media storage — nothing shared at the data layer.
2. `npm install github:bzavydovskyi/studio-admin-kit#v0.1.0` (or whatever the latest tag is), add `transpilePackages`.
3. Write that client's own `theme.css` with the token table above.
4. Build that client's own API routes and page components; pass the data they return into `AdminChrome`/`StatCard`/`AdminTable`/etc. as props, same shape as the other two apps.
5. Pick a unique CSRF header name for `createAdminApi`/`assertSameOrigin`.

No change to this package is required to onboard a client whose business logic is already expressible through these components' props.

## Releasing a shared fix

```bash
git commit -am "fix: ..."
git tag v0.1.1
git push && git push --tags
```

Each app upgrades independently, on its own schedule:

```json
"@studio/admin-kit": "github:bzavydovskyi/studio-admin-kit#v0.1.1"
```

```bash
npm install
```

A site is never force-upgraded by a tag push — nothing happens until that app's own `package.json` is bumped and `npm install` runs there.

## What's in here vs. what stays app-specific

**In this package:** `AdminChrome` (nav shell), `Modal`, `SidePanel`, `StatCard`, `AttentionTiles`/`AttentionDetailPanel`, `InfoPopover`, `AdminTable`, `useFocusTrap`, `useLockBodyScroll`, the `adminApiClient`/`apiServer` request conventions, and `admin-kit.css`'s component styles.

**Not in here, by design:** availability/pricing/booking engines (fundamentally different per business — hourly-resource vs. day/night civil-date exclusivity, say), Prisma schemas, auth, calendar *grid* rendering, and any page that's mostly business logic with a thin shell around it. Each app owns its own version of these and feeds this package's components through props.
