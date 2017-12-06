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

const getErrorRoute = (location) => {
  const params = new URLSearchParams(location.search);
  return {
    pathname: '/error',
    search: params.toString(),
    state: {
      timeStamp: Date.now()
    }
  };
};

const waitCommand = (command, { history, location }) => {
  return ipcRenderer.once(command, (event, { data, options, id }) => {
    try {
      const modalRoute = getModalRoute(location);
      console.log('modal:push-props', event, { data, options, id }, modalRoute);
      const webContents = remote.webContents.fromId(id);
      const modal = webContents.getOwnerBrowserWindow();
      return history.push({ ...modalRoute, state: { data, options, id } });
    } catch (error) {
      const errorRoute = getErrorRoute(location);
      return history.push({ ...errorRoute, state: { data, options, id } });
    }
  });
};

export const ModalRouter = (props) => {

  const listener = waitCommand('modal:push-props', props);
  // return (<Redirect to={ location } {...props } />);
  return false;
};
