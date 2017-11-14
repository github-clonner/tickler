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
import { isString, isObject, isEmpty, isDataURL, isWebURL, renderTemplate, camelToDash } from '../../lib/utils';
import { isValidFile } from '../../lib/FileSystem';

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

export class Modal {

  static get options() {
    return {
      title: 'Modal',
      backgroundColor: '#FFF',
      maximizable: false,
      resizable: true,
      fullscreenable: false,
      webviewTag: true,
      modal: true,
      show: false,
      postData: [{
        type: 'rawData',
        bytes: Buffer.from('hello=world')
      }],
      extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
    };
  };

  static get state() {
    return {
      autoSave: 'true'
    };
  };

  static loadTemplate(template, state) {
    console.log('loadTemplate', template, state);
    if(isDataURL(template)) {
      return template;
    } else if (isWebURL(template)) {
      return template;
    } else {
      const target = {
        protocol: 'file',
        slashes: true,
        pathname: path.resolve(__dirname, 'index.html'),
        search: querystring.stringify({ ...state, index: template })
      };
      console.log('loadTemplate', target);
      return URL.format(target);
    }
    return null;
  };

  constructor(template, state = {}, options = {}) {
    this.state = { ...Modal.state, ...state };
    this.options = { ...Modal.options, ...options };
    this.template = Modal.loadTemplate(template, this.state);
    if (this.options.show) {
      this.show();
    }
  }

  show(options) {
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
      closed: [this.modal.once, (event) => { console.log('MODAL CLOSED', event) }],
      beforeInputEvent: [ this.modal.webContents.on,  (event, input) => {
        if (input.key === 'Escape') {
          return this.modal.close();
        }
      }],
      readyToShow: [modal.once,  () => {
        console.log('readyToShow');
        this.modal.show();
        this.modal.focus();
        this.modal.webContents.send('modal:set:scope', { state: this.state, options: this.options });
      }],
    })
    .map(([ listener, [ func, handler ]]) => {
      const event = camelToDash(listener);
      return func.apply(this.modal, [ event, handler ]);
    });

    const modalEvents = this.modalEvents = Object.entries({
      modalClose: [ ipcRenderer.once, (event) => {
        console.log('modal:close');
        return this.modal.close();
      }]
    })
    .map(([ listener, [ func, handler ]]) => {
      const event = camelToDash(listener, ':');
      return func.apply(ipcRenderer, [ event, handler ]);
    });
  }

};
