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
import Stream from 'stream';
import { EchoStream } from './StreamEx';
import FFmpeg from 'fluent-ffmpeg';
import camelCase from 'lodash/camelCase';

/*
 * Inspiration:
 * https://github.com/jameskyburz/youtube-audio-stream
 *
 */

/*
 * get ffmpeg capabilities
 */
export const getCapabilities = async function(...capabilities?: Array<string>) : Object | Error {

  const methods = ['formats', 'codecs', 'encoders', 'filters'];
  const promisify = function(capability) {
    const func = camelCase('get-available-'.concat(capability));
    return new Promise((resolve, reject) => {
      const callback = (error, result) => (error ? reject(error) : resolve(result));
      return FFmpeg[ func ].apply(this, [ callback ]);
    });
  };

  if (capabilities.length && !capabilities.every(capability => methods.includes(capability))) {
    return Promise.reject();
  } else if (!capabilities.length) {
    capabilities = Array.from(methods);
  }
  return Promise
    .all(capabilities.map(c => promisify(c)))
    .then(features => features.reduce((features, feature, index) => ({ ...features,  [capabilities[index]]: feature }), {}));
};

/*
 * Transcode from stream
 * @param {Stream} readable stream
 */
export const encode = function(stream, options) {
  return new FFmpeg(stream)
  .audioCodec('libmp3lame')
  .audioBitrate(128)
  .audioChannels(2)
  .format('mp3')
  .save('out.mp3')
  .on('start', function(commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
  })
  .on('codecData', function(data) {
    console.log('Input is ', data.audio, ' audio ', 'with ', data.video, ' video');
  })
  .on('error', function(error) {
    console.error(error.message);
  })
  .on('progress', function(progress) {
    console.log('progress', progress);
  })
  .on('end', function() {
    console.log('end conversion!');
  });
  // Sometimes breaks
  // .ffprobe(function(error, data) {
  //   console.log('metadata:');
  //   console.dir(data);
  // });
};

const presets = {
  mp3(command) {
    return command
      .format('mp3')
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .audioChannels(2);
  }
};

export default class Transcoder {

  constructor(stream) {
    this.stream = stream;
  }

  // encode(options) {
  //   const { stream } = this;
  //   const { preset } = options;
  //   const command = new FFmpeg(stream)
  //     .preset(presets.mp3)
  //     .save('out.mp3');
  //   this.listeners(command);
  //   return command;
  // }

  encode(options) {
    const { stream } = this;
    const { preset, output } = options;
    console.log('encode options', options);
    if (!(stream instanceof Stream.Readable)) {
      throw new Error('Invalid input stream');
    }
    return new FFmpeg(stream)
    .audioCodec('libmp3lame')
    .audioBitrate(128)
    .audioChannels(2)
    .format('mp3')
    .save('out.mp3')
    .on('start', function(commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('codecData', function(data) {
      console.log('Input is ', data.audio, ' audio ', 'with ', data.video, ' video');
    })
    .on('error', function(error) {
      console.error(error.message);
    })
    .on('progress', function(progress) {
      console.log('progress', progress);
    })
    .on('end', function() {
      console.log('end conversion!');
    });
  }

  listeners(command) {
    return command
    .on('start', function(commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('codecData', function(data) {
      console.log('Input is ', data.audio, ' audio ', 'with ', data.video, ' video');
    })
    .on('error', function(error) {
      console.error(error.message);
    })
    .on('progress', function(progress) {
      console.log('progress', progress);
    })
    .on('end', function() {
      console.log('end conversion!');
    })
    .ffprobe(function(error, data) {
      console.log('metadata:');
      console.dir(data);
    });
  }
}



