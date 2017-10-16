// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : items.js                                                //
// @summary      : items selector                                            //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Oct 2017                                               //
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

import { createSelector } from 'reselect'

/* Get all items */
export const getItems = state => state;

/* Get selected item*/
export const getSelected = items => items
  .filter(item => item.get('file'))
  .filter(item => item.get('selected'))
  .first();

/* Get next item*/
export const getNext = items => items
  .skip(items.indexOf(getSelected(items)) + 1)
  .filter(item => item.get('file'))
  .first();

/* Get previous item */
export const getPrev = items => items
  .skipLast(items.indexOf(getSelected(items)) -1)
  .filter(item => item.get('file'))
  .first();

/*
 * Redux Action Creators
 * Each key inside this object is assumed to be a Redux action creator
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
export const getItemsBy = (state, props) => {
  return state.filter(item => item.get('file'));
};

export const getShuffledItems = state => state
  .map(item => ({ sort: Math.random(), value: item }))
  .sort((a, b) => a.sort > b.sort ? 1 : -1)
  .map((a) => a.value)

/*
 * Redux Action Creators
 * Each key inside this object is assumed to be a Redux action creator
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
export const getFilteredItems = createSelector(
  [ getItemsBy, getItems ], function(filter, items) {
    console.log('getFilteredItems', filter.size, items.size);
    switch (filter) {
      case 'SHOW_LOCAL': return items.filter(({ file }) => (file));
      case 'SHOW_REMOTE': return items.filter(({ file }) => !(file));
      case 'SHOW_SELECTED': return items.filter(({ selected }) => (selected))
      case 'SHOW_LOADING': return items.filter(({ isLoading }) => (isLoading))
      default:
        return items
    }
  }
);



