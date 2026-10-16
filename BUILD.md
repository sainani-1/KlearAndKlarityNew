# Shipping Klear And Klarity to every store

This repo now produces installable apps for **Android, iOS, Windows, macOS and
Linux**, plus an installable **PWA** for anything with a browser.

The web app (`frontend/`) is the single source of truth. Every platform wraps
the same React build, so you change the site once and rebuild the apps.

---

## 1. Where every artifact lives

| Platform | Store / distribution | File to upload | Location in this repo |
| --- | --- | --- | --- |
| **Android** | Google Play Store | `app-release.aab` | `frontend\android\app\build\outputs\bundle\release\app-release.aab` |
| **Android** | Direct install / testing | `app-release.apk` | `frontend\android\app\build\outputs\apk\release\app-release.apk` |
| **iOS** | Apple App Store | `.ipa` (built on Mac/CI) | `frontend\ios\App\App.xcodeproj` → see section 5 |
| **Windows** | Microsoft Store / direct | `Klear And Klarity Setup 1.0.0.exe` | `desktop\release\Klear And Klarity Setup 1.0.0.exe` |
| **Windows** | Portable (no install) | `Klear And Klarity 1.0.0.exe` | `desktop\release\Klear And Klarity 1.0.0.exe` |
| **macOS** | Mac App Store / direct | `.dmg` / `.pkg` (built on Mac/CI) | `desktop\release\` after CI run → see section 6 |
| **Linux** | Direct / Snap / Flathub | `.AppImage` / `.deb` (built on Linux/CI) | `desktop\release\` after CI run → see section 6 |
| **All OS** | PWA (installable website) | the built site | `frontend\dist\` |

The signed **Android keystore** (keep this safe, never commit it) is at:
`frontend\android\keystore\klearity-upload.jks`
with its credentials in `frontend\android\keystore.properties`.

---

## 2. The API URL (read this first)

Native and desktop apps cannot use `localhost`. The backend URL is baked into
the app **at build time** from `frontend\.env.production`:

```
VITE_API_URL=https://klear-and-klarity-api.zeabur.zeabur.app/api
```

**Once your backend is actually deployed**, edit that line to the real URL,
then rebuild every app (commands below). Nothing else needs to change.

---

## 3. App identity (already configured)

| Setting | Value |
| --- | --- |
| App name | Klear And Klarity |
| Android package / iOS bundle id | `com.klearandklarity.app` |
| Version | 1.0 (`versionCode` / `build` = 1) |
| Icons & splash | generated from `All Needed\Logo.jpeg` into `frontend\resources\` |

To bump a version later: change `versionCode` and `versionName` in
`frontend\android\app\build.gradle`, and `version` in `frontend\package.json`,
then rebuild.

---

## 4. Android → Google Play Store

The `.aab` at
`frontend\android\app\build\outputs\bundle\release\app-release.aab`
is already signed with the upload keystore and ready to upload.

**To rebuild after any web change:**

```powershell
cd frontend
npm run build
npx cap sync android
cd android
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat bundleRelease assembleRelease
```

**To upload:**

1. Create a Google Play Developer account (one-time **$25**): https://play.google.com/console
2. Create the app → fill in listing, screenshots, content rating, privacy policy.
3. **Production → Create new release → upload `app-release.aab`.**
4. Complete the Data safety form and submit for review.

> Keep `frontend\android\keystore\klearity-upload.jks` and its passwords
> forever. Losing it means you cannot update the app on Play.

---

## 5. iOS → Apple App Store

The Xcode project is generated at `frontend\ios\App\App.xcodeproj`, but the
`.ipa` **must be built on macOS** (Apple requires Xcode). You said you have no
Mac, so use the ready-made cloud workflow:

**GitHub Actions (recommended):**

1. Push this repo to GitHub.
2. Actions → **Build iOS app (App Store)** → Run workflow.
3. If you have an Apple Developer account, add these repo secrets:
   `IOS_DIST_CERT_P12`, `IOS_DIST_CERT_PASSWORD`, `IOS_PROVISIONING_PROFILE`,
   `IOS_KEYCHAIN_PASSWORD`. Set your team id in
   `frontend\ios\App\ExportOptions.plist`.
4. Download the `ios-signed-ipa` (or `ios-unsigned-ipa`) artifact.

**Upload:** use **Transporter** (Mac App Store) or
`xcrun altool --upload-app` to send the `.ipa` to App Store Connect, then
submit for review in https://appstoreconnect.apple.com.

Requirements: Apple Developer Program (**$99/year**), a bundle id
`com.klearandklarity.app` registered in your Apple account, and a macOS build.

---

## 6. Windows / macOS / Linux desktop (Electron)

Project lives in `desktop\`. It loads the built web app and talks to the same
backend.

**Windows (buildable on this machine):**

```powershell
cd frontend; npm run build; cd ..\desktop
npx electron-builder --win
```

Output: `desktop\release\`
- `Klear And Klarity Setup 1.0.0.exe` — installer (upload to **Microsoft Store**
  as a packaged app, or share directly)
- `Klear And Klarity 1.0.0.exe` — portable
- `win-unpacked\` — the raw app folder

**macOS (`.dmg`) and Linux (`.AppImage` / `.deb`):** use the cloud workflow
`.github/workflows/build-desktop.yml` (Actions → Build desktop apps) because
cross-building these on Windows needs symlink privileges (Windows Developer
Mode) and, for macOS, code-signing. Download the artifacts from the run.

- Microsoft Store: **$19 one-time** developer account.
- Mac App Store: needs the same Apple Developer account as iOS; sign with a
  Developer ID / Mac App Distribution certificate.

---

## 7. PWA — installable on any OS (works today)

The built site in `frontend\dist\` now ships `manifest.webmanifest` and
`sw.js`, so it installs like an app:

- **Android/Chrome:** menu → *Install app*
- **Windows/macOS Chrome/Edge:** install icon in the address bar
- **iPhone/iPad Safari:** Share → *Add to Home Screen*

Deploy `frontend\dist\` to any static host (your Cloudflare Pages setup). No
store fees, instant updates. This is the fastest way to be "on" every device
while the store listings are in review.

---

## 8. One-time checklist before you publish

- [ ] Deploy the backend and set the real URL in `frontend\.env.production`.
- [ ] Rebuild Android (`bundleRelease`), Windows (`electron-builder --win`) and
      run the iOS + desktop CI workflows.
- [ ] Add a **privacy policy** URL (all stores require one).
- [ ] Prepare store assets: screenshots (phone + tablet + desktop), feature
      graphic (1024×500 for Play), app descriptions.
- [ ] Back up the Android keystore + `keystore.properties` somewhere safe.
- [ ] Enable **Windows Developer Mode** if you want to build Linux packages
      locally (`start ms-settings:developers`).

---

## 9. Quick command reference

| Goal | Command |
| --- | --- |
| Build web + PWA | `cd frontend && npm run build` |
| Push web to native projects | `npx cap sync` |
| Open Android in Studio | `npx cap open android` |
| Open iOS in Xcode (Mac) | `npx cap open ios` |
| Android release build | `cd android && .\gradlew.bat bundleRelease assembleRelease` |
| Run desktop in dev | `cd desktop && npm start` |
| Build desktop | `cd desktop && npx electron-builder` |

---

## 10. Notes / known limitations

- **iOS and macOS apps cannot be compiled on Windows.** Use the provided
  GitHub Actions macOS runners (free for public repos). This is an Apple
  platform rule, not a project limitation.
- **Linux desktop packages** need Unix symlink support; build them in CI or
  after enabling Windows Developer Mode.
- The desktop apps are currently **unsigned** (no code-signing certificates).
  Windows SmartScreen and macOS Gatekeeper will warn on first launch until you
  add certificates. Android *is* signed with your upload key.
