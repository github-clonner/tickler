///////////////////////////////////////////////////////////////////////////////
// @file         : Metadata.js                                               //
// @summary      : Extract media metadata                                    //
// @version      : 1.0.0                                                     //
// @project      : N/A                                                       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 19 Oct 2017                                               //
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
import path from 'path';
import axios from 'axios';
import fpcalc from 'fpcalc';

function promisify(func) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      return func(...args, (error, result) => (error ? reject(error) : resolve(result)));
    });
  }
}

function verifyFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (error) {
    return false;
  }
}

/*
 * Access nested object property by string path
 * inspiration: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 */
const get = (object: Object, path: string, defaultValue?: any) => path
  .replace(/\[(\w+)\]/g, '.$1') // Convert indexes to properties
  .replace(/^\./, '')           // strip leading dot
  .split('.')                   // Split (.) into array of properties
  .reduce((object = {}, key) => object[key], object);

export default class Metadata {

  /*
   * Lookup the MusicBrainz metadata
   */
  lookup(params) {
    const { duration, fingerprint } = params;
    return axios.get('https://api.acoustid.org/v2/lookup?meta=' + 'recordings+releasegroups+compress', {
      params: {
        format: 'json',
        client: 'zbPJRz2UGAA',
        duration: duration,
        fingerprint: fingerprint
      }
    })
    .then(response => response.data);
  }

  /*
   * Calculates the fingerprint of the given audio file
   */
  getFingerprint(file) {
    const command = path.resolve(process.cwd(), 'fpcalc');
    if(!verifyFile(file) || !verifyFile(command)) {
      return false;
    }
    return new Promise((resolve, reject) => {
      return fpcalc(file, {
        command: path.resolve(process.cwd(), 'fpcalc')
      }, (error, result) => (error ? reject(error) : resolve(result)));
    });
  }

  /*
   * Get album artwork from the Cover Art Archive
   *
   * http://coverart.org/doc/Development/XML_Web_Service/Version_2/#Lookups
   *
   * @param {String} type The type of search (e.g. 'artist', 'releasegroup', 'release', 'recording', etc)
   * @param {String} mbid The id for the type
   */
  getCoverArt(type, mbid) {
    return axios({
      method:'get',
      baseURL: 'http://coverartarchive.org',
      url: `${type}/${mbid}`
    })
    .then(response => response.data)
  }

  async obtain(file) {
    try {
      const fingerprint = await this.getFingerprint(file);
      const lookup = await this.lookup(fingerprint);
      const best = get(lookup, 'results[0].recordings[0].releasegroups[0]');
      const coverArt = await this.getCoverArt('release-group', best.id);
      return { fingerprint, lookup, best, coverArt };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

/* test */
// const metadata = new Metadata();
// const audio = path.resolve(process.cwd(), 'audio.mp3');
// metadata.obtain(audio).then(info => console.log('metadata', info));





