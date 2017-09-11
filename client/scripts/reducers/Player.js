import { List, Map, Record } from 'immutable';

const Toolbar = Record({
  equalizer: false,
  levels: true,
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


const initialToolbar = new Toolbar();

export function ToolBar (state = initialToolbar, action) {
  switch (action.type) {
    case 'TOOLBAR_OPTIONS': {
      let toolbar = new Toolbar(action.payload);
      return toolbar;
    }
    default:
      return state;
  }
}

const audio = {
  context: null,
  analyser: null,
  wavesurfer: null
};

export function Audio (state = audio, action) {
  switch (action.type) {

    case 'CONTEXT': {
      state.context = action.payload;
      return state;
    }

    case 'ANALYSER': {
      state.analyser = action.payload;
      return state;
    }

    case 'WAVESURFER': {
      state.wavesurfer = action.payload;
      return state;
    }

    default:
      return state;
  }
}

