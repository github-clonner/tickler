const Stream = require('stream');
const toArrayBuffer = require('to-arraybuffer')
const DEFAULT_BUFFER_DURATION = 60; // seconds
// https://github.com/feross/mediasource/blob/master/index.js

class MediaElementWrapper extends MediaSource {
  constructor(element, options = {}) {
    super();
    this._bufferDuration = options.bufferDuration || DEFAULT_BUFFER_DURATION
    this._elem = element;
    this._mediaSource = this;//new MediaSource();
    this._streams = []
    this.detailedError = null

    this._errorHandler = () => {
      this._elem.removeEventListener('error', this._errorHandler);
      const streams = this._streams.slice();
      streams.forEach(stream => {
        stream.destroy(this._elem.error);
      });
    }
    this._elem.addEventListener('error', this._errorHandler);
    this._elem.src = URL.createObjectURL(this._mediaSource);
  }

  /*
   * `obj` can be a previous value returned by this function
   * or a string
   */
  createWriteStream(object) {
    return new MediaSourceStream(this, object);
  }

  /*
   * Use to trigger an error on the underlying media element
   */
  error(err) {
    // be careful not to overwrite any existing detailedError values
    if (!this.detailedError) {
      this.detailedError = err
    }
    try {
      this._mediaSource.endOfStream('decode')
    } catch (err) {}
  }
}

class MediaSourceStream extends Stream.Writable {

  constructor(wrapper, obj, ...args) {
    super(...args);
    this._wrapper = wrapper
    this._elem = wrapper._elem
    this._mediaSource = wrapper._mediaSource
    this._allStreams = wrapper._streams
    this._allStreams.push(this)
    this._bufferDuration = wrapper._bufferDuration
    this._sourceBuffer = null

    this._openHandler = () => {
      return this._onSourceOpen();
    }

    this._flowHandler = () => {
      return this._flow();
    }

    if (typeof obj === 'string') {
      this._type = obj
      // Need to create a new sourceBuffer
      if (this._mediaSource.readyState === 'open') {
        this._createSourceBuffer()
      } else {
        this._mediaSource.addEventListener('sourceopen', this._openHandler)
      }
    } else if (obj._sourceBuffer === null) {
      obj.destroy()
      this._type = obj._type // The old stream was created but hasn't finished initializing
      this._mediaSource.addEventListener('sourceopen', this._openHandler)
    } else if (obj._sourceBuffer) {
      obj.destroy()
      this._type = obj._type
      this._sourceBuffer = obj._sourceBuffer // Copy over the old sourceBuffer
      this._sourceBuffer.addEventListener('updateend', this._flowHandler)
    } else {
      throw new Error('The argument to MediaElementWrapper.createWriteStream must be a string or a previous stream returned from that function')
    }


    this._elem.addEventListener('timeupdate', this._flowHandler)

    this.on('error', (err) => {
      this._wrapper.error(err)
    })

    this.on('finish', () => {
      if (this.destroyed) return
      this._finished = true
      if (this._allStreams.every((other) => { return other._finished })) {
        try {
          this._mediaSource.endOfStream()
        } catch (err) {}
      }
    })
  }

  _onSourceOpen() {
    if (this.destroyed) return

    this._mediaSource.removeEventListener('sourceopen', this._openHandler);
    this._createSourceBuffer();
  }

  destroy() {
    if (this.destroyed) return
    this.destroyed = true

    // Remove from allStreams
    this._allStreams.splice(this._allStreams.indexOf(this), 1)

    this._mediaSource.removeEventListener('sourceopen', this._openHandler)
    this._elem.removeEventListener('timeupdate', this._flowHandler)
    if (this._sourceBuffer) {
      this._sourceBuffer.removeEventListener('updateend', this._flowHandler)
      if (this._mediaSource.readyState === 'open') {
        this._sourceBuffer.abort()
      }
    }

    if (err) this.emit('error', err)
    this.emit('close')
  }

  _createSourceBuffer() {
    if (this.destroyed) return

    if (MediaSource.isTypeSupported(this._type)) {
      this._sourceBuffer = this._mediaSource.addSourceBuffer(this._type)
      this._sourceBuffer.addEventListener('updateend', this._flowHandler)
      if (this._cb) {
        const cb = this._cb
        this._cb = null
        cb()
      }
    } else {
      this.destroy(new Error('The provided type is not supported'))
    }
  }

  _write(chunk, encoding, cb) {
    if (this.destroyed) return;

    if (!this._sourceBuffer) {
      this._cb = (err) => {
        if (err) return cb(err)
        this._write(chunk, encoding, cb)
      }
      return
    }

    if (this._sourceBuffer.updating) {
      return cb(new Error('Cannot append buffer while source buffer updating'))
    }

    try {
      this._sourceBuffer.appendBuffer(toArrayBuffer(chunk))
    } catch (err) {
      // appendBuffer can throw for a number of reasons, most notably when the data
      // being appended is invalid or if appendBuffer is called after another error
      // already occurred on the media element. In Chrome, there may be useful debugging
      // info in chrome://media-internals
      this.destroy(err)
      return
    }
    this._cb = cb
  }

  _flow() {
    if (this.destroyed || !this._sourceBuffer || this._sourceBuffer.updating) {
      return
    }

    if (this._mediaSource.readyState === 'open') {
      // check buffer size
      console.log('_getBufferDuration: %d, _bufferDuration: %d', this._getBufferDuration(), this._bufferDuration);
      if (this._getBufferDuration() > this._bufferDuration) {
        return
      }
    }

    if (this._cb) {
      var cb = this._cb
      this._cb = null
      cb()
    }
  }

  _getBufferDuration() {
    const buffered = this._sourceBuffer.buffered
    let currentTime = this._elem.currentTime
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

module.exports = MediaElementWrapper;

