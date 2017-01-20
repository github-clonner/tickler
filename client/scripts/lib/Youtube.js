import async from 'async';
import axios from 'axios';
import ytdl from 'ytdl-core';
import Stream from 'stream';
import fs from 'fs';
import path from 'path';
import {ipcRenderer} from 'electron';
import {EventEmitter} from 'events';


async function foo() {
  console.log('async working!')
}

async function bar() {
  await foo()
  console.log('after foo')
}

bar()

class EchoStream extends Stream.Writable {
  constructor(options) {
    super(options);
    this.body = new Array();
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

class YoutubeEvents extends EventEmitter {
  constructor(...args) {
    super(...args);
  }
}

export default class Youtube {

  constructor(apiKey) {
    this.apiKey = apiKey || 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU';
    this.axios = axios.create({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      params: {
        key: this.apiKey
      }
    });
    this.events = new YoutubeEvents();
  }

  getVideos(ids) {
    let part = 'id,snippet,contentDetails,player,recordingDetails,statistics,status,topicDetails';
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

  getPlayListItems(playlistId) {
    let part = 'id,snippet,contentDetails';
    let options = {
      playlistId: playlistId,
      part: part,
      maxResults: 5,
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
          return callback(null, response.data)
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
          return resolve(items)
        }
      });
    })
  }

  downloadVideo(video) {
    let uri = `http://www.youtube.com/watch?v=${video.id}`
    let mux = new EchoStream({
      writable: true
    });
    var output = path.resolve(__dirname, './media/sound.mp4');
    return new Promise((resolve, reject) => {
      let yt = ytdl(uri/*, {
          filter: function(format) {
            return format.container === 'mp4' && !format.encoding;;
          }
        }*/)
        // .pipe(fs.createWriteStream('./media/sound.mp4'))
        // .on('progress', progress => {
        //   console.log('progress: ', progress)
        // })
        .on('finish', () => {
          console.log('donwload finish !')
        })
        // .on('info', function(info) {
        //   console.log('info', info);
        // })
        // .on('error', function(error) {
        //   console.log('error:', error)
        //   return reject(error);
        // });

        yt.on('info', function(info) {
          console.log('info', info);
        })
        yt.on('response', response => {
          let size = response.headers['content-length'];
          yt.pipe(fs.createWriteStream('./media/sound.mp4'));

          // Keep track of progress.
          let dataRead = 0;
          yt.on('data', data => {
            dataRead += data.length;
            var progress = dataRead / size;
            this.events.emit('progress', progress);
          });
        });

        /*yt.on('end', function() {
          console.log('Finished');
        })*/
    })
  }
}
