// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : configureStore.js                                         //
// @summary      : Redux store configuration                                 //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 28 Oct 2017                                               //
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

import thunk from 'redux-thunk';
import { remote } from 'electron';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import createHashHistory from 'history/createHashHistory';
import { PluginManager } from '../lib';
import { ClipBoardManager } from '../lib/ClipBoardManager';
import { TrayManager } from '../lib';
import { actionListener } from './StoreEnhancers';
import { MiddlewareManager } from './MiddlewareManager';
import * as reducers from '../reducers';

const MENU_TEMPLATE = [
  { label: 'item #1', type: 'radio' },
  { label: 'item #2', type: 'radio' },
  { label: 'item #3', type: 'radio', checked: true },
  { label: 'item #4', type: 'radio' }
];
// const trayManager = window.trayManager = new TrayManager({ menu: remote.Menu.buildFromTemplate(MENU_TEMPLATE)});

// Create a history of your choosing (we're using a browser history in this case)
export const history = createBrowserHistory({
  basename: window.location.pathname
});

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

/* hack */
window.goUrl =  (url) => {
  store.dispatch(push({
    pathname: url || '/about',
    state: { some: 'state' }
  }));
};

const enhancer = compose(
  applyMiddleware(thunk),
  applyMiddleware(routerMiddleware(history)),
  // applyMiddleware(trayManager.middleware)
  // applyMiddleware(PluginManager.middleware),
  // actionListener,
  // applyMiddleware(function ({ dispatch, getState }) {
  //   return (next) => action => {
  //     //console.log('will dispatch', action)
  //     // Call the next dispatch method in the middleware chain.
  //     let returnValue = next(action)

  //     //console.log('state after dispatch', getState())

  //     // This will likely be the action itself, unless
  //     // a middleware further in chain changed it.
  //     return returnValue
  //   }
  // })
);

export default (initialState) => createStore(reducer, initialState, enhancer);

