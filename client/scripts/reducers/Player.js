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

export function Player (state = initialState, action) {
  switch (action.type) {
    case 'TOOLBAR_OPTIONS': {
      let toolbar = new Toolbar();
      return toolbar.merge(action.payload);
    }
    default:
      return state;
  }
}

const audio = {
  context: new AudioContext(),
  analyser: null
};

export function Audio (state = audio, action) {
  switch (action.type) {
    case 'CONTEXT': {
      state.context = context;
      return state;
    }
    case 'ANALYSER': {
      state.analyser = action.analyser;
      return {
        context: state.context,
        analyser: action.analyser
      };
    }
    default:
      return state;
  }
}
