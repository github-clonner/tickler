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
import WaveSurfer from 'wavesurfer.js';

const audio = {
  context: new AudioContext(),
  analyzer: null,
  currentTime: 0,
  seek: 0,
  duration: 0,
  volume: 0,
  mute: false,
  progress: 0,
  finish: false,
  isPlaying: false,
  isPaused: false,
  isReady: false,
  wavesurfer: Object.create(WaveSurfer)
};

export function Audio (state: Object = audio, action: PlayerActions) {

  if (action.type !== Action.SET_CURRENT_TIME && action.type !== Action.SET_PLAYING) {
    console.log("AUDIO", action.type, action.payload);
  }

  switch (action.type) {

    case Action.SET_CONTEXT: {
      return Object.assign({}, state, { context: action.payload });
    }

    case Action.SET_ANALYZER: {
      return Object.assign({}, state, { analyzer: action.payload });
    }

    case Action.SET_WAVESURFER: {
      return Object.assign({}, state, { wavesurfer: action.payload });
    }

    case Action.SET_CURRENT_TIME: {
      return Object.assign({}, state, { currentTime: action.payload });
    }

    case Action.SET_SEEK: {
      return Object.assign({}, state, { seek: action.payload, currentTime: action.payload });
    }

    case Action.SET_DURATION: {
      return Object.assign({}, state, { duration: action.payload });
    }

    case Action.SET_VOLUME: {
      return Object.assign({}, state, { volume: action.payload });
    }

    case Action.SET_MUTE: {
      return Object.assign({}, state, { mute: action.payload });
    }

    case Action.SET_LOADING: {
      return Object.assign({}, state, { progress: action.payload });
    }

    case Action.SET_FINISHED: {
      return Object.assign({}, state, { finish: action.payload });
    }

    case Action.SET_PLAYING: {
      return Object.assign({}, state, { isPlaying: true, isPaused: false });
    }

    case Action.SET_STOP: {
      return Object.assign({}, state, { isPlaying: false, currentTime: 0 });
    }

    case Action.SET_PAUSE: {
      return Object.assign({}, state, { isPaused: true, isPlaying: false });
    }

    case Action.SET_READY: {
      return Object.assign({}, state, { isReady: action.payload });
    }

    default:
      return state;
  }

}

