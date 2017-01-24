import { List, Map } from 'immutable';

export default function Playlist(playlist = List([]), action) {
  switch(action.type) {
    case 'ADD_ITEM':
      return playlist.push(Map(action.payload));
    default:
      return playlist;
  }
}
