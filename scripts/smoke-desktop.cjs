const { app, BrowserWindow, session } = require("electron");
const path = require("node:path");
const assert = require("node:assert/strict");

// Use an isolated, in-memory partition: never touch the owner's diary.
const partition = `desktop-smoke-${Date.now()}`;
const timeout = setTimeout(() => {
  console.error("Desktop verification timed out");
  app.exit(1);
}, 45000);
app
  .whenReady()
  .then(async () => {
    const requests = [];
    session
      .fromPartition(partition)
      .webRequest.onBeforeRequest((details, callback) => {
        requests.push(details.url);
        // An offline desktop build must not require remote assets.
        callback({ cancel: /^https?:/.test(details.url) });
      });
    const window = new BrowserWindow({
      show: false,
      width: 1500,
      height: 1000,
      webPreferences: {
        partition,
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false,
      },
    });
    const errors = [];
    window.webContents.on("console-message", (_event, level, message) => {
      if (level >= 3) {
        errors.push(message);
        console.error(message);
      }
    });
    await window.loadFile(path.join(__dirname, "../dist/index.html"));
    assert.ok(
      (
        await window.webContents.executeJavaScript("document.body.innerText")
      ).includes("Sign in"),
    );
    await window.webContents.executeJavaScript(
      "localStorage.setItem('maruti800DiaryUnlocked','true')",
    );
    await window.loadFile(path.join(__dirname, "../dist/index.html"));
    await window.webContents
      .executeJavaScript(`new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (document.querySelector('.model-viewer')?.dataset.ready === 'true') return resolve();
      if (Date.now() - start > 25000) return reject(new Error('Model did not load from packaged file path: ' + document.body.innerText));
      setTimeout(check, 250);
    }; check();
  })`);
    const body = await window.webContents.executeJavaScript(
      "document.body.innerText",
    );
    assert.ok(body.includes("Workbench"));
    assert.ok(!body.includes("3D view unavailable"));
    assert.ok(!body.includes("Loading vehicle geometry"));
    assert.equal(
      requests.filter((url) => /^https?:/.test(url)).length,
      0,
      "Unexpected remote dependency",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: Electron file build renders login, workbench and model; no remote dependencies or browser errors.",
    );
    clearTimeout(timeout);
    window.destroy();
    app.quit();
  })
  .catch((error) => {
    console.error(error);
    clearTimeout(timeout);
    app.exit(1);
  });
