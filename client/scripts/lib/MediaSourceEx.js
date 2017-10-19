// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : MediaSourceEx.js                                          //
// @summary      : MediaSource extension with node.js Stream support         //
// @version      : 1.0.0                                                     //
// @project      : N/A                                                       //
// @description  : N/A                                                       //
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
import Stream from 'stream';
import { EchoStream } from './StreamEx';
import MediaElementWrapper from './mediasource';

/*
 * Inspiration:
 * https://github.com/feross/mediasource/blob/master/index.js
 * https://developer.mozilla.org/es/docs/Web/API/MediaSource
 * https://axel.isouard.fr/blog/2016/05/24/streaming-webm-video-over-html5-with-media-source
 * https://developers.google.com/web/fundamentals/media/mse/basics
 * https://developers.google.com/web/updates/2015/06/Media-Source-Extensions-for-Audio
 */

/*
 * Media error code constants
 * reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaError/code#Media_error_code_constants
 */
const MediaErrorType = {
  MEDIA_ERR_ABORTED: [ 1, 'Request aborted by user'],
  MEDIA_ERR_NETWORK: [ 2, 'Network error'],
  MEDIA_ERR_DECODE: [ 3, 'An error occurred while trying to decode the media resource'],
  MEDIA_ERR_SRC_NOT_SUPPORTED: [ 4, 'Unsupported resource or media format']
};

const DEFAULT_BUFFER_DURATION = 60; // seconds

export class MediaSourceStream extends Stream.Writable {
  constructor(wrapper, ...args) {
    super(...args);
  }
}

export class MediaSourceEx extends MediaSource {
  constructor(element, stream, mimeType, ...args) {
    super(...args);
    this.element = element;
    this.stream = stream;
    this.mimeType = mimeType;
  }

  onUpdateEnd(event) {
    const { sourceBuffer } = this;
    if (!sourceBuffer.updating && this.readyState === 'open') {
      this.endOfStream();
    }
  }

  onSourceOpen(event) { }

  onError(error) {
    console.error(error);
    try {
      this.endOfStream('decode');
    } catch (ignored) { }
  }

  createWriteStream(mimeType) {
    if (!MediaSource.isTypeSupported(mimeType)) {
      console.error('Unsupported MIME type or codec: ' + mimeType);
      throw new Error('Unsupported MIME type or codec: ' + mimeType);
    }
    const { element, sourceBuffer = null } = this;
    sourceBuffer = this.addSourceBuffer(mimeType);
    sourceBuffer.addEventListener('error', this.onError);
    sourceBuffer.addEventListener('updateend', this.onUpdateEnd);
    sourceBuffer.addEventListener('sourceopen', this.onUpdateEnd);
    element.src = URL.createObjectURL(this);
  }
}

export class MediaElementEx extends MediaElementWrapper {
  constructor(
    element = document.getElementById('audioElement'),
    readable = fs.createReadStream(path.resolve(process.cwd(), 'audio.mp3')),
    format = 'audio/mpeg'
  ) {
    super(element);

    this.element = element;
    this.readable = readable;
    this.writable = this.createWriteStream(format);

    /* listeners */
    this.element.addEventListener('error', (error) => {
      console.error('audio error', this.error);
    });
    this.writable.on('error', (error) => {
      console.error('writable error', error);
    });

    this.readable.pipe(this.writable);
  }
}
