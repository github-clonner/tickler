
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
