// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Modal.js                                                  //
// @summary      : Modal class                                               //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Nov 2017                                               //
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
import querystring from 'querystring';
import { shell, remote, ipcRenderer } from 'electron';
import { isString, isObject, isEmpty, isDataURL, isWebURL, isRenderer, renderTemplate, camelCase, camelToDash } from '../../lib/utils';
import { isValidFile } from '../../lib/FileSystem';
import { DialogOptions } from '../../types/PlayList';
import uuid from 'uuid/v1';


const DEFAULT_TEMPLATE = path.join(process.cwd(), 'client', 'scripts', 'components', 'Modal', 'template', 'default.html');

/**
 *
 * Bare bones template engine
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

/*
 *  Load from file then apply scope
 */
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

const defaultWindowOptions = {
  title: 'Modal',
  backgroundColor: '#FFF',
  maximizable: false,
  resizable: false,
  fullscreenable: false,
  webviewTag: true,
  modal: true,
  show: false,
  postData: [{
    type: 'rawData',
    bytes: Buffer.from('hello=world')
  }],
};

const showModal = function(url, options) {
  const parent = remote.getCurrentWindow();
  const modal = new remote.BrowserWindow({ parent, ...defaultWindowOptions, ...options });
  modal.loadURL(url);
  modal.once('closed', event => {
    console.log('modal closed', __dirname, process.cwd());
  });
  modal.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      modal.close();
    }
  });
  ipcRenderer.once('modal:close', (event) => {
    console.log('ipcRenderer:modal:close', event);
    modal.close();
  });
  modal.once('ready-to-show', () => {
    modal.show();
    modal.focus();
  });
  window.modal = modal;
  console.log('window id', modal.id);
  return modal;
};

export const openModal = function (url, state) {
  if(isDataURL(url)) {
    return showModal(url);
  } else {
    const basePath = path.resolve(__dirname, 'index.html');
    const initialState = {
      readOnly: 'true',
      mode: 'javascript',
      index: 'modal'
    };
    const base = URL.format({
      protocol: 'file',
      slashes: true,
      pathname: basePath,
      search: querystring.stringify({ ...initialState, ...state })
    });
    const target = new URI(base);
    console.log('Modal URL', 'target', target, URL.format(target));
    return showModal(URL.format(target));
  }
};

export class Modal {

  static get options() {
    return {
      title: 'Modal',
      backgroundColor: '#FFF',
      maximizable: false,
      resizable: false,
      fullscreenable: false,
      webviewTag: true,
      modal: true,
      show: false,
      postData: [{
        type: 'rawData',
        bytes: Buffer.from('hello=world')
      }],
    };
  };

  static get state() {
    return {
      readOnly: 'true',
      mode: 'javascript',
      index: 'modal'
    };
  };

  static loadTemplate(template, state) {
    if(isDataURL(template)) {
      return template;
    } else if (isWebURL(template)) {
      return template;
    } else {
      const basePath = path.resolve(__dirname, 'index.html');
      const initialState = {
        readOnly: 'true',
        mode: 'javascript',
        index: 'modal/media/metadata'
      };
      const base = URL.format({
        protocol: 'file',
        slashes: true,
        pathname: basePath,
        search: querystring.stringify({ ...initialState, ...state })
      });
      const target = new URI(base);
      return URL.format(target);
    }
    return null;
  };

  constructor(template, state = {}, options = {}) {
    this.template = Modal.loadTemplate(template, state);
    this.options = { ...Modal.options, ...options, parent };
    this.state = { ...Modal.state, ...state };
    this.id = uuid();
    if (this.options.show) {
      this.show();
    }
  }

  show(options) {
    console.log('show', this.template, this.options);
    try {
      this.modal = new remote.BrowserWindow({
        ...this.options,
        parent: remote.getCurrentWindow()
      });
      if (this.modal) {
        this.modal.loadURL(this.template);
        this.attachListeners();
        return this.modal.id;
      } else {
        throw new Error('Cannot show modal');
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  attachListeners() {
    const { modal } = this;
    const windowEvents = this.windowEvents = Object.entries({
      closed: [ this.modal.once, (event) => { console.log('MODAL CLOSED', event) } ],
      beforeInputEvent: [ this.modal.webContents.on,  (event, input) => {
        if (input.key === 'Escape') {
          return this.modal.close();
        }
      }],
      readyToShow: [ modal.once,  () => {
        console.log('readyToShow');
        this.modal.show();
        this.modal.focus();
      } ],
    })
    .map(([ listener, [ func, handler ]]) => {
      const event = camelToDash(listener);
      return func.apply(this.modal, [ event, handler ]);
    });

    const modalEvents = this.modalEvents = Object.entries({
      modalClose: [ ipcRenderer.once, (event) => this.modal.close() ]
    })
    .map(([ listener, [ func, handler ]]) => {
      const event = camelToDash(listener, ':');
      return func.apply(this.modal, [ event, handler ]);
    });
  }

};
