// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : FileSystem.js                                             //
// @summary      : Platform independent file manipulation helpers            //
// @version      : 0.0.2                                                     //
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

import electron from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { isRenderer } from './utils';
import sanitize from 'sanitize-filename';

export const getPath = function (name: string) {
  return isRenderer ? electron.remote.app.getPath(name) : electron.app.getPath(name);
};

/**
 * Get special/named directory or file path
 * @param {string} path name
 * @returns {string} the full path
 */
export const getNamedPath = function (name: string) {
  return isRenderer ? electron.remote.app.getPath(name) : electron.app.getPath(name);
};

/**
 * Get Application path
 * @returns {string} The current application directory
 */
export const getAppPath = function () {
  return isRenderer ? electron.remote.app.getAppPath() : electron.app.getAppPath();
};

/**
 * List of special directories
 * More info: https://electron.atom.io/docs/api/app/#appgetpathname
 */
export const OS_DIRECTORIES = ['home', 'appData', 'userData', 'temp', 'music', 'videos', 'exe'].reduce((directories, name) => {
  return Object.assign({}, directories, {
    [name]: getPath(name)
  })
}, {});

/**
 * Verify file exists and that it is a file type
 * @param {string} the file absolute path
 * @returns {boolean} true if file is valid
 */
export const isValidFile = function(file: string) : boolean {
  try {
    return fs.statSync(file).isFile();
  } catch (ignored) {
    return false;
  }
}

/**
 * Verify dir exists and that is is a directory type
 * @param {string} the directory absolute path
 * @returns {boolean} true if directory is valid
 */
export const isValidDir = function(dir: string) : boolean {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (ignored) {
    return false;
  }
}

/**
 * Verify dir is empty
 * @param {string} the directory absolute path
 * @returns {boolean} true if directory is empty
 */
export const isEmptyDir = function(dir: string) : boolean {
  try {
    if (this.isValidDir(dir)) {
      const items = fs.readdirSync(dir);
      return Boolean(!items || !items.length);
    } else {
      return true;
    }
  } catch (ignored) {
    return true;
  }
};

/**
 * Verify path exists (files and directories)
 * @param {string} the path
 * @returns {boolean} true if path extists
 */
export const isValidPath = function(filename: string) : boolean {
  try {
    return fs.existsSync(filename);
  } catch (ignored) {
    return false;
  }
};

/**
 * Verify list of paths
 * @param {array} list of file paths
 * @returns {boolean} true if list contains one or more valid paths
 */
export const isValidPathList = function(filePaths: Array<string>) : boolean {
  return (!isEmpty(filePaths) || !filePaths.some(isValidPath));
};

/**
 * Sanitize string for use as filename
 * @param {string} Some string that may be unsafe or invalid as a filename
 * @returns {string | error} sanitized filename
 */
export const sanitizeFilename = function(filename: string) : string | Error {
  try {
    return sanitize(filename);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Returns an array of filenames excluding '.' and '..'
 * @param {string} dir path to scan
 */
export const readdir = function(dir: string, options?: Object = Object) : Array<string> {
  const { resolve = true } = options;
  try {
    const files = fs.readdirSync(dir);
    if (resolve) {
      return files.map(filename => path.resolve(dir, filename));
    }
    return files;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Ensures that the directory exists. If the directory structure does not exist, it is created. Like mkdir -p.
 * @param {string} the directory path
 */
export const ensureDir = fs.ensureDirSync;

/**
 * Synchronus JSON file reader
 * @param {string} file path
 * @param {string|object} If options is a string, then it specifies the encoding
 * @returns {object} the parsed json file
 */
export const read = function (path: string, options?: string | Object = 'utf8') : Object | Error {
  try {
    const data: string = fs.readFileSync(path, options);
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Synchronus POJO to JSON file write
 * @param {string} file path
 * @param {object} POJO to be converted to JSON
 * @returns {undefined|Error}
 */
export const write = function (path: string, content: Object, options?: string | Object) : void | Error {
  try {
    const data: string = JSON.stringify(content, null, 2);
    return fs.writeFileSync(path, data, options);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Synchronus file remove
 * @param {string} file path to be removed
 * @returns {undefined|Error}
 */
export const remove = function (path: string) : void | Error {
  try {
    return fs.unlinkSync(path);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Synchronus file rename
 * @param {string} source path
 * @param {string} destination path
 * @returns {undefined|Error}
 */
export const rename = function (source: string, destination: string) : void | Error {
  try {
    return fs.renameSync(source, destination);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Synchronus file move
 * @param {string} source path
 * @param {string} destination path
 * @returns {undefined|Error}
 */
export const move = function (source: string, destination: string, options?: Object) : void | Error {
  try {
    return fs.moveSync(source, destination, { overwrite: true });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
