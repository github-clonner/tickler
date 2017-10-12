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

import { PlayListActionKeys as Action } from '../types';
import { List } from 'immutable';
import MapEx from '../lib/MapEx';

export default function PlayListItems (state = List([]), action) {

  // Get item by id
  const getIndex = function (id) {
    return state.findIndex(item => ( item.get('id') === id) );
  };

  // Is any item currently playing ?
  const isPlaying = function () {
    return state.some(item => (item.get('isPlaying') === true));
  };

  // Find item that's playing
  const pause = function () {
    const index = state.findIndex(item => (item.get('isPlaying') === true));
    if (index > -1) {
      return state.update(index, item => (item.set('isPlaying', false).set('selected', false) ));
    } else {
      return state;
    }
  };

  const unselect = () => state.map(item => item.get('selected') ? item.set('selected', false) : item);

  switch (action.type) {

    case Action.RECEIVE_LIST_ITEMS: {
      const playlist = action.payload.map(item => new MapEx(item));
      return List(playlist);
    }

    case Action.CREATEFROM: {
      const playlist = action.payload.map(element => {
        const item = new MapEx();
        return item.merge(element);
      });
      return List(playlist);
    }

    case Action.ADD_ITEM: {
      const item = new MapEx();
      return state.push(item.merge(action.payload));
    }

    case Action.DELETE_ITEM: {
      const index = getIndex(action.id);
      if (index > -1) {
        return state.delete(index);
      } else {
        return state;
      }
    }

    case Action.EDIT_ITEM: {
      const index = getIndex(action.id);
      if (index > -1) {
        return state.update(index, item => ( item.merge(action.payload) ));
      } else {
        return state;
      }
    }

    case Action.EDIT_ITEMS: {
      return state.map(item => {
        const id = item.get('id');
        return action.payload.hasOwnProperty(id) ? item.merge(action.payload[id]) : item;
      });
    }

    case Action.PLAYPAUSE_ITEM: {
      const index = getIndex(action.id);
      if (index > -1) {
        const isPlaying = action.payload;
        return pause().update(index, item => ( item.set('isPlaying', isPlaying).set('selected', true) ));
      } else {
        return state;
      }
    }

    case Action.PAUSE_ITEM: {
      const index = getIndex(action.id);
      if (index > -1) {
        return state.update(index, item => item.set('isPlaying', false));
      } else {
        return state;
      }
    }

    case Action.PLAY_NEXT_ITEM: {
      const index = getIndex(action.id);
      if (index > -1 && index + 1 < state.size) {
        return pause().update(index + 1, item => ( item.set('isPlaying', true).set('selected', true) ));
      } else {
        return pause().update(0, item => ( item.set('isPlaying', true) ));
      }
    }

    case Action.PLAY_PREVIOUS_ITEM: {
      const index = getIndex(action.id);
      if (index > -1 && index - 1 >= 0) {
        return pause().update(index - 1, item => ( item.set('isPlaying', true) ));
      } else {
        const paused = pause();
        return paused.update(paused.size, item => ( item.set('isPlaying', true) ));
      }
    }

    case Action.STOP: {
      return pause();
    }

    case Action.ORDER_LIST: {
      const from = state.get(action.from);
      const to = state.get(action.to);
      state = state.delete(action.from).insert(action.to, from);
      console.log(from.toJS(), to.toJS())
      return state;
    }

    case Action.SELECT_ITEMS: {
      const selected = List(action.payload.map(item => new MapEx(item)));
      return state.map(item => selected.includes(item) ? item.set('selected', true) : item.set('selected', false));
    }

    case Action.SELECT_ITEM: {
      const index = state.indexOf(new MapEx(action.payload));
      return unselect().update(index, item => item.set('selected', true));
    }

    case Action.SELECT_INDEX: {
      const index = parseInt(action.payload, 10);
      if (Number.isInteger(index) && Math.sign(index) >= 0) {
        return unselect().update(action.payload, item => item.set('selected', true));
      } else {
        return state;
      }
    }

    default:
      return state;
  }
}
