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
export const playPauseItem = (id, playPause) => ({ type: 'PLAYPAUSE_ITEM', id, playPause });
export const playNext = (id) => ({ type: 'PLAY_NEXT_ITEM', id });
export const playPrevious = (id) => ({ type: 'PLAY_PREVIOUS_ITEM', id });
export const receivePlayList = payload => ({type: 'RECEIVE_LIST', payload});
export const orderPlayList = (from, to) => ({ type: 'ORDER_LIST', from, to });
export const receiveItem = (id, payload) => ({type: 'RECEIVE_ITEM', id, payload});
export const downloadProgress = payload => ({type: 'DOWNLOAD_PROGRESS', payload});


/* Async Operations */
export function fetchItem (item) {
  return async function (dispatch, getState) {
    let { Playlist } = getState();
    let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');
    let onProgress = ({video, progress}) => {
      dispatch(editItem(video.id, {
        isLoading: true,
        progress: progress
      }));
    };

    youtube.events.on('progress', onProgress);

    dispatch(editItem(item.id, {
      isLoading: true,
      progress: 0
    }));
    try {
      let fileName = await youtube.downloadVideo(item);
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
    }
  }
}

export function playNextItem (id) {
  return async function (dispatch, getState) {
    let { Playlist } = getState();
    let index = Playlist.findIndex(item => (item.get('id') === id));
    console.log(id, Playlist.toJS(), index)
    /*
    if (!item && !item.get('file')) {
      console.log('no File')
    } else {
      console.log(item.get('file'))
    }
    */
  }
}

export function fetchList (id) {
  //console.log('lodash:', _.VERSION, getObjectProperty)
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
