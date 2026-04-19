# GCP Cloud Run Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Containerise the Deutsch Tutor Next.js app and deploy it to Google Cloud Run with a custom domain and HTTPS.

**Architecture:** Add `output: 'standalone'` to `next.config.ts` so Next.js produces a self-contained server bundle, then containerise it with a multi-stage Dockerfile. Deploy to Cloud Run via `gcloud builds submit` + `gcloud run deploy`, setting credentials as environment variables. Attach the custom domain via Cloud Run domain mappings for automatic HTTPS.

**Tech Stack:** Next.js 15 (standalone output), Docker (multi-stage), Google Cloud Run, Google Artifact Registry, `gcloud` CLI

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `next.config.ts` | Modify | Enable `output: 'standalone'` |
| `Dockerfile` | Create | Multi-stage container build |
| `.dockerignore` | Create | Exclude large/sensitive files from build context |

No other files are modified. `src/middleware.ts` is unchanged.

---

## Pre-requisites

- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Your GCP project ID known (find it with `gcloud projects list`)
- Billing enabled on the GCP project
- Domain registrar login available for DNS changes

---

## Task 1: Enable standalone output

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Update next.config.ts**

Replace the entire file content with:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 2: Run the build and verify standalone output is produced**

```bash
npm run build
```

Expected: build succeeds with no errors. Then verify the standalone server exists:

```bash
ls .next/standalone/server.js
```

Expected output: `.next/standalone/server.js`

If the file is missing, the `output: 'standalone'` config was not picked up — double-check `next.config.ts` was saved correctly.

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
npm test
```

Expected:
```
Test Files  3 passed (3)
     Tests  20 passed (20)
```

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat: enable Next.js standalone output for containerisation"
```

---

## Task 2: Add .dockerignore

**Files:**
- Create: `.dockerignore`

- [ ] **Step 1: Create .dockerignore at the repo root**

```
node_modules
.next
.git
.env
.env.*
docs
*.md
```

This keeps the Docker build context small (skipping `node_modules` and `.next` which are regenerated inside the container) and prevents any `.env` files from being copied into the image.

- [ ] **Step 2: Commit**

```bash
git add .dockerignore
git commit -m "chore: add .dockerignore for Cloud Run build"
```

---

## Task 3: Add Dockerfile

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Create Dockerfile at the repo root**

```dockerfile
# Stage 1 — install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2 — build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3 — production image (lean)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed to run the server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

- [ ] **Step 2: Verify the Dockerfile builds locally (optional — skip if Docker not installed)**

```bash
docker build -t deutsch-tutor-test .
```

Expected: build completes with `Successfully built ...` or `Successfully tagged deutsch-tutor-test:latest`. If Docker is not installed locally, skip this step — Cloud Build (Step 3 of Task 4) will catch any errors.

- [ ] **Step 3: Commit**

```bash
git add Dockerfile
git commit -m "feat: add multi-stage Dockerfile for Cloud Run"
```

---

## Task 4: GCP one-time setup

These are manual `gcloud` CLI steps. Run them once. Replace `YOUR_PROJECT_ID` with your actual GCP project ID throughout.

- [ ] **Step 1: Set your project**

```bash
gcloud config set project YOUR_PROJECT_ID
```

Expected: `Updated property [core/project].`

- [ ] **Step 2: Enable required APIs**

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

Expected: output ends with `Operation "operations/..." finished successfully.`

- [ ] **Step 3: Create the Artifact Registry repository**

```bash
gcloud artifacts repositories create deutsch-tutor \
  --repository-format=docker \
  --location=us-central1 \
  --description="Deutsch Tutor Docker images"
```

Expected: `Created repository [deutsch-tutor].`

- [ ] **Step 4: Configure Docker authentication (for local use)**

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

Expected: `Adding credentials for: us-central1-docker.pkg.dev`

---

## Task 5: Build, deploy, and configure domain

Replace `YOUR_PROJECT_ID`, `YOUR_USERNAME`, `YOUR_PASSWORD`, and `yourdomain.com` with real values in every command below.

- [ ] **Step 1: Push source to git so Cloud Build has the latest code**

```bash
git push origin main
```

- [ ] **Step 2: Build and push the Docker image via Cloud Build**

```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/deutsch-tutor/app \
  --project YOUR_PROJECT_ID
```

Expected: ends with `SUCCESS` and the image URL. This runs the build remotely — no local Docker required.

- [ ] **Step 3: Deploy to Cloud Run**

```bash
gcloud run deploy deutsch-tutor \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/deutsch-tutor/app \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars AUTH_USERNAME=YOUR_USERNAME,AUTH_PASSWORD=YOUR_PASSWORD \
  --project YOUR_PROJECT_ID
```

Expected output includes:
```
Service [deutsch-tutor] revision [...] has been deployed and is serving 100 percent of traffic.
Service URL: https://deutsch-tutor-XXXX-uc.a.run.app
```

- [ ] **Step 4: Verify the app on the Cloud Run URL**

Open the Service URL from Step 3 in a browser.

Expected:
- Browser shows a login prompt (HTTP Basic Auth)
- Enter `YOUR_USERNAME` / `YOUR_PASSWORD` → app loads and functions normally
- Enter wrong credentials → prompt re-appears

If the login prompt does not appear, check that `AUTH_USERNAME` and `AUTH_PASSWORD` were set correctly in Step 3 (re-run the deploy command with corrected values).

- [ ] **Step 5: Add custom domain mapping**

```bash
gcloud run domain-mappings create \
  --service deutsch-tutor \
  --domain yourdomain.com \
  --region us-central1 \
  --project YOUR_PROJECT_ID
```

Expected output: command prints a DNS record to add at your registrar — either an A record or a CNAME, for example:
```
NAME               TYPE   DATA
yourdomain.com     A      216.239.32.21
```

- [ ] **Step 6: Add the DNS record at your registrar**

Log in to your domain registrar and add the exact record printed in Step 5. DNS propagation typically takes 5–30 minutes (up to 48 hours worst case).

- [ ] **Step 7: Verify HTTPS on your custom domain**

Once DNS has propagated, open `https://yourdomain.com` in a browser.

Expected:
- Browser shows a padlock (HTTPS) — Google provisions the certificate automatically
- Login prompt appears before any page content
- Enter correct credentials → app loads
- Enter wrong credentials → prompt re-appears
- Open in a private/incognito window and confirm the gate still holds

---

## Done

The app is live at `https://yourdomain.com` with:
- Automatic HTTPS via Google-managed certificate
- HTTP Basic Auth gate — nothing is served to unauthenticated requests
- Credentials stored only as Cloud Run environment variables — not in git

**To redeploy after code changes:**

```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/deutsch-tutor/app

gcloud run deploy deutsch-tutor \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/deutsch-tutor/app \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars AUTH_USERNAME=YOUR_USERNAME,AUTH_PASSWORD=YOUR_PASSWORD
```
