const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("milo", {
  action: (a) => ipcRenderer.send("action", a),
  roam: () => ipcRenderer.send("roam"),
  studio: () => ipcRenderer.send("studio"),
  menu: () => ipcRenderer.send("menu"),
  bounds: (b) => ipcRenderer.send("bounds", b),
  setting: (k, v) => ipcRenderer.send("setting", k, v),
  onAction: (fn) => ipcRenderer.on("action", (_, a) => fn(a)),
  onSetting: (fn) => ipcRenderer.on("setting", (_, k, v) => fn(k, v)),
});
