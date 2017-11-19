// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Modal.jsx                                                 //
// @summary      : Modal component                                           //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 26 Sep 2017                                               //
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

import fs from 'fs';
import path from 'path';
import URL, { URL as URI} from 'url';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import querystring from 'querystring';
import { connect } from 'react-redux';
import { shell, remote } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import * as Actions from 'actions/PlayList';
import * as Settings from 'actions/Settings';
import { isString, isObject, isEmpty, isDataURL } from '../../lib/utils';
import { isValidFile } from '../../lib/FileSystem';
import { DialogOptions } from '../../types/PlayList';
/*
{
  x: this.mainWindowState.x,
  y: this.mainWindowState.y,
  width: this.mainWindowState.width,
  height: this.mainWindowState.height,
  backgroundThrottling: false, // do not throttle animations/timers when page is background
  minWidth: 800,
  minHeight: 400,
  darkTheme: true, // Forces dark theme (GTK+3)
  titleBarStyle: 'hidden-inset', // Hide title bar (Mac)
  useContentSize: true, // Specify web page size without OS chrome
  center: true,
  frame: false,
  icon: makeIcon('icon.png')
}
*/


const DEFAULT_TEMPLATE = path.join(process.cwd(), 'client', 'scripts', 'components', 'Modal', 'template', 'default.html');

/*
  Bare bones template engine
*/
const hydrate = function(template, scope) {
  if (
    isString(template) && !isEmpty(template) &&
    isObject(scope) && !isEmpty(scope)
  ) {
    return Object.entries(scope).reduce((view, [ key, value ]) => {
      const regexp = new RegExp('\\${' + key + '}', 'gi');
      return view.replace(regexp, value);
    }, template.slice(0));
  } else {
    return null;
  }
};

export const renderModal = ( file, scope ) => {
  if(isValidFile(file)) {
    try {
      const template = fs.readFileSync(file, 'UTF-8');
      return hydrate(template, scope);
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};

const MEDIA_INFORMATION_MODAL = 'data:text/html;charset=UTF-8,' + encodeURIComponent(renderModal(DEFAULT_TEMPLATE, {
  title: 'Media Information',
  name: 'benja',
  description: 'My Modal',
  scriptUrl: './account.view.js'
}));

console.log('MEDIA_INFORMATION_MODAL', MEDIA_INFORMATION_MODAL);

export const openModal = function (url, state) {
  if(isDataURL(url)) {
    return showModal(url);
  } else {
    const basePath = path.resolve(__dirname, 'index.html');
    const initialState = {
      readOnly: 'true',
      mode: 'javascript',
      index: 'about'
    };
    const base = URL.format({
      protocol: 'file',
      slashes: true,
      pathname: basePath,
      search: encodeURIComponent(JSON.stringify({ ...initialState, ...state }))
    });
    const target = new URI(base);
    console.log('Modal URL', 'target', target, URL.format(target));
    return showModal(URL.format(target));
  }

  function showModal(url, options) {
    const parent = remote.getCurrentWindow();
    const modal = new remote.BrowserWindow({
      backgroundColor: '#FFF',
      webviewTag: true,
      parent: parent,
      modal: true,
      show: false,
      postData: [{
        type: 'rawData',
        bytes: Buffer.from('hello=world')
      }],
    });
    modal.loadURL(url);
    modal.once('closed', event => {
      console.log('modal closed', __dirname, process.cwd());
    });
    modal.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        modal.close();
      }
    });
    modal.once('ready-to-show', () => {
      modal.show();
      modal.focus();
    });
    window.modal = modal;
    console.log('window id', modal.id);
    return modal;
  }
}

export const openModal2 = function (route, state) {
  const basePath = path.join(process.cwd(), 'dist', 'index.html');
  const parent = remote.getCurrentWindow();
  const base = URL.format({
    protocol: 'file',
    slashes: true,
    pathname: basePath
  });
  // const location = path.parse(decodeURIComponent(base));
  const target = new URI(base);
  target.search = 'readOnly=true&mode=javascript&index=about';
  const modal = new remote.BrowserWindow({
    webviewTag: true,
    parent: parent,
    modal: true,
    show: false
  });
  console.log('Modal URL', 'target', target, URL.format(target))
  modal.loadURL(URL.format(target));
  // modal.loadURL(MEDIA_INFORMATION_MODAL); // TODO: load data uri
  modal.once('closed', event => {
    console.log('modal closed', __dirname, process.cwd());
  });
  modal.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      modal.close();
    }
  });
  modal.once('ready-to-show', () => {
    modal.show();
    modal.focus();
  });
  window.modal = modal;
}
