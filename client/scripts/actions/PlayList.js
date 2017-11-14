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

import { PlayListActionKeys as Action } from '../types';
import schema from '../../schemas/playlist.json';
import { DialogOptions } from '../types/PlayList';
import getObjectProperty from 'lodash/get';
import jsonata from 'jsonata';
import {
  Youtube,
  Transcoder,
  Time,
  parseDuration,
  SettingsStore,
  PlayListStore,
  PluginManager,
  Modal
  // DownloadManager,
  // HttpDownloader
} from '../lib';
import fs from 'fs';
import * as fileSystem from '../lib/FileSystem';
import Metadata from '../lib/Metadata';
import os from 'os';
import path from 'path';
import sanitize from 'sanitize-filename';
import { shell, remote, dialog } from 'electron';
import { Howl } from 'howler';

import { formatJSON } from './PlayList/InPout';

// window.dw = new DownloadManager();
// window.ht = new HttpDownloader()

const settings = window.settings = new SettingsStore();
const plugins = settings.get('plugins');
const download = settings.get('download');
const youtube = new Youtube({
  apiKey: settings.get('plugins.youtube.apiKey'),
  options: {
    download: settings.get('download')
  }
});

export const addItem = (id: string, payload: Object) => ({ type: Action.ADD_ITEM, id});
export const deleteItem = (id: string) => ({ type: Action.DELETE_ITEM, id });
export const editItem = (id: string, payload) => ({ type: Action.EDIT_ITEM, id, payload });
export const editItems = (payload: Object) => ({ type: Action.EDIT_ITEMS, payload });
export const selectItems = (payload: any) => ({ type: Action.SELECT_ITEMS, payload });
export const selectItem = (payload: any) => ({ type: Action.SELECT_ITEM, payload });
export const selectIndex = (payload: number) => ({ type: Action.SELECT_INDEX, payload });
export const createFrom = payload => ({type: 'CREATEFROM', payload});
export const playPauseItem = (id: string, payload) => ({ type: Action.PLAYPAUSE_ITEM, id, payload });
export const pauseItem = (id: string) => ({ type: Action.PAUSE_ITEM, id });
export const playNext = (id: string) => ({ type: Action.PLAY_NEXT_ITEM, id });
export const playPrevious = (id: string) => ({ type: Action.PLAY_PREVIOUS_ITEM, id });
export const stop = id => ({ type: 'STOP', id });
export const receivePlayListItems = payload => ({type: Action.RECEIVE_LIST_ITEMS, payload});
export const orderPlayList = (from, to) => ({ type: Action.ORDER_LIST, from, to });
export const downloadProgress = payload => ({type: Action.DOWNLOAD_PROGRESS, payload});


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
        return formatJSON(info, formatters.metainfo);
        // const formatter = jsonata(formatters.metainfo);
        // formatter.registerFunction('toFilename', string => sanitize(string), '<s:n>');
        // return formatter.evaluate(info);
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

async function getYoutubeMediaInfo(id: string) {
  try {
    const info = await youtube.getInfo(id);
    const formatter = `$.(
      $. {
        'status': status,
        'id': video_id,
        'title': title,
        'name': title,
        'filename': $toFilename(title),
        'description': description,
        'related': related_videos,
        'keywords': keywords,
        'rating': $number(avg_rating),
        'views': $number(view_count),
        'author': author
      }
    )`;
    return formatJSON(info, formatter);
  } catch (error) {
    console.error(error);
    return error;
  }
}

/**
 * Get media metainfo.
 */
export function getInfo(id: string) {
  return async function(dispatch, getState) {
    const { Settings } = getState();
    try {
      const info = await youtube.getInfo(id);
      // const { formatters: { metainfo: formatter } } = Settings.get('plugins.youtube');
      const formatter = `$.(
        $. {
          'status': status,
          'id': video_id,
          'title': title,
          'name': title,
          'filename': $toFilename(title),
          'description': description,
          'related': related_videos,
          'keywords': keywords,
          'rating': $number(avg_rating),
          'views': $number(view_count),
          'author': author
        }
      )`;
      const metainfo = formatJSON(info, formatter);
      dispatch(editItem(id, {
        rating: metainfo.rating,
        related: metainfo.related,
        keywords: metainfo.keywords,
        description: metainfo.description
      }));
      return
    } catch (error) {
      return dispatch({ type: 'ERROR', error });
    }
  };
}

export function viewMediaInfo(media) {
  return async function(dispatch, getState) {
    const { PlayListItems } = getState();
    try {
      const info = await getYoutubeMediaInfo(media.id);
      const modal = new Modal('/modal/media/metadata', info, { details: true, stats: true });
      return modal.show();
    } catch (error) {
      console.error(error);
      return dispatch({ type: 'ERROR', error });
    }
  };
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
 * addPlayListItem
 * Adds an item to the playlist
 * @return {null}
 */
export function addPlayListItem (source: string) {
  return async function (dispatch, getState) {
    const { Audio, Settings, PluginManager } = getState();
    const extensionWorker = PluginManager.invokeExtension('mediaPlayback', source);

    console.log('extensionWorker', extensionWorker);
    // const plugins = PluginManager.plugins.forEach((plugin, name) => {
    //   const { instance, availableExtensions } = plugin;
    //   if(availableExtensions.includes('extendMediaSources')) {
    //     const { extendMediaSources } = instance;
    //     const supportsSource = extendMediaSources(source);
    //     console.log('supportsSource', supportsSource);
    //   }
    // });
    // todo lookup source handlers
    // const regExp = new RegExp(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
    // const id = source.replace(regExp, '$1');
    // console.log('video id', id);

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

export function jumpTo (diraction: number, amount: number = 1) {
  return async function (dispatch, getState) {
    const { PlayListItems: items } = getState();
    if (Math.sign(direction) > 0) {

    } else {

    }
  };
  // jump: ({ item, items, player }) => (direction) => (event) => {
  //   const index = items.findIndex(({ id }) => (id === item.id));
  //   if (Math.sign(direction) > 0) {
  //     const nextIndex = ((index + 1) === items.length) ? 0 : index + 1;
  //     return player.play(items[nextIndex].file);
  //   } else {
  //     const prevIndex = (index === 0) ? (items.length - 1) : index - 1;
  //     return player.play(items[prevIndex].file);
  //   }
  // }
}

/**
 * Play Item.
 * Downloads the item if no local file
 * @param  {String} id of the youtube video
 * @return {null}
 */
export function playItem (item: Object) {
  return function (dispatch, getState) {
    const { Audio } = getState();
    const player = settings.get('player');
    console.log('Audio', Audio, player);
    if (!item.file && !item.isLoading) {
      dispatch(fetchItem(item, player.autoplay));
    } else {
      dispatch(playPauseItem(item.id, true));
    }
    return dispatch(preloadItems(item.id));
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

metainfo formatter:

$.(
  $. {
    'status': status,
    'id': video_id,
    'filename': $toFilename(title),
    'title': title,
    'description': description,
    'related_videos': related_videos,
    'keywords': keywords,
    'rating': avg_rating,
    'views': view_count,
    'author': author
  }
)
*/
// $.($AccName := function() { $.contentDetails.duration };$.{'id': id,'title': snippet.title,'name': snippet.title,'artists': [{'id': 'sfasdf','name': 'nook'}],'description': snippet.description,'thumbnails': snippet.thumbnails,'duration': $parseDuration(contentDetails.duration)})

export function getCurrent () {
  return async function (dispatch, getState) {
    const playListStore = new PlayListStore();
    return (
      dispatch(receivePlayListItems(playListStore.playlist.tracks)),
      dispatch(selectIndex(0))
    );
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


const playListFormatter = `$.(
  $AccName := function() { $.contentDetails.duration };
  $.{
    'id': id,
    'title': snippet.title,
    'name': snippet.title,
    'artists': [{
      'id': 'sfasdf',
      'name': 'nook'
    }],
    'url': 'http://www.youtube.com/watch?v='&id,
    'description': snippet.description,
    'thumbnails': snippet.thumbnails,
    'tags': snippet.tags,
    'duration': $parseDuration(contentDetails.duration)
  }
)`;
export function fetchListItems (id: string) {
  return async function (dispatch, getState) {
    const playList = await youtube.getPlayListItems(id);
    const ids = playList.map(item => item.snippet.resourceId.videoId);
    const restricted = youtube.findPrivate(playList).map(item => item.snippet.resourceId.videoId);
    const items = await youtube.getVideos(ids);
    const missing = youtube.findMissing(items, ids);
    console.log('ids', ids, 'private', restricted, 'missing', missing);
    try {
      const plugins = settings.get('plugins');
      const formatter = jsonata(playListFormatter);
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


export function alert (message: string) {
  return async function (dispatch, getState) {
    const state = getState();
    try {
      const result = dialog.showMessageBox({
        message,
        buttons: ['Ok']
      });
    } catch (error) {
      console.error(error);
      return dispatch({type: 'ERROR', error: error});
    }
  }
}


