// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : PlayList.js                                               //
// @summary      : Playlist actions                                          //
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

import schema from '../../schemas/playlist.json';
import { DialogOptions } from '../types/PlayList';
import getObjectProperty from 'lodash/get';
import jsonata from 'jsonata';
import { Youtube, Time, parseDuration, SettingsStore, PlayListStore, getPath } from '../lib';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { shell, remote } from 'electron';

const settings = new SettingsStore();
const plugins = settings.get('plugins');
const youtube = new Youtube({
  apiKey: plugins.youtube.apiKey,
  options: {
    saveTo: os.tmpdir()
  }
});

export const deleteItem = (id: string) => ({ type: 'DELETE_ITEM', id });
export const editItem = (id: string, payload) => ({ type: 'EDIT_ITEM', id, payload });
export const editItems = (payload: Object) => ({ type: 'EDIT_ITEMS', payload });
export const selectItems = (payload: any) => ({ type: 'SELECT_ITEMS', payload });
export const createFrom = payload => ({type: 'CREATEFROM', payload});
export const playPauseItem = (id: string, payload) => ({ type: 'PLAYPAUSE_ITEM', id, payload });
export const pauseItem = (id: string) => ({ type: 'PAUSE_ITEM', id });
export const playNext = (id: string) => ({ type: 'PLAY_NEXT_ITEM', id });
export const playPrevious = (id: string) => ({ type: 'PLAY_PREVIOUS_ITEM', id });
export const stop = id => ({ type: 'STOP', id });
export const receivePlayListItems = payload => ({type: 'RECEIVE_LIST_ITEMS', payload});
export const orderPlayList = (from, to) => ({ type: 'ORDER_LIST', from, to });
export const downloadProgress = payload => ({type: 'DOWNLOAD_PROGRESS', payload});


/**
 * fetch youtube video
 * Downloads the item if no local file
 * @param  {Object} video descriptor
 * @param  {boolean} autoplay flag
 * @return {null}
 */
export function fetchItem (item, autoPlay = false) {
  return async function (dispatch, getState) {
    const onProgress = ({video, progress}) => {
      return dispatch(editItem(video.id, {
        isLoading: true,
        progress: progress
      }));
    };

    const onInfo = ({video, info}) => {
      return console.debug(video, info)
    };

    const onError = ({vide, error}) => {
      dispatch(playNextItem(item.id));
    };

    const removeAllListeners = () => {
      youtube.events.removeListener('progress', onProgress);
      youtube.events.removeListener('info', onInfo);
    };

    let fileName = null;

    youtube.events.on('progress', onProgress);
    youtube.events.on('info', onInfo);
    youtube.events.on('error', onError);

    dispatch(editItem(item.id, {
      isLoading: true,
      progress: 0
    }));

    try {
      fileName = await youtube.downloadVideo(item);
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
      removeAllListeners();
      dispatch(editItem(item.id, {
        isLoading: false
      }));
      if (fileName && autoPlay) {
        dispatch(playPauseItem(item.id, true));
      }
    }
  }
}

/**
 * Open PlayList.
 * Allows user to pick a playlist file from disk
 * @return {null}
 */
export function openPlayList (options: Object = DialogOptions.open) {
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
        return dispatch(receivePlayListItems(playListStore.playlist.tracks));
      } catch (error) {
        console.error(error);
        return dispatch({type: 'ERROR', error: error});
      }
    });
  }
}

/**
 * Save PlayList.
 * Allows user to save a playlist file to disk
 * @return {null}
 */
export function saveAsPlayList (playlist, options: Object = DialogOptions.save) {
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

export function playNextItem (id: string) {
  return async function (dispatch, getState) {
    const { PlayListItems } = getState();
    const index = PlayListItems.findIndex(item => (item.get('id') === id));
    const nextIndex = ((index + 1) === PlayListItems.size) ? 0 : index + 1;
    let nextItem = PlayListItems.get(nextIndex);

    if (!nextItem.get('file') && !nextItem.get('isLoading')) {
      dispatch(fetchItem(nextItem, true));
    } else {
      dispatch(playPauseItem(nextItem.get('id'), true));
    }
  }
}

/**
 * Play Item.
 * Downloads the item if no local file
 * @param  {String} id of the youtube video
 * @return {null}
 */
export function playItem (id: string) {
  return function (dispatch, getState) {
    const player = settings.get('player');
    const { PlayListItems } = getState();
    const item = PlayListItems.find(item => (item.get('id') === id));
    if (!item.get('file') && !item.get('isLoading')) {
      dispatch(fetchItem(item, player.autoplay));
    } else {
      dispatch(playPauseItem(item.get('id'), true));
    }
    return dispatch(receiveItem(item.id));
  }
}

/**
 * Receive Item.
 * Downloads the item if no local file
 * @param  {String} id of the youtube video
 * @return {null}
 */
export function receiveItem (id: string) {
  return async function (dispatch, getState) {
    const player = settings.get('player');
    const { preload } = player;
    if(!preload.active) {
      return false;
    }
    const { PlayListItems } = getState();
    const index = PlayListItems.findIndex(item => (item.get('id') === id));
    for(let i = (index + 1); i < ((index + 1) + (preload.concurrency - 1)); i++) {
      const item = PlayListItems.get(i);
      if(!item.get('file') && !item.get('isLoading')) {
        dispatch(fetchItem(item, false));
      }
    }
  }
}

/*

youtube playlist formatter

$.(
  $AccName := function() { $.contentDetails.duration };
  $.{
    'id': id,
    'title': snippet.title,
    'name': snippet.title,
    'artists': [{
      'id': 'sfasdf',
      'name': 'nook'
    }],
    'description': snippet.description,
    'thumbnails': snippet.thumbnails,
    'duration': $parseDuration(contentDetails.duration)
  }
)
*/
// $.($AccName := function() { $.contentDetails.duration };$.{'id': id,'title': snippet.title,'name': snippet.title,'artists': [{'id': 'sfasdf','name': 'nook'}],'description': snippet.description,'thumbnails': snippet.thumbnails,'duration': $parseDuration(contentDetails.duration)})

export function getCurrent () {
  return async function (dispatch, getState) {
    const playListStore = new PlayListStore();
    return dispatch(receivePlayListItems(playListStore.playlist.tracks));
  };
};

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

export function fetchListItems (id: string) {
  return async function (dispatch, getState) {
    const playList = await youtube.getPlayListItems(id);
    const ids = playList.map(item => item.snippet.resourceId.videoId);
    const disabled = playList.filter(item => item.status.privacyStatus != 'public').map(item => item.snippet.resourceId.videoId);
    console.info('ids', ids, 'disabled', disabled)
    const items = await youtube.getVideos(ids);
    try {
      const plugins = settings.get('plugins');
      const formatter = jsonata(plugins.youtube.playlist.formatter);
      formatter.registerFunction('parseDuration', (duration) => parseDuration(duration), '<s:n>');
      const payload = formatter.evaluate(items);
      return dispatch(receivePlayListItems(payload));
    } catch (error) {
      console.error(error);
      return dispatch({type: 'ERROR', error: error});
    }
  };
}

export const receivePlayList = payload => ({ type: 'RECEIVE_LIST', payload });

export function fetchList (id: string) {
  return async function (dispatch, getState) {
    const state = getState();
    try {
      const playList = await youtube.getPlayList(id);
      const item = playList.items.pop();
      if (item) {
        dispatch(receivePlayList({
          id: getObjectProperty(item, 'id'),
          title: getObjectProperty(item, 'snippet.title'),
          description: getObjectProperty(item, 'snippet.description'),
          publishedAt: getObjectProperty(item, 'snippet.publishedAt'),
        }));
      }
      console.debug(playList);
    } catch (error) {
      console.error(error);
      return dispatch({type: 'ERROR', error: error});
    }
  }
}