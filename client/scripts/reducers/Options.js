import { List, Map, Record } from 'immutable';

const DefaultOptions = Record({
  paths: null,
  package: null,
  playlist: ''
});

export function Options (state = new DefaultOptions(), action) {
  switch (action.type) {
    case 'PLAYER_OPTIONS': {
      let toolbar = new Toolbar();
      return toolbar.merge(action.payload);
    }
    default:
      return state;
  }
}