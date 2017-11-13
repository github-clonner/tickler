// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : extensions.js                                             //
// @summary      : Cupported plugin extensions                               //
// @version      : 1.0.0                                                     //
// @project      : N/A                                                       //
// @description  :                                                           //
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

export const applicationEvents = new Set(
  [
    'onApp',
    'onWindow',
    'onRendererWindow',
    'onUnload'
  ]
);

export const playerMethods = new Set(
  [
    'play', // Begins playback of a sound
    'pause', // Pauses playback of sound or group, saving the seek of playback.
    'stop', // Stops playback of sound, resetting seek to 0.
    'mute', // Mutes the sound, but doesn't pause the playback.
    'volume', // Get/set volume of this sound or the group
    'fade', // Fade a currently playing sound between two volumes
    'rate', // Get/set the rate of playback for a sound
    'seek', // Get/set the position of playback for a sound
    'loop', // Get/set whether to loop the sound or group
    'state', // Check the load status, returns a unloaded, loading or loaded
    'playing', // Check if a sound is currently playing or not,
    'duration' // Get the duration of the audio source
  ]
);

export const playerEvents = new Set(
  [
    'load',
    'loaderror',
    'playerror',
    'play',
    'end',
    'pause',
    'stop',
    'mute',
    'volume',
    'rate',
    'seek',
    'fade'
  ]
);

export const supportedExtensions = new Set(
  [
    'onApp',
    'onWindow',
    'onRendererWindow',
    'onUnload',
    'middleware',
    'decorateMenu',
    'decorateHeader',
    'decorateNotification',
    'decorateNotifications',
    'decorateConfig',
    'decorateEnv',
    'extendKeymaps',
    'extendMediaSources',
    'extendMediaIcon',

    'mediaPlayback',
    'mediaTranscode',
    'mediaFetch'
  ]
);

export const supportedEvents = new Set(
  [
    'onApp',
    'onWindow',
    'onRendererWindow',
    'onUnload',
  ]
);

export const hasInterfaces = (instance) => {
  return Object.keys(instance).some(extension => supportedExtensions.has(extension));
};

