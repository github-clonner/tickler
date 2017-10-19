// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : StreamEx.js                                               //
// @summary      : Enhaced Stream library                                    //
// @version      : 0.1.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 15 Oct 2017                                               //
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
    this._wrapper = wrapper;
    this.element = wrapper.element;
    this.mediaSource = wrapper.mediaSource;
    this._allStreams = wrapper.streams;
    this._allStreams.push(this);
    this._bufferDuration = wrapper.bufferDuration;
    this._sourceBuffer = null;

    this._flowHandler = () => {
      return this.flowHandler();
    }

    if (typeof obj === 'string') {
      this._type = obj;
      // Need to create a new sourceBuffer
      if (this.mediaSource.readyState === 'open') {
        this._createSourceBuffer();
      } else {
        this.mediaSource.addEventListener('sourceopen', this.onSourceOpen);
      }
    } else if (obj._sourceBuffer === null) {
      obj.destroy();
      this._type = obj._type; // The old stream was created but hasn't finished initializing
      this.mediaSource.addEventListener('sourceopen', this.onSourceOpen);
    } else if (obj._sourceBuffer) {
      obj.destroy();
      this._type = obj._type;
      this._sourceBuffer = obj._sourceBuffer; // Copy over the old sourceBuffer
      this._sourceBuffer.addEventListener('updateend', this.onUpdateEnd);
    } else {
      throw new Error('The argument to MediaElementEx.createWriteStream must be a string or a previous stream returned from that function')
    }


    this.element.addEventListener('timeupdate', this.onTimeUpdate);

    this.on('error', error => this._wrapper.error(error));
    this.on('finish', () => {
      if (this.destroyed) return;

      this._finished = true;
      if (this._allStreams.every((other) => { return other._finished })) {
        try {
          this.mediaSource.endOfStream();
        } catch (ignored) {}
      }
    })
  }

  onSourceOpen = () => {
    if (this.destroyed) return;

    this.mediaSource.removeEventListener('sourceopen', this.onSourceOpen);
    this._createSourceBuffer();
  }

  onUpdateEnd = (...args) => this.flowHandler(...args)
  onTimeUpdate = (...args) => this.flowHandler(...args)
  flowHandler = () => {
    if (this.destroyed || !this._sourceBuffer || this._sourceBuffer.updating) {
      return;
    }

    if (this.mediaSource.readyState === 'open') {
      // check buffer size
      console.log('_getBufferDuration: %d, _bufferDuration: %d', this._getBufferDuration(), this._bufferDuration);
      if (this._getBufferDuration() > this._bufferDuration) {
        return;
      }
    }

    if (this._cb) {
      const callback = this._cb;
      this._cb = null;
      return callback();
    }
  }

  destroy(error) {
    if (this.destroyed) return;

    this.destroyed = true;

    // Remove from allStreams
    this._allStreams.splice(this._allStreams.indexOf(this), 1);

    this.mediaSource.removeEventListener('sourceopen', this.onSourceOpen);
    this.element.removeEventListener('timeupdate', this._flowHandler);

    if (this._sourceBuffer) {
      this._sourceBuffer.removeEventListener('updateend', this.onUpdateEnd);
      if (this.mediaSource.readyState === 'open') {
        this._sourceBuffer.abort();
      }
    }

    return (error) ? this.emit('error', error) : this.emit('close');
  }

  _createSourceBuffer() {
    if (this.destroyed) return;

    if (MediaSource.isTypeSupported(this._type)) {
      this._sourceBuffer = this.mediaSource.addSourceBuffer(this._type);
      this._sourceBuffer.addEventListener('updateend', this.onUpdateEnd);
      if (this._cb) {
        const callback = this._cb;
        this._cb = null;
        callback();
      }
    } else {
      this.destroy(new Error('The provided type is not supported'));
    }
  }

  _write(chunk, encoding, callback) {
    if (this.destroyed) return;

    if (!this._sourceBuffer) {
      this._cb = error => {
        if (error) return callback(error);
        this._write(chunk, encoding, callback);
      }
      return;
    }

    if (this._sourceBuffer.updating) {
      return callback(new Error('Cannot append buffer while source buffer updating'))
    }

    try {
      this._sourceBuffer.appendBuffer(toArrayBuffer(chunk));
    } catch (error) {
      // appendBuffer can throw for a number of reasons, most notably when the data
      // being appended is invalid or if appendBuffer is called after another error
      // already occurred on the media element. In Chrome, there may be useful debugging
      // info in chrome://media-internals
      this.destroy(error);
      return;
    }
    this._cb = callback;
  }

  _flow() {
    if (this.destroyed || !this._sourceBuffer || this._sourceBuffer.updating) {
      return;
    }

    if (this.mediaSource.readyState === 'open') {
      // check buffer size
      console.log('_getBufferDuration: %d, _bufferDuration: %d', this._getBufferDuration(), this._bufferDuration);
      if (this._getBufferDuration() > this._bufferDuration) {
        return;
      }
    }

    if (this._cb) {
      const callback = this._cb;
      this._cb = null;
      return callback();
    }
  }

  _getBufferDuration() {
    const buffered = this._sourceBuffer.buffered
    const currentTime = this.element.currentTime
    let bufferEnd = -1 // end of the buffer
    // This is a little over complex because some browsers seem to separate the
    // buffered region into multiple sections with slight gaps.
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i) + Number.EPSILON;

      if (start > currentTime) {
        // Reached past the joined buffer
        break
      } else if (bufferEnd >= 0 || currentTime <= end) {
        // Found the start/continuation of the joined buffer
        bufferEnd = end
      }
    }

    return Math.max((bufferEnd - currentTime), 0);
  }
}
