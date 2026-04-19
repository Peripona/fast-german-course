# Deployment: Vercel + Basic Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add HTTP Basic Auth middleware to gate the app, then deploy to Vercel with a custom domain and automatic HTTPS.

**Architecture:** A single `src/middleware.ts` file intercepts every request on the Vercel Edge before any content is served. The auth logic is extracted into a pure `checkAuth` function (easy to unit-test). Credentials are stored as Vercel environment variables — never in code.

**Tech Stack:** Next.js 15 Edge Middleware (`next/server`), Vitest (node environment), Vercel dashboard (manual steps for deploy + domain)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/middleware.ts` | Create | Edge middleware + exported `checkAuth` pure function |
| `src/middleware.test.ts` | Create | Unit tests for `checkAuth` |

No other files are modified.

---

## Task 1: Write failing tests for `checkAuth`

**Files:**
- Create: `src/middleware.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// src/middleware.test.ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkAuth } from "./middleware";

describe("checkAuth", () => {
  beforeEach(() => {
    process.env.AUTH_USERNAME = "testuser";
    process.env.AUTH_PASSWORD = "testpass";
  });

  afterEach(() => {
    delete process.env.AUTH_USERNAME;
    delete process.env.AUTH_PASSWORD;
  });

  it("returns false when header is null", () => {
    expect(checkAuth(null)).toBe(false);
  });

  it("returns false when header is not Basic scheme", () => {
    expect(checkAuth("Bearer sometoken")).toBe(false);
  });

  it("returns false when credentials are wrong", () => {
    const header = "Basic " + btoa("wrong:credentials");
    expect(checkAuth(header)).toBe(false);
  });

  it("returns false when only username is wrong", () => {
    const header = "Basic " + btoa("baduser:testpass");
    expect(checkAuth(header)).toBe(false);
  });

  it("returns false when only password is wrong", () => {
    const header = "Basic " + btoa("testuser:badpass");
    expect(checkAuth(header)).toBe(false);
  });

  it("returns true when credentials are correct", () => {
    const header = "Basic " + btoa("testuser:testpass");
    expect(checkAuth(header)).toBe(true);
  });

  it("handles password containing a colon", () => {
    process.env.AUTH_PASSWORD = "pass:with:colons";
    const header = "Basic " + btoa("testuser:pass:with:colons");
    expect(checkAuth(header)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail with "cannot find module"**

```bash
npm test
```

Expected output: `Error: Cannot find module './middleware'`

---

## Task 2: Implement the middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create the middleware file**

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Pure function — extracts and validates Basic Auth credentials.
 * Exported for unit testing.
 */
export function checkAuth(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;

  const base64 = authHeader.slice(6);
  const decoded = atob(base64);

  // Split on the first colon only — password may contain colons
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return false;

  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  return (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  );
}

export function middleware(request: NextRequest) {
  if (!checkAuth(request.headers.get("authorization"))) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Deutsch Tutor"',
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  // Protect all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Run tests — expect them to pass**

```bash
npm test
```

Expected output:
```
✓ src/middleware.test.ts (7)
  ✓ checkAuth > returns false when header is null
  ✓ checkAuth > returns false when header is not Basic scheme
  ✓ checkAuth > returns false when credentials are wrong
  ✓ checkAuth > returns false when only username is wrong
  ✓ checkAuth > returns false when only password is wrong
  ✓ checkAuth > returns true when credentials are correct
  ✓ checkAuth > handles password containing a colon
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts src/middleware.test.ts
git commit -m "feat: add Edge Basic Auth middleware"
```

---

## Task 3: Deploy to Vercel

These are manual steps in the Vercel dashboard and your domain registrar. No code changes.

- [ ] **Step 1: Connect the repository to Vercel**
  1. Go to [vercel.com](https://vercel.com) → New Project
  2. Import the GitHub repository (`Tarandeep-ai-project`)
  3. Vercel detects Next.js automatically — leave all framework settings as default
  4. Do NOT deploy yet — set env vars first (Step 2)

- [ ] **Step 2: Add environment variables**
  1. In the new project → Settings → Environment Variables
  2. Add variable: `AUTH_USERNAME` → your chosen username (e.g. `tarandeep`) → Environment: Production
  3. Add variable: `AUTH_PASSWORD` → a strong password → Environment: Production → tick **Sensitive**
  4. Save both

- [ ] **Step 3: Deploy**
  1. Go to the Deployments tab → trigger a deploy (or push any commit to `main`)
  2. Wait for the build to complete (typically 1-2 minutes)
  3. Open the Vercel preview URL (e.g. `https://tarandeep-ai-project.vercel.app`)
  4. Browser should show a login prompt — enter your credentials and verify the app loads

- [ ] **Step 4: Add your custom domain**
  1. In Vercel → Project Settings → Domains → Add Domain
  2. Enter your domain (e.g. `deutsch.yourdomain.com`)
  3. Vercel shows the DNS record to add — either:
     - **A record**: `@` → Vercel's IP address (shown in the dashboard)
     - **CNAME**: `www` (or subdomain) → `cname.vercel-dns.com`
  4. Log in to your domain registrar and add the record shown by Vercel
  5. Wait for DNS propagation (usually 5-30 minutes; up to 48 hours worst case)

- [ ] **Step 5: Verify HTTPS + auth on your domain**
  1. Open `https://yourdomain.com` in a browser
  2. Confirm the browser shows a padlock (HTTPS) — Vercel provisions Let's Encrypt automatically
  3. Confirm the login prompt appears before any page content
  4. Enter correct credentials → app loads
  5. Enter wrong credentials → prompt re-appears

---

## Done

The app is now live at your custom domain with:
- Automatic HTTPS via Let's Encrypt (managed by Vercel)
- HTTP Basic Auth gate — the browser prompts for credentials before serving anything
- Credentials stored only in Vercel's environment variables — not in git

Future pushes to `main` deploy automatically with zero downtime.
