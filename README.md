# HAVEN Archive — implementation notes

This file is the build spec for the photo carousel, the card→detail transition, and the Supabase backend. Written to be handed straight to a CLI coding agent.

---

## 1. Concave cylindrical carousel

### 1.1 Reference implementation (source of truth — verified correct)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Concave Cylindrical Carousel</title>
<style>
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #f8f4f4;
  font-family: Inter, system-ui, sans-serif;
}
.scene, .a3d { display: grid; }
.scene {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  perspective: 35em;
  perspective-origin: 50% 50%;
  mask: linear-gradient(90deg, #0000, red 20% 80%, #0000);
  -webkit-mask: linear-gradient(90deg, #0000, red 20% 80%, #0000);
}
.a3d {
  place-self: center;
  transform-style: preserve-3d;
  animation: none;
  transform: rotateY(0deg);
}
.card {
  --w: 17.5em;
  --ba: 1turn/var(--n);
  grid-area: 1/1;
  width: var(--w);
  aspect-ratio: 7/10;
  object-fit: cover;
  border-radius: 1.5em;
  backface-visibility: hidden;
  transform:
    rotatey(calc(var(--i) * var(--ba)))
    translatez(calc(-1 * (0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))));
  box-shadow: 0 16px 35px rgba(0,0,0,.14);
}
.caption {
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255,255,255,.8);
  color: #222;
  font-size: 14px;
  letter-spacing: .04em;
  backdrop-filter: blur(8px);
  z-index: 10;
}
@media (max-width: 768px) {
  .card { --w: 12em; }
  .scene { perspective: 25em; }
}
@media (min-width: 1200px) {
  .card { --w: 20em; }
  .scene { perspective: 45em; }
}
</style>
</head>
<body>
<div class="scene">
  <div class="a3d" style="--n: 7">
    <img class="card" src="assets/panel1.jpg" style="--i: 0" alt="">
    <img class="card" src="assets/panel2.jpg" style="--i: 1" alt="">
    <img class="card" src="assets/panel3.jpg" style="--i: 2" alt="">
    <img class="card" src="assets/panel4.jpg" style="--i: 3" alt="">
    <img class="card" src="assets/panel5.jpg" style="--i: 4" alt="">
    <img class="card" src="assets/panel6.jpg" style="--i: 5" alt="">
    <img class="card" src="assets/panel7.jpg" style="--i: 6" alt="">
  </div>
  <div class="caption">CONCAVE CYLINDRICAL CAROUSEL</div>
</div>
</body>
</html>
```

Key mechanics — keep these when porting:
- `--n` (card count) and `--i` (per-card index) drive `--ba` (the angle between cards, `1turn / n`).
- Each card's own transform never changes: `rotateY(i * ba) translateZ(-radius)`. The **negative** `translateZ` is what folds every card's face inward toward the shared center — flipping it to positive turns this into an outward-facing (convex) wheel instead.
- `radius = (0.5 * width + gap) / tan(0.5 * ba)` — this is what keeps card edges touching regardless of card count or width. Recompute it whenever `--w` or `--n` changes; don't hardcode a px value.
- The whole ring only ever gets one shared `rotateY(...)` on `.a3d` — that single value is what "spins" the carousel. Never touch individual card transforms after mount.
- The `mask` gradient on `.scene` is what feathers the far-left/far-right cards into the background instead of hard-clipping them.

### 1.2 Porting to Svelte — `CylinderCarousel.svelte`

- Props: `images: string[]` (resort's `gallery` array), optional `caption?: string`.
- `n = images.length`; loop with `{#each images as src, i}` and bind `style="--i: {i}"` on each `<img>`; bind `style="--n: {n}"` on the `.a3d` wrapper.
- Rotation state: a single reactive `rotation` (degrees or turns) applied as `style="transform: rotateY({rotation}deg)"` on `.a3d`. Drive it from pointer drag (`pointerdown`/`pointermove`/`pointerup`) and wheel events, snapping to the nearest `360/n` step on release — same interaction model as the index/hover behavior already in `Card.svelte`.
- **Make it fill the screen** (this was too narrow before):
  - `.scene { width: 100%; height: 60vh; }` instead of a fixed `100vw` — it should size to whatever container it's placed in (the full-screen detail view described below), not the raw viewport.
  - Card width should scale with viewport instead of a fixed `17.5em`: `--w: clamp(14em, 22vw, 24em);` on `.card`, and `perspective: clamp(28em, 40vw, 55em);` on `.scene` so wider screens get a deeper, more dramatic curve instead of the same fixed depth stretched wide.
- Replace `assets/panelN.jpg` with `resort.gallery[i]` (Supabase Storage URLs — see §3.5).

---

## 2. Card → full-screen detail transition

Trigger: clicking a card in `CardCascade.svelte` (currently opens the small centered `ResortModal.svelte`). New behavior: the clicked card itself flattens and grows to fill the screen, then the resort details + `CylinderCarousel` fade in on top of it.

Steps:

1. **Capture the origin.** On click, before doing anything else, read `cardEl.getBoundingClientRect()` and `getComputedStyle(cardEl).transform` (the actual matrix3d string, which already encodes the cascade's tilt/position/hover offset — don't try to recompute this by hand). Store both in a `transitionOrigin` store alongside `selectedResort`.
2. **Spawn the overlay pinned to that origin.** Render `ResortDetailView.svelte` as a `position: fixed` full-viewport element, but on its very first paint set its inner wrapper's inline style to exactly match the captured rect and transform (`top/left/width/height` + the matrix3d), with `transition: none`.
3. **Flatten + grow, in the next frame.** On the following animation frame (`requestAnimationFrame`), remove the inline transform (back to identity) and set `top: 0; left: 0; width: 100vw; height: 100vh`, with a single `transition: all 0.6s cubic-bezier(0.22, 0.8, 0.25, 1)` covering both the transform and the box. The browser interpolates the un-rotate and the resize together — that's the "flattens into the screen" feel.
4. **Reveal content after the shape settles.** Listen for `transitionend` on that property, then fade/translate in the resort details and the carousel (short 200–300ms opacity + `translateY(12px)→0`). Don't render the detail content until this fires — it shouldn't be visible mid-flatten.
5. **Closing** reverses the same sequence: fade out content first, then animate the box/transform back to the stored `transitionOrigin`, then clear `selectedResort`.

Note: the native View Transitions API (`document.startViewTransition`) can shortcut steps 2–3 for the size/position morph, but it does not interpolate arbitrary 3D rotation — you'd still need to manually reset the card's rotation to flat just before calling `startViewTransition`. The manual FLIP above is the version that actually reproduces the "flattens toward you" effect; treat View Transitions as an optional simplification only if you're willing to drop the rotation part.

---

## 3. Backend — Supabase (full CRUD spec)

### 3.1 Project setup

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Env vars (`.env`):
```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only, never shipped to the client
```

### 3.2 Schema

```sql
create table resorts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  location text not null,
  contact text,
  rate_12h text,
  rate_22h text,
  pax text,
  add_pax_rate text,
  rooms text,
  pool text,
  inclusions text[] default '{}',
  amenities text[] default '{}',
  gallery text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table allowed_users (
  email text primary key,
  role text not null default 'viewer' check (role in ('viewer','admin')),
  added_at timestamptz default now()
);
```

### 3.3 Row Level Security

```sql
alter table resorts enable row level security;
alter table allowed_users enable row level security;

create or replace function is_allowed_user()
returns boolean language sql stable as $$
  select exists (
    select 1 from allowed_users where email = auth.jwt() ->> 'email'
  );
$$;

create or replace function is_admin_user()
returns boolean language sql stable as $$
  select exists (
    select 1 from allowed_users
    where email = auth.jwt() ->> 'email' and role = 'admin'
  );
$$;

create policy "allowed users can read resorts"
  on resorts for select using (is_allowed_user());

create policy "admins can insert resorts"
  on resorts for insert with check (is_admin_user());

create policy "admins can update resorts"
  on resorts for update using (is_admin_user());

create policy "admins can delete resorts"
  on resorts for delete using (is_admin_user());

create policy "admins can read allowed_users"
  on allowed_users for select using (is_admin_user());

create policy "admins can manage allowed_users"
  on allowed_users for all using (is_admin_user()) with check (is_admin_user());
```

### 3.4 Auth (Google sign-in, restricted to the allow-list)

1. In the Supabase dashboard: enable the Google provider, plug in the OAuth client ID/secret from Google Cloud Console, set the redirect URL.
2. Client sign-in call:
   ```ts
   await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: { redirectTo: `${origin}/auth/callback` }
   });
   ```
3. `hooks.server.ts` — use `@supabase/ssr`'s `createServerClient` to read/write the session cookie on every request.
4. **Allow-list gate** (`+layout.server.ts` for the main app): after auth, query `allowed_users` for the session's email. If no row exists, sign the user out server-side and render an "access restricted" page — don't just hide UI, actually block the load function from returning resort data.
5. **Admin gate** (`/admin/+layout.server.ts`): same check, additionally requiring `role = 'admin'`. Redirect non-admins to `/`.

### 3.5 Storage (resort photos)

- Bucket: `resort-photos`. Given the "selected emails only" model, make it **private** (not public) and read via signed URLs rather than a public bucket — keeps photo access consistent with the rest of the access model.
- Storage policies: admins get `insert`/`update`/`delete`; allowed users get `select` (via `is_allowed_user()`), same pattern as §3.3.
- Upload (admin panel):
  ```ts
  const { data, error } = await supabase.storage
    .from('resort-photos')
    .upload(`${resortId}/${file.name}`, file);
  ```
  Store the resulting path in `resorts.gallery`; generate a signed URL per image when rendering (`createSignedUrl(path, expiresInSeconds)`), don't store the signed URL itself since it expires.

### 3.6 CRUD operations

```ts
// list
const { data } = await supabase.from('resorts').select('*').order('created_at');

// get one
const { data } = await supabase.from('resorts').select('*').eq('slug', slug).single();

// create (admin only — enforced by RLS, not just UI)
const { data, error } = await supabase.from('resorts').insert({ ...fields }).select().single();

// update
const { error } = await supabase.from('resorts').update({ ...fields }).eq('id', id);

// delete
const { error } = await supabase.from('resorts').delete().eq('id', id);
```

Run every admin mutation through a `+page.server.ts` form action or API route using the **session-scoped** client — never the service-role key in a code path a non-admin request could hit. RLS is what actually enforces "admin only," not the UI gating.

### 3.7 Suggested build order (for the CLI)

1. Create Supabase project → run schema + RLS SQL above.
2. `src/lib/server/supabase.ts` — server client factory (`@supabase/ssr`).
3. `src/lib/supabaseClient.ts` — browser client.
4. `hooks.server.ts` — session handling.
5. `+layout.server.ts` — allow-list gate (main app) and `/admin/+layout.server.ts` (admin gate).
6. Swap the mock `resorts.ts` array for real Supabase queries in `+page.server.ts` load functions — `Resort` type stays the same shape, just add `gallery: string[]` and `slug: string`.
7. Build `/admin` CRUD routes (list, create/edit form, delete confirm) + image upload to `resort-photos`.
8. Build `CylinderCarousel.svelte` (§1.2) and the card→full-screen transition (§2).
9. Wire `resort.gallery` (signed URLs) into the carousel.