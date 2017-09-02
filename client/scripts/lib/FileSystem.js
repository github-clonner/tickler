// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : FileSystem.js                                             //
// @summary      : Save and load JSON data                                   //
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

import { remote } from 'electron';
import path from 'path';
import fs from 'fs';

export const OS_DIRECTORIES = {
  home: remote.app.getPath('home'),
  appData: remote.app.getPath('appData'),
  temp: remote.app.getPath('temp'),
  music: remote.app.getPath('music'),
  videos: remote.app.getPath('videos')
};

export const read = function (path: string, options?: string | Object = 'utf8') : Object | Error {
  if (path && fs.existsSync(path)) {
    try {
      const data: string = fs.readFileSync(path, options);
      return JSON.parse(data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    return new Error('File not found');
  }
};

export const write = function (path: string, content: Object, options?: string | Object = 'utf8') : void | Error {
  if (path && fs.existsSync(path)) {
    try {
      const str: string = JSON.stringify(content, null, 2);
      return fs.writeFileSync(path, str, options);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    return new Error('File not found');
  }
};

export const remove = function (path: string) : void | Error {
  if (path && fs.existsSync(path)) {
    try {
      return fs.unlinkSync(path);
    } catch (error) {
      console.error(error);
      throw error;
    }
  } else {
    return new Error('File not found');
  }
};
