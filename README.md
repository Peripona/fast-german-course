# Deutsch Tutor

Next.js app for learning German: **vocabulary** with SM-2 spaced repetition, **grammar** lessons with exercises, and a **progress** dashboard. Data stays in the browser (Zustand + `localStorage`); you can export/import JSON backups.

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
npm test         # Vitest (SRS unit tests)
```

## Deploy (Vercel)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com): framework **Next.js**, root directory this folder, build `npm run build`, output `.next`.
3. No extra env vars required for the local-first build.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand persist, Framer Motion, Vitest.
