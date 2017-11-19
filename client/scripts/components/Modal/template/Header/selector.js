// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : selector.js                                               //
// @summary      : Header reselect selectors                                 //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 18 Nov 2017                                               //
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

import { createSelector } from 'reselect';

/* Get header state */
export const geHeader = state => state;

/* Get header actions */
export const getAction = (state, props) => {
  console.log('getAction', state, props);
  return state;
};

/* Get modal settings */
export const getModalSettings = (state, props) => {
  console.log('getModalSettings', state, props);
  return state;
};

/*
 * Redux Action Creators
 * Each key inside this object is assumed to be a Redux action creator
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
export const getHeaderActions = createSelector(
  [ getAction, geHeader ], function(action, header) {
    switch (action) {
      case 'CLOSE': return 'CLOSE';
      // case 'SHOW': return items.filter(({ file }) => !(file));
      // case 'MAXIMIZE': return items.filter(({ isLoading }) => (isLoading));
      // case 'MINIMIZE': return items.filter(({ isLoading }) => (isLoading));
      default:
        return items
    }
  }
);



