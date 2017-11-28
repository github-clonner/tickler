///////////////////////////////////////////////////////////////////////////////
// @file         : Thorium.js                                                //
// @summary      : Thorium core class                                        //
// @version      : 1.0.0                                                     //
// @project      : Thorium Famework                                          //
// @description  : Lightweight application framework for Electron            //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 19 Nov 2017                                               //
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
  Tray,
  systemPreferences
} from 'electron';
import fs from 'fs';
import path from 'path';
import windowStateKeeper from 'electron-window-state';

export default class Thorium {

  static config(options) {
    return {
      backgroundThrottling: false, // do not throttle animations/timers when page is background
      backgroundColor: '#FFF',
      minWidth: 800,
      minHeight: 400,
      darkTheme: true, // Forces dark theme (GTK+3)
      titleBarStyle: 'hidden-inset', // Hide title bar (Mac)
      useContentSize: true, // Specify web page size without OS chrome
      center: true,
      frame: false,
      icon: makeIcon('icon.png'),
      ...options
    };
  };

  static windowStateKeeper(options) {
    return windowStateKeeper({ defaultWidth: 800, defaultHeight: 400, ...options });
  }

  modalWindow(hRef) {
    try {
      const modal = new BrowserWindow(this.options);
      if (!modal) throw new Error('Error loading modal');
      modal.loadURL(hRef, this.data);
      return modal;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  constructor() {

  }
}
