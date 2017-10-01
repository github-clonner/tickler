// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : PlayList.js                                               //
// @summary      : PlayList flow type definition                             //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Sep 2017                                               //
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

import type { Action } from './Action';
import { Track } from './Track';

export type PlayList = {
  id: string;
  name: string;
  description?: string | null;
  href?: string;
  tracks: Array<Track>;
};

export const PlayListActionKeys = {
  RECEIVE_LIST_ITEMS: 'RECEIVE_LIST_ITEMS',
  CREATEFROM: 'CREATEFROM',
  ADD_ITEM: 'ADD_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  EDIT_ITEM: 'EDIT_ITEM',
  EDIT_ITEMS: 'EDIT_ITEMS',
  PLAYPAUSE_ITEM: 'PLAYPAUSE_ITEM',
  PAUSE_ITEM: 'PAUSE_ITEM',
  PLAY_NEXT_ITEM: 'PLAY_NEXT_ITEM',
  PLAY_PREVIOUS_ITEM: 'PLAY_PREVIOUS_ITEM',
  STOP: 'STOP',
  ORDER_LIST: 'ORDER_LIST',
  SELECT_ITEMS: 'SELECT_ITEMS',
  SELECT_ITEM: 'SELECT_ITEM'
};

export type PlayListActions =
  | Action<typeof PlayListActionKeys.RECEIVE_LIST_ITEMS, any>
  | Action<typeof PlayListActionKeys.CREATEFROM, any>
  | Action<typeof PlayListActionKeys.ADD_ITEM, any>
  | Action<typeof PlayListActionKeys.DELETE_ITEM, any>
  | Action<typeof PlayListActionKeys.EDIT_ITEM, any>
  | Action<typeof PlayListActionKeys.EDIT_ITEMS, any>
  | Action<typeof PlayListActionKeys.PLAYPAUSE_ITEM, any>
  | Action<typeof PlayListActionKeys.PAUSE_ITEM, any>
  | Action<typeof PlayListActionKeys.PLAY_NEXT_ITEM, any>
  | Action<typeof PlayListActionKeys.PLAY_PREVIOUS_ITEM, any>
  | Action<typeof PlayListActionKeys.STOP, any>
  | Action<typeof PlayListActionKeys.ORDER_LIST, any>
  | Action<typeof PlayListActionKeys.SELECT_ITEMS, number>
  | Action<typeof PlayListActionKeys.SELECT_ITEM, number>
  ;
