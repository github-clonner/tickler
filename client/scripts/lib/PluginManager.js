// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : PluginManager.js                                          //
// @summary      : Application Plugin manager                                //
// @version      : 0.1.0                                                     //
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

import path from 'path';
import fs from 'fs';
import { app, dialog, remote } from 'electron';
import isEmpty from 'lodash/isEmpty';
import schema from '../../schemas/plugin.json';
import { Validator } from './Schematismus';
import * as fileSystem from './FileSystem';
import { MiddlewareManager } from '../store/MiddlewareManager';

const AVAILABLE_EXTENSIONS = new Set([
  'onApp',
  'onWindow',
  'onRendererWindow',
  'onUnload',
  'middleware',
  'decorateMenu',
  'decorateHeader',
  'decorateNotification',
  'decorateNotifications',
  'decorateConfig',
  'decorateEnv',
]);
const DEFAULT_PLUGINS_DIR = [ fileSystem.getAppPath(), fileSystem.getNamedPath('userData') ].map(dir => path.join(dir, 'plugins'));
const VALIDATOR = Validator({ schemas: [ schema ] });

/**
 * Plugin class
 */
export class Plugin {

  module: Object;
  options: Object;

  static validate(data: Object, schemaId?: string = 'plugin') : any | Error {
    try {
      const validate = VALIDATOR.getSchema(schemaId);
      return validate(data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  static isValidModule(module) {
    const hasKeys = (object, keys) => keys.every(key => (key in object));
    const required = [ 'plugin', 'package' ];
    return isEmpty(module) || !hasKeys(module, required) ? false : (!isEmpty(module.plugin) && !isEmpty(module.package));
  };

  static get defaults() {
    return {
      availableExtensions: AVAILABLE_EXTENSIONS
    };
  };

  constructor(dir: string, options?: Object) {
    this.options = { ...Plugin.defaults, ...options, ...{ dir }};
    if (fileSystem.isValidDir(dir)) {
      this.load(dir);
    }
  }

  async require(file: string, validator?: Function) : any | Error {
    try {
      return validator ? await validator(remote.require(file)) : remote.require(file);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getModule(dir: string) : Object | Error {
    /* resolve file path */
    const resolvePath = ([ key, options ]) => [ key, { ...options, file: path.join(dir, options.file) } ];
    /* filter invalid files */
    const isValidPath = ([key, { file }]) => fileSystem.isValidFile(file);
    /* require path */
    const requirePath = ([ key, { file, validator }]) => this.require(file, validator).then(result => [ key, { file, validator, ...result }]);
    /* module template */
    const properties = [
      [ 'plugin', { file: 'plugin.json', validator: Plugin.validate }],
      [ 'package', { file: 'package.json' }]
    ];

    try {
      const module = await Promise.all(properties.map(resolvePath).filter(isValidPath).map(requirePath));
      return module.reduce((module, [ key, options ]) => ({ ...module, [key]: options }), {});
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getInstance(dir: string) : Object | Error {
    const { availableExtensions } = this.options;
    try {
      const instance = await this.require(dir);
      const exposed = instance && Object.keys(instance).some(key => availableExtensions.has(key));
      if (!exposed) {
        throw new Error('Plugin error!', `Plugin "${path.basename(dir)}" does not expose any ` + 'Hyper extension API methods');
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  applyExtensions() {

  }

  async load(dir: string) : string | Error {
    try {
      const module = await this.getModule(dir);
      if (Plugin.isValidModule(module)) {
        this.module = module;
        this.instance = await this.require(dir);
        return this.instance;
      } else {
        throw new Error(`Cannot load plugin: ${name}`);
      }
    } catch (error) {
      console.error(name, error);
      return undefined;
    }
  }

  unload() {
    this.module = undefined;
    this.instance = undefined;
  }

}

const MM = [
  ['A', (store) => (next) => (action) => {
    console.log('WILL DISPATCH', action.type);
    return next(action);
  }],
  ['B', (store) => (next) => (action) => {
    return next(action);
  }]
];

/**
 * Plugin Manager class
 */
export class PluginManager {

  plugins: Map<string, *>;

  // static middlewareManager = new MiddlewareManager(PluginManager);
  static middlewares = new Map(MM);
  static ActionHandler = {
    middleware: store => next => action => {
      console.log('ActionHandler', action);
      return next(action);
    }
  };

  static KAKAKA = store => next => action => {
    console.log('KAKAKA', next, action.type);
    return next(action);
  };

  static menu(action) {
    console.log('MENU:', action);
    return action;
  }
  // redux middleware generator
  static middleware({ dispatch, getState }) {

    const middleware_A = store => next => action => {
      console.log('middleware_A', action.type);
      return next(action);
    }

    const middleware_B = store => next => action => {
      console.log('middleware_B', action.type);
      return next(action);
    }

    //
    const middlewareManager = new MiddlewareManager(PluginManager);
    middlewareManager.use('menu', middleware_A, middleware_B);

    return next => action => {
      const { middlewares } = PluginManager;
      console.log('PluginManager.middlewares', action.type, middlewares);
      const result = PluginManager.menu(action);
      return next(result);
      // return next(action);
      // console.log('will dispatch', action);
      // // Call the next dispatch method in the middleware chain.
      // let returnValue = next(action);
      // console.log('state after dispatch', getState());
      // // This will likely be the action itself, unless
      // // a middleware further in chain changed it.
      // return returnValue;
    };
    // const nextMiddleware = remaining => action_ =>
    //   remaining.length ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action_) : next(action_);
    // nextMiddleware(middlewares)(action);
  };

  static get defaults() {
    return {
      pluginsDir: DEFAULT_PLUGINS_DIR
    };
  };

  constructor(options) {
    console.log('new PluginManager()')
    this.options = { ...PluginManager.defaults, ...options };
    this.plugins = new Map();
    const paths = this.getPaths();
    if (Array.isArray(paths) && paths.length > 0) {
      this.loadPlugins(paths);
    } else {
      this.createPluginsDir();
    }
  }

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
    const plugins = dirs
    /* load plugins */
    .reduce((plugins, dir) => {
      const name = path.basename(dir);
      try {
        const plugin = new Plugin(dir);
        return {
          ...plugins,
          [name]: plugin
        };
      } catch (error) {
        return plugins;
      }
    }, {});

    Object.entries(plugins).forEach(([name, plugin]) => PluginManager.middlewares.set(name, 'caca'))

    return this.plugins = new Map(Object.entries(plugins));
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

// redux middleware generator
export const middleware = store => next => action => {
  // const nextMiddleware = remaining => action_ =>
  //   remaining.length ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action_) : next(action_);
  // nextMiddleware(middlewares)(action);
};
