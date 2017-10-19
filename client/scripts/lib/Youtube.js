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
import throttle from 'lodash/throttle';
import sanitize from 'sanitize-filename';
import EventEmitterEx from './EventEmitterEx';
import Transcoder, { encode } from './Transcoder';
import Metadata from './Metadata';
import { ApiClient } from '@maggiben/google-apis';

const defaults = {
  params: {
    maxResults: 50,
    part: 'id,snippet,contentDetails,status'
  }
};

export default class Youtube {

  constructor({ apiKey, options }) {
    this.apiClient = new ApiClient('youtube', {
      params: { key: apiKey }
    });
    this.streams = new Map();
    this.options = { ...defaults, ...options };
    this.events = new EventEmitterEx();

    this.events.on('cancel', ({ id, reason, options }) => {
      if (this.streams.has(id)) {
        console.log('cancel download %s', id);
        const downloader = this.streams.get(id);
        return downloader.destroy();
      } else {
        console.error('stream %s not found', id);
        return false;
      }
    });
    this.events.on('get:stream', id => (this.streams.has(id) ? this.streams.get(id) : undefined));
  }

  /*
   * Find all missing values from array
   * @param {Array} array to inspect.
   * @param {...Array} The values to search for.
   */
  findMissing(items, ...values) {
    const removeByIndex = (list, index) => [ ...list.slice(0, Math.max(0, index)), ...list.slice(index + 1) ];
    try {
      return items.reduce((missing, { id }) => removeByIndex(missing, missing.indexOf(id)), Array.prototype.concat(...values));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /*
   * Find all private videos
   * @param {Array} list of items to inspect.
   */
  findPrivate(items) {
    try {
      return items.filter(({ status: { privacyStatus: privacy } }) => privacy != 'public');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /*
  youtube playlist formatter

  $.(
    $AccName := function() { $.contentDetails.duration };
    $.{
      'id': id,
      'title': snippet.title,
      'name': snippet.title,
      'artists': [{
        'id': 'sfasdf',
        'name': 'nook'
      }],
      'description': snippet.description,
      'thumbnails': snippet.thumbnails,
      'duration': $parseDuration(contentDetails.duration)
    }
  )
  */

  /*
   * Returns a list of videos
   * @param {...Array} list of the YouTube video ID(s)
   */
  async getVideos(id, options) {
    const params = { ...this.options.params, ...options, ...{ id }};
    const fetch = async (value, index) => {
      try {
        const offset = index * params.maxResults;
        const id = params.id.slice(offset, offset + params.maxResults);
        const result = await this.apiClient.$resource.videos.list({ ...params, ...{ id } });
        return result.items;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    /*
     * Create request buckets by slicing the ids array into chunks of of size <= maxResults
     * then create an array of promises
     */
    const promises = Array.from({ length: Math.ceil(id.length / params.maxResults) }, fetch);

    /*
     * Flatten result buckets into a single array
     */
    return Array.prototype.concat(...(await Promise.all(promises)));
  }

  /*
   * Returns a collection of playlists
   * @param {...Array} A list of the YouTube playlist ID(s)
   */
  async getPlayList(id: Array<string>) {
    const params = {
      id,
      part: 'id,snippet,contentDetails,status',
    };
    const { items } = await this.apiClient.$resource.playlists.list(params);
    return (items.length === 1) ? items.slice(-1).pop() : items;
  }

  /*
   * Returns a collection of playlist items
   * @param {String} ID of the playlist for which you want to retrieve playlist items.
   */
  async getPlayListItems(playlistId: string) {
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

  /*
   * Download video
   * @param {Object} Video to download.
   * @return {Promise|Stream} Promise | Readable stream
   */
  async downloadVideo(video) {
    const { events, streams, options: { download: { savePath, tempPath }}} = this;
    console.debug('downloadVideo: ', video, savePath, tempPath);
    const file = path.resolve(tempPath, sanitize(video.title));
    const stream = fs.createWriteStream(file);
    this.streams.set(video.id, null);

    return new Promise((resolve, reject) => {
      try {
        const listener = {
          progress: throttle((chunkLength, downloaded, total) => {
            return this.events.emit('progress', { video, downloaded, total, progress: (downloaded / total) });
          }, 100, { trailing: true }),
          error: (error) => {
            console.error('download error', error);
            cleanup(downloader);
            this.events.emit('error', { video, error });
            return reject(error);
          },
          info: (info, format) => {
            this.events.emit('info', { video, info, format });

            const file = {
              dir: path.resolve(tempPath),
              name: sanitize(video.title),
              ext: format.audioEncoding
            };

            const output = transcoder.encode({
              video,
              info,
              input: {
                format
              },
              output: {
                file: path.format(file)
              }
            });
          },
          response(response) {
            downloader.pipe(stream);
            events.emit('response', { video, response, downloader, stream });
          },
          end: () => {
            console.log('download of %s ended', video.id);
            cleanup(downloader);
            this.events.emit('finish', { video, file });
            return resolve(file);
          },
          abort: () => {
            console.log('download of %s aborted', video.id);
            cleanup(downloader);
            this.events.emit('abort', { video, file });
            return reject('abort');
          }
        };

        /* Graceful exit */
        const cleanup = (...emitters) => {
          stream.end();
          downloader.end();
          downloader.removeAllListeners();
          // return emitters.map(emitter => {
          //   return Object.entries(listener).map(function ([ name, handler ]) {
          //     return emitter.removeListener(name, handler);
          //   });
          // });
        };

        /* Start download */
        const downloader = ytdl(`http://www.youtube.com/watch?v=${video.id}`, {
          quality: 'highest',
          filter: (format) => {
            const { bitrate, audioBitrate, audioEncoding, type } = format;
            const isTypeSupported = MediaSource.isTypeSupported(type);
            if(!bitrate && audioBitrate && isTypeSupported) {
              console.log('format', audioEncoding, 'type', type, 'audioBitrate', audioBitrate , 'isTypeSupported', isTypeSupported);
              return format;
            }
          }
        });
        /* Instanciate media transcoder */
        const transcoder = new Transcoder(downloader);
        /* Add private listeners */
        downloader
          .on('response', listener.response)
          .on('progress', listener.progress)
          .once('abort', listener.abort)
          .once('end', listener.end)
          .once('error', listener.error)
          .once('info', listener.info);

        /* Memorize operation */
        this.streams.set(video.id, downloader);

      } catch (error) {
        console.error(error);
        return listener.error(error);
      }
    });
  }
}
