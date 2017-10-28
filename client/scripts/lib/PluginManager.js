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
import Ajv from 'ajv';
import setupAsync from 'ajv-async';
import schema from '../../schemas/plugin.json';
import * as fileSystem from './FileSystem';

const DEFAULT_PLUGINS_DIR = [ fileSystem.getAppPath(), fileSystem.getNamedPath('userData') ].map(dir => path.join(dir, 'plugins'));

const ajv = setupAsync(new Ajv({
  async: 'true',
  allErrors: true,
  useDefaults: true,
}));

const validate = ajv.compile(schema);

export default class PluginManager {

  plugins: Map<string, *>;

  static get defaults() {
    return {
      pluginsDir: DEFAULT_PLUGINS_DIR
    };
  };

  constructor(options) {
    this.options = { ...PluginManager.defaults, ...options };
    this.plugins = new Map();
    const { pluginsDir } = this.options;

    if (pluginsDir.some(fileSystem.isValidDir)) {
      const plugins = this.findPlugins(pluginsDir);
      console.log('plugins', plugins);
    } else {
      fileSystem.ensureDir(pluginsDir);
    }
  }

  findPlugins(dirs: Array<string>) : string | Error {
    const plugins = dirs
    /* filter valid directories */
    .filter(fileSystem.isValidDir)
    /* get dir filenames */
    .map(fileSystem.readdir)
    /* flatten all results */
    .reduce((dirs, dir) => dirs.concat(dir), [])
    /* Build  */
    .reduce((plugins, dir) => {
      const name = path.basename(dir);
      try {
        const plugin = this.loadPlugin(dir);
        return {
          ...plugins,
          [name]: plugin
        };
      } catch (ignored) {
        return plugins;
      }
    }, {});
    return plugins;
  }

  loadPlugin(dir: string) : string | Error {
    try {
      const name = path.basename(dir);
      const plugin = fileSystem.read(path.join(dir, 'plugin.json'));
      validate(plugin)
      .then(function (data) {
        console.log('Data is valid', data); // { userId: 1, postId: 19 }
      })
      .catch(function (error) {
        if (!(error instanceof Ajv.ValidationError)) throw error;
        // data is invalid
        console.error('Validation errors:', error.errors);
      });
      if (plugin) {
        this.plugins.set(name, plugin);
        return plugin;
      } else {
        throw new Error(`Cannot load plugin: ${name}`);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getPluginPackage() {

  }

  // clearCache() {
  //   // trigger unload hooks
  //   modules.forEach(mod => {
  //     if (mod.onUnload) {
  //       mod.onUnload(app);
  //     }
  //   });

  //   // clear require cache
  //   for (const entry in require.cache) {
  //     if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
  //       delete require.cache[entry];
  //     }
  //   }
  // }

}


const pluginManager = new PluginManager();
