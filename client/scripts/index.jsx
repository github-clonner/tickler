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

import { URL } from 'url';
import React from 'react';
import routes from './routes';
import Style from './layout.css';
import { remote } from 'electron';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import configureStore, { history } from './store/configureStore';

const ModalRouter = (href) => {
  const { ipcRenderer, remote } = require('electron');

  const waitCommand = function (command, { pathname, query, state }) {
    ipcRenderer.once(command, function (event, { state, options, id }) {
      console.log('modal:set:scope', event);
      // const webContents = remote.webContents.fromId(id);
      // const modal = webContents.getOwnerBrowserWindow();
      setTimeout(() => {
        const modal = electron.remote.getCurrentWindow();
        modal.show();
        modal.focus();
        modal.webContents.openDevTools();
      }, 500)
      return history.push({ pathname, query, state: { timeStamp: Date.now() } });
    });
  }
  try {
    const url = new URL(href);
    console.log('ModalRouter', url.pathname);
    if (url.searchParams.has('modal')) {
      const modal = url.searchParams.get('modal');
      waitCommand('modal:set:scope', { pathname: modal });
    };
  } catch (error) {
    console.log(error);
  }
}

ModalRouter(window.location.href);
/* clipboard manager */
// import ClipBoardManager from './lib/ClipBoardManager';
const store = window.store = configureStore();
const electron = window.electron = require('electron');
// const removeActionListener = store.addActionListener('SELECT_ITEM', () => {
//   console.log('SELECT_ITEM', arguments);
// });

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







