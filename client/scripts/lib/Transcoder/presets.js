// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : presets.js                                                //
// @summary      : FFmpeg transcoding presets                                //
// @version      : 1.0.0                                                     //
// @project      : N/A                                                       //
// @description  : N/A                                                       //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 31 Oct 2017                                               //
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

export const presets = {
  mp3: output => command => {
    const { file, bitrate = 128, frequency = 44100, channels = 2 } = output;
    return command
      .format('mp3')
      .audioCodec('libmp3lame')
      .audioBitrate(bitrate)
      .audioFrequency(frequency)
      .audioChannels(channels)
      .output(file);
  },
  flac: output => command => {
    const { file, bitrate = 128, frequency = 44100, channels = 2 } = output;
    return command
      .format('flac')
      .audioBitrate(bitrate)
      .audioFrequency(frequency)
      .audioChannels(channels)
      .output(file);
  },
  mp4: output => command => {
    const { file, bitrate = 128, frequency = 44100, channels = 2 } = output;
    return command
      .format('mp4')
      .audioBitrate(bitrate)
      .audioFrequency(frequency)
      .audioChannels(channels)
      .output(file);
  },
  m4a: output => command => {
    const { file, bitrate = 128, frequency = 44100, channels = 2 } = output;
    return command
      .format('m4a')
      .audioBitrate(bitrate)
      .audioFrequency(frequency)
      .audioChannels(channels)
      .output(file);
  },
  aac: output => command => {
    const { file, bitrate = 128, frequency = 44100, channels = 2 } = output;
    return command
      .format('m4a')
      .audioBitrate(bitrate)
      .audioFrequency(frequency)
      .audioChannels(channels)
      .output(file);
  },
  wav: output => command => {
    const { file, bitrate = 128, frequency = 44100, channels = 2 } = output;
    return command
      .format('m4a')
      .audioBitrate(bitrate)
      .audioFrequency(frequency)
      .audioChannels(channels)
      .output(file);
  },
  ogg: output => command => {
    const { file, bitrate = 128, frequency = 44100, channels = 2 } = output;
    return command
      .format('m4a')
      .audioBitrate(bitrate)
      .audioFrequency(frequency)
      .audioChannels(channels)
      .output(file);
  }
};
