import async from 'async';
import axios from 'axios';
import ytdl from 'ytdl-core';
import Stream from 'stream';
import fs from 'fs';
import path from 'path';
import {ipcRenderer} from 'electron';
import sanitize from 'sanitize-filename';
import {EventEmitter} from 'events';

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
    return callback()
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

  async getPlayListItems(playlistId) {
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
    var fileName = path.resolve(`./media/${sanitize(video.title)}`);
    let fileStream = fs.createWriteStream(fileName);
    return new Promise((resolve, reject) => {
      let yt = ytdl(uri, 'audioonly'/*, {
          filter: function(format) {
            return format.container === 'mp4' && !format.encoding;;
          }
        }*/)
        // .pipe(fs.createWriteStream('./media/sound.mp4'))
        // .on('progress', progress => {
        //   console.log('progress: ', progress)
        // })
        .on('finish', () => {
          //ipcRenderer.send('encode', fileName);
          //ipcRenderer.on('encoded', (event, fileName) => {
            this.events.emit('finish', fileName);
          //});
          console.log('donwload finish !')
        })
        .on('error', error => {
          this.events.emit('error', error);
          console.log('error:', error)
        });

        yt.on('info', info => {
          this.events.emit('info', info);
          console.log('info', info);
        })
        yt.on('response', response => {
          let size = response.headers['content-length'];
          yt.pipe(fileStream);
          yt.pipe(mux);

          // Keep track of progress.
          let dataRead = 0;
          yt.on('data', data => {
            dataRead += data.length;
            var progress = dataRead / size;
            this.events.emit('progress', progress);
          });
        });


        //createSong(fileName, yt);

        this.events.once('abort', () => {
          console.log('abort download');
          yt.end();
          fileStream.end();
        })

        /*yt.on('end', function() {
          console.log('Finished');
        })*/
    })
  }
}
