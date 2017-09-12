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

import path from 'path';
import fs from 'fs';
import os from 'os';
import Ajv from 'ajv';
import uuid from 'uuid';
import schema from '../../schemas/playlist.json';
import { read, write, remove, getPath } from './FileSystem';
import SettingsStore from './SettingsStore';
import { PlayList } from '../types';

const settings = new SettingsStore();
const ajv = new Ajv({
  allErrors: true,
  useDefaults: true
});

export default class PlayListStore {

  playlist: PlayList;
  validate: Function;

  constructor (file?: string) {
    this.validate = ajv.compile(schema);
    const { current, folders } = settings.get('playlist');
    if (file && fs.existsSync(file)) {
      this.playlist = this.load(file);
      console.log('playlist loaded', this.playlist);
    } else {
      const match = this.find(folders, current);
      if (match) {
        console.log('playlist found', match);
        this.playlist = this.load(match);
      } else {
        console.log('playlist not found, create new');
        this.playlist = this.create();
      }
    }
  }

  /*
   * Find a playlist
   */
  find (folders: Array<string>, glob: string) : void | string {
    const { current } = settings.get('playlist');
    return folders
    .map(folder => {
      return path.isAbsolute(folder) ? path.join(folder, current) : path.join(getPath(folder), current);
    })
    .find(file => {
      return fs.existsSync(file);
    });
  }

  /*
   * Load playlist from disk
   */
  load (file: string) : PlayList | Error {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      if (stats.isFile()) {
        try {
          console.log('Playlist loading', file);
          this.playlist = read(file);
          if (this.validate(this.playlist)) {
            return this.playlist;
          } else {
            console.error(this.validate.errors);
            throw new Error('Invalid playlist format');
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      } else {
        throw new Error('Invalid playlist format');
      }
    } else {
      throw new Error('Playlist not found');
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
  create () : void | Error {
    const { username } = os.userInfo();
    const { current, folder } = settings.get('playlist');
    // Default playlist file location+name    
    const file = path.join(getPath(folder), current);
    
    this.playlist = {
      name: `${username} playlist`,
      id: uuid.v1()
    };

    this.validate(this.playlist);
    this.save(file, this.playlist);
    return this.playlist;
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
}

