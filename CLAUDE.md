# CLAUDE.md — Kyrios Frontend (Creaca)

Authoritative engineering conventions for this repository. Claude Code (and
any contributor) MUST follow these rules when adding or changing code. This
file mirrors the conventions of the sibling reference project
`estore-frontend` (`/home/khuccy/Desktop/Projects/estore/estore-frontend`)
almost exactly, so that widgets and patterns can be ported between the two
codebases with minimal translation. Where Kyrios genuinely differs from
estore (see "Kyrios-Specific Exceptions" below), the difference is
intentional and documented — do not silently "fix" it to match estore.

> **Status note**: this document describes the TARGET structure. Parts of the
> current codebase have not yet migrated to match it — see "Migration Delta"
> at the end of this file for the tracked list of gaps. Do not assume the
> tree already looks like the target section below; check the delta list
> first.

See also: `../CLAUDE.md` (root) for how this file relates to the backend's
`../kyrios-backend/CLAUDE.md`.

## 0. Git & Commit Conventions

Mirrored from `estore-frontend/CLAUDE.md` — same rules apply here.

**Secrets**: never commit or push secrets, tokens, API keys, or other
sensitive environment variables to this repository — not in tracked files,
not in commit messages, not in this file. `.env*` is gitignored (except
`.env.example`, which must stay a placeholder template); keep it that way
and don't add exceptions. Before `git add -A` or any broad staging, review
what's actually staged (`git status`, `git diff --cached`) and double-check
file contents if anything looks like it could hold a credential, even if the
filename looks innocuous. Local credentials needed for this project (e.g. a
GitHub token for pushing) should be stored outside this repo's working tree
— e.g. via `git credential-store` (`~/.git-credentials`) — never inside the
project directory, even in a gitignored file.

**Commit messages**: plain and focused on the change — describe what
changed and why. Do not add a `Co-Authored-By: Claude` (or similar AI
attribution) trailer, or any `Signed-off-by`/`Acked-by`/`Reviewed-by` line
naming an AI tool or model. Use conventional commit prefixes (`fix:`,
`feat:`, `refactor:`, `chore:`, `docs:`, `test:`) so intent is clear from
the summary line.

## 1. Project Overview

Kyrios is an LMS-style product (courses, subjects, modules, packages,
subscriptions, course registrations, staff/user administration). This repo
(`Creaca`) is the Next.js frontend. It pairs with a Django REST-ish backend
at `../kyrios-backend` (sibling directory, see its own `CLAUDE.md`). All
persistent state — auth, course data, admin data — comes from that Django
API; this frontend has no server actions or database access of its own.

The frontend serves two audiences from one Next.js app:
- A **public, localized marketing + learner site** under `src/app/[lang]/`
  (home, about, contact, courses, packages, FAQs, auth, learner dashboard,
  profile).
- An **internal, non-localized admin panel** under `src/app/admin/` (staff/
  user management, subjects/courses/modules, packages/subscriptions, logs,
  stats, settings), with its own hand-rolled sidebar shell.

## 2. Tech Stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4 — CSS-based `@theme`, no `tailwind.config.*`
- shadcn/ui, style `new-york`, base color `neutral`, CSS variables on
- Radix primitives (via shadcn), `react-hook-form` + `zod` for forms
- `axios` for HTTP, `@tanstack/react-query` v5 for server state
- `next-themes` (dark mode), `nextjs-toploader`, `sonner` (toasts), `cmdk`
- `gsap` / `@gsap/react` for animation (estore uses none of these — fine,
  Kyrios-specific, keep)
- `js-cookie` for auth cookie access, `@dicebear` for avatar generation,
  `react-qr-code`
- No test runner or CI yet configured (estore has vitest + testing-library —
  adopting this is a future task, not required for the widget port)

## 3. Target Directory Structure

This is the structure new/ported code should conform to. It matches
`estore-frontend`'s layout so widgets can be copied across with only import
path changes.

```
Creaca/
├── components.json              shadcn config (already matches estore)
├── CLAUDE.md                    this file
├── src/
│   ├── app/
│   │   ├── layout.tsx            root layout: fonts, providers, toaster
│   │   ├── page.tsx               redirect '/' -> '/{defaultLang}'
│   │   ├── admin/                 non-localized admin panel (kept, see §7)
│   │   └── [lang]/                localized public + learner site (kept, see §7)
│   │       each route folder may colocate page-local pieces in a
│   │       parenthesized `(components)` folder (plural, PascalCase files);
│   │       promote to a widget only on 2nd use elsewhere (see §4)
│   ├── axios-instances/
│   │   ├── SecurityAxios.ts       authenticated instance: bearer token,
│   │   │                          refresh-token interceptor w/ request
│   │   │                          queueing, isAuthenticated()/
│   │   │                          getCurrentAccessToken()/
│   │   │                          clearAuthentication()/setAuthentication()
│   │   └── UnAuthenticatedAxios.ts same base config, no auth header
│   ├── components/
│   │   └── ui/                    shadcn primitives only, kebab-case files
│   ├── constants/
│   │   └── endpoints/
│   │       └── endpoints.ts       single flat ENDPOINTS object grouped by
│   │                              domain, `:id`/`:slug` placeholders,
│   │                              never hardcode a path elsewhere
│   ├── hooks/                     shared hooks (e.g. use-mobile.ts)
│   ├── lib/
│   │   ├── providers/
│   │   │   ├── Providers.tsx      react-query setup (5 min staleTime,
│   │   │   │                      10 min gcTime, retry: 2, no
│   │   │   │                      refetchOnWindowFocus)
│   │   │   └── auth-provider.tsx  + use-auth.tsx hook
│   │   ├── dictionary/            i18n system — Kyrios-specific, KEEP
│   │   │                          (see §7); no equivalent in estore
│   │   ├── api-message.ts         apiMessage(error, fallback) helper
│   │   ├── format-time.ts         timeAgo / clockTime / formatNumber
│   │   └── utils.ts               cn() helper
│   ├── types/                     shared TS types (api.ts: ApiResponse<T> =
│   │                              { success, data?, message?, error?,
│   │                              errors? }, plus per-domain *Types.d.ts)
│   └── widgets/                   reusable building blocks, see §4
├── middleware.ts
├── next.config.ts
└── tsconfig.json                  @/* -> ./src/*
```

`src/templates/` (estore's multi-tenant storefront theming system) is
**explicitly excluded** from Kyrios. Kyrios is a single-tenant LMS with no
per-store theming requirement; do not port `templates/contract.ts` or the
registry pattern unless a genuine multi-brand requirement appears later. If
that need ever arises, revisit this section rather than improvising ad hoc.

## 4. Widgets — Reuse Before You Build

- `src/widgets/` holds reusable building blocks (tables, dialogs, selects,
  toggles, data display, pagination, avatars, refresh buttons, loaders …).
  **Always check for an existing widget before writing a new component.**
- Folder naming: **kebab-case folder, PascalCase file(s) inside**:
  `src/widgets/<kebab-name>/<PascalCaseName>.tsx`. Example:
  `src/widgets/custom-table/DataTable.tsx`,
  `src/widgets/confirm-dialog/ConfirmDialog.tsx`,
  `src/widgets/custom-dialog/{CustomDialog,InfoDialog}.tsx`.
- Multi-component folders are fine for tightly related variants (e.g.
  `custom-select/{CustomSelect,CustomMultiSelect}.tsx`,
  `loaders/{Spinner,TableLoader,AnalyticsLoader}.tsx`).
- Feature-scoped bundles (reusable only within one feature area, e.g.
  admin course/subject forms) get their own folder under `widgets/` too,
  not scattered across route-local `(components)` folders once reused.
- Extraction threshold: a component/hook/helper used **more than once** —
  across pages, or twice within one page — gets extracted:
  - Generic UI → `src/widgets/<kebab-name>/<PascalCase>.tsx`
  - Feature-scoped shared UI → a feature folder under `src/widgets/`
  - Non-visual helpers → `src/lib/`
- Named shared helpers to reuse, never reimplement inline:
  - `apiMessage(error, fallback)` — `src/lib/api-message.ts`
  - `timeAgo` / `clockTime` / `formatNumber` — `src/lib/format-time.ts`
  - `RefreshButton` widget for refresh actions (spinner + toast +
    react-query refetch state)

## 5. Export Convention

Use **named exports** for all widgets, hooks, and lib helpers
(`export function Foo()` / `export const useFoo = …`). Reserve default
exports for Next.js file-convention files only (`page.tsx`, `layout.tsx`,
`loading.tsx`, `not-found.tsx`, `middleware.ts`) where the framework requires
them. estore-frontend has no house rule here and mixes both — do not copy
that inconsistency; Creaca standardizes on named exports.

## 6. Data Fetching, Mutations, Responsive Layout, Style

These mirror `estore-frontend/RULES.md` and apply equally here.

**Data fetching**
- Server state via `@tanstack/react-query`.
- Authenticated calls go through `src/axios-instances/SecurityAxios.ts`;
  unauthenticated/public calls through `UnAuthenticatedAxios.ts`.
- Endpoint strings come **only** from `src/constants/endpoints/endpoints.ts`
  — never hardcode a path in a component or hook.
- API response envelope: `{ success, data, message, errors }`.
- Debounce free-text search inputs before they enter a query key.

**Mutation UX**
- Every button that fires a mutation disables itself and shows a spinner
  (`Loader2` with `animate-spin`) while the request is in flight.
- When several sibling actions exist, disable them all during a mutation but
  spin only the button that was clicked (track via the mutation's
  `variables`).
- Destructive actions (delete, reject, revoke) go through a confirmation
  dialog (`InfoDialog` / `ConfirmDialog`).
- Surface results with `sonner` toasts using `apiMessage(error, fallback)`.

**Responsive layout**
- Multi-pane pages (list / detail / side panel) collapse on mobile to a
  single pane with drill-in navigation and back buttons, visible only below
  `lg`.
- The page body never scrolls horizontally; panes scroll internally
  (`overflow-y-auto` with a max height).

**Style**
- Tailwind v4 classes; support dark mode (`dark:` variants) on every new
  surface.
- Match the existing visual language: rounded-2xl cards on
  `bg-white dark:bg-[#111114]`, emerald as the primary action color,
  `text-[10px] font-black uppercase tracking-widest` for micro-labels.

## 7. Kyrios-Specific Exceptions (do NOT remove when aligning with estore)

These are intentional divergences from estore-frontend. They exist because
Kyrios has requirements estore does not (localization, a two-audience app).
When porting a widget from estore, keep these in place — do not strip them
out in the name of matching estore exactly.

- **i18n dictionary system** (`src/lib/dictionary/`): `dictionary.ts` merges
  a common dictionary with per-page dictionaries (home, about, contact,
  courses, faqs) keyed by `Lang` (en/fr/es); `get-dictionary.ts` resolves a
  lang with fallback to `en`. estore-frontend has no i18n at all — this is
  purely a Kyrios addition and is load-bearing for the whole `[lang]` route
  tree. Any ported widget with copy/strings must be wired into this
  dictionary system rather than hardcoding English strings.
  - Known inconsistency to fix opportunistically (not urgent): some pages
    (e.g. `login/page.tsx`) define their own inline ad-hoc dictionary
    instead of using the centralized one. New/ported pages must use the
    centralized dictionary; do not add further one-off inline dictionaries.
- **Admin vs. `[lang]` split**: `src/app/admin/` (non-localized, internal,
  own sidebar shell) is deliberately separate from `src/app/[lang]/`
  (localized, public + learner-facing). estore has only one dashboard
  layout; Kyrios has two distinct shells for two audiences. When porting an
  estore dashboard widget, decide explicitly whether it belongs under
  `admin/` (internal ops) or under `[lang]/dashboard` (learner-facing), and
  wire strings through the dictionary only for the latter.
- **Auth cookie**: Kyrios uses a single cookie `kyrios_auth_session`
  containing `{ user, tokens }`, versus estore's `auth_data`. Keep this name;
  do not rename to match estore.
- **Role-based routing**: ADMIN/STAFF land in `/admin/...`; all other roles
  land in `/${lang}/dashboard`. This has no equivalent in estore's simpler
  single-audience storefront and must be preserved.

## 8. Migration Delta (tracked, NOT executed by this document)

The current tree does not yet match §3 above. This checklist is the
authoritative to-do list for the **future** structural-migration task (the
one that ports widgets from estore-frontend). Writing this CLAUDE.md makes
**no** code changes; nothing below has been done yet.

- [ ] Move `widgets/` (currently at repo root, sibling to `src/`) into
      `src/widgets/`, and rename each folder from PascalCase to kebab-case:
      - `widgets/ConfirmDialog` → `src/widgets/confirm-dialog`
      - `widgets/CustomDialog` → `src/widgets/custom-dialog`
      - `widgets/CustomSelect` → `src/widgets/custom-select`
      - `widgets/Customtable` → `src/widgets/custom-table` (also fixes the
        mid-word casing typo `Customtable`)
      - `widgets/DataDisplay` → `src/widgets/data-display`
      - `widgets/ToggleGroup` → `src/widgets/toggle-group`
      Update all relative imports to these; consider adding a `@/widgets/*`
      tsconfig path alias once they live under `src/`.
- [ ] Split `src/lib/axios.ts` (single shared instance with an allowlist +
      refresh-on-401 check) into `src/axios-instances/SecurityAxios.ts`
      (authed) and `src/axios-instances/UnAuthenticatedAxios.ts` (public),
      matching estore's split. Preserve the existing refresh logic (which
      keys off `error.response.data.message === "Token has expired"`) inside
      `SecurityAxios.ts`'s interceptor.
- [ ] Rename `src/lib/endpoints.tsx` → `src/constants/endpoints/endpoints.ts`
      (drop the unused `.tsx` extension; move to the estore-shaped path).
      Preserve `API_VERSION`/`'/api/v1'` prefix, domain grouping
      (AUTH/ADMIN/SUBJECTS/COURSES/PACKAGES/SUBSCRIPTIONS), and the
      `PUBLIC_URLS` export.
- [ ] Move `src/context/providers.tsx` → `src/lib/providers/Providers.tsx`
      (react-query config already matches estore's; this is a location-only
      move). Move/rename `src/context/AuthContext.tsx` into
      `src/lib/providers/` as `auth-provider.tsx` (+ a `use-auth.tsx` hook)
      if adopting estore's provider-file naming, or explicitly document
      keeping `AuthContext.tsx`'s current name/shape if not — decide before
      executing.
- [ ] Add `src/types/` with at least `api.ts` exporting
      `ApiResponse<T> = { success, data?, message?, error?, errors? }`, plus
      per-domain type files as needed (courses, subjects, packages, users).
- [ ] Add `src/hooks/` (currently referenced by `components.json`'s
      `hooks: "@/hooks"` alias but the directory does not exist).
- [ ] Decide the fate of `src/templates/`: confirmed EXCLUDED per §3 above
      unless a multi-tenant/theming requirement emerges. No action needed
      now; revisit only if that requirement appears.
- [x] Fixed the middleware locale bug in `src/middleware.ts`: it computes
      `const lang = segments[1] || 'en'` in two branches but then redirects
      to the hardcoded `/en/login` and `/` instead of
      `` `/${lang}/login` `` and `` `/${lang}` ``. This makes redirects
      non-locale-aware for fr/es users.

Pre-launch functionality added in July 2026: hosted Paystack checkout and
localized result pages, server-backed admin analytics/logs/settings, real
notifications, admin role gating, server-side logout, MFA backup recovery,
prerequisite editing, and repaired dead detail/navigation actions. These
features intentionally use the current pre-structural-migration import paths;
the directory moves above remain a separate follow-up.
- [ ] Resolve `(components)` vs `(component)` plural inconsistency:
      `src/app/admin/subjects/(components)/` (plural) vs.
      `src/app/admin/users/(component)/` (singular). Standardize on plural
      `(components)` and rename the `users` one.
- [ ] Decide casing for `src/app/[lang]/FAQs` (currently PascalCase route
      segment, inconsistent with sibling lowercase segments `about`,
      `contact`, `courses`, `packages`, `profile`). Recommend renaming to
      `faqs` for consistency, with a redirect/rewrite if the old URL must be
      preserved for SEO/bookmarks.
- [ ] Decide casing for `src/app/admin/subjects/course_registrations`
      (snake_case) — recommend renaming to `course-registrations` (kebab-
      case) to match Next.js route-segment conventions used elsewhere, with
      the same redirect caveat if this URL is already indexed/linked.
- [ ] Rename `package.json` `"name": "out"` (stray leftover, also present in
      estore) to something meaningful, e.g. `"kyrios-frontend"`.
- [ ] Remove stray artifacts not part of source control hygiene:
      `firebase-debug.log` at repo root (add to `.gitignore` if not already).
- [ ] Once directory moves above are done, update `tsconfig.json` if a
      `@/widgets/*` or `@/types/*` alias is desired (not strictly required
      since `@/*` already covers `./src/*`, but improves ergonomics and
      matches how other aliases are documented in `components.json`).

Do not begin executing this checklist as part of writing this document. It is
scoped for a follow-up task explicitly focused on the estore→Creaca widget
port and structural alignment.
