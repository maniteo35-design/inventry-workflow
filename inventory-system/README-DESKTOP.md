# InvenTrack Desktop — Offline PC App

InvenTrack now runs as a native desktop app (Windows/macOS/Linux) with **no internet connection and no separate database server required**. It's the same Next.js frontend and Express backend from the web version, wrapped in Electron, using a local **SQLite** file instead of MySQL/Postgres.

How it fits together:
- **Electron main process** (`electron/main.js`) starts the Express API on `http://127.0.0.1:5051` and the built Next.js app on `http://127.0.0.1:4300`, then opens a native window pointed at the frontend.
- **Database**: SQLite file stored in the OS-standard per-user app data folder (e.g. `%APPDATA%/InvenTrack` on Windows, `~/Library/Application Support/InvenTrack` on macOS, `~/.config/InvenTrack` on Linux) — created automatically, no setup.
- **First launch**: a default admin account is created automatically (`AUTO_SEED_ADMIN=true`), so there's nothing to configure before you can log in.

---

## 1. One-time setup

From the project root (this installs backend + frontend + electron-builder together via npm workspaces):

```bash
npm install
```

> Note: `sqlite3` is a native module. `postinstall` runs `electron-builder install-app-deps`, which rebuilds native modules against Electron's Node version automatically. If you hit a native-module error, run `npx electron-builder install-app-deps` manually.

---

## 2. Run in development (fastest feedback loop)

This runs the backend and frontend as normal dev servers (with hot reload) and points an Electron window at them — nothing gets built or packaged.

```bash
# make sure backend/.env has DB_DIALECT=sqlite (copy from backend/.env.example if you haven't)
npm run dev:desktop
```

This starts, in parallel: the Express API (`:5000`), the Next.js dev server (`:3000`), and Electron once both are up, loading `http://localhost:3000/login`.

---

## 3. Build & package as an installable app

```bash
npm run build:frontend   # builds the Next.js app for production
npm run package           # packages for your current OS -> /dist
```

Or target a specific OS explicitly:
```bash
npm run package:win
npm run package:mac
npm run package:linux
```

Output installers land in `/dist` (e.g. `InvenTrack Setup.exe`, `InvenTrack.dmg`, `InvenTrack.AppImage`). Install and launch like any desktop app — fully offline from then on.

---

## 4. Default login

On first launch, a default account is created:
```
admin@local / ChangeMe123!
```
Change this immediately from a real user-management flow, or override before first run via environment variables in `electron/main.js` (`DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`).

**Important:** change `JWT_SECRET` in `electron/main.js` before distributing this to real users — the placeholder there is fine for local testing but shouldn't ship as-is.

---

## 5. Where your data lives

All inventory, sales, customers, etc. are stored in a single `inventory.sqlite` file in the app's user-data folder. To back up: copy that file. To reset: delete it and relaunch (a fresh default admin will be created).

To find the exact path, the app logs it on first startup (check the terminal in dev mode), or check your OS's standard app-data location for "InvenTrack".

---

## 6. Known trade-offs of the offline build

- **Single user per install** — this is a single-machine desktop app; it doesn't sync data between installs. If you need multiple PCs sharing one dataset, run the original web version (`docker-compose.yml`) with MySQL/Postgres on a shared server instead, and point each PC's browser at it.
- **Barcode label printing (jsbarcode/canvas)** was intentionally left out of the desktop build to avoid native-module packaging headaches across OSes; the QR code (pure JS, no native deps) still works everywhere. Add barcode rendering back in if you're comfortable rebuilding `canvas` per target platform.
- **Auto-update** isn't wired up. `electron-builder` supports it (electron-updater) if you want to ship updates later — not included here to keep the scaffold focused.
