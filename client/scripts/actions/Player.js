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
import { createAsyncAction } from '../lib/ActionHelpers';
import SettingsStore from '../lib/SettingsStore';
import WaveSurfer from 'wavesurfer.js';
import throttle from 'lodash/throttle';

const settings = new SettingsStore();

export const setAnalyzer = (payload: any) => ({ type: Action.SET_ANALYZER, payload });
export const setContext = (payload: any) => ({ type: Action.SET_CONTEXT, payload });
export const setWavesurfer = (payload: any) => ({ type: Action.SET_WAVESURFER, payload });
export const setDuration = (payload: number) => ({ type: Action.SET_DURATION, payload });
export const setReady = (payload: boolean) => ({ type: Action.SET_READY, payload });
export const setCurrentTime = (payload: number) => ({ type: Action.SET_CURRENT_TIME, payload });
export const setSeek = (payload: number) => ({ type: Action.SET_SEEK, payload });
export const setLoading = (payload: number) => ({ type: Action.SET_LOADING, payload });
// export const setVolume = (payload: number) => ({ type: Action.SET_VOLUME, payload });
export const setMute = (payload: boolean) => ({ type: Action.SET_MUTE, payload });
export const setFinished = (payload: boolean) => ({ type: Action.SET_FINISHED, payload });
export const setStop = (payload: boolean) => ({ type: Action.SET_STOP, payload });
export const setPlaying = (payload: boolean) => ({ type: Action.SET_PLAYING, payload });
export const setPause = (payload: boolean) => ({ type: Action.SET_PAUSE, payload });
export const ERROR = (error: string) => ({ type: Action.ERROR, error });

/*
 * Initialise the wave
 */
export const init = function(options: Object) {
  return async function (dispatch, getState) {
    const wavesurfer = window.WS = new WaveSurfer(options);
    const getPlayBackStatus = () => ({
      isPlaying: wavesurfer.isPlaying(),
      isPaused: wavesurfer.backend.isPaused()
    })

    /*
     * Fires on seeking.
     * Listener will receive (float) progress [0..1].
     */
    const onSeek = (progress: number) => dispatch(setSeek(progress));

    /*
     * Fires when it finishes playing.
     */
    const onFinish = () => {
      wavesurfer.stop();
      return dispatch(setStop(true));
    };

    /*
     * Fires When audio is paused
     */
    const onPause = () => dispatch(setPause(getPlayBackStatus()));

    /*
     * Fires when play starts.
     */
    const onPlay = () => dispatch(setPlaying(getPlayBackStatus()));

    /*
     * Fires when audio is loaded, decoded and the waveform drawn.
     */
    const onReady = () => (
      dispatch(setReady(wavesurfer.isReady)),
      dispatch(setDuration(wavesurfer.getDuration()))
    );

    /*
     * Fires continuously when loading via XHR or drag'n'drop.
     * Listener will receive (integer) loading progress in percents [0..100] and (object) event target.
     */
    const onLoading = throttle((progress: number) => (
      dispatch(setLoading(progress))
    ), 100, { trailing: true });

    /*
     * Fires continuously as the audio plays. Also fires on seeking.
     */
    const onAudioprocess = throttle(() => (
      dispatch(setCurrentTime(wavesurfer.getCurrentTime()))
    ), 100, { trailing: true });

    /*
     * Fires on error.
     * Listener will receive (string) error message.
     */
    const onError = (error: string) => dispatch(ERROR(error));

    wavesurfer.init();

    wavesurfer.on('ready', onReady);
    wavesurfer.on('loading', onLoading);
    wavesurfer.on('audioprocess', onAudioprocess);
    wavesurfer.on('seek', onSeek);
    wavesurfer.on('pause', onPause);
    wavesurfer.on('play', onPlay);
    wavesurfer.on('finish', onFinish);
    wavesurfer.on('error', onError);

    return dispatch(setWavesurfer(wavesurfer));
  }
};

/*
 * Loads audio and re-renders the waveform.
 */
export const load = function(item: Object) {
  return async function (dispatch, getState) {
    const { Audio } = getState();
    const media = item.file || item.url || item.stream;
    try {
      Audio.wavesurfer.load(media, null, false);
      return dispatch(setLoading(0));
    } catch (error) {
      console.error(error);
      return dispatch(ERROR(error));
    }
  };
};

/*
 * Toggle playback
 */
export const playPause = createAsyncAction(Action.SET_PLAYPAUSE, (item: any, { dispatch, getState }) => {
  const { Audio } = getState();
  if (Audio.wavesurfer.isPlaying() || Audio.wavesurfer.getCurrentTime()) {
    return Audio.wavesurfer.playPause();
  } else {
    /* wait until media is loaded and decoded */
    Audio.wavesurfer.once('ready', (...args) => {
      return Audio.wavesurfer.play();
    });
    /* load media */
    return dispatch(load(item));
  }
});

/*
 * Stops and goes to the beginning
 */
export const stop = createAsyncAction(Action.SET_STOP, (item: any, { dispatch, getState }) => {
  const { Audio } = getState();
  Audio.wavesurfer.once('seek', progress => {
    console.log('stop', progress);
  });
  return Audio.wavesurfer.stop();
});

/*
 * Seeks to a position
 */
export const seekTo = createAsyncAction(Action.SEEK_TO, (progress: number, { dispatch, getState }) => {
  const { Audio } = getState();
  return Audio.wavesurfer.seekTo(progress);
});

/*
 * Set the playback volume
 */
export const setVolume = createAsyncAction(Action.SET_VOLUME, (volume: number, { dispatch, getState }) => {
  const { Audio } = getState();
  console.log('setVolume', volume)
  return Audio.wavesurfer.setVolume(volume);
}, true, 100);

/*
 * Toggle the volume on and off
 */
export const toggleMute = createAsyncAction(Action.TOGGLE_MUTE, (mute: boolean, { getState }) => {
  const { Audio } = getState();
  Audio.wavesurfer.toggleMute();
  return Audio.wavesurfer.getMute();
});

