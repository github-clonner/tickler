// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : TrayManager.js                                            //
// @summary      : System's notification manager                             //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 27 Nov 2017                                               //
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

const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');
const { remote } = require('electron');
const { app, Menu, MenuItem, Tray, nativeImage, BrowserWindow, screen } = remote;
const { isEmpty, isDataURL, isPlainObject, isObject, isString, isBuffer, fromEntries } = require('../utils');
const { isValidFile } = require('../FileSystem');
const { createIcon, fitIcon } = require('./TrayIcon');

const isMenu = (object) => (!isPlainObject(object) && !isEmpty(object.items));


export default class TrayManager extends EventEmitter {

  static defaults(options) {
    console.log('options', options)
    return {
      icon: '/Users/bmaggi/tickler/assets/images/cheese.png', // '/Users/bmaggi/tickler/assets/images/cheese.icns', // '/Users/bmaggi/tickler/assets/images/play.icns',
      toolTip: 'This is my application.',
      menu: [
        { label: 'Item1', type: 'radio' },
        { label: 'Item2', type: 'radio' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' }
      ],
      ...options
    };
  };

  static get app() {
    const execPath = process.execPath;
    const parts = execPath.split(path.sep);
    const index = parts.findIndex(part => part.match(/.app/i));
  };

  static get windows() {
    return BrowserWindow.getAllWindows();
  }

  constructor(options, ...args) {
    super(...args);
    this.options = TrayManager.defaults(options);
    this.tray = new Tray(createIcon());
    this.show();
  }

  get menu() {
    console.log('isMenu', this.options.menu, isMenu(this.options.menu));
    if (isMenu(this.options.menu)) {
      return this.options.menu;
    } else if(isPlainObject(this.options.menu)) {
      return this.options.menu = Menu.buildFromTemplate(this.options.menu);
    }
  }

  get bounds() {
    console.log('getBounds', this.tray, this.tray.getBounds())
    try {
      return this.tray.getBounds();
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  get icon() {
    try {
      const { options: { icon }, tray, bounds } = this;
      return createIcon(icon, { bounds });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  get toolTip() {
    return this.options.toolTip;
  }

  async show() {
    const { tray, icon, menu, toolTip } = this;
    tray.setImage(icon)
    tray.setContextMenu(menu);
    tray.setToolTip(toolTip);
  }

}

const MENU_TEMPLATE = [
  { label: 'item #1', type: 'radio' },
  { label: 'item #2', type: 'radio' },
  { label: 'item #3', type: 'radio', checked: true },
  { label: 'item #4', type: 'radio' }
];

export const trayManager = window.trayManager = new TrayManager({ menu: Menu.buildFromTemplate(MENU_TEMPLATE)});
