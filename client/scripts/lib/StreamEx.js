// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : StreamEx.js                                               //
// @summary      : Enhaced Stream library                                    //
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
import Stream from 'stream';

export const toArrayBuffer = function(buffer) {
  // If the buffer is backed by a Uint8Array, a faster version will work
  if (buffer instanceof Uint8Array) {
    // If the buffer isn't a subarray, return the underlying ArrayBuffer
    if (buffer.byteOffset === 0 && buffer.byteLength === buffer.buffer.byteLength) {
      return buffer.buffer;
    } else if (typeof buffer.buffer.slice === 'function') {
      // Otherwise we need to get a proper copy
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
  }
  if (Buffer.isBuffer(buffer)) {
    // This is the slow version that will work with any Buffer
    // implementation (even in old browsers)
    const arrayCopy = new Uint8Array(buffer.length);
    for (var i = 0; i < buffer.length; i++) {
      arrayCopy[i] = buffer[i];
    }
    return arrayCopy.buffer;
  } else {
    throw new Error('Argument must be a Buffer');
  }
}

export class EchoStream extends Stream.Writable {

  constructor(...args) {
    super(...args);
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

export class MediaSourceStream extends Stream.Writable {

  constructor(wrapper, obj, ...args) {
    super(...args);
    const { element, mediaSource, streams, bufferDuration } = wrapper;
    this.wrapper = wrapper;
    this.element = element;
    this.mediaSource = mediaSource;
    this.streams = streams.concat(this);
    this.bufferDuration = bufferDuration;
    this.sourceBuffer = null;

    if (typeof obj === 'string') {
      this.mimeType = obj;
      // Need to create a new sourceBuffer
      if (mediaSource.readyState === 'open') {
        this.createSourceBuffer();
      } else {
        this.mediaSource.addEventListener('sourceopen', this.onSourceOpen);
      }
    } else if (obj.sourceBuffer === null) {
      obj.destroy();
      this.mimeType = obj.mimeType; // The old stream was created but hasn't finished initializing
      mediaSource.addEventListener('sourceopen', this.onSourceOpen);
    } else if (obj.sourceBuffer) {
      obj.destroy();
      this.mimeType = obj.mimeType;
      this.sourceBuffer = obj.sourceBuffer; // Copy over the old sourceBuffer
      this.sourceBuffer.addEventListener('updateend', this.onUpdateEnd);
    } else {
      throw new Error('The argument to MediaElementEx.createWriteStream must be a string or a previous stream returned from that function')
    }

    element.addEventListener('timeupdate', this.onTimeUpdate, false);
    this.on('error', wrapper.error);
    this.on('finish', this.onFinish);
  }

  onFinish = () => {
    const { destroyed, mediaSource, streams } = this;
    if (destroyed) return;

    this.finished = true;
    if (streams.every(other => { return other.finished })) {
      try {
        return mediaSource.endOfStream();
      } catch (ignored) {}
    }
  }

  onSourceOpen = () => {
    const { destroyed, mediaSource } = this;
    if (destroyed) return;

    mediaSource.removeEventListener('sourceopen', this.onSourceOpen);
    this.createSourceBuffer();
  }

  onUpdateEnd = (...args) => this.flowHandler(...args)
  onTimeUpdate = (...args) => this.flowHandler(...args)
  flowHandler = () => {
    const { destroyed, sourceBuffer, mediaSource, bufferDuration } = this;
    if (destroyed || !sourceBuffer || sourceBuffer.updating) {
      return;
    }

    // if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
    //   mediaSource.endOfStream();
    // }

    if (mediaSource.readyState === 'open') {
      // check buffer size
      console.log('buffered: %d, max: %d', this.getBufferDuration(), bufferDuration);
      if (this.getBufferDuration() > bufferDuration) {
        return;
      }
    }

    if (this._cb) return this._cb();
  }

  destroy(error) {
    const { sourceBuffer, mediaSource, element } = this;
    if (this.destroyed) return;

    this.destroyed = true;
    // Remove from allStreams
    this.streams.splice(this.streams.indexOf(this), 1);

    mediaSource.removeEventListener('sourceopen', this.onSourceOpen);
    element.removeEventListener('timeupdate', this.onTimeUpdate);

    if (sourceBuffer) {
      sourceBuffer.removeEventListener('updateend', this.onUpdateEnd);
      if (mediaSource.readyState === 'open') {
        sourceBuffer.abort();
      }
    }

    return error ? this.emit('error', error) : this.emit('close');
  }

  createSourceBuffer() {
    const { destroyed, mediaSource, mimeType } = this;
    if (destroyed) return;

    if (MediaSource.isTypeSupported(mimeType)) {
      this.sourceBuffer = mediaSource.addSourceBuffer(mimeType);
      this.sourceBuffer.addEventListener('updateend', this.onUpdateEnd);
      if (this._cb) return this._cb();
    } else {
      return this.destroy(new Error('The provided type is not supported'));
    }
  }

  _write(chunk, encoding, callback) {
    const { destroyed, sourceBuffer } = this;
    if (destroyed) return;

    if (!sourceBuffer) {
      this._cb = error => {
        if (error) return callback(error);
        this._write(chunk, encoding, callback);
      }
      return;
    }

    if (sourceBuffer.updating) {
      return callback(new Error('Cannot append buffer while source buffer updating'))
    }

    try {
      sourceBuffer.appendBuffer(toArrayBuffer(chunk));
    } catch (error) {
      // appendBuffer can throw for a number of reasons, most notably when the data
      // being appended is invalid or if appendBuffer is called after another error
      // already occurred on the media element. In Chrome, there may be useful debugging
      // info in chrome://media-internals
      console.error(error);
      this.destroy(error);
      return;
    }
    this._cb = error => {
      this._cb = null;
      return callback(error);
    }
  }

  getBufferDuration() {
    const { sourceBuffer, element } = this;
    const buffered = sourceBuffer.buffered;
    const currentTime = element.currentTime;
    let bufferEnd = -1; // end of the buffer
    // This is a little over complex because some browsers seem to separate the
    // buffered region into multiple sections with slight gaps.
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i) + Number.EPSILON;

      if (start > currentTime) {
        // Reached past the joined buffer
        break;
      } else if (bufferEnd >= 0 || currentTime <= end) {
        // Found the start/continuation of the joined buffer
        bufferEnd = end;
      }
    }

    return Math.max((bufferEnd - currentTime), 0);
  }
}
