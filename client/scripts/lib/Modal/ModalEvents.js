// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : ModalEvents.js                                            //
// @summary      : Event handlers and utilities                              //
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

import path from 'path';
import { URL } from 'url';
import HashMap from '../HashMap';
import querystring from 'querystring';
import { remote, ipcRenderer } from 'electron';
import { isFunction, isDataURL, isWebURL, camelToDash, toBuffer, isSymbol } from '../../lib/utils';

export const names = [
  'pushProps',
  'beforeInputEvent',
  'didFinishLoad',
  'close'
].reduce((events, name) => {
  return { ...events, [name]: 'modal:'.concat(camelToDash(name)) };
}, {});

export const configKey = Symbol('config');

export function listeners(configKey = configKey, listeners) {
  return {
    /* modal event listeners */
    modal: {
      readyToShow: [ 'once',  (event) => {
        // console.info('modal:readyToShow');
        const { data, options, modal: { webContents }} = this;
        const { id } = remote.getCurrentWindow();
        return this.send('modal:push-props', { data, options, id });
      }],
      [configKey]: { producer: this.modal, context: this }
    },
    /* webContents event listeners */
    webContents: {
      beforeInputEvent: [ 'on',  (event, input) => {
        // console.info('webContents:beforeInputEvent');
        this.send('modal:before-input-event', event, input);
        switch (input.key) {
          case 'Escape': return this.close();
          default:
            return;
        }
      }],
      didFinishLoad: [ 'on', (event) => {
        // console.info('webContents:didFinishLoad');
        this.send('modal:didi-finish-load', event);
        this.modal.show();
        this.modal.focus();
      }],
      [configKey]: { producer: this.modal.webContents }
    },
    /* ipcRenderer event listeners */
    ipcRenderer: {
      modalClose: [ 'once', (event) => {
        // console.info('ipcRenderer:modalClose');
        this.send('modal:modal-close', event);
        return this.close();
      }],
      [configKey]: { producer: ipcRenderer, sep: ':'}
    },
    ...listeners
  };
};
