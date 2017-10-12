///////////////////////////////////////////////////////////////////////////////
// @file         : ToolBar.js                                                //
// @summary      : ToolBar flow types                                        //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 07 Sep 2017                                               //
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

import type { Action } from './Action';

export const PlayerActionKeys = {
  SET_CONTEXT: 'SET_CONTEXT',
  SET_ANALYZER: 'SET_ANALYZER',
  SET_WAVESURFER: 'SET_WAVESURFER',
  SET_DURATION: 'SET_DURATION',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_SEEK: 'SET_SEEK',
  SET_VOLUME: 'SET_VOLUME',
  SET_MUTE: 'SET_MUTE',
  SET_LOADING: 'SET_LOADING',
  SET_FINISHED: 'SET_FINISHED',
  SET_PLAYING: 'SET_PLAYING',
  SET_STOP: 'SET_STOP',
  SET_PAUSE: 'SET_PAUSE',
  SET_READY: 'SET_READY',
  SET_PLAYPAUSE: 'SET_PLAYPAUSE',
  TOGGLE_MUTE: 'TOGGLE_MUTE',
  SEEK_TO: 'SEEK_TO',
  ERROR: 'ERROR',
};

export type PlayerActions =
  | Action<typeof PlayerActionKeys.SET_CONTEXT, any>
  | Action<typeof PlayerActionKeys.SET_ANALYZER, any>
  | Action<typeof PlayerActionKeys.SET_WAVESURFER, any>
  | Action<typeof PlayerActionKeys.SET_DURATION, number>
  | Action<typeof PlayerActionKeys.SET_CURRENT_TIME, number>
  | Action<typeof PlayerActionKeys.SET_SEEK, number>
  | Action<typeof PlayerActionKeys.SET_VOLUME, number>
  | Action<typeof PlayerActionKeys.SET_MUTE, boolean>
  | Action<typeof PlayerActionKeys.SET_LOADING, number>
  | Action<typeof PlayerActionKeys.SET_FINISHED, boolean>
  | Action<typeof PlayerActionKeys.SET_PLAYING, any>
  | Action<typeof PlayerActionKeys.SET_STOP, boolean>
  | Action<typeof PlayerActionKeys.SET_PAUSE, boolean>
  | Action<typeof PlayerActionKeys.SET_PLAYPAUSE, any>
  | Action<typeof PlayerActionKeys.SET_READY, boolean>
  | Action<typeof PlayerActionKeys.TOGGLE_MUTE, void>
  | Action<typeof PlayerActionKeys.SEEK_TO, number>
  | Action<typeof PlayerActionKeys.ERROR, string>
  ;
