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
const { remote } = require('electron');
const { EventEmitter } = require('events');
const { app, Menu, MenuItem, Tray, nativeImage, BrowserWindow, screen } = remote;
const { isEmpty, isDataURL, isPlainObject, isObject, isString, isBuffer, fromEntries, camelToDash, isSymbol, isFunction } = require('../utils');
const { isValidFile } = require('../FileSystem');
const { createIcon } = require('./TrayIcon');
const { MenuBar } = require('../MenuBar/MenuBar');
import HashMap from '../HashMap';

const isMenu = (object) => (!isPlainObject(object) && !isEmpty(object.items));

export default class TrayManager extends EventEmitter {

  static mapEmitterMethod(property, object) {
    if (!isSymbol(property) && (property in object)) {
      const { configKey } = TrayManager.listenerConfig;
      const { [configKey]: { producer, sub }} = object;
      let { [property]: listener } = object;
      listener.splice(0, 1, producer[listener.slice(0, 1).pop()]);
      return true;
    } else {
      return false;
    }
  };

  static proxyfier(object) {

    const handler = {
      construct: function(object, argumentsList, newTarget) {
        console.log('construct', object, argumentsList, newTarget);
        return Reflect.construct(object, argumentsList, newTarget);
      },
      ownKeys: function (target) {
        console.log('ownKeys', target, Object.getOwnPropertyNames(target));
        Object.getOwnPropertySymbols(target).forEach(symbol => {
          Object.defineProperty(target, symbol, { enumerable: false });
        });
        return Reflect.ownKeys(target);
      },
      has: function (taget, property) {
        console.log('has', taget, property, typeof property);
        return Reflect.has(object, property);
      },
      set: function(object, property, value, receiver) {
        console.log('set', object, property, value, receiver);
        return Reflect.set(object, property, value, receiver);
      },
      get: function (object, property, receiver) {
        console.log('get', object, property);
        TrayManager.mapEmitterMethod(property, object);
        return Reflect.get(object, property, receiver);
      },
      apply: function(object, thisArg, argumentsList) {
        console.log('apply', object, thisArg, argumentsList);
        return Reflect.apply(object, thisArg, argumentsList);
      }
    }
    return new Proxy(object, handler);
  };

  static middlewares = new HashMap();

  // static actionBypass(action) {
  //   return action;
  // }

  // static get pluginsReady() {
  //   const pluginsReady = PluginManager.middlewares.toArray().filter(isPromise);
  //   return Promise.all(pluginsReady)
  //   .then(middlewares => {
  //     middlewares.forEach(([name, plugin]) => PluginManager.middlewares.set(name, plugin));
  //     return middlewares;
  //   });
  // }

  static middleware(store) {
    /* create MiddlewareManager */
    const hookMiddleware = function(plugin, name) {
    //   if (isPlugin(plugin)) {
    //     const middlewareManager = new MiddlewareManager(Plugin, store);
    //     const { module, instance } = plugin;
    //     middlewareManager.use('actionBypass', plugin.middleware.bind(plugin));
    //   }
    };

    /* Wait for plugins to be loaded then hook the middleware manager */
    // PluginManager.pluginsReady.then((plugins) => {
    //   PluginManager.middlewares.forEach(hookMiddleware);
    // });

    /* Return */
    return next => action => {
      console.log('ACTION', action, this);
      // const result = Plugin.actionBypass(action);
      // PluginManager.pluginsReady.then((plugins) => {
      //   const rx = plugins.map(([name, plugin]) => {
      //     return plugin.middleware.bind(plugin)(store)(next)(action);
      //   })
      //   // const result = plugins[0].invokeExtension(middleware, next, action);
        return next(action);
      // })
    };
  };

  static defaults(options) {
    return {
      icon: '/Users/bmaggi/tickler/assets/images/cheese.png', // '/Users/bmaggi/tickler/assets/images/cheese.icns', // '/Users/bmaggi/tickler/assets/images/play.icns',
      ...options
    };
  };

  static listenerConfig = {
    configKey: Symbol('config')
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
    this.menubar = new MenuBar();
    this.attachListeners();
    this.show();
  }

  get menu() {
    if (isMenu(this.options.menu)) {
      return this.options.menu;
    } else if(isPlainObject(this.options.menu)) {
      return this.options.menu = Menu.buildFromTemplate(this.options.menu);
    }
  }

  get bounds() {
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

  get listenerConfig() {
    return this.constructor.listenerConfig;
  }

  on(eventName, listener) {
    return super.on(eventName, listener);
  }

  off(eventName, listener) {
    return super.removeListener(eventName, listener);
  }

  get toolTip() {
    return this.options.toolTip || 'MyApp';
  }

  get middleware() {
    return this.constructor.middleware.bind(this);
  }

  proxyfier(object) {
    return this.constructor.proxyfier(object);
  }

  createListener(event, subscriber, handler, config) {
    const { listenerConfig: { configKey } } = this;
    const descriptor = { [event]: [ subscriber, handler, { [configKey]: config }] };
    console.log('descriptor', descriptor);
    return descriptor;
  }

  get listeners() {
    const { tray, menubar, options, listenerConfig: { configKey } } = this;
    const listeners = new HashMap();
    listeners.set('tray', this.proxyfier({
      click: [ 'on', (event, bounds) => {
        console.log('tray click', event, bounds, this.toolTip);

        if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return this.menubar.hideWindow();
        if (this.menubar.isVisible) return this.menubar.hideWindow();
        this.menubar.showWindow(bounds);
        return event.preventDefault();
      }],
      doubleClick: [ 'on', (event, bounds) => {
        console.log('tray double click', event, bounds);
        return event.preventDefault();
      }],
      [configKey]: { producer: tray }
    }));
    listeners.set('application', this.proxyfier({
      beforeQuit: [ 'once', (event) => {
        this.destroy()
      }],
      [configKey]: { producer: remote.app }
    }));
    return this._listeners || listeners;
  }

  set listeners(listeners) {
    this._listeners = listeners;
  }

  attachListeners() {
    const { configKey } = this.listenerConfig;
    const excludeSymbols = ([name]) => !isSymbol(name);
    const mapProducers = ({ producer, sep }) => ([ name, [ method, handler ]]) => [ camelToDash(name, sep), [ method, handler ]];
    const mapListeners = ([ emitter, events ]) => ([ emitter, Object.entries(events).filter(excludeSymbols).map(mapProducers(events[configKey])).map(mapHandlers) ]);
    const mapHandlers = ([ name, [ method, handler ]]) => [ name, [ method.apply(method, [ name, handler ]), handler ] ];
    const toDictionary = (listeners, [ emitter, events ]) => ({ ...listeners, [emitter]: events });
    return this.listeners = this.listeners.map(mapListeners);
  }

  detachListeners() {
    const { configKey } = this.listenerConfig;
    return this.listeners = this.listeners.map(([ emitter, events ]) => {
      return events.map(([name, [ producer, handler ]]) => {
        return producer.removeListener(name, handler);
      });
    });
  }

  destroy() {
    this.detachListeners();
    this.tray.destroy();
  };

  async show() {
    const { tray, icon, menu, toolTip } = this;
    const trayImage = icon ? tray.setImage(icon) : undefined;
    // const trayMenu = menu ? tray.setContextMenu(menu) : undefined;
    const trayToolTip = toolTip ? tray.setToolTip(toolTip) : undefined;
  }

}

// export const trayManager = window.trayManager = new TrayManager({ menu: Menu.buildFromTemplate(MENU_TEMPLATE)});
