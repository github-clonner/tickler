// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : MenuBar.js                                                //
// @summary      : Menubar class for with electron apps                      //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 28 Nov 2017                                               //
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

import { remote, ipcRenderer } from 'electron';
import { EventEmitter } from 'events';
const { app, Menu, MenuItem, Tray, nativeImage, BrowserWindow, screen } = remote;

const handler = {
  construct: function(object, [ file, repository, commands ], newTarget) {
    console.log('constructor', object, newTarget)
    // console.log('constructor', file, repository, commands)
    // if (validator.validate('playlist#/definitions/Track', dictionary)) {
    //   return Reflect.construct(object, [ dictionary ], newTarget);
    // } else {
    //   console.error(validator.errorsText(), validator.errors);
    //   throw new Error(validator.errorsText());
    // }
    // console.log('object', file, newTarget);
    return Reflect.construct(object, [ commands ], newTarget);
  },
  has: function (object, property) {
    console.log('has', property, value)
    return Reflect.has(object, property);
  },
  set: function(object, property, value, receiver) {
    console.log('set', property, value)
    return Reflect.set(object, property, value, receiver);
  },
  get: function (object, property, receiver) {
    // console.log('get', object, property, typeof object[property]);
    if (typeof object[property] === 'functxion') {
      console.log('get is FX', object, property);
      const method = Reflect.get(object, property).bind(object);
      return (...args) => {
        return Reflect.apply(method, object, args);
      };
      // return Reflect.get(object, property, receiver).bind(object);

      // const apply = (...args) => {
      //   return Reflect.apply(object[property], object, args);
      // };
      // return apply.bind(object);
    }
    if (Reflect.has(object, property)) {
      return Reflect.get(object, property);
    } else {
      return Reflect.get(object, property, receiver);
    }
  },
  apply: function(object, thisArg, argumentsList) {
    // console.log('apply', argumentsList);
    return Reflect.apply(object, thisArg, argumentsList);
  }
};

export class MenuBar extends EventEmitter {
  static config(options) {
    return {
      width: 400,
      height: 400,
      show: false,
      frame: false,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      autoHideMenuBar: true,
      hasShadow: false,
      titleBarStyle: 'customButtonsOnHover',
      transparent: true,
      backgroundColor: '#00FFFFFF',
      ...options
    };
  };

  get listeners() {
    const { menubar, menubar: { id }, menubar: { webContents }, options } = this;
    return {
      /* menubar event listeners */
      menubar: {
        closed: [ menubar.once, (event) => { console.log('MODAL CLOSED', event) }],
        readyToShow: [ menubar.once,  () => {
          console.log('readyToShow');
          return this.send('menubar:set:scope', { data, options, id });
        }],
        blur: [ menubar.once, (event) => menubar.close() ],
      },

      /* webContent event listeners */
      webContent: {
        beforeInputEvent: [ webContents.on,  (event, input) => {
          console.log('beforeInputEvent');
          if (input.key === 'Escape') return menubar.close();
        }],
        didFinishLoad: [ webContents.once, () => {
          console.log('didFinishLoad');
          menubar.show();
          menubar.focus();
          // this.send('menubar:set:scope', { data: this.data, options: this.options });
          webContents.openDevTools();
        }]
      },

      /* app event listeners */
      app: {
        ready: [ app.once, (event) =>  {

        }]
      },
      /* application event listeners */
      tray: {
        defaultClickEvent: [ this.tray.on, (event) => {
          return event.preventDefault();
          // return menubar.close();
        }],
        double: [ this.tray.on, (event) => {
          return event.preventDefault();
        }]
      }
    };
  }

  set options(options) {
    this._options = MenuBar.config(options);
  }

  get options() {
    return this._options;
  }

  get bounds() {
    return this.menubar.getBounds();
  }

  constructor(options, ...args) {
    super(...args);
    this.options = options;
    this.createWindow();
  }

  verticalCenter(x, width) {
    return x - (this.bounds.width / 2) + (width / 2);
  };

  createWindow() {
    this.menubar = new BrowserWindow(this.options);
    this.menubar.loadURL('https://s.codepen.io/maggiben/debug/KyrKWZ/NjkYzwLbdQGM');
  }

  showWindow({ x, y, width, height }) {
    this.menubar.setPosition(this.verticalCenter(x, width), y + height);
    this.menubar.show();
    this.emit('after-show');
  }

  hideWindow () {
    this.emit('hide');
    this.menubar.hide();
    this.emit('after-hide');
  }

  get isVisible() {
    return this.menubar ? this.menubar.isVisible() : false;
  }

  menubarClear () {
    delete menubar.menubar;
    this.menubar.emit('after-close');
  }


  attachListeners() {

  }
}
