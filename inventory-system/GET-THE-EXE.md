# Getting the actual `.exe`

You have two ways to get a real, double-click InvenTrack installer. Pick whichever is easier for you.

## Option A — No local setup at all (recommended)

Uses GitHub Actions to build it in the cloud.

1. Create a new GitHub repository and push this entire folder to it.
2. On GitHub, open the **Actions** tab. The **"Build Desktop App"** workflow runs automatically (or click **Run workflow** to trigger it manually).
3. Wait a few minutes for it to finish (green checkmark).
4. Open the finished run → scroll to **Artifacts** → download **`InvenTrack-Windows-Installer`**.
5. Unzip it. Inside is **`InvenTrack Setup <version>.exe`** — double-click to install, then launch "InvenTrack" like any Windows app.

The same run also produces a macOS `.dmg` and a Linux `.AppImage` as separate artifacts, if you need those too.

## Option B — Build it yourself on a Windows PC

Requires only [Node.js](https://nodejs.org) installed (one download, a few minutes).

```bash
npm install
npm run package:win
```

The installer appears in the `dist/` folder as `InvenTrack Setup <version>.exe`.

---

Either way, the result is the same file: an installer that puts a normal Windows app on the person's machine — Start Menu entry, desktop shortcut (optional), fully offline, with its own local database. No terminal, no Node.js, no dependencies needed on the end user's PC — only whoever *builds* it needs Node.js (or nothing at all, with Option A).
