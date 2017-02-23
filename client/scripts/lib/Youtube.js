///////////////////////////////////////////////////////////////////////////////
// @file         : Youtube.js                                                //
// @summary      : Youtube Library                                           //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Feb 2017                                               //
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

import async from 'async';
import axios from 'axios';
import ytdl from 'ytdl-core';
import Stream from 'stream';
import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import { EventEmitter } from 'events';

class EchoStream extends Stream.Writable {
  constructor(options) {
    super(options);
    this.body = new Array();
  }
  _write(chunk, encoding, callback) {
    if (!(chunk instanceof Buffer)) {
        return this.emit('error', new Error('Invalid data'));
    }
    this.body.push(chunk);
    return callback();
  }

  toBuffer () {
    return Buffer.concat(this.body);
  }

  toBufferX () {
    let buffers = [];
    this._writableState.getBuffer().forEach(function(data) {
      buffers.push(data.chunk);
    });
    return Buffer.concat(buffers);
  }

  toArray () {
    let buffer = this.toBuffer();
    return new Uint8Array(buffer);
  }

  toString () {
    return String.fromCharCode.apply(null, this.toArray());
  }

  end (chunk, encoding, callback) {
    let ret = Stream.Writable.prototype.end.apply(this, arguments);
    if (!ret) this.emit('finish');
  }
}

///////////////////////////////////////////////////////////////////////////////
// create single EventEmitter instance                                       //
///////////////////////////////////////////////////////////////////////////////
class YoutubeEvents extends EventEmitter {
  constructor(...args) {
    super(...args);
  }
}

const youtubeEvents = new YoutubeEvents();

export default class Youtube {

  constructor({apiKey, options = {}}) {
    this.apiKey = apiKey || 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU';
    this.axios = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      params: {
        key: this.apiKey
      }
    });
    this.options = options;
    this.events = youtubeEvents;//new YoutubeEvents();
  }

  async getVideos(ids) {
    //let part = 'id,snippet,contentDetails,player,recordingDetails,statistics,status,topicDetails';
    let part = 'id,snippet,contentDetails';
    let options = {
      id: ids.join(','),
      part: part
    };
    return this.axios({
      method: 'GET',
      url: '/videos',
      params: options
    })
    .then(response => response.data);
  }

  getPlayList (playlistId) {
    let part = 'id,snippet,contentDetails';
    let options = {
      id: playlistId,
      part: part,
      maxResults: 50,
      pageToken: null
    };
    return this.axios({
      method: 'GET',
      url: '/playlists',
      params: options
    })
    .then(response => response.data);
  }

  async getPlayListItems (playlistId) {
    let part = 'id,snippet,contentDetails';
    let options = {
      playlistId: playlistId,
      part: part,
      maxResults: 50,
      pageToken: null
    };
    let items = [];
    let nextPageToken = true;
    return new Promise((resolve, reject) => {
      async.doWhilst(callback => {
         this.axios({
          method: 'GET',
          url: '/playlistItems',
          params: options
        })
        .then(response => {
          return callback(null, response.data);
        })
        .catch(callback);
      }, function(list, callback) {
        items = items.concat(list.items);
        options.pageToken = list.nextPageToken;
        return list.nextPageToken;
      }, function(error, result) {
        if (error) {
          return reject(error);
        } else {
          console.debug('getPlayListItems: ', items);
          return resolve(items);
        }
      });
    });
  }
  
  trackProgress = (video, size) => {
    let dataRead = 0;
    return data => {
      dataRead += data.length;
      let progress = dataRead / size;
      return this.events.emit('progress', { video, progress });
    };
  }

  async downloadVideo(video) {
    if(!this.options.saveTo) {
      return Promise.reject(false);
    }
    console.debug('downloadVideo: ', video.id);
    let uri = `http://www.youtube.com/watch?v=${video.id}`;
    let fileName = path.resolve(this.options.saveTo, sanitize(video.title));
    let fileStream = fs.createWriteStream(fileName);
    return new Promise((resolve, reject) => {
      let yt = ytdl(uri, 'audioonly');
      yt.on('error', error => {
        this.events.emit('error', {video, error});
        return reject(error);
      });

      yt.on('info', info => {
        this.events.emit('info', {video, info});
      });

      yt.on('response', response => {
        let size = response.headers['content-length'];
        yt.pipe(fileStream);
        // Keep track of progress.
        yt.on('data', this.trackProgress(video, size));

        yt.on('end', () => {
          this.events.emit('finish', {video, fileName});
          return resolve(fileName);
        });
      });
      this.events.once('abort', () => {
        console.log('abort download');
        yt.end();
        fileStream.end();
        return reject();
      });
    });
  }
}
