import Chance from 'chance';
import getObjectProperty from 'lodash/get';
import { Youtube, Time } from '../lib';

const options = {
  preload: true
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
export const createFrom = payload => ({type: 'CREATEFROM', payload});
export const playPauseItem = (id, payload) => ({ type: 'PLAYPAUSE_ITEM', id, payload });
export const playNext = (id) => ({ type: 'PLAY_NEXT_ITEM', id });
export const playPrevious = (id) => ({ type: 'PLAY_PREVIOUS_ITEM', id });
export const receivePlayList = payload => ({type: 'RECEIVE_LIST', payload});
export const orderPlayList = (from, to) => ({ type: 'ORDER_LIST', from, to });
export const receiveItem = (id, payload) => ({type: 'RECEIVE_ITEM', id, payload});
export const downloadProgress = payload => ({type: 'DOWNLOAD_PROGRESS', payload});


/* Async Operations */
export function fetchItem (item, autoPlay = false) {
  return async function (dispatch, getState) {
    let { Playlist } = getState();
    let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');
    let onProgress = ({video, progress}) => {
      dispatch(editItem(video.id, {
        isLoading: true,
        progress: progress
      }));
    };
    let fileName = null;

    youtube.events.on('progress', onProgress);

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
    let { Playlist } = getState();
    let index = Playlist.findIndex(item => (item.get('id') === id));
    let nextIndex = ((index + 1) === Playlist.size) ? 0 : index + 1;
    console.log(id, Playlist.get(index).toJS(), index, nextIndex, Playlist.size)
    let nextItem = Playlist.get(nextIndex);

    if(!nextItem.get('file') && !nextItem.get('isLoading')) {
      dispatch(fetchItem(nextItem, true));
    } else {
      dispatch(playPauseItem(nextItem.get('id'), true));
    }
  }
}

export function playItem (id) {
  return async function (dispatch, getState) {
    let { Playlist } = getState();
    let item = Playlist.find(item => (item.get('id') === id));

    if(!item.get('file') && !item.get('isLoading')) {
      console.log('fetch: ', item.get('id'), item.get('title'))
      dispatch(fetchItem(item, true));
    } else {
      dispatch(playPauseItem(item.get('id'), true));
    }
  }
}


export function fetchList (id) {
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
          url: "https://i.ytimg.com/vi/GDpmVUEjagg/default.jpg"
        }
      }
    };
    dispatch(receivePlayList(payload));
  };
}
