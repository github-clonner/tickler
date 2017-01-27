import { List, Map, Record } from 'immutable';

const Item = Record({
  id: null,
  kind: null,
  title: null,
  artist: null,
  album: null,
  year: 0,
  comment: null,
  track: 0,
  genre: null,
  thumbnails: null,
  lyrics: null,
  duration: 0,
  file: null,
  stars: 0,
  isLoading: false,
  isPlaying: false,
  isReady: false,
  progress: 0
});

const initialState = List([
  /*Map({
    id: '9DNoEXn4DSg',
    title: 'The Four Seasons',
    artist: '',
    album: '',
    year: 0,
    comment: '',
    track: 0,
    genre: '',
    thumbnails: '',
    lyrics: '',
    duration: 158,
    file: 'media/06_-_Vivaldi_Summer_mvt_3_Presto_-_John_Harrison_violin.ogg',
    stars: 4,
    isPlaying: true
  }),
  Map({
    id: '_mVW8tgGY_w',
    title: 'FurElise xx',
    duration: 176,
    file: 'media/FurElise.ogg',
    stars: 3
  })*/
]);

export default function Playlist (state = initialState, action) {
  let getIndex = id => {
    // Get item by id
    return state.findIndex(item => ( item.get('id') === id) );
  }
  let isPlaying = () => {
    // Is any item currently playing ?
    return state.some(item => (item.get('isPlaying') === true));
  }
  let pause = () => {
    // Find item that's playing
    let index = state.findIndex(item => (item.get('isPlaying') === true));
    if (index > -1) {
      return state.update(index, item => ( item.set('isPlaying', false) ));
    } else {
      return state;
    }
  }

  switch (action.type) {

    case 'RECEIVE_LIST': {
      let playlist = action.payload.map(element => {
        let item = new Item();
        return item.merge(element);
      });
      return List(playlist);
    }

    case 'CREATEFROM': {
      let playlist = action.payload.map(element => {
        let item = new Item();
        return item.merge(element);
      });
      return List(playlist);
    }

    case 'ADD_ITEM': {
      let item = new Item();
      return state.push(item.merge(action.payload));
    }

    case 'DELETE_ITEM': {
      let index = getIndex(action.id);
      if (index > -1) {
        return state.delete(index);
      } else {
        return state;
      }
    }

    case 'EDIT_ITEM': {
      let index = getIndex(action.id);
      if (index > -1) {
        return state.update(index, item => ( item.merge(Map(action.payload)) ));
      } else {
        return state;
      }
    }

    case 'PLAYPAUSE_ITEM': {
      let index = getIndex(action.id);
      if (index > -1) {
        return pause().update(index, item => ( item.set('isPlaying', action.playPause) ));
      } else {
        return state;
      }
    }

    case 'PLAY_NEXT_ITEM': {
      let index = getIndex(action.id);
      if (index > -1 && index + 1 < state.size) {
        return pause().update(index + 1, item => ( item.set('isPlaying', true) ));
      } else {
        return pause().update(0, item => ( item.set('isPlaying', true) ));
      }
    }

    case 'PLAY_PREVIOUS_ITEM': {
      let index = getIndex(action.id);
      if (index > -1 && index - 1 >= 0) {
        return pause().update(index - 1, item => ( item.set('isPlaying', true) ));
      } else {
        let paused = pause();
        return paused.update(paused.size, item => ( item.set('isPlaying', true) ));
      }
    }

    default:
      return state;
  }
}
