// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : SettingsStore.js                                          //
// @summary      : Save and load user preferences                            //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 02 Sep 2017                                               //
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

import path from 'path';
import fs from 'fs';
import Ajv from 'ajv';
import schema from '../../schemas/settings.json';
import { read, write, remove, getPath } from './FileSystem';
import { tickler } from '../../../package.json';

const get = (o, path) => path.split('.').reduce((o = {}, key) => o[key], o);
const ajv = new Ajv({
  formats: {
    path: {
      type: 'string',
      validate(data) {
        return path.isAbsolute(data);
      }
    }
  },
  allErrors: true,
  useDefaults: true,
});

ajv.addKeyword('resolve', {
  type: 'string',
  modifying: true,
  validate: function (
    schemaParameterValue,
    validatedParameterValue,
    validationSchemaObject,
    currentDataPath,
    validatedParameterObject,
    validatedParameter,
    rootData
  ) {
    try {
      return (schemaParameterValue) ? validatedParameterObject[validatedParameter] = getPath(validatedParameterValue) : true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
});

ajv.addKeyword('exists', {
  type: 'string',
  modifying: true,
  validate: function (
    schemaParameterValue,
    validatedParameterValue,
    validationSchemaObject,
    currentDataPath,
    validatedParameterObject,
    validatedParameter,
    rootData
  ) {
    try {
      return fs.statSync(validatedParameterValue)[schemaParameterValue.type]();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
});

const DEFAULT_SETTINGS_FILENAME = 'settings.json';

export default class SettingsStore {
  settings: Map<string, *>;
  file: string;
  validate: Function;

  constructor () {
    this.validate = ajv.compile(schema);
    this.file = path.join(getPath('userData'), DEFAULT_SETTINGS_FILENAME);
    if (!fs.existsSync(this.file)) {
      this.create();
    } else {
      this.load();
    }
  }

  get (key: string, defaultValue?: any = null) : any {
    const { file, settings } = this;
    return (key && settings.has(key)) ? settings.get(key) : defaultValue;
  }

  load () : Object | Error {
    const { file, settings } = this;
    try {
      const data = read(file);
      if (ajv.validate(schema, data)) {
        console.log('settings', data);
        return this.settings = new Map(Object.entries(data));
      } else {
        console.error(ajv.errorsText(), ajv.errors);
        throw new Error('Invalid settings format');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  toString() : string {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  toJSON () : Object {
    const { settings } = this;
    const object = {};
    if (settings.size) {
      for (let [key, value] of settings) {
        object[key] = value
      }
    }
    return object;
  }

  save () : void | Error {
    const { file, settings } = this;
    const object = this.toJSON();
    settings.set('modifiedAt', new Date());
    const result = write(file, object);
    return result;
  }

  create () : void | Error {
    let defaults = {};
    this.validate(defaults);
    this.settings = new Map(Object.entries(defaults));
    this.settings.set('createdAt', new Date());
    console.log('new settings', defaults);
    return this.save();
  }

  delete (key: string) : void | Error {
    const { settings } = this;
    if (settings.delete(key)) {
      return this.save();
    }
  }

  clear () : void | Error {
    const { file, settings } = this;
    settings.clear();
    return remove(file);
  }

  set (key: string, value: any) : void | Error {
    const { file, settings } = this;
    settings.set(key, value);
    return this.save();
  }
}
