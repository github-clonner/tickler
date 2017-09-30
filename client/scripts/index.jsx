///////////////////////////////////////////////////////////////////////////////
// @file         : index.jsx                                                 //
// @summary      : Application entry point                                   //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Feb 2017                                               //
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

import { remote } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import url, { URLSearchParams } from 'url';
/* redux stuff */
import thunk from 'redux-thunk';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import createBrowserHistory from 'history/createBrowserHistory';
import createHashHistory from 'history/createHashHistory';
import { Router, Route, Switch, Link } from 'react-router-dom';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux';
import * as reducers from './reducers';
/* routes */
import routes from './routes';

import Style from './layout.css';
// Create a history of your choosing (we're using a browser history in this case)
const history = createBrowserHistory({
  basename: window.location.pathname
});

// Build the middleware for intercepting and dispatching navigation actions
const { query } = url.parse(window.location.href, true, true);
console.log('query', query);

if (query.index) {
  history.push({
    pathname: '/' + query.index,
    query: {
      modal: true
    },
    state: {
      list: new Date(),
      video: '/Users'
    }
  });
};

/* clipboard manager */
// import ClipBoardData from 'lib/ClipBoardData';

const reducer = combineReducers({
  ...reducers,
  routing: routerReducer
});

const middleware = routerMiddleware(history);
const store = createStore(
  reducer,
  applyMiddleware(thunk),
  applyMiddleware(middleware)
);

// const history = syncHistoryWithStore(browserHistory, store);

// const clipBoardData = new ClipBoardData();
// clipBoardData.events.on('data', data => {
//   history.push({
//     pathname: '/new-list',
//     query: {
//       modal: true
//     },
//     state: {
//       list: data.list,
//       video: data.v
//     }
//   });
// })

//console.log(history)
// Needed for onTouchTap
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

window.goUrl =  (url) => {
  store.dispatch(push({
    pathname: url || '/about',
    state: { some: 'state' }
  }));
};



// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

const domContainerNode = document.getElementById('app');
domContainerNode.className = Style.application;

render(
  <Provider store={ store }>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    <ConnectedRouter history={ history }>
      { routes }
    </ConnectedRouter>
  </Provider>,
  domContainerNode
);







