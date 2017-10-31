// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : ActionHelpers.js                                          //
// @summary      : Collection of Redux helpers                               //
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

import { createAction } from 'redux-actions';
import throttle from 'lodash/throttle';
import { isPromise } from './utils';

/*
 * Asynchronous action creator
 * Use this helper to call a methods that returns a Promise
 */
export const createAsyncAction = function (type: string, fn: Function, throttleable?: boolean = false, wait?: number = 1000) {
  /* throttle action dispatch */
  const throttled = throttle((...args) => fn(...args), wait, { trailing: true });
  /*
   * Lifecycle prefixes
   */
  const events = [ 'START', 'SUCCEEDED', 'FAILED', 'ENDED' ];
  const actionCreators = events
    .map(prefix => [ prefix, `${prefix}_${type}` ])
    .reduce((actions, [ prefix, name ]) => ({ ...actions, ...{ [prefix]: createAction(name) }}), {});

  const factory = (...args) => (dispatch, getState, extra) => {
    const startedAt = (new Date()).getTime();

    dispatch(actionCreators['START'](args));

    const succeeded = (data) => {
      dispatch(actionCreators['SUCCEEDED'](data));
      dispatch(actionCreators['ENDED']({ elapsed: (new Date()).getTime() - startedAt }));
      return data;
    };

    const failed = (error) => {
      dispatch(actionCreators['FAILED'](error));
      dispatch(actionCreators['ENDED']({ elapsed: (new Date()).getTime() - startedAt }));
      throw error;
    };

    try {
      const context = { dispatch, getState, extra };
      const result = throttleable ? throttled(...args, context) : fn(...args, context);
      /* in case of async (promise), use success and fail callbacks. */
      return isPromise(result) ? result.then(succeeded, failed) : succeeded(result);
    } catch (error) {
      console.error(error);
      return failed(error);
    }
  };

  factory.NAME = type;
  factory.START = actionCreators['START'].toString();
  factory.SUCCEEDED = actionCreators['SUCCEEDED'].toString();
  factory.FAILED = actionCreators['FAILED'].toString();
  factory.ENDED = actionCreators['ENDED'].toString();
  return factory;
};
