// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : DownloadManager.js                                        //
// @summary      : Base class for media downloaders                          //
// @version      : 1.0.0                                                     //
// @project      :                                                           //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 01 Nov 2017                                               //
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


const os = require('os');
const url = require('url');
const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid/v4');
const request = require('request');
const { EventEmitter } = require('events');
const { remote, app } = require('electron');
const sanitize = require('sanitize-filename');
// const resumable = require('resumable-request');
const { throttle } = require('lodash/throttle');
// const requestPromise = require('request-promise-native');
const { disposition } = require('./disposition');

const EventHandlers = {
  progress(progress) {
    const { events, downloader } = this;
    event.emit('download:progress', progress);
  },
  start(event) {
    const { events, downloader } = this;
    event.emit('download:started', event);
  },
  end() {
    const { events, downloader } = this;
    event.emit('download:ended', null);
  },
  error(error) {
    const { events, downloader } = this;
    event.emit('download:error', error);
  },
  abort(reason) {
    const { events, downloader } = this;
    event.emit('download:aborted', reason);
  }
};

const ProxyHandler = {
  construct: function(target, [ { dispatch, getState, emitter }, ...args ], newTarget) {
    return Reflect.construct(target, [ dictionary ], newTarget);
  },
  has: function (taget, property) {
    return Reflect.has(target, property);
  },
  set: function (target, property, value, receiver) {
    return Reflect.set(target, property, value, receiver);
  },
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  apply: function(target, thisArg, argumentsList) {
    return Reflect.apply(target, thisArg, argumentsList);
  }
};


class MapEx extends Map {

  constructor(...args) {
    super(...args);
  }

  some(...args) {
    return Array.prototype.some.apply(this.toEntries(), [...args]);
  }

  find(...args) {
    return Array.prototype.find.apply(this.toEntries(), [...args]);
  }

  map(...args) {
    return Array.prototype.map.apply(this.toEntries(), [...args]);
  }

  toEntries() {
    return Array.from(this.entries());
  }

  toArray() {
    return Array.from(this.values());
  }

  fromArray(array) {
    return new HashMap(array.map((value, index) => ([value,[]])));
  }

  reduce(...args) {
    return Array.prototype.reduce.apply(this.toEntries(), [...args]);
  }

  toObject() {
    return Array.from(this.entries()).reduce((object, [key, value]) => ({ ...object, [key]: value }), Object);
  }
}

class EventMap extends MapEx {

  static get emitter() {
    return EventMap._emitter ? EventMap._emitter : EventMap._emitter = new EventEmitter();
  };

  constructor(...args) {
    super(...args);
  }

  emit(event, message) {
    return EventMap.emitter.emit(event, message);
  }

  set(key, value) {
    this.emit('event:map:set', [ key, value ]);
    return super.set(key, value);
  }

  get(key) {
    this.emit('event:map:get', key);
    return super.get(key);
  }

  delete(key) {
    this.emit('event:map:delete', key);
    return super.delete(key, value);
  }

  clear() {
    this.emit('event:map:clear');
    return super.clear();
  }
}

class DownloadManager {

  static get clients() {
    return this._clients || (this._clients = new EventMap());
  };

  static get workers() {
    return this._workers || (this._workers = new EventMap());
  };

  static get emitter() {
    return this._emitter || (this._emitter = new EventEmitter());
  };

  static attach(id, client) {
    return this.clients.set(id, client);
  };

  static protocol(uri) {
    try {
      return url.parse(uri).protocol.replace(/(:)/g,'');
    } catch (error) { throw error; }
  };

  static isProtocolHandled(scheme) {
    return this.clients.some(client => client.supportedProtocols.has(scheme));
  };

  static isSourceHandled(source) {
    return this.clients.some(client => client.supportedSources.has(source));
  };

  static get defaults() {
    return {
      tmpdir: os.tmpdir(),
      retries: 5
    };
  };

  constructor(options) {
    this.options = { ...DownloadManager.defaults, ...options };
    this.emitter = new EventEmitter();
    this.listeners = new Proxy(EventHandlers, ProxyHandler);
    this.clientEvents = [
      EventMap.emitter.on('event:map:set', this.attach),
      EventMap.emitter.on('event:map:delete', this.dettach)
    ];
  }

  attach([ id, client ]) {
    console.info('client:attached:', DownloadManager.clients.size, id);
  }

  dettach(id) {
    console.info('client:dettached:', id);
  }

  get clients() {
    return DownloadManager.clients;
  }

  getSourceHandler(uri) {
    return this.clients.find(([ id, client ]) => client.constructor.isSourceHandled(uri));
  };

  async download(uri, params) {
    try {
      const [ id, clients ] = this.getSourceHandler(uri);
      if (!clients) return;
      const result = await clients.download(uri, params);
    } catch (error) {
      console.error(error);
    }
  }

  // removeListeners() {
  //   const { downloader, listeners: { progress, start, end, error, abort } } = this;
  //   return downloader
  //   .off('progress', progress)
  //   .off('end', end)
  //   .off('start', start)
  //   .off('error', error)
  //   .off('abort', abort);
  // }

}

const UrlRegex = (opts) => {
  opts = Object.assign({folder: true, file: true}, opts)

  const protocol = 'https://'
  const host = 'mega.nz'
  const folder = opts.folder ? '#F' : ''
  const file = opts.file ? '#' : ''
  const id = '[a-zA-Z0-9]{0,8}'
  const key = '[a-zA-Z0-9_-]+'
  const regex = `${protocol}${host}/(${folder}|${file})!${id}!${key}`

  return opts.exact ? new RegExp(`(^${regex}$)`, 'i') : new RegExp(regex, 'ig')
};

class HttpDownloader {

  static get supportedProtocols() {
    return new Set([ 'http', 'https', 'ftp' ]);
  };

  static get supportedSources() {
    return new MapEx([
      [ 'generic', /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/ ],
      [ 'youtube', /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/ ],
      [ 'dailymotion', /^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/ ],
      [ 'vimeo', /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/ ]
    ]);
  }

  static isSourceHandled(source) {
    return this.supportedSources.some(([ name, validator ]) => validator.test(source));
  }

  static get defaults() {
    return {
      baseConf: {
        progressInterval: 500
      },
      tmpdir: os.tmpdir(),
      retries: 5
    };
  };

  constructor(config) {
    this.options = { ...HttpDownloader.defaults, ...config };
    this.emitter = new EventEmitter();
    this.listeners = new Proxy(EventHandlers, ProxyHandler);
    this.register('A-' + uuid());
  }

  register(id) {
    this.id = id;
    return DownloadManager.attach(id, this);
  }

  download(uri, config) {
    const { baseConf, tmpdir } = this.options;
    const result = resumable(request, { url: uri }, { progressInterval: 500 })
    .on('progress', function onProgress(state) {
      console.log(state);
    })
    .on('response', function(response) {
      // const content = disposition(response.headers['content-disposition']) || path.basename(url.parse(uri).path);
      var filename, contentDisp = response.headers['content-disposition'];
      if (contentDisp && /^attachment/i.test(contentDisp)) {
        filename = contentDisp.toLowerCase().split('filename=')[1].split(';')[0].replace(/"/g, '');
      } else {
        filename = path.basename(url.parse(uri).path);
      }
      console.log(filename);
      result.pipe(fs.createWriteStream(path.join(tmpdir, filename)));
    });
  }
}

class HttpDownloader2 {

  static get supportedProtocols() {
    return new Set([ 'http', 'https', 'ftp' ]);
  };

  static get supportedSources() {
    return new MapEx([
      [ 'generic', /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/ ],
      [ 'youtube', /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/ ],
      [ 'dailymotion', /^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/ ],
      [ 'vimeo', /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/ ]
    ]);
  }

  static isSourceHandled(source) {
    return this.supportedSources.some(([ name, validator ]) => validator.test(source));
  }

  static get defaults() {
    return {
      baseConf: {
      },
      tmpdir: os.tmpdir()
    };
  };

  constructor(config) {
    this.options = { ...HttpDownloader.defaults, ...config };
    this.emitter = new EventEmitter();
    this.listeners = new Proxy(EventHandlers, ProxyHandler);
    this.register('A-' + uuid());
  }

  register(id) {
    this.id = id;
    return DownloadManager.attach(id, this);
  }

  downloader(uri, config) {
    const { baseConf, tmpdir } = this.options;
    return request = $http.request({ ...config, url: uri})
    .on('response', response => {
      const content = disposition(response.headers) || path.basename(url.parse(uri).path);
      console.log(content);
      request.pipe(fs.createWriteStream(path.join(tmpdir, content.filename)));
    });
  }
}


module.exports = {
  DownloadManager,
  HttpDownloader
};
