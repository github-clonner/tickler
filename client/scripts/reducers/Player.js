// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Player.js                                                //
// @summary      : Player reducer                                            //
// @version      : 0.2.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Sep 2017                                               //
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

import type { PlayerActions } from '../types';
import { PlayerActionKeys as Action } from '../types';
// import SettingsStore from '../lib/SettingsStore';

/* List of Actions used for debug */
const isValidType = (type: string) => ([
  Action.SET_CONTEXT,
  Action.SET_ANALYZER,
  Action.SET_WAVESURFER,
  Action.SET_DURATION,
  Action.SET_CURRENT_TIME,
  Action.SET_SEEK,
  Action.SET_VOLUME,
  Action.SET_MUTE,
  Action.SET_LOADING,
  Action.SET_FINISHED,
  Action.SET_PLAYING,
  Action.SET_STOP,
  Action.SET_PAUSE,
  Action.SET_PLAYPAUSE,
  Action.SET_READY,
  Action.TOGGLE_MUTE,
  Action.SEEK_TO,
  Action.ERROR
].includes(type));

// const settings = new SettingsStore();
const audio = {
  wavesurfer: null,
  context: null,
  analyzer: null,
  seek: 0,
  duration: 0,
  currentTime: 0,
  // volume: settings.get('audio.volume', 0.5),
  volume: 0.5,
  progress: 0,
  // isMuted: settings.get('audio.isMuted', false),
  isMuted: false,
  isPlaying: false,
  isPaused: false,
  isReady: false
};

export function Audio (state = audio, action: PlayerActions) {

  if (isValidType(action.type)) {
    console.log(action.type, action);
  }

  switch (action.type.replace(/(^START.)/,'')) {
    case Action.SET_CONTEXT: return { ...state, context: action.payload };
    case Action.SET_ANALYZER: return { ...state, analyzer: action.payload };
    case Action.SET_WAVESURFER: return { ...state, wavesurfer: action.payload };
    case Action.SET_CURRENT_TIME: return { ...state, currentTime: action.payload };
    case Action.SET_SEEK: return { ...state, seek: action.payload };
    case Action.SET_DURATION: return { ...state, duration: action.payload };
    case Action.SET_VOLUME: return { ...state, volume: action.payload };
    case Action.SET_MUTE: return { ...state, mute: action.payload };
    case Action.SET_LOADING: return { ...state, progress: action.payload };
    case Action.SET_FINISHED: return { ...state, isPlaying: false, isPaused: true, currentTime: 0 };
    case Action.SET_PLAYING: return { ...state, isPlaying: true, isPaused: false };
    /* case Action.SET_PLAYPAUSE: return state; */
    case Action.SET_STOP: return { ...state, isPlaying: false, currentTime: 0 };
    case Action.SET_PAUSE: return { ...state, isPaused: true, isPlaying: false };
    case Action.SET_READY: return { ...state, isReady: action.payload };
    case Action.TOGGLE_MUTE: return { ...state, isMuted: action.payload };
    default:
      return state;
  }
}

