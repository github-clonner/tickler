import { List, Map, Record } from 'immutable';

const Toolbar = Record({
  equalizer: false,
  levels: false,
  coverflow: false
});

const Controls = Record({
  play: false,
  pause: false,
  next: false,
  previous: false
});

const initialState = new Toolbar();

export default function Player(state = initialState, action) {
  switch(action.type) {
    case 'TOOLBAR_OPTIONS': {
      let toolbar = new Toolbar();
      return toolbar.merge(action.payload);
    }
    default:
      return state;
  }
}
