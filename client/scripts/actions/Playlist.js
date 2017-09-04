import Chance from 'chance';
import schema from '../../schemas/playlist.json';
import getObjectProperty from 'lodash/get';
import jsonata from 'jsonata';
import Ajv from 'ajv';
import { Youtube, Time, parseDuration, SettingsStore, getPath } from '../lib';
import fs from 'fs';
import os from 'os';
import path from 'path';

const customFormats = {
  'uint32': {
    validate(data) { return Number.isInteger(data) },
    type: 'number'
  },
  'int32': {
    validate(data) { return Number.isInteger(data) },
    type: 'number'
  },
  'uint64': {
    validate(data) { return Number.isInteger(data) },
    type: 'number'
  },
  'int64': {
    validate(data) { return Number.isInteger(data) },
    type: 'number'
  },
  'double': {
    validate(data) { return Number.isFinite(data) },
    type: 'number'
  }
};

const ajv = new Ajv({
  formats: customFormats,
  allErrors: true,
  unknownFormats: 'ignore'
});

const settings = new SettingsStore();
const youtube = new Youtube({
  apiKey: 'AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU',
  options: {
    saveTo: os.tmpdir()
  }
});
const options = {
  preload: {
    active: false,
    items: 1
  }
};

export const addItem = ({id, title, duration, file, stars}) => {
  return {
    type: 'ADD_ITEM',
    payload: {
      id,
      title,
      duration,
      file,
      stars
    }
  };
};

export const deleteItem = id => ({ type: 'DELETE_ITEM', id });
export const editItem = (id, payload) => ({ type: 'EDIT_ITEM', id, payload });
export const selectItems = payload => ({ type: 'SELECT_ITEMS', payload });
export const createFrom = payload => ({type: 'CREATEFROM', payload});
export const playPauseItem = (id, payload) => ({ type: 'PLAYPAUSE_ITEM', id, payload });
export const playNext = (id) => ({ type: 'PLAY_NEXT_ITEM', id });
export const playPrevious = (id) => ({ type: 'PLAY_PREVIOUS_ITEM', id });
export const stop = id => ({ type: 'STOP', id });
export const receivePlayListItems = payload => ({type: 'RECEIVE_LIST_ITEMS', payload});
export const orderPlayList = (from, to) => ({ type: 'ORDER_LIST', from, to });
export const downloadProgress = payload => ({type: 'DOWNLOAD_PROGRESS', payload});


/* Async Operations */
export function fetchItem (item, autoPlay = false) {
  return async function (dispatch, getState) {
    const onProgress = ({video, progress}) => {
      dispatch(editItem(video.id, {
        isLoading: true,
        progress: progress
      }));
    };

    const onInfo = ({video, info}) => {
      console.debug(video, info)
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

export function playNextItem (id) {
  return async function (dispatch, getState) {
    let { PlayListItems } = getState();
    let index = PlayListItems.findIndex(item => (item.get('id') === id));
    let nextIndex = ((index + 1) === PlayListItems.size) ? 0 : index + 1;
    console.log(id, PlayListItems.get(index).toJS(), index, nextIndex, PlayListItems.size)
    let nextItem = PlayListItems.get(nextIndex);

    if(!nextItem.get('file') && !nextItem.get('isLoading')) {
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
export function playItem (id) {
  return function (dispatch, getState) {
    let { PlayListItems } = getState();
    let item = PlayListItems.find(item => (item.get('id') === id));
    if(!item.get('file') && !item.get('isLoading')) {
      dispatch(fetchItem(item, true));
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
export function receiveItem (id) {
  return async function (dispatch, getState) {
    if(!options.preload.active) {
      return false;
    }
    let { PlayListItems } = getState();
    let index = PlayListItems.findIndex(item => (item.get('id') === id));
    for(let i = (index + 1); i <= (index + options.preload.items); i++) {
      let item = PlayListItems.get(i);
      if(!item.get('file') && !item.get('isLoading')) {
        console.log('preload: ', item.get('title'))
        return dispatch(fetchItem(item, false));
        dispatch(editItem(item.get('id'), {
          isLoading: true,
        }));
      }
    }
  }
}

const playlistQuery = jsonata(`
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
`);
playlistQuery.registerFunction('parseDuration', (duration) => parseDuration(duration), '<s:n>');

export function getCurrent () {
  return async function (dispatch, getState) {
    const { current, folders } = settings.get('playlist');
    const file = folders
    .map(folder => {
      return path.isAbsolute(folder) ? path.join(folder, current) : path.join(getPath(folder), current);
    })
    .find(file => {
      return fs.existsSync(file);
    });

    if (file) {
      try {
        const playlist = JSON.parse(fs.readFileSync(file, options));
        const validate = ajv.compile(schema);
        if (validate(playlist)) {
          console.log('playlist:', playlist);
          return dispatch(receivePlayListItems(playlist.tracks));
        } else {
          console.error(validate.errors);
          throw new Error('Unknown playlist format');
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      throw new Error('PlayList not found');
    }
  };
};

export function fetchListItems (id) {
  return async function (dispatch, getState) {
    const playList = await youtube.getPlayListItems(id);
    const ids = playList.map(item => item.snippet.resourceId.videoId);
    const disabled = playList.filter(item => item.status.privacyStatus != 'public').map(item => item.snippet.resourceId.videoId);
    console.info('ids', ids, 'disabled', disabled)
    const items = await youtube.getVideos(ids);
    try {
      const payload = playlistQuery.evaluate(items);
      console.log('payload', payload);
      return dispatch(receivePlayListItems(payload));
    } catch (error) {
      console.error(error);
      return error;
    }

    /*
    let chance = new Chance();
    let payload = items.map(item => {
      let time = new Time(getObjectProperty(item, 'contentDetails.duration'));
      return {
        id: item.id,
        kind: item.kind,
        title: getObjectProperty(item, 'snippet.title'),
        duration: time.toTime(),
        thumbnails: getObjectProperty(item, 'snippet.thumbnails'),
        stars: chance.integer({min: 0, max: 5})
      };
    });
    dispatch(receivePlayListItems(payload));
    */
  };
}

export const receivePlayList = payload => ({ type: 'RECEIVE_LIST', payload });

export function fetchList (id) {
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
    }
  }
}
