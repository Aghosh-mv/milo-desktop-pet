const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Tray,
  Menu,
  nativeImage,
} = require("electron");
const path = require("path");
let studio,
  pet,
  tray,
  hit = null,
  timer;
const settings = {};
function createStudio() {
  if (studio) {
    studio.show();
    return;
  }
  studio = new BrowserWindow({
    width: 1120,
    height: 860,
    minWidth: 760,
    minHeight: 650,
    title: "Milo",
    backgroundColor: "#f5f8f6",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  studio.loadFile(path.join(__dirname, "../index.html"));
  studio.on("closed", () => (studio = null));
}
function roam() {
  if (pet) {
    pet.showInactive();
    return;
  }
  const d = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  pet = new BrowserWindow({
    ...d.workArea,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    focusable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });
  pet.setAlwaysOnTop(true, "screen-saver");
  pet.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  pet.setIgnoreMouseEvents(true, { forward: true });
  pet.loadFile(path.join(__dirname, "../index.html"), {
    query: { overlay: "1" },
  });
  pet.webContents.on("did-finish-load", () =>
    Object.entries(settings).forEach(([k, v]) =>
      pet.webContents.send("setting", k, v),
    ),
  );
  console.log(
    "Milo overlay created",
    JSON.stringify({
      bounds: pet.getBounds(),
      alwaysOnTop: pet.isAlwaysOnTop(),
      visibleOnAllWorkspaces: pet.isVisibleOnAllWorkspaces(),
    }),
  );
  pet.on("closed", () => {
    pet = null;
    hit = null;
    clearInterval(timer);
  });
  timer = setInterval(() => {
    if (!pet || !hit) return;
    const p = screen.getCursorScreenPoint(),
      b = pet.getBounds();
    const inside =
      hit.drag ||
      (p.x >= b.x + hit.x &&
        p.x <= b.x + hit.x + hit.w &&
        p.y >= b.y + hit.y &&
        p.y <= b.y + hit.y + hit.h);
    pet.setIgnoreMouseEvents(!inside, { forward: true });
  }, 40);
}
function menu() {
  return Menu.buildFromTemplate([
    { label: "Open Milo Studio", click: createStudio },
    { label: "Let Milo roam", click: roam },
    { label: "Hop", click: () => pet?.webContents.send("action", "jump") },
    { label: "Swing", click: () => pet?.webContents.send("action", "swing") },
    {
      label: "Pause / resume",
      click: () => pet?.webContents.send("action", "pause"),
    },
    {
      label: "Bring Milo to this display",
      click: () => {
        if (pet)
          pet.setBounds(
            screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
              .workArea,
          );
      },
    },
    { type: "separator" },
    {
      label: "Quit Milo",
      accelerator: "CommandOrControl+Q",
      click: () => app.quit(),
    },
  ]);
}
app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "../assets/tray.png"),
  );
  tray = new Tray(icon);
  tray.setToolTip("Milo");
  tray.setContextMenu(menu());
  createStudio();
  screen.on("display-metrics-changed", () => {
    if (pet)
      pet.setBounds(
        screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea,
      );
  });
});
ipcMain.on("action", (e, a) => {
  if (
    e.sender === studio?.webContents &&
    typeof a === "string" &&
    a.length < 40
  )
    pet?.webContents.send("action", a);
});
ipcMain.on("roam", roam);
ipcMain.on("studio", createStudio);
ipcMain.on("menu", () => menu().popup());
ipcMain.on("bounds", (e, b) => {
  if (
    e.sender === pet?.webContents &&
    b &&
    ["x", "y", "w", "h"].every((k) => Number.isFinite(b[k]))
  )
    hit = b;
});
ipcMain.on("setting", (e, k, v) => {
  if (e.sender !== studio?.webContents) return;
  if (!["gravity", "bounce", "size", "autonomy", "quiet", "paused"].includes(k))
    return;
  if (typeof v === "number" && !Number.isFinite(v)) return;
  settings[k] = v;
  pet?.webContents.send("setting", k, v);
});
app.on("window-all-closed", () => {});
app.on("activate", createStudio);
app.on("before-quit", () => clearInterval(timer));
