///////////////////////////////////////////////////////////////////////////////
// @file         : Middleware.js                                             //
// @summary      : Redux Store Middleware                                    //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 29 Oct 2017                                               //
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

import { createStore } from 'redux';
import { isFSA } from 'flux-standard-action';

function isPromise(promise) {
  return promise && promise.then && promise.catch;
}

export const actionListener = function (createStore) {
  return (reducer, initialState, enhancer) => {
    const actionListeners = {};
    const store = createStore(reducer, initialState, enhancer);
    const dispatch = store.dispatch;
    store.dispatch = action => {
      if (!isFSA(action)) throw new Error('Invalid action');
      const result = dispatch(action);
      if (isPromise(result)) {
        console.log('isPromise', action)
      }
      if (action.type in actionListeners) {
        actionListeners[action.type].forEach((listener) => listener(action));
      }
      return result;
    };
    store.addActionListener = (actionType, listener) => {
      const { [actionType]: listeners = [ ] } = actionListeners;
      actionListeners[actionType] = [ ...listeners, listener ];
      return () => {
        actionListeners[actionType] = listeners.filter((l) => l !== listener);
      };
    };
    return store;
  };
};



