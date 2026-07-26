const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const http = require("http");

// Set to true only while developing (npm run dev:desktop) — points the
// window at the Next.js/Express dev servers instead of a built production copy.
const DEV_MODE = process.env.ELECTRON_DEV === "true";

const BACKEND_PORT = 5051;
const FRONTEND_PORT = 4300;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const FRONTEND_URL_PROD = `http://127.0.0.1:${FRONTEND_PORT}`;
const FRONTEND_URL_DEV = "http://localhost:3000";

let mainWindow;

function configureBackendEnv() {
  // These must be set BEFORE the backend module is required, since its
  // config reads process.env at require-time.
  process.env.NODE_ENV = "production";
  process.env.PORT = String(BACKEND_PORT);
  process.env.HOST = "127.0.0.1";
  process.env.DB_DIALECT = "sqlite";
  // Store the database inside the OS-standard per-user app data folder so it
  // survives updates and isn't tied to the install location.
  process.env.DB_STORAGE = path.join(app.getPath("userData"), "inventory.sqlite");
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || "inventrack-local-desktop-secret-change-if-you-fork-this";
  process.env.CLIENT_URL = FRONTEND_URL_PROD;
  process.env.AUTO_SEED_ADMIN = "true";
  process.env.DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@local";
  process.env.DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!";
}

async function startBackend() {
  if (DEV_MODE) return; // assume `npm run dev` is already running in /backend
  configureBackendEnv();
  // server.js starts listening as a side effect of being required.
  require(path.join(__dirname, "..", "backend", "server.js"));
}

async function startFrontend() {
  if (DEV_MODE) return; // assume `npm run dev` is already running in /frontend
  const frontendDir = path.join(__dirname, "..", "frontend");
  const next = require(path.join(frontendDir, "node_modules", "next"));
  const nextApp = next({ dev: false, dir: frontendDir });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();
  await new Promise((resolve) => {
    http.createServer((req, res) => handle(req, res)).listen(FRONTEND_PORT, "127.0.0.1", resolve);
  });
}

function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function attempt() {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Timed out waiting for ${url}`));
          } else {
            setTimeout(attempt, 300);
          }
        });
    })();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "InvenTrack",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Open any external links (e.g. target="_blank") in the OS browser, not inside the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const frontendUrl = DEV_MODE ? FRONTEND_URL_DEV : FRONTEND_URL_PROD;
  await mainWindow.loadURL(`${frontendUrl}/login`);
}

app.whenReady().then(async () => {
  try {
    await startBackend();
    await startFrontend();
    if (!DEV_MODE) {
      await waitForServer(BACKEND_URL + "/api/health");
    }
    await createWindow();
  } catch (err) {
    console.error("Failed to start InvenTrack:", err);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
