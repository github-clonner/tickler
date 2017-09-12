
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

