"use strict";
import {
  app,
  nativeImage,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Menu,
  Tray
} from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';

const config = JSON.parse(fs.readFileSync("package.json"));
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  initMainWindow();
});

// Create app icon
function makeIcon(name) {
  let file = path.join(__dirname, '../' , 'media', name);
  console.log('file: ', file)
  return nativeImage.createFromPath(file);
}

class ElectonApplication {

  constructor (...args) {
    this.mainWindowState = windowStateKeeper({
      defaultWidth: 800,
      defaultHeight: 400
    });
    this.mainWindow = new BrowserWindow({
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
      width: this.mainWindowState.width,
      height: this.mainWindowState.height,
      minWidth: 800,
      minHeight: 400,
      center: true,
      frame: false,
      icon: makeIcon('icon.png')
    });

    this.mainWindow.loadURL(`file://${__dirname}/index.html`);
    this.mainWindow.webContents.openDevTools();
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url.indexOf('build/index.html#') < 0) {
        event.preventDefault();
      }
    });

    this.mainWindowState.manage(this.mainWindow);
    initializeMediaShortcuts();
    menuBar();

    this.showAndFocus = this.showAndFocus.bind(this);
    this.maximizeApp = this.maximizeApp.bind(this);
    this.didFinishLoad = this.didFinishLoad.bind(this);

    this.mainWindow.webContents.on('did-finish-load', this.didFinishLoad);

    app.on('activate', this.showAndFocus);
    ipcMain.on('showApp', this.showAndFocus);
    ipcMain.on('maximizeApp', this.maximizeApp);

  }
  didFinishLoad () {
    this.mainWindow.setTitle('Soundnode');
    this.mainWindow.show();
    this.mainWindow.focus();
    this.mainWindow.webContents.send('config' , config);
  }
  showAndFocus () {
    this.mainWindow.show();
    this.mainWindow.focus();
  }

  maximizeApp () {
    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize();
    } else {
      this.mainWindow.maximize();
    }
  }

  makeTray (name) {
    let file = path.join(__dirname, '../' , 'media', name);
    let icon = nativeImage.createFromPath(file);
    icon = icon.resize({
      width: 16,
      height: 16
    })
    let appIcon = new Tray(icon);
  }
}

// Create the browser window.
function initMainWindow() {

  let application = new ElectonApplication();
}

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

app.on('activate', () => {
  //showAndFocus();
});

/**
 * Receive maximize event and trigger command
 */
ipcMain.on('maximizeApp', () => {
  /*if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }*/
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
  //mainWindow.hide();
});

ipcMain.on('showApp', () => {
  //showAndFocus();
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
