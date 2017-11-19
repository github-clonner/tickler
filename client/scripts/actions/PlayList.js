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
    const formatter = `$. {
      'id': video_id,
      'title': title,
      'name': title,
      'filename': $string(title),
      'description': description,
      'image': iurlhq,
      'related': $.(
        related_videos.{
          'id': id,
          'duration': $number(length_seconds),
          'type': $string($exists(list) ? 'list' : 'media'),
          'list': list,
          'image': $string(iurlhq & playlist_iurlhq),
          'title': $string(title & playlist_title),
          'views': short_view_count_text,
          'size': $number(playlist_length),
          'author': author
        }
      ),
      'formats': $.(
        formats.{
          'quality': $string(quality & quality_label),
          'fps': fps,
          'type': type,
          'size': size,
          'container': container,
          'resolution': resolution,
          'encoding': encoding,
          'profile': profile,
          'bitrate': bitrate,
          'audioEncoding': audioEncoding,
          'audioBitrate': audioBitrate
        }
      ),
      'keywords': keywords,
      'rating': $number(avg_rating),
      'views': $number(view_count),
      'author': author,
      'status': status
    }`;
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
      const metainfo = await getYoutubeMediaInfo(id);
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
      // const INFOX = await getYoutubeMediaInfo(media.id);
      // console.log('INFOX', JSON.stringify(INFOX, 0, 2))
      const info = {id:"tEJpLDEOivA",title:"Daft Punk - Voyager",name:"Daft Punk - Voyager",filename:"Daft Punk - Voyager",description:"Daft Punk - Voyager",image:"https://i.ytimg.com/vi/tEJpLDEOivA/hqdefault.jpg",related:[{id:"dh3jFRvYvDE",duration:346,type:"media",image:"https://i.ytimg.com/vi/dh3jFRvYvDE/hqdefault.jpg",title:"Daft Punk - Veridis Quo",views:"1.4M views",author:"Costa Ntino"},{list:"RDtEJpLDEOivA",type:"list",image:"https://i.ytimg.com/vi/tEJpLDEOivA/hqdefault.jpg",title:"Mix - Daft Punk - Voyager",size:0},{id:"zNRbP7U0Iq8",duration:241,type:"media",image:"https://i.ytimg.com/vi/zNRbP7U0Iq8/hqdefault.jpg",title:"Daft Punk - Face To Face",views:"4.4M views",author:"Costa Ntino"},{id:"QOngRDVtEQI",duration:299,type:"media",image:"https://i.ytimg.com/vi/QOngRDVtEQI/hqdefault.jpg",title:"Daft Punk - Digital Love",views:"10M views",author:"Costa Ntino"},{id:"mCnJ2_xN2jU",duration:209,type:"media",image:"https://i.ytimg.com/vi/mCnJ2_xN2jU/hqdefault.jpg",title:"Daft Punk - Aerodynamic",views:"5.2M views",author:"Costa Ntino"},{list:"PLjIuADMrDKIb_TAE3RsW8kffG9N9LxjrU",type:"list",image:"https://i.ytimg.com/vi/n6RTF4OPzf8/hqdefault.jpg",title:"Daft Punk - Discovery full album",size:14},{id:"yca6UsllwYs",duration:431,type:"media",image:"https://i.ytimg.com/vi/yca6UsllwYs/hqdefault.jpg",title:"Daft Punk - Around The World",views:"30M views",author:"Costa Ntino"},{id:"Oq77lLDEFGY",duration:601,type:"media",image:"https://i.ytimg.com/vi/Oq77lLDEFGY/hqdefault.jpg",title:"Daft Punk - Too Long",views:"982K views",author:"Costa Ntino"},{id:"sIv17mT9pBc",duration:232,type:"media",image:"https://i.ytimg.com/vi/sIv17mT9pBc/hqdefault.jpg",title:"Daft Punk - Something About Us",views:"2.5M views",author:"Costa Ntino"},{id:"X4fa44_sq2E",duration:239,type:"media",image:"https://i.ytimg.com/vi/X4fa44_sq2E/hqdefault.jpg",title:"Daft Punk - Superheroes",views:"1.4M views",author:"Costa Ntino"},{id:"TBXv37PFcAQ",duration:350,type:"media",image:"https://i.ytimg.com/vi/TBXv37PFcAQ/hqdefault.jpg",title:"Daft Punk - Lose Yourself To Dance",views:"43M views",author:"neonwiretv"},{id:"GDpmVUEjagg",duration:225,type:"media",image:"https://i.ytimg.com/vi/GDpmVUEjagg/hqdefault.jpg",title:"Daft Punk - Harder, Better, Faster, Stronger",views:"26M views",author:"Costa Ntino"}],formats:[{quality:"hd720",type:'video/mp4; codecs="avc1.64001F, mp4a.40.2"',container:"mp4",resolution:"720p",encoding:"H.264",profile:"high",bitrate:"2-3",audioEncoding:"aac",audioBitrate:192},{quality:"medium",type:'video/webm; codecs="vp8.0, vorbis"',container:"webm",resolution:"360p",encoding:"VP8",profile:null,bitrate:"0.5-0.75",audioEncoding:"vorbis",audioBitrate:128},{quality:"medium",type:'video/mp4; codecs="avc1.42001E, mp4a.40.2"',container:"mp4",resolution:"360p",encoding:"H.264",profile:"baseline",bitrate:"0.5",audioEncoding:"aac",audioBitrate:96},{quality:"small",type:'video/3gpp; codecs="mp4v.20.3, mp4a.40.2"',container:"3gp",resolution:"240p",encoding:"MPEG-4 Visual",profile:"simple",bitrate:"0.175",audioEncoding:"aac",audioBitrate:32},{quality:"small",type:'video/3gpp; codecs="mp4v.20.3, mp4a.40.2"',container:"3gp",resolution:"144p",encoding:"MPEG-4 Visual",profile:"simple",bitrate:"0.05",audioEncoding:"aac",audioBitrate:24},{quality:"1080p",fps:"25",type:'video/mp4; codecs="avc1.640028"',size:"1920x1080",container:"mp4",resolution:"1080p",encoding:"H.264",profile:"high",bitrate:"2.5-3",audioEncoding:null,audioBitrate:null},{quality:"1080p",fps:"25",type:'video/webm; codecs="vp9"',size:"1920x1080",container:"webm",resolution:"1080p",encoding:"VP9",profile:"profile 0",bitrate:"1.5",audioEncoding:null,audioBitrate:null},{quality:"720p",fps:"25",type:'video/mp4; codecs="avc1.4d401f"',size:"1280x720",container:"mp4",resolution:"720p",encoding:"H.264",profile:"main",bitrate:"1-1.5",audioEncoding:null,audioBitrate:null},{quality:"720p",fps:"25",type:'video/webm; codecs="vp9"',size:"1280x720",container:"webm",resolution:"720p",encoding:"VP9",profile:"profile 0",bitrate:"0.7-0.8",audioEncoding:null,audioBitrate:null},{quality:"480p",fps:"25",type:'video/mp4; codecs="avc1.4d401e"',size:"854x480",container:"mp4",resolution:"480p",encoding:"H.264",profile:"main",bitrate:"0.5-1",audioEncoding:null,audioBitrate:null},{quality:"480p",fps:"25",type:'video/webm; codecs="vp9"',size:"854x480",container:"webm",resolution:"480p",encoding:"VP9",profile:"profile 0",bitrate:"0.5",audioEncoding:null,audioBitrate:null},{quality:"360p",fps:"25",type:'video/mp4; codecs="avc1.4d401e"',size:"640x360",container:"mp4",resolution:"360p",encoding:"H.264",profile:"main",bitrate:"0.3-0.4",audioEncoding:null,audioBitrate:null},{quality:"360p",fps:"25",type:'video/webm; codecs="vp9"',size:"640x360",container:"webm",resolution:"360p",encoding:"VP9",profile:"profile 0",bitrate:"0.25",audioEncoding:null,audioBitrate:null},{quality:"240p",fps:"25",type:'video/mp4; codecs="avc1.4d4015"',size:"426x240",container:"mp4",resolution:"240p",encoding:"H.264",profile:"main",bitrate:"0.2-0.3",audioEncoding:null,audioBitrate:null},{quality:"240p",fps:"25",type:'video/webm; codecs="vp9"',size:"426x240",container:"webm",resolution:"240p",encoding:"VP9",profile:"profile 0",bitrate:"0.1-0.2",audioEncoding:null,audioBitrate:null},{quality:"144p",fps:"25",type:'video/mp4; codecs="avc1.4d400c"',size:"256x144",container:"mp4",resolution:"144p",encoding:"H.264",profile:"main",bitrate:"0.1",audioEncoding:null,audioBitrate:null},{quality:"144p",fps:"13",type:'video/webm; codecs="vp9"',size:"256x144",container:"webm",resolution:"144p 15fps",encoding:"VP9",profile:"profile 0",bitrate:"0.08",audioEncoding:null,audioBitrate:null},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:160},{quality:"",type:'audio/mp4; codecs="mp4a.40.2"',container:"m4a",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"aac",audioBitrate:128},{quality:"",type:'audio/webm; codecs="vorbis"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"vorbis",audioBitrate:128},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:64},{quality:"",type:'audio/webm; codecs="opus"',container:"webm",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"opus",audioBitrate:48},{quality:"",container:"mp4",resolution:null,encoding:null,profile:null,bitrate:null,audioEncoding:"aac",audioBitrate:48}],keywords:["Discovery","Daft Punk (Musical Group)","Voyager"],rating:4.91556906451,views:2634455,author:{id:"UCIVB9h04X5FXmx7r9zatZJQ",name:"Costa Ntino",avatar:"https://yt3.ggpht.com/-lZQMUToQIF8/AAAAAAAAAAI/AAAAAAAAAAA/qnfriszfzlY/s88-c-k-no-mo-rj-c0xffffff/photo.jpg",user:"aimo10",channel_url:"https://www.youtube.com/channel/UCIVB9h04X5FXmx7r9zatZJQ",user_url:"https://www.youtube.com/user/aimo10"},status:"ok"};
      const modal = new Modal('/modal/media/metadata', info, { details: true, stats: true });
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


