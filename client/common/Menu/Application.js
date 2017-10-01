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
  Menu,
  shell,
  dialog,
  systemPreferences
} from 'electron';
import path from 'path';

const appName = app.getName();
const appVersion = app.getVersion();

export const makeIcon = function (name) {
  const file = path.join(__dirname, '../' , 'media', name);
  return nativeImage.createFromPath(file);
};

export const showAbout = function () {
  dialog.showMessageBox({
    title: `About ${appName}`,
    message: `${appName} ${appVersion}`,
    detail: `Created by Benjamin Maggi \nCopyright © 2017.`,
    buttons: [],
    icon: makeIcon('icon.png')
  });
};

export const Application = function() {
  const submenu = [{
    label: `${appName}`,
    submenu: [{
      label: `About ${appName}`,
      click() {
        showAbout();
      }
    }, {
      type: "separator"
    }, {
      label: "Quit",
      accelerator: "Command+Q",
      click() {
        app.quit();
      }
    }]
  }];
  const menu = Menu.buildFromTemplate(submenu);
  Menu.setApplicationMenu(menu);
};
