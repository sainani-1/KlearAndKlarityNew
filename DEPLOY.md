# Deploy: backend on Render + frontend on Cloudflare Pages

You are deploying from the GitHub repo
`https://github.com/sainani-1/klearandklarity` (branch `master`).

```
            HTTPS                JDBC (MySQL)
  Browser ─────────► Cloudflare Pages ─────┐
  App     calls      (React SPA, /dist)    │  no, the SPA calls the API:
                                           ▼
                            Render (Spring Boot) ──► TiDB Cloud (free MySQL)
```

- **Frontend** = static React build → **Cloudflare Pages** (free, Git-connected).
- **Backend** = Spring Boot jar → **Render** (free web service, from `render.yaml`).
- **Database** = MySQL → **TiDB Cloud** free Serverless cluster (Render does not host MySQL).

The two connect through two settings:
- Frontend `VITE_API_URL` → the Render URL + `/api`
- Backend `CORS_ALLOWED_ORIGINS` → the Cloudflare Pages URL

> Do the parts in order. Part 3 gives you the Pages URL that Part 2 needs, so if
> you set the backend up first, come back and add the CORS value afterwards.

---

## Part 1 — Create the free MySQL database (TiDB Cloud)

1. Sign up at https://tidbcloud.com (free "Serverless" tier, no card).
2. **Create Cluster → Serverless → Starter**, pick the region closest to your
   Render region (`singapore` is what `render.yaml` uses), create it.
3. Open the cluster → **Connect** → **Connect with a SQL Client** / **General**.
   Copy these values:
   - **Host** — looks like `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
   - **Port** — `4000`
   - **User** — looks like `3Fk9aBx2.root`
   - **Password** — click **Reset/Create Password** and copy it
4. **Network access:** add `0.0.0.0/0` (allow all) so Render can connect.
   TiDB Serverless by default only allows your current IP; Render's IPs change,
   so all-IP is the simple option.

Build the JDBC URL (keep it on one line):

```
jdbc:mysql://gateway01.<your-region>.prod.aws.tidbcloud.com:4000/klearity?sslMode=REQUIRED&serverTimezone=UTC&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
```

Notes:
- Port **4000**, not 3306.
- `sslMode=REQUIRED` — TiDB needs TLS; the backend's Hibernate `ddl-auto: update`
  creates all tables automatically on first boot.

Keep `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` handy for Part 2.

---

## Part 2 — Deploy the backend on Render

`render.yaml` is already in the repo. Two ways:

### Option A — Blueprint (recommended)
1. Sign in at https://render.com (GitHub login is easiest).
2. **New → Blueprint** → choose repo `sainani-1/klearandklarity` → **Connect**.
3. Render reads `render.yaml` and shows the service `klear-and-klarity-api`.
4. It will ask for the `sync: false` variables. Fill them (see table below).
   Leave the others at their defaults; `JWT_SECRET` is generated for you.
5. **Apply** — Render builds and deploys.

### Option B — Manual Web Service
**New → Web Service** → repo → set:
- **Runtime:** Native (or Docker, context `backend`)
- **Build command:** `cd backend && bash ./mvnw -B -DskipTests package`
- **Start command:** `java -Xmx320m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC -jar backend/target/guidance-plus-1.0.0.jar`
- **Health check path:** `/api/public/settings`
- Add the same environment variables below.

### Environment variables

| Key | Value | Required? |
| --- | --- | --- |
| `DB_URL` | the JDBC URL from Part 1 | **Yes** |
| `DB_USERNAME` | TiDB user, e.g. `3Fk9aBx2.root` | **Yes** |
| `DB_PASSWORD` | TiDB password | **Yes** |
| `JWT_SECRET` | any long random string (blueprint auto-generates) | Yes |
| `JWT_EXPIRATION_MINUTES` | `720` | default |
| `CORS_ALLOWED_ORIGINS` | `https://<your-pages-project>.pages.dev` | **Yes** (set after Part 3) |
| `MAIL_BASE_URL` | `https://<your-pages-project>.pages.dev` | **Yes** |
| `MAIL_FROM_NAME` | `Klear And Klarity` | default |
| `MAIL_FROM_ADDRESS` | your sending address | optional |
| `MAIL_USERNAME` | Gmail address | optional |
| `MAIL_PASSWORD` | Gmail **App Password** (16 chars) | optional |
| `MAIL_VERIFICATION_REQUIRED` | leave **blank** | default |

**Mail is optional.** If `MAIL_USERNAME`/`MAIL_PASSWORD` are blank, email
verification is simply turned off (per `application.yml`). You can add real mail
later without touching anything else. If you do want it, create a Gmail App
Password at https://myaccount.google.com/apppasswords.

### After the first deploy
- Your API URL is `https://klear-and-klarity-api.onrender.com` (Render shows the
  exact name). Health check:
  `https://klear-and-klarity-api.onrender.com/api/public/settings`
- **Free tier sleeps** after ~15 min idle; the first request takes ~50s to wake.
  Open the health URL once before testing the site.
- Logs, redeploys: Render dashboard → your service → **Manual Deploy / Logs**.

---

## Part 3 — Deploy the frontend on Cloudflare Pages (Git-connected)

1. Sign in at https://dash.cloudflare.com → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git**.
2. Authorize GitHub and pick `sainani-1/klearandklarity`, branch `master`.
3. **Build settings:**
   - **Framework preset:** `Vite` (or None)
   - **Root directory:** `frontend`   ← important, the app is in a subfolder
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Environment variables** (Production):
   - `VITE_API_URL` = `https://klear-and-klarity-api.onrender.com/api`
   - `NODE_VERSION` = `22.12.0`
5. **Save and Deploy.** First build takes a few minutes.
6. Note your URL: `https://<your-pages-project>.pages.dev`.
   Every future `git push` to `master` rebuilds automatically.

`frontend/public/_redirects` already sends unknown paths to `index.html`, so
React Router deep links (`/career-tree`, `/admin/...`) work on refresh.

> `VITE_API_URL` set here **overrides** `frontend/.env.production` during the
> Cloudflare build, so you don't have to edit any file for the website.

---

## Part 4 — Connect the two (the important bit)

1. Copy the Cloudflare Pages URL from Part 3.
2. In **Render → your service → Environment**, set:
   - `CORS_ALLOWED_ORIGINS` = `https://<your-pages-project>.pages.dev`
     (comma-separate to add more, e.g. a custom domain:
     `https://app.klearandklarity.com,https://<project>.pages.dev`)
   - `MAIL_BASE_URL` = `https://<your-pages-project>.pages.dev`
3. **Save** → Render redeploys the backend.
4. If you change `VITE_API_URL` later, hit **Retry deployment / Redeploy** in
   Cloudflare Pages so the new value is baked into the build.

---

## Part 5 — Verify

1. Wake the backend: open
   `https://klear-and-klarity-api.onrender.com/api/public/settings` (wait ~50s).
2. Open `https://<your-pages-project>.pages.dev` and:
   - load the home page and the career tree,
   - register a test account and log in.
3. Troubleshooting:
   - **Browser console "blocked by CORS policy"** → `CORS_ALLOWED_ORIGINS` in
     Render doesn't exactly match the Pages URL. Fix and redeploy backend.
   - **"Cannot reach the server"** → `VITE_API_URL` is wrong; fix in Cloudflare
     and redeploy the Pages build.
   - **Backend 500 on start** → check Render logs; usually the DB URL/user/pass
     or TiDB network access (0.0.0.0/0).

---

## Part 6 — After the API is live: repoint the native & desktop apps

The Android / iOS / Windows / macOS apps currently point at the old placeholder.
Once the Render URL works:

1. Edit `frontend/.env.production`:
   ```
   VITE_API_URL=https://klear-and-klarity-api.onrender.com/api
   ```
2. Rebuild them (see `REBUILD.md`):
   ```powershell
   cd frontend
   npm run build
   npx cap sync
   cd android ; $env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk" ; .\gradlew.bat bundleRelease assembleRelease
   cd ..\..\desktop ; npx electron-builder --win
   ```
3. For iOS/macOS/Linux, re-run the GitHub Actions workflows with the same URL.

---

## Quick reference

| Thing | Value |
| --- | --- |
| Repo | `github.com/sainani-1/klearandklarity` (branch `master`) |
| Frontend build | root `frontend`, cmd `npm run build`, output `dist` |
| Backend build | `cd backend && bash ./mvnw -B -DskipTests package` |
| Backend start | `java -jar backend/target/guidance-plus-1.0.0.jar` |
| Backend health | `GET /api/public/settings` |
| Connect keys | FE `VITE_API_URL` ↔ BE `CORS_ALLOWED_ORIGINS` |

See `BUILD.md` for app-store uploads and `REBUILD.md` for what to rebuild when
things change.
