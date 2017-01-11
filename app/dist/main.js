"use strict";

const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Menu
} = require('electron');
const fs = require('fs');

const windowStateKeeper = require('electron-window-state');

const config = JSON.parse(fs.readFileSync("package.json"));

// custom constants
const clientId = '342b8a7af638944906dcdb46f9d56d98';
const redirectUri = 'http://sc-redirect.herokuapp.com/callback.html';
const SCconnect = `https://soundcloud.com/connect?&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`;
const userConfigPath = `${__dirname}/app/public/js/system/userConfig.json`;

let mainWindow;
let authenticationWindow;

app.on('ready', () => {
  initMainWindow();
});

function initMainWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 400
  });

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 800,
    minHeight: 400,
    center: true,
    frame: false
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('will-navigate', function (e, url) {
    if (url.indexOf('build/index.html#') < 0) {
      e.preventDefault();
    }
  });

  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow.setTitle('Soundnode');
    mainWindow.show();
    mainWindow.focus();
    //setInterval(function() {
      //event.sender.send('asynchronous-reply', 'pong')
      mainWindow.webContents.send('config' , config);
    //}, 1500)

  });

  mainWindowState.manage(mainWindow);
  initializeMediaShortcuts();
  menuBar();
}

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

app.on('activate', () => {
  showAndFocus();
});

/**
 * Receive maximize event and trigger command
 */
ipcMain.on('maximizeApp', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

/**
 * Receive minimize event and trigger command
 */
ipcMain.on('minimizeApp', () => {
  mainWindow.minimize()
});

/**
 * Receive hide event and trigger command
 */
ipcMain.on('hideApp', () => {
  mainWindow.hide();
});

ipcMain.on('showApp', () => {
  showAndFocus();
});

/**
 * Receive close event and trigger command
 */
ipcMain.on('closeApp', () => {
  if (process.platform !== "darwin") {
    mainWindow.destroy();
  } else {
    mainWindow.hide();
  }
});

//
ipcMain.on('destroyApp', () => {
  mainWindow.close();
});

function showAndFocus() {
  mainWindow.show();
  mainWindow.focus();
}

function initializeMediaShortcuts() {
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('MediaPlayPause');
  });

  globalShortcut.register('MediaStop', () => {
    mainWindow.webContents.send('MediaStop');
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.send('MediaPreviousTrack');
  });

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.send('MediaNextTrack');
  });
}

function menuBar() {
  const template = [
    {
      role: 'view',
      submenu: [
        {
          role: 'togglefullscreen'
        },
        {
          role: 'close'
        },
        {
          type: 'separator'
        },
        {
          label: 'Learn More',
          click() {
            require('electron').shell.openExternal('https://github.com/Soundnode/soundnode-app/wiki/Help')
          }
        },
        {
          label: 'License',
          click() {
            require('electron').shell.openExternal('https://github.com/Soundnode/soundnode-app/blob/master/LICENSE.md')
          }
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload()
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        }
      ]
    }
  ];

  const basicTemplate = [{
    label: "Application",
    submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
  ];

  const menu = Menu.buildFromTemplate(basicTemplate);
  Menu.setApplicationMenu(menu)
}
