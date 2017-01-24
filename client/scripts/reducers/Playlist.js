import { List, Map, Record } from 'immutable';

const Item = Record({
  id: null,
  title: null,
  artist: null,
  album: null,
  year: 0,
  comment: null,
  track: 0,
  genre: null,
  image: null,
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
  Map({
    id: '9DNoEXn4DSg',
    title: 'The Four Seasons',
    artist: '',
    album: '',
    year: 0,
    comment: '',
    track: 0,
    genre: '',
    image: '',
    lyrics: '',
    duration: 158,
    file: 'media/06_-_Vivaldi_Summer_mvt_3_Presto_-_John_Harrison_violin.ogg',
    stars: 4
  }),
  Map({
    id: '_mVW8tgGY_w',
    title: 'FurElise xx',
    duration: 176,
    file: 'media/FurElise.ogg',
    stars: 3
  })
]);

export default function Playlist(state = initialState, action) {
  let getIndex = id => {
    return state.findIndex(item => ( item.get('id') === id) );
  }
  let pause = () => {
    // Find item that's playing
    let index = state.find(item => (item.get('isPlaying') === true));
    return state.update(index, item => ( item.set('isPlaying', false) ));
  }

  switch(action.type) {
    case 'ADD_ITEM':
      let item = new Item();
      return state.push(item.merge(action.payload));
    case 'DELETE_ITEM': {
      let index = state.findIndex(item => (item.get('id') === action.id));
      return state.delete(index);
    }
    case 'EDIT_ITEM': {
      let index = state.findIndex(item => ( item.get('id') === action.id) );
      return state.update(index, item => ( item.merge(Map(action.payload)) ));
    }
    case 'PLAYPAUSE_ITEM': {
      let index = getIndex(action.id);
      return state.update(index, item => ( item.set('isPlaying', action.playPause) ));
    }
    default:
      return state;
  }
}
