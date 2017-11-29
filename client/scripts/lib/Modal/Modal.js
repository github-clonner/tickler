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

import path from 'path';
import { URL } from 'url';
import HashMap from '../HashMap';
import querystring from 'querystring';
import { remote, ipcRenderer } from 'electron';
import { isFunction, isDataURL, isWebURL, camelToDash, toBuffer, isSymbol } from '../../lib/utils';

export class Modal {

  static config(options) {
    return {
      backgroundColor: '#FFF',
      maximizable: false,
      resizable: true,
      fullscreenable: false,
      webviewTag: true,
      modal: true,
      show: false,
      parent: remote.getCurrentWindow(),
      ...options
    };
  };

  static hRef(hRef, params) {
    try {
      if (isDataURL(hRef) || isWebURL(hRef)) {
        return hRef;
      } else {
        const url = new URL(path.resolve(__dirname, 'index.html'), 'file://');
        url.searchParams.set('modal', hRef);
        return url.href;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  static postData(data) {
    return {
      postData: [{ type: 'rawData', bytes: toBuffer(data) }],
      extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
    };
  };

  static listenerConfig = {
    configKey: Symbol('config')
  };

  constructor(modal, data, options) {
    this.options = options;
    this.data = data;
    this.modal = modal;
  }

  modalWindow(hRef) {
    try {
      const modal = new remote.BrowserWindow(this.options);
      if (!modal) throw new Error('Error loading modal');
      modal.loadURL(hRef, this.data);
      return modal;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  set modal(modal) {
    try {
      const hRef = Modal.hRef(modal);
      this._modal = this.modalWindow(hRef);
      this.attachListeners();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  get modal() {
    return this._modal;
  }

  send(event, ...args) {
    console.info('send', event, ...args);
    return this.modal.webContents.send(event, ...args);
  };

  set data(data) {
    this._data = Modal.postData(data);
  }

  get data() {
    return this._data;
  }

  set options(options) {
    this._options = Modal.config(options);
  }

  get options() {
    return this._options;
  }

  get listenerConfig() {
    return this.constructor.listenerConfig;
  }

  get listeners() {
    const { modal, modal: { id }, modal: { webContents }, data, options, listenerConfig: { configKey } } = this;
    return this._listeners || HashMap.fromObject({
      /* modal event listeners */
      modal: HashMap.fromObject({
        closed: [ 'once', (event) => { console.log('MODAL CLOSED', event) }],
        readyToShow: [ 'once',  () => {
          console.log('readyToShow');
          return this.send('modal:set:scope', { data, options, id });
        }],
        [configKey]: { producer: this.modal }
      }),

      /* webContents event listeners */
      webContents: HashMap.fromObject({
        beforeInputEvent: [ 'on',  (event, input) => {
          console.log('beforeInputEvent');
          if (input.key === 'Escape') return modal.close();
        }],
        didFinishLoad: [ 'on', () => {
          console.log('didFinishLoad');
          modal.show();
          modal.focus();
          // this.send('modal:set:scope', { data: this.data, options: this.options });
          webContents.openDevTools();
        }],
        [configKey]: { producer: webContents }
      }),

      /* ipcRenderer event listeners */
      ipcRenderer: HashMap.fromObject({
        modalClose: [ 'once', (event) => modal.close() ],
        [configKey]: { producer: ipcRenderer, sep: ':'}
      }),

      /* application event listeners */
      application: HashMap.fromObject({
        beforeQuit: [ 'once', (event) => {
          return event.preventDefault();
          // return modal.close();
        }],
        [configKey]: { producer: remote.app }
      })
    });
  }

  set listeners(listeners) {
    this._listeners = listeners;
  }

  attachListeners() {
    const { configKey } = this.listenerConfig;
    const excludeSymbols = ([name]) => !isSymbol(name);
    const mapProducers = ({ producer, sep }) => ([ name, [ method, handler ]]) => [ camelToDash(name, sep), [ producer[method].bind(producer), handler ]];
    const mapListeners = ([ emitter, events ]) => ([ emitter, events.filter(excludeSymbols).map(mapProducers(events.get(configKey))) ]);
    const mapHandlers = ([ name, [ method, handler ]]) => method.apply(method, [ name, handler ]);
    const toDictionary = (listeners, [ emitter, events ]) => ({ ...listeners, [emitter]: events.map(mapHandlers) });
    return this.listeners = this.listeners.map(mapListeners).reduce(toDictionary, {});
  }

  destroy() {

  }
};
