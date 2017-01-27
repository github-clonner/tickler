import { Youtube, Time } from '../lib';
import Chance from 'chance';
import getObjectProperty from 'lodash/get';

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

export function fetchList(id) {
  //console.log('lodash:', _.VERSION, getObjectProperty)
  return async function(dispatch, getState) {
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
  }
}
