// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Plugin.js                                                 //
// @summary      : Application Plugin class                                  //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 31 Oct 2017                                               //
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
import uuid from 'uuid/v1';
import { EventEmitter } from 'events';
import { isEmpty, isObject } from '../utils';
import { app, dialog, remote } from 'electron';
import schema from '../../../schemas/plugin.json';
import { Validator } from '../Schematismus';
import * as fileSystem from '../FileSystem';
import { supportedExtensions } from './extensions';
import { MiddlewareManager } from '../../store/MiddlewareManager';

const DEFAULT_PLUGINS_DIR = [ fileSystem.getAppPath(), fileSystem.getNamedPath('userData') ].map(dir => path.join(dir, 'plugins'));
const VALIDATOR = Validator({ schemas: [ schema ] });

/**
 * Plugin class
 */
export class Plugin {

  module: Object;
  options: Object;

  static validator = Validator({ schemas: [ schema ] });
  static validate(data: Object, schemaId?: string = 'plugin') : any | Error {
    try {
      const validate = Plugin.validator.getSchema(schemaId);
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

  static actionBypass(action) {
    console.log('actionBypass', action.type);
    return action;
  }

  static get defaults() {
    return {
      supportedExtensions
    };
  };

  constructor(dir: string, options?: Object) {
    this.options = { ...Plugin.defaults, ...options, ...{ dir }};
    this.events = new EventEmitter();
    this.id = uuid();
    if (fileSystem.isValidDir(dir)) {
      this.load(dir);
    }
  }

  async require(file: string, validator?: Function) : any | Error {
    try {
      return validator ? await validator(window.require(file)) : window.require(file);
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
    const { supportedExtensions } = this.options;
    try {
      const instance = await this.require(dir);
      const exposed = instance && Object.keys(instance).some(key => supportedExtensions.has(key));
      if (!exposed) {
        throw new Error('Plugin error!', `Plugin "${path.basename(dir)}" does not expose any ` + 'Hyper extension API methods');
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  get ready() {
    return new Promise((resolve, reject) => {
      this.events.once('ready', () => {
        console.log('ready event', this._ready);
        return resolve(this._ready);
      });
    });
  }

  set ready(ready) {
    this._ready = ready;
    this.events.emit('ready', this._ready);
  }

  actionBypass(action) {
    return action;
  }

  middleware(store) {
    const { dispatch, getState } = store;
    const { module, instance, testX1, testX2 } = this;
    return next => action => {
      if (typeof instance.middleware === 'function') {
        const interceptor = instance.middleware(store);
        return interceptor(next)(action);
      } else {
        return next(action);
      }
    }
  }

  async load(dir: string) : string | Error {
    try {
      const module = await this.getModule(dir);
      if (Plugin.isValidModule(module)) {
        this.module = module;
        this.instance = await this.require(dir);
        this.ready = true;
        return this;
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
    this.ready = false;
  }

}

/**
 * Check if object is a plugin
 */
export const isPlugin = (plugin) => {
  return (plugin instanceof Plugin);
}
