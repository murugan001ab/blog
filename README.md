# The Journal — a file-backed Next.js blog

A simple blog with a public site and an admin dashboard, built on Next.js 16
(App Router, Turbopack) and Tailwind CSS v4. Content is stored as JSON files
on disk — no database, no ORM, no separate backend.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then set ADMIN_PASSWORD
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard
(you'll be redirected to `/login` first).

Three sample posts and three categories are seeded under `content/` so the
site isn't empty on first run — edit or delete them from the admin.

## How content is stored

```
content/
  categories.json       # all categories
  blogs/
    <id>.json           # one file per post
public/images/blogs/    # uploaded images, served at /images/blogs/*
```

Every read and write goes through `lib/blog/store.ts` — the rest of the app
(`lib/blog/queries.ts`, `lib/blog/actions.ts`, every page and component) only
knows about `BlogPost` / `Category` objects, not where they live. To move to
a database or headless CMS later, reimplement the exported functions in that
one file.

**Note for deployment:** file-based storage needs a writable, persistent
filesystem. It works with `next start` on a traditional server or container,
but **not** on read-only/serverless platforms (e.g. Vercel's default runtime)
— writes there won't persist between requests. That's exactly the seam
`store.ts` exists to let you replace when you're ready.

## Project structure

```
app/
  page.tsx                    # home
  blog/page.tsx                # blog index (client-side search + filter)
  blog/[slug]/page.tsx          # post detail (SSG, SEO metadata, JSON-LD)
  category/[category]/page.tsx  # posts filtered by category
  sitemap.ts, robots.ts
  login/page.tsx
  admin/
    layout.tsx                 # auth gate + admin nav
    page.tsx                   # dashboard
    blogs/                     # list, new, edit
    categories/                # category CRUD
    media/                     # image library
components/
  site/     # header, footer, shell
  blog/     # PostCard, ContentRenderer, CoverImage, PostBrowser
  admin/    # PostEditor, BlockEditor, ImagePicker, CategoryManager, ...
  ui/       # small shared primitives
lib/
  blog/     # store.ts (storage), queries.ts (reads), actions.ts (writes)
  auth.ts, auth-actions.ts     # single-password admin session
  utils/    # slug, date, rich-text helpers
types/blog.ts                  # BlogPost, Category, ContentBlock, ...
```

## Content model

Post content is stored as an array of typed blocks (heading, paragraph,
list, quote, image, code, divider) rather than raw Markdown — this lets the
admin editor offer per-block controls instead of a text box, and lets the
public site render plain semantic HTML with no Markdown parser and no
`dangerouslySetInnerHTML`. Inline styling (`**bold**`, `*italic*`,
`` `code` ``, `[links](url)`) is a small marker syntax the editor's toolbar
buttons write for you.

## Admin auth

A single shared password gates `/admin`, stored as a hashed, httpOnly
session cookie. Set `ADMIN_PASSWORD` in `.env.local` — the app falls back to
the (insecure) default `admin` and shows a warning on the login page until
you do. This is intentionally minimal; swap in a real auth provider if the
blog ever needs more than one editor or account-level permissions.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- Version-matched docs are also vendored at `node_modules/next/dist/docs/`
  for this exact Next.js version — useful since this project runs Next 16,
  which changed several APIs (async `params`/`searchParams`, Turbopack by
  default, etc.) from earlier versions.
