// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Transcoder.js                                             //
// @summary      : FFmpeg media transcoder                                   //
// @version      : 1.0.0                                                     //
// @project      : N/A                                                       //
// @description  : N/A                                                       //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 16 Oct 2017                                               //
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
import os from 'os';
import Stream from 'stream';
import FFmpeg from 'fluent-ffmpeg';
import sanitize from 'sanitize-filename';
import EventEmitterEx from '../EventEmitterEx';
import { MediaElementEx } from '../MediaSourceEx';
import { presets } from './presets';

window.qaq = function(
  element = document.getElementById('audioElement'),
  stream = fs.createReadStream(path.resolve(process.cwd(), 'audio.mp3')),
  format = 'audio/mpeg'
) {
  const mediaElementEx = new MediaElementEx(element, stream, format);
}

export default class Transcoder {

  constructor(stream, options) {
    if (!(stream instanceof Stream.Readable)) {
      throw new Error('Invalid input stream');
    }
    this.options = options;
    this.stream = stream;
    this.command = new FFmpeg({
      source: stream,
      priority: options.priority || 0
    });
    this.events = new EventEmitterEx();
    this.addListeners(this.command);
  }


  get outputDir() {
    const { savePath } = this.options;
    return path.resolve(savePath || os.tmpdir());
  }

  get outputName() {
    const { info: { filename } } = this.source;
    return filename ? sanitize(filename) : null;
  }

  get outputExt() {
    const { preset: { format } } = this.options;
    return '.'.concat(format);
  }

  get getSavePath() {
    const { outputDir: dir, outputName: name, outputExt: ext } = this;
    console.log('savePath', path.format({ dir, name, ext }));
    return path.format({ dir, name, ext });
  }

  getPreset() {
    const { preset, savePath = os.tmpdir() } = this.options;
    return presets[preset.format].apply(this, [ { ...preset, file: this.getSavePath } ]);
  }
  /*
   * Transcode from stream
   * @param {options} FFmpeg command configuration
   */
  encode(source) {
    this.source = source;
    this.command.preset(this.getPreset());
    this.command.run();
    this.play(
      document.getElementById('audioElement'),
      this.stream,
      source.format.type
    );
    return this.command;
  }

  play(
    element = document.getElementById('audioElement'),
    stream = fs.createReadStream(path.resolve(process.cwd(), 'audio.mp3')),
    format = 'audio/mpeg'
  ) {
    const mediaElementEx = new MediaElementEx(element, stream, format);
  }

  getListeners(command = this.command) {
    return {
      end: [ command.once, () => {
        this.events.emit('end', { file: this.getSavePath });
        return this.cleanup();
      }],
      error: [ command.once, (error) => this.onError(error) ],
      start: [ command.once, function onStart(args) { console.log('Spawned Ffmpeg with arguments: ' + args) } ],
      progress: [ command.on, function onProgress(progress) { console.log('progress', progress) } ],
      codecData: [ command.once, function onCodecData(data) { console.log('Input is ', data.audio, ' audio ', 'with ', data.video, ' video') } ],
    };
  }

  addListeners(command = this.command) {
    const listeners = this.getListeners(command);
    return Object.entries(listeners).map(([listener, [ func, handler ]]) => {
      return func.apply(command, [ listener, handler ]);
    });
  }

  onError(error) {
    console.error(error);
    return this.cleanup();
  };

  cleanup(command = this.command) {
    return command.removeAllListeners();
  }

  probe(index = 0) {
    return new Promise((resolve, reject) => {
      return this.command.ffprobe(index, (error, data) => (error ? reject(error) : resolve(data)));
    });
  }
}



    // return command
    //   .on('start', cmd => console.log('Spawned Ffmpeg with command: ' + cmd))
    //   .on('codecData', data => console.log('Input is ', data.audio, ' audio ', 'with ', data.video, ' video'))
    //   .on('error', error => console.error(error))
    //   .on('progress', progress => console.log('progress', progress))
    //   .on('end', () => console.log('end conversion!'));
