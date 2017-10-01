// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Main.js                                                   //
// @summary      : Electron main process manager                             //
// @version      : 0.2.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Sep 2017                                               //
// @license:     : MIT                                                       //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2017 Benjamin Maggi <benjaminmaggi@gmail.com>                   //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

import {
  app,
  nativeImage,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  // Menu,
  Tray,
  systemPreferences
} from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';
const config = {
  paths: {
    downloads: app.getPath('downloads'),
    music: app.getPath('music'),
    videos: app.getPath('videos'),
    appData: app.getPath('appData'),
    userData: app.getPath('userData'),
    cwd: process.cwd()
  },
  package: JSON.parse(fs.readFileSync(path.resolve(app.getAppPath(), 'package.json'))),
  env: process.env
};

import * as Menu from '../common/Menu';

//JSON.parse(fs.readFileSync("package.json"));
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var application;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Create the browser window.
  application = new ElectonApplication();
});

// Create app icon
function makeIcon(name) {
  let file = path.join(__dirname, '../' , 'media', name);
  return nativeImage.createFromPath(file);
}

ipcMain.on('debug', (event, message) => {
  console.log(message);
});

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
      backgroundThrottling: false, // do not throttle animations/timers when page is background
      minWidth: 800,
      minHeight: 400,
      darkTheme: true, // Forces dark theme (GTK+3)
      titleBarStyle: 'hidden-inset', // Hide title bar (Mac)
      useContentSize: true, // Specify web page size without OS chrome
      center: true,
      frame: false,
      icon: makeIcon('icon.png')
    });

    this.mainWindow.loadURL(`file://${__dirname}/index.html`);
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url.indexOf('build/index.html#') < 0) {
        event.preventDefault();
      }
    });

    this.mainWindowState.manage(this.mainWindow);
    this.initializeMediaShortcuts();
    // Menu.Application();
    // menuBar();

    this.showAndFocus = this.showAndFocus.bind(this);
    this.maximizeApp = this.maximizeApp.bind(this);
    this.didFinishLoad = this.didFinishLoad.bind(this);

    this.mainWindow.webContents.on('did-finish-load', this.didFinishLoad);

    app.on('activate', this.showAndFocus);
    app.on('will-quit', this.willQuit);
    ipcMain.on('showApp', this.showAndFocus);
    ipcMain.on('maximizeApp', this.maximizeApp);
    ipcMain.on('minimizeApp', this.minimizeApp);
    ipcMain.on('hideApp', this.hideApp);
    ipcMain.on('closeApp', this.closeApp);
    ipcMain.on('destroyApp', this.destroyApp);
  }

  didFinishLoad = () => {
    this.mainWindow.setTitle('Soundnode');
    this.mainWindow.show();
    this.mainWindow.focus();
    this.mainWindow.webContents.send('config' , config);
    this.mainWindow.webContents.send('systemPreferences' , systemPreferences);
  }

  showAndFocus = event => {
    this.mainWindow.show();
    this.mainWindow.focus();
  }

  /**
  * Receive maximize event and trigger command
  */
  maximizeApp = event => {
    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize();
    } else {
      this.mainWindow.maximize();
    }
  }

  /**
  * Receive minimize event and trigger command
  */
  minimizeApp = event => {
    return this.mainWindow.minimize();
  }

  /**
  * Receive hide event and trigger command
  */
  hideApp = event => {
    return this.mainWindow.hide();
  }

  /**
  * Receive close event and trigger command
  */
  closeApp = event => {
    if (process.platform !== "darwin") {
      this.mainWindow.destroy();
    } else {
      this.mainWindow.hide();
    }
  }

  destroyApp = event => {
    return this.mainWindow.close();
  }

  willQuit = event => {
    return globalShortcut.unregisterAll();
  }

  initializeMediaShortcuts() {
    globalShortcut.register('MediaPlayPause', () => {
      this.mainWindow.webContents.send('MediaPlayPause');
    });

    globalShortcut.register('MediaStop', () => {
      this.mainWindow.webContents.send('MediaStop');
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      this.mainWindow.webContents.send('MediaPreviousTrack');
    });

    globalShortcut.register('MediaNextTrack', () => {
      this.mainWindow.webContents.send('MediaNextTrack');
    });
  }
}

/*
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
            require('electron').shell.openExternal('https://github.com/maggiben/tickler/wiki');
          }
        },
        {
          label: 'License',
          click() {
            require('electron').shell.openExternal('https://github.com/maggiben/tickler/blob/master/LICENSE');
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
              focusedWindow.reload();
            }
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
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
    submenu: [{
        label: "About Application",
        selector: "orderFrontStandardAboutPanel:"
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: function() {
          app.quit();
        }
      }
    ]
  }, {
    label: "Edit",
    submenu: [{
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        selector: "undo:"
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        selector: "redo:"
      },
      {
        type: "separator"
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        selector: "cut:"
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        selector: "copy:"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        selector: "paste:"
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        selector: "selectAll:"
      }
    ]
  }];

  const menu = Menu.buildFromTemplate(basicTemplate);
  Menu.setApplicationMenu(menu);
}
*/
