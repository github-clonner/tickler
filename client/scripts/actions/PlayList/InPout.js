// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : InPout.js                                                 //
// @summary      : List input output actions                                 //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 01 Nov 2017                                               //
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

import {
  parseDuration,
} from '../../lib';
import fs from 'fs';
import os from 'os';
import path from 'path';
import jsonata from 'jsonata';
import sanitize from 'sanitize-filename';
import schema from '../../../schemas/playlist.json';
import { PlayListActionKeys as Action } from '../../types';

export function formatJSON(json, rules) {
  try {
    const formatter = jsonata(rules);
    formatter.registerFunction('toFilename', filename => sanitize(filename), '<s:s>');
    // formatter.registerFunction('parseDuration', (duration) => parseDuration(duration), '<s:n>');
    return formatter.evaluate(json);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * fetch youtube video
 * Downloads the item if no local file
 * @param  {Object} video descriptor
 * @param  {boolean} autoplay flag
 * @return {null}
 */
export function fetchItem (item, autoPlay = false) {
  return async function (dispatch, getState) {

    const { Audio, Settings } = getState();
    // autoPlay = autoPlay || Settings.get('player.autoPlay');
    const { transcode } = Settings.get('download');
    let transcoder = null;
    let encoder = null;

    const formatInfo = (info) => {
      try {
        const { formatters } = Settings.get('plugins.youtube');
        const formatter = jsonata(formatters.metainfo);
        formatter.registerFunction('toFilename', string => sanitize(string), '<s:n>');
        return formatter.evaluate(info);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    const onProgress = ({video, progress}) => {
      return dispatch(editItem(video.id, {
        isLoading: true,
        progress: progress
      }));
    };

    const onResponse = ({ video, response, downloader, stream }) => {
      // console.log('onResponse', { video, response, downloader, stream });
      // const blob = new window.Blob([new Uint8Array(stream)]);
      // Audio.wavesurfer.loadBlob(blob);
      // const sound = window.howl = new Howl({
      //   src: ['http://ice1.somafm.com/groovesalad-128-mp3', 'http://ice1.somafm.com/groovesalad-128-aac'],
      //   html5: true, // A live stream can only be played through HTML5 Audio.
      //   format: ['mp3', 'aac']
      // });
      // sound.play();
      // const transcoder = transcode ? new Transcoder(downloader, transcode) : undefined;
    }

    const onInfo = ({ video, downloader, file, info, format }) => {
      if (transcode) {
        console.log('inco', formatInfo(info));
        /* Instanciate media transcoder */
        transcoder = new Transcoder(downloader, transcode);
        encoder = transcoder.encode({ info: formatInfo(info), format });
      }
      return console.log('onInfo', video, info, format);
    };

    const onEnd = ({ video, file }) => {
      if (transcode && transcoder && !transcode.keep) {
        transcoder.events.once('end', transcoded => {
          if (!transcode.savePath) {
            fileSystem.remove(file);
            const dest = path.format({
              dir: path.dirname(file),
              name: path.basename(transcoded.file)
            });
            fileSystem.move(transcoded.file, dest);
            const metadata = new Metadata();
            metadata.obtain(dest).then(info => console.log('metadata', info));
         } else {
            return fileSystem.remove(file);
         }
        });
      }
      return console.log('onEnd', video, file);
    };

    const onError = ({ video, error }) => {
      console.error(video, error);
      return dispatch(playNextItem(item.id));
    };

    const onAbort = ({ video, reason }) => {
      console.log('onAbort', video, video);
      return dispatch(playNextItem(item.id));
    };

    const cleanListeners = () => (
      youtube.events.off('progress', onProgress)
    );

    youtube.events.on('progress', onProgress);
    youtube.events.once('response', onResponse);
    youtube.events.once('info', onInfo);
    youtube.events.once('end', onEnd);
    youtube.events.once('error', onError);
    youtube.events.once('abort', onAbort);

    dispatch(editItem(item.id, {
      isLoading: true,
      progress: 0
    }));

    try {
      const fileName = await youtube.downloadVideo(item);
      dispatch(editItem(item.id, {
        file: fileName,
        isLoading: false,
        progress: 1
      }));
    } catch (error) {
      dispatch(editItem(item.id, {
        isLoading: false,
        progress: 0
      }));
      dispatch({type: 'ERROR', error: error});
    } finally {
      cleanListeners();
      // dispatch(editItem(item.id, {
      //   isLoading: false
      // }));
      // if (fileName && autoPlay) {
      //   dispatch(playPauseItem(item.id, true));
      // }
    }
  }
}



/**
 * Save PlayList.
 * Allows user to save a playlist file to disk
 * @return {null}
 */
export function saveAs (playlist, options: Object = DialogOptions.save) {
  return async function (dispatch, getState) {
    const { PlayListItems } = getState();
    remote.dialog.showSaveDialog(options, function (files) {
      if (!Array.isArray(files) || files.length < 1) {
        return;
      }
      // files is an array that contains all the selected
      const file = files.slice(0).pop();
      try {
        // const playListStore = new PlayListStore(file);
        // return dispatch(receivePlayListItems(playListStore.playlist.tracks));
      } catch (error) {
        // console.error(error);
        // return dispatch({type: 'ERROR', error: err});
      }
    });
  }
}

/**
 * Preload Items.
 * Downloads n items ahead
 * @param  {String} head item
 * @return {null}
 */
export function preloadItems (id: string) {
  return async function (dispatch, getState) {
    const concurrency = settings.get('download.concurrency');
    if(concurrency > 2) {
      return false;
    }
    const { PlayListItems } = getState();
    const index = PlayListItems.findIndex(item => (item.get('id') === id));
    for(let i = (index + 1); i < ((index + 1) + (concurrency - 1)); i++) {
      const item = PlayListItems.get(i);
      if(!item.get('file') && !item.get('isLoading')) {
        dispatch(fetchItem(item, false));
      }
    }
  }
}

/**
 * Reopen last open playlist.
 */
export function reopen () {
  return async function (dispatch, getState) {
    const playListStore = new PlayListStore();
    return (
      dispatch(receivePlayListItems(playListStore.playlist.tracks)),
      dispatch(selectIndex(0))
    );
  };
};

/**
 * Open PlayList.
 * Allows user to pick a playlist file from disk
 * @return {null}
 */
export function open (options: Object = DialogOptions.open) {
  return async function (dispatch, getState) {
    const { PlayListItems } = getState();
    remote.dialog.showOpenDialog(options, function (files) {
      if (!Array.isArray(files) || files.length < 1) {
        return;
      }
      // files is an array that contains all the selected
      const file = files.slice(0).pop();
      try {
        const playListStore = new PlayListStore(file);
        return (
          dispatch(receivePlayListItems(playListStore.playlist.tracks)),
          dispatch(selectIndex(0))
        );
      } catch (error) {
        console.error(error);
        return dispatch({type: 'ERROR', error: error});
      }
    });
  }
}

/**
 * Cancel item download.
 * Downloads the item if no local file
 * @param  {id} id of the youtube video
 * @return {null}
 */
export function cancel (ids: string | Array<string>, reason?: boolean, options?: Object) {
  return async function (dispatch, getState) {
    if (Array.isArray(ids) && ids.length) {
      ids.forEach(id => {
        youtube.events.emit('cancel', { ids, reason, options });
        return dispatch(editItem(id, {
          isLoading: false,
          progress: 0
        }));
      })
    } else {
      const id = String(ids);
      youtube.events.emit('cancel', { id, reason, options });
      return dispatch(editItem(id, {
        isLoading: false,
        progress: 0
      }));
    }
  }
}
