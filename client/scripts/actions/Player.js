// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Player.js                                                 //
// @summary      : Player actions                                            //
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

import { PlayerActionKeys as Action } from '../types';
import WaveSurfer from 'wavesurfer.js';
import throttle from 'lodash/throttle';

export const setAnalyzer = (payload: any) => ({ type: Action.SET_ANALYZER, payload });
export const setContext = (payload: any) => ({ type: Action.SET_CONTEXT, payload });
export const setWavesurfer = (payload: any) => ({ type: Action.SET_WAVESURFER, payload });
export const setDuration = (payload: number) => ({ type: Action.SET_DURATION, payload });
export const setReady = (payload: boolean) => ({ type: Action.SET_READY, payload });
export const setCurrentTime = (payload: number) => ({ type: Action.SET_CURRENT_TIME, payload });
export const setSeek = (payload: number) => ({ type: Action.SET_SEEK, payload });
export const setLoading = (payload: number) => ({ type: Action.SET_LOADING, payload });
export const setVolume = (payload: number) => ({ type: Action.SET_VOLUME, payload });
export const setMute = (payload: boolean) => ({ type: Action.SET_MUTE, payload });
export const setFinished = (payload: boolean) => ({ type: Action.SET_FINISHED, payload });
export const setStop = (payload: boolean) => ({ type: Action.SET_STOP, payload });
export const setPlaying = (payload: boolean) => ({ type: Action.SET_PLAYING, payload });
export const setPause = (payload: boolean) => ({ type: Action.SET_PAUSE, payload });
export const ERROR = (error: string) => ({ type: Action.ERROR, error });

export function init (options: Object) {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    const wavesurfer = new WaveSurfer(options);
    const onLoading = (progress: number) => dispatch(setLoading(progress));
    const onSeek = (progress: number) => dispatch(setSeek(progress));
    const onFinish = () => dispatch(setFinished(true));
    const onError = (error: string) => dispatch(ERROR(error));
    const onPause = () => (
      dispatch(setPlaying(false)),
      dispatch(setPause(true))
    );
    const onReady = () => (
      dispatch(setReady(true)),
      dispatch(setDuration(wavesurfer.getDuration()))
    );

    const onAudioprocess = throttle(() => (
      dispatch(setPlaying(true)),
      dispatch(setCurrentTime(wavesurfer.getCurrentTime()))
    ), 500, { trailing: true });

    wavesurfer.init();
    wavesurfer.on('loading', onLoading);
    wavesurfer.on('ready', onReady);
    wavesurfer.on('audioprocess', onAudioprocess);
    wavesurfer.on('seek', onSeek);
    wavesurfer.on('pause', onPause);
    wavesurfer.on('finish', onFinish);
    wavesurfer.on('error', onError);
    return dispatch(setWavesurfer(wavesurfer));
  }
};

export function load (item: Object) {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    const media = item.file || item.url || item.stream;
    try {
      console.log('media', media);
      Audio.wavesurfer.load(media);
      return dispatch(setLoading(0));
    } catch (error) {
      console.error(error);
      return dispatch(ERROR(error));
    }
  }
};

export function play (item: Object) {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    Audio.wavesurfer.once('ready', Audio.wavesurfer.play);
    return dispatch(load(item));
  }
}

export function playPause () {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    Audio.wavesurfer.playPause();
    const isPlaying = Audio.wavesurfer.isPlaying();
    return (
      dispatch(setPlaying(isPlaying)),
      dispatch(setPause(!isPlaying))
    );
  }
}

export function pause () {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    Audio.wavesurfer.pause();
    return dispatch(setPause(true));
  }
}

export function stop () {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    Audio.wavesurfer.stop();
    Audio.wavesurfer.once('seek', progress => {
      console.log('seek', progress);
      return dispatch(setStop(progress))
    });
  }
}

export function volume (volume: number) {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    Audio.wavesurfer.setVolume(volume);
    return dispatch(setVolume(volume));
  }
}

