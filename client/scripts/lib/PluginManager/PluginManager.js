// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : PluginManager.js                                          //
// @summary      : Application Plugin manager                                //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 15 Oct 2017                                               //
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

/**
 * Reference: https://maggiben.github.io/tickler/plugins#youtube
 */

import fs from 'fs';
import path from 'path';
import { app, dialog, remote } from 'electron';
import { isEmpty, isPromise, isFunction, getGenerator } from '../utils';
import schema from '../../../schemas/plugin.json';
import { Validator } from '../SchemaUtils';
import * as fileSystem from '../FileSystem';
import HashMap from '../HashMap';
import { supportedExtensions } from './extensions';
import { Plugin, isPlugin } from './Plugin';
import { MiddlewareManager } from '../../store/MiddlewareManager';

const DEFAULT_PLUGINS_DIR = [ fileSystem.getAppPath(), fileSystem.getNamedPath('userData') ].map(dir => path.join(dir, 'plugins'));

/**
 * Plugin Manager class
 */
export class PluginManager {

  static plugins = new HashMap();
  static middlewares = new HashMap();

  static actionBypass(action) {
    return action;
  }

  static get pluginsReady() {
    const pluginsReady = PluginManager.middlewares.toArray().filter(isPromise);
    return Promise.all(pluginsReady)
    .then(middlewares => {
      middlewares.forEach(([name, plugin]) => PluginManager.middlewares.set(name, plugin));
      return middlewares;
    });
  }

  static middleware(store) {
    /* create MiddlewareManager */
    const hookMiddleware = function(plugin, name) {
      if (isPlugin(plugin)) {
        const middlewareManager = new MiddlewareManager(Plugin, store);
        const { module, instance } = plugin;
        middlewareManager.use('actionBypass', plugin.middleware.bind(plugin));
      }
    };

    /* Wait for plugins to be loaded then hook the middleware manager */
    PluginManager.pluginsReady.then((plugins) => {
      PluginManager.middlewares.forEach(hookMiddleware);
    });

    /* Return */
    return next => action => {
      const result = Plugin.actionBypass(action);
      PluginManager.pluginsReady.then((plugins) => {
        const rx = plugins.map(([name, plugin]) => {
          return plugin.middleware.bind(plugin)(store)(next)(action);
        })
        // const result = plugins[0].invokeExtension(middleware, next, action);
        return next(result);
      })
    };
  }

  static get defaults() {
    return {
      pluginsDir: DEFAULT_PLUGINS_DIR
    };
  };

  constructor(options) {
    this.options = { ...PluginManager.defaults, ...options };
    const paths = this.getPaths();
    if (Array.isArray(paths) && paths.length > 0) {
      this.loadPlugins(paths);
    } else {
      this.createPluginsDir();
    }
  }

  get plugins() {
    console.log('get plugins', PluginManager.plugins);
    return PluginManager.plugins;
  }

  set plugins(plugins) {
    return plugins.copy(PluginManager.plugins);
  }

  /* find available extension handlers */
  findExtansionHandler(extension) {
    const { plugins } = this;
    return plugins.filter(([name, plugin]) => plugin.hasExtension(extension))
  }

  invokeExtension(extension, ...args) {
    const handlers = this.findExtansionHandler(extension);
    console.log('invokeExtension', handlers);
    return handlers.map(([ name, plugin ]) => {
      return plugin.invokeExtension(extension, ...args);
    });
    // return handlers;
  }

  /*
   * Get Path values from hashMap
   * @public
   * @param {string} path The path of the property to get.
   * @param {*} default value to return if undefined
   * @returns {*} Returns the resolved value.
   */
  // get(...args) {
  //   return getGenerator(this.plugins).apply(this, [...args]);
  // }

  getPaths(dirs?: Array<string>) : string | Error {
    const { pluginsDir } = this.options;
    try {
      return [ ...pluginsDir, dirs ]
      /* filter valid directories */
      .filter(fileSystem.isValidDir)
      /* get dir filenames */
      .map(fileSystem.readdir)
      /* flatten all results */
      .reduce((dirs, dir) => dirs.concat(dir), [])
      /* filter valid directories */
      .filter(fileSystem.isValidDir)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async loadPlugins(dirs: Array<string>) : string | Error {
    console.log('loadPlugins', dirs);
    const promises = dirs.slice(1, 2).map(dir => {
      const name = path.basename(dir);
      const plugin = new Plugin(dir);
      const result = plugin.ready.then(() => [ name, plugin ]);
      PluginManager.middlewares.set(name, result);
      return result;
    });
    return this.plugins = new HashMap(await Promise.all(promises));
  }

  clearCache() {
    /* trigger unload hooks */
    this.plugins.forEach(plugin => {
      if (plugin.onUnload) {
        plugin.onUnload(app);
      }
    });
    /* clear require cache */
    for (const entry in require.cache) {
      if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
        delete require.cache[entry];
      }
    }
  }

  /* create default plugins directory */
  createPluginsDir(dir?: string = this.options.pluginsDir) {
    return fileSystem.ensureDir(dir);
  }
}
