/* eslint-disable no-undef */
const { app, BrowserWindow } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
  });
  win.loadFile(path.join(app.getAppPath(), "dist/index.html"));
};

app.whenReady().then(() => {
  createWindow();
  app.on("active", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
