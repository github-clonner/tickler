// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : ModalRouter.jsx                                           //
// @summary      : Modal state router                                        //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 05 Dec 2017                                               //
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

import React, { Component } from 'react';
import { URL, URLSearchParams } from 'url';
import { Redirect } from 'react-router-dom';
import { ipcRenderer, remote } from 'electron';
import { ModalEvents } from '../lib/Modal';

/* event listeners cache */
const listeners = new Map();

/* event names */
const { pushProps } = ModalEvents.names;

/* location factory */
const getModalRoute = (location) => {
  const params = new URLSearchParams(location.search);
  return {
    pathname: params.get('modal'),
    search: params.toString(),
    state: {
      timeStamp: Date.now()
    }
  };
};

/* Navigation handle */
const navigationHandler = (command, { history, location }) => (event, { data, options, id }) => {
  try {
    const modalRoute = getModalRoute(location);
    const webContents = remote.webContents.fromId(id);
    const modal = webContents.getOwnerBrowserWindow();
    return history.push({ ...modalRoute, state: { data, options, id } });
  } catch (error) {
    throw error;
  } finally {
    return eventForget(command);
  }
};

/* event subscribe */
const eventListen = (command, { history, location }) => {
  try {
    if(!listeners.has(command)) {
      const eventHandler = navigationHandler(command, { history, location });
      const eventUnlisten = ipcRenderer.once(command, eventHandler) ? () => { return ipcRenderer.removeListener(command, eventHandler) } : undefined;
      const historyUnlisten = history.listen((location, action) => {
        console.log('on history change', location, action);
        return eventForget(command);
      });
      listeners.set(command, [ eventUnlisten, historyUnlisten ]);
    } else {
      return (eventForget(command), eventListen.apply(this, arguments));
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* event unsubscribe */
const eventForget = (command) => {
  if(!listeners.has(command)) return;
  const [ eventUnlisten, historyUnlisten ] = listeners.get(command);
  console.log('eventForget', command);
  return (
    eventUnlisten(),
    historyUnlisten(),
    listeners.delete(command)
  );
};

/* route handler */
export const ModalRouter = (props) => {
  console.log('ipcRenderer', ipcRenderer.eventNames(), ipcRenderer.listeners(pushProps));
  eventListen(pushProps, props);
  console.log('ipcRenderer', ipcRenderer.eventNames(), ipcRenderer.listeners(pushProps));
  return false;
};
