// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : PlayListStore.js                                          //
// @summary      : PlayList store class                                      //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Sep 2017                                               //
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


import fs from 'fs';
import os from 'os';
import Ajv from 'ajv';
import path from 'path';
import uuid from 'uuid';
import { PlayList } from '../types';
import SettingsStore from './SettingsStore';
// import chokidar from 'chokidar';
import schema from '../../schemas/playlist.json';
import { read, write, remove, getPath } from './FileSystem';

const settings = new SettingsStore();
const ajv = new Ajv({
  allErrors: true,
  useDefaults: true
});

export default class PlayListStore {

  playlist: PlayList;
  watcher: Object;
  validate: Function;

  constructor (file?: string, create?: boolean = true) {
    this.validate = ajv.compile(schema);
    const { scanDirs, current } = settings.get('playlist');
    if (file) {
      this.playlist = this.load(file);
    } else if (current) {
      this.playlist = this.load(current);
    } else if (scanDirs) {
      const lists = this.find(scanDirs);
      this.playlist = this.load(lists);
    } else if (create) {
      this.playlist = this.create();
    }
  }

  /*
   * Find a playlist
   */
  find (folders: Array<string>) : void | string {
    return folders.find(file => fs.existsSync(file));
  }

  /*
   * Load playlist from disk
   */
  load (file: string) : PlayList | Error {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.isFile()) {
        try {
          this.playlist = read(file);
          if (this.validate(this.playlist)) {
            console.log(`playlist ${file} loaded`);
            this.watch(file);
            return this.playlist;
          } else {
            console.error(ajv.errorsText());
            throw new Error('Invalid playlist format');
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      } else {
        throw new Error(`Playlist ${file} cant be read`);
      }
    } else {
      throw new Error(`Playlist ${file} not found`);
    }
  }

  /*
   * Save playlist to disk
   */
  save (file: string, data: PlayList = this.playlist) : void | Error {
    const { playlist } = this;
    return write(file, this.playlist);
  }

  /*
   * Create empty playlist usually inside the user’s music directory
   */
  create() : void | Error {
    const { username } = os.userInfo();
    const { savePath, formats } = settings.get('playlist');
    const file = path.format({
      dir: getPath(savePath),
      base: `${username}-playlist`,
      ext: `.${formats.pop()}`
    });
    const { playlist } = this.playlist = {
      name: `${username}-playlist`,
      id: uuid.v1()
    };
    this.validate(playlist);
    this.save(file, playlist);
    return playlist;
  }

  /*
   * Remove playlist from disk
   */
  remove (file: string) : void | Error {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.isFile()) {
        return remove(file);
      }
    }
  }

  /*
   * Watch for playlist changes
   */
  watch (file: string, options?: Object) {
    // Initialize watcher.
    const { watcher = fs.watch(file, options) } = this;
    watcher
      .on('error', error => console.log(`Watcher error: ${error}`))
      .on('change', () => console.log(`PlayList ${file} has been changed`))
    return watcher;
  }
}

