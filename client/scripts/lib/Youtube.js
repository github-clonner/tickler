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

  constructor(apiKey) {
    this.apiKey = apiKey || 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU';
    this.axios = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      params: {
        key: this.apiKey
      }
    });
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

  async getPlayListItems(playlistId) {
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
          return resolve(items);
        }
      });
    });
  }

  async downloadVideo(video) {
    console.log('YOUTUBE: ', video.id);
    let uri = `http://www.youtube.com/watch?v=${video.id}`;
    let mux = new EchoStream({
      writable: true
    });
    var fileName = path.resolve(`./media/${sanitize(video.title)}`);
    let fileStream = fs.createWriteStream(fileName);
    return new Promise((resolve, reject) => {
      let yt = ytdl(uri, 'audioonly'/*{
          filter: function(format) {
            let isAudio = !format.bitrate && format.audioBitrate;
            console.log('isAudio: ', isAudio, format.bitrate, format.audioBitrate, format.container)
            return isAudio;
          }
        }*/)
        .on('finish', () => {
          //ipcRenderer.send('encode', fileName);
          //ipcRenderer.on('encoded', (event, fileName) => {
            this.events.emit('finish', {video, fileName});
            return resolve(fileName);
          //});
          console.log('donwload finish !');
        });

        yt.on('error', error => {
          this.events.emit('error', error);
          return reject(error);
        });

        yt.on('info', info => {
          this.events.emit('info', info);
        });

        yt.on('response', response => {
          let size = response.headers['content-length'];
          yt.pipe(fileStream);
          //yt.pipe(mux);

          // Keep track of progress.
          let dataRead = 0;
          yt.on('data', data => {
            dataRead += data.length;
            var progress = dataRead / size;
            this.events.emit('progress', {video, progress});
          });
        });

        this.events.once('abort', () => {
          console.log('abort download');
          yt.end();
          fileStream.end();
          return reject();
        });

        /*yt.on('end', function() {
          console.log('Finished');
        })*/
    });
  }
}
