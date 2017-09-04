///////////////////////////////////////////////////////////////////////////////
// @file         : PlayListItems.js                                          //
// @summary      :                                                           //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 17 Jul 2017                                               //
// @license:     : MIT                                                       //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2017 Benjamin Maggi <benjaminmaggi@gmail.com>                   //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

import { List, Map, Record } from 'immutable';

/*const Item = Record({
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
  selected: false,
  progress: 0
});*/

const ItemTemplate = Object.freeze({
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
  selected: false,
  progress: 0,
  status: null
});

class Item extends Record(ItemTemplate) {
  constructor(values, name) {
    const props = new Set(Object.keys(ItemTemplate));
    const newValues = {};
    for (let prop of props) {
      newValues[prop] = values[prop] || ItemTemplate[prop];
    }
    super(newValues);
  }
}

const PlayListInfo = Record({
  id: null,
  title: null,
  description: null,
  publishedAt: null,
  uri: null,
  tracks: null
});

export function PlayList (state = {}, action) {
  switch (action.type) {
    case 'RECEIVE_LIST': {
      console.log('RECEIVE_LIST');
      // return new PlayListInfo(action.payload);
    }
    default:
      return state;
  }
}

export default function PlayListItems (state = List([]), action) {

  const getIndex = function (id) {
    // Get item by id
    return state.findIndex(item => ( item.get('id') === id) );
  };

  const isPlaying = function () {
    // Is any item currently playing ?
    return state.some(item => (item.get('isPlaying') === true));
  };

  const pause = function () {
    // Find item that's playing
    const index = state.findIndex(item => (item.get('isPlaying') === true));
    if (index > -1) {
      return state.update(index, item => (item.set('isPlaying', false).set('selected', false) ));
    } else {
      return state;
    }
  };

  switch (action.type) {

    case 'RECEIVE_LIST_ITEMS': {
      const playlist = action.payload.map(item => {
        // let item = new Item();
        // return item.merge(item);
        return new Item(item);
      });
      return List(playlist);
    }

    case 'CREATEFROM': {
      const playlist = action.payload.map(element => {
        const item = new Item();
        return item.merge(element);
      });
      return List(playlist);
    }

    case 'ADD_ITEM': {
      const item = new Item();
      return state.push(item.merge(action.payload));
    }

    case 'DELETE_ITEM': {
      const index = getIndex(action.id);
      if (index > -1) {
        return state.delete(index);
      } else {
        return state;
      }
    }

    case 'EDIT_ITEM': {
      const index = getIndex(action.id);
      if (index > -1) {
        return state.update(index, item => ( item.merge(Map(action.payload)) ));
      } else {
        return state;
      }
    }

    case 'PLAYPAUSE_ITEM': {
      const index = getIndex(action.id);
      if (index > -1) {
        return pause().update(index, item => ( item.set('isPlaying', action.payload).set('selected', true) ));
      } else {
        return state;
      }
    }

    case 'PLAY_NEXT_ITEM': {
      console.log('PLAY_NEXT_ITEM', action.id)
      const index = getIndex(action.id);
      if (index > -1 && index + 1 < state.size) {
        return pause().update(index + 1, item => ( item.set('isPlaying', true).set('selected', true) ));
      } else {
        return pause().update(0, item => ( item.set('isPlaying', true) ));
      }
    }

    case 'PLAY_PREVIOUS_ITEM': {
      const index = getIndex(action.id);
      if (index > -1 && index - 1 >= 0) {
        return pause().update(index - 1, item => ( item.set('isPlaying', true) ));
      } else {
        const paused = pause();
        return paused.update(paused.size, item => ( item.set('isPlaying', true) ));
      }
    }

    case 'STOP': {
      return pause();
    }

    case 'ORDER_LIST': {
      const from = state.get(action.from);
      const to = state.get(action.to);
      state = state.delete(action.from).insert(action.to, from);
      console.log(from.toJS(), to.toJS())
      return state;
    }

    case 'SELECT_ITEMS': {
      return state.map(item => {
        const selected = (action.payload.indexOf(item.get('id')) > -1);
        return item.merge({
          selected: selected
        });
      });
      // return state
      //   .update(selectedIndex, item => ( item.set('selected', false) )).map(item => )
        //.update(index, item => ( item.set('selected', true) ));
    }

    default:
      return state;
  }
}
