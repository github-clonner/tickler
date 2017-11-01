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
import { isValidFile } from './FileSystem';
import { get } from './utils';

export default class Metadata {


  static get metaType() {
    return ['recordings', 'recordingids', 'releases', 'releaseids', 'releasegroups', 'releasegroupids', 'tracks', 'compress', 'usermeta', 'sources'];
  }

  static metaParams(...args) {
     return '?meta=' + args.filter(arg => Metadata.metaType.includes(arg)).join('+');
  }

  static get defaults() {
    return {
      meta: Metadata.metaType,
      acoustid: {
        baseURL: 'https://api.acoustid.org/v2/lookup' + Metadata.metaParams,
        /* response format */
        format: 'json',
        /* application's API key */
        client: 'asmIAEKS75',
        /* duration of the whole audio file in seconds */
        duration: undefined,
        /* audio fingerprint data */
        fingerprint: undefined
      }
    };
  };

  constructor(options?: Object) {
    this.options = { ...Metadata.defaults, ...options };
  }

  /*
   * Lookup the MusicBrainz metadata
   */
  lookup(params) {
    const { duration, fingerprint } = params;
    return axios({
      // baseURL: 'https://api.acoustid.org/v2/lookup?meta=' + 'recordings+releasegroups+compress'
      baseURL: 'https://api.acoustid.org/v2/lookup' + Metadata.metaParams,
      params: {
        ...this.options.params, duration, fingerprint
      }
    })
    .then(response => response.data);
  }

  /*
   * Calculates the fingerprint of the given audio file
   */
  getFingerprint(file) {
    const command = path.resolve(process.cwd(), 'fpcalc');
    if(!isValidFile(file) || !isValidFile(command)) {
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





