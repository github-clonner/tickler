import Chance from 'chance';
import getObjectProperty from 'lodash/get';
import { Youtube, Time } from '../lib';

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
    let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');
    let onProgress = ({video, progress}) => {
      dispatch(editItem(video.id, {
        isLoading: true,
        progress: progress
      }));
    };

    let onInfo = ({video, info}) => {
      console.debug(video, info)
    };

    let fileName = null;

    youtube.events.on('progress', onProgress);
    youtube.events.on('info', onInfo);

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
      youtube.events.removeListener('progress', onProgress);
      youtube.events.removeListener('info', onInfo);
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

export function fetchListItems (id) {
  return async function (dispatch, getState) {
    let state = getState();
    let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');
    let playList = await youtube.getPlayListItems(id);
    let ids = playList.map(item => getObjectProperty(item, 'snippet.resourceId.videoId'));
    let {items} = await youtube.getVideos(ids);
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
    payload[0] = {
      id: '_mVW8tgGY_w',
      title: 'FurElise xx',
      duration: 176,
      file: 'media/FurElise.ogg',
      stars: 3,
      thumbnails: {
        default: {
          url: "https://pbs.twimg.com/profile_images/1119269505/0509071614Peter_Griffin.jpg"
        }
      }
    };
    dispatch(receivePlayListItems(payload));
  };
}

export const receivePlayList = payload => ({ type: 'RECEIVE_LIST', payload });


export function fetchList (id) {
  return async function (dispatch, getState) {
    let state = getState();
    let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');
    try {
      let playList = await youtube.getPlayList(id);
      let item = playList.items.pop();
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
