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
import ytdl from 'ytdl-core';
import Stream from 'stream';
import fs from 'fs';
import path from 'path';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import sanitize from 'sanitize-filename';
import { EventEmitter } from 'events';
import { ApiClient } from '@maggiben/google-apis';

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
    this.apiClient = new ApiClient('youtube', {
      params: { key: apiKey }
    });
    this.options = options;
    this.events = new EventEmitter();
  }

  findMissing (ids, { pageInfo, items }) {
    if (Array.isArray(ids) && pageInfo.resultsPerPage !== ids.length) {
      const missing = items.map(item => item.id).filter(id => !ids.includes(id));
      console.error('id skipped', missing);
      return missing;
    }
  }

  async getVideos (id) {
    id = id.slice(0, 100);
    const maxResults = 50;
    const params = {
      id,
      maxResults,
      part: 'id,snippet,contentDetails,status'
    };

    const fetch = async (value, index) => {
      try {
        const query = Object.assign({}, params);
        query.id = id.slice(index * maxResults, index * maxResults + maxResults);
        const { items } = await this.apiClient.$resource.videos.list(query);
        return items;
      } catch (error) {
        console.error(error);
        return error;
      }
    };

    const length = Math.ceil(id.length / maxResults);
    const items = Array.from({ length }, fetch);
    const videos = await Promise.all(items);
    return videos.reduce((videos, items) => videos.concat(items), []);
  }

  async getPlayList (id) {
    const params = {
      id,
      part: 'id,snippet,contentDetails,status',
    };
    const { items } = await this.apiClient.$resource.playlists.list(params);
    return (items.length === 1) ? items.slice(-1).pop() : items;
  }

  async getPlayListItems (playlistId) {
    const maxResults = 50;
    const params = {
      playlistId,
      maxResults,
      part: 'id,snippet,contentDetails,status',
    };
    const { contentDetails, snippet }  = await this.getPlayList(playlistId);
    const playlistItems = [];
    do {
      try {
        const { items, nextPageToken } = await this.apiClient.$resource.playlistItems.list(params);
        playlistItems.push(...items);
        params.pageToken = nextPageToken;
      } catch (error) {
        console.error(error);
        return error;
      }
    } while (params.pageToken);
    return playlistItems;
  }

  async downloadVideo(video) {

    console.debug('downloadVideo: ', video.id);
    return new Promise((resolve, reject) => {
      try {
        const title = path.resolve(this.options.saveTo, sanitize(video.title));
        const stream = fs.createWriteStream(title);
        const downloader = ytdl(`http://www.youtube.com/watch?v=${video.id}`, 'audioonly');
        const listener = {
          progress: throttle((chunkLength, downloaded, total) => {
            return this.events.emit('progress', { video, downloaded, total, progress: (downloaded / total) });
          }, 100, { trailing: true }),
          error: (error) => {
            removeListeners(downloader);
            this.events.emit('error', { video, error });
            return reject(error);
          },
          info: (info) => {
            this.events.emit('info', { video, info });
          },
          response(response) {
            downloader.pipe(stream);
          },
          end: () => {
            removeListeners(downloader);
            this.events.emit('finish', { video, title });
            return resolve(title);
          }
        };

        const removeListeners = (...emitters) => {
          return emitters.map(emitter => {
            return Object.entries(listener).map(function ([name, handler]) {
              return emitter.removeListener(name, handler);
            });
          });
        };

        downloader
          .on('response', listener.response)
          .on('progress', listener.progress)
          .once('end', listener.end)
          .once('error', listener.error)
          .once('info', listener.info);
      } catch (error) {
        console.error(error);
        return listener.error(error);
      }

      this.events.once('abort', reason => {
        console.log('abort download', reason);
        downloader.end();
        downloader.destroy();
        stream.end();
        removeListeners(downloader);
        return reject(reason);
      });

    });
  }
}
