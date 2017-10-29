// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : ClipBoardManager.js                                          //
// @summary      : Clipboard events and data manager                         //
// @version      : 1.0.0                                                     //
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

import { clipboard, ipcRenderer } from 'electron';
import { EventEmitter } from 'events';
import isEmpty from 'lodash/isEmpty';
import querystring from 'querystring';
import url from 'url';

export default class ClipBoardManager {

  static get defaults() {
    return {
      interval: 100,
      supportedFormats: [ 'text/plain', 'text/html', 'image/png' ],
    };
  };

  constructor(options?: Object) {
    this.options = { ...ClipBoardManager.defaults, ...options };
    this.events = new EventEmitter();
    this.listeners = {
      clipboard: this.handleClipboardEvents(),
      window: this.handleWindowEvents()
    };
  }

  init () {
    const listener = {
      paste: (event) => {
        event.preventDefault();
        event.stopPropagation();
        const formats = clipboard.availableFormats();
        if (formats.indexOf('text/plain') > -1) {
          const text = this.clipboard.readText();
          console.log('text', text);
        }
      },
      copy: (event) => {
        event.clipboardData.setData('text/plain', 'Hello, world!');
        // We want our data, not data from any selection, to be written to the clipboard
        event.preventDefault();
      },
      blur: (event) => {
        // event.preventDefault();
        // event.stopPropagation();
        this.timer = !(this.timer) ? (this.timer = setInterval(() => this.decode(), 2000)) : false;
        window.addEventListener('focus', listener.focus, { once: true, capture: true });
        // event.preventDefault();
      },
      focus: (event) => {
        // event.preventDefault();
        // event.stopPropagation();
        this.timer = !!(this.timer) ? (this.timer = clearInterval(this.timer) & false) : false;
        window.addEventListener('blur', listener.blur, { once: true, capture: true });
        // event.preventDefault();
      }
    };

    document.addEventListener('paste', listener.paste, false);
    document.addEventListener('copy', listener.copy, false);
    window.addEventListener('blur', listener.blur, { once: true, capture: true });
  }

  /**
   * Handle clipboard events
   */
  handleClipboardEvents() {
    const addEventListener = (event, listener) => {

    }
    const listener = {
      paste: (event) => {
        console.log('paste', event);
        this.events.emit('paste', event);
        return event.preventDefault();
      },
      copy: (event) => {
        console.log('copy', event);
        this.events.emit('copy', event);
        event.clipboardData.setData('text/plain', 'Hello, world! COPY');
        // We want our data, not data from any selection, to be written to the clipboard
        return event.preventDefault();
      },
      cut: (event) => {
        console.log('cut', event);
        this.events.emit('cut', event);
        event.clipboardData.setData('text/plain', 'Hello, world! CUT');
        // We want our data, not data from any selection, to be written to the clipboard
        return event.preventDefault();
      }
    };

    /* Start listening clipboard events */
    document.addEventListener('paste', listener.paste, false);
    document.addEventListener('copy', listener.copy, false);
  }


  startWatching(event, interval:? number = this.options.interval) {
    this.events.emit('startWatching');
    return this.timer = !(this.timer) ? (this.timer = setInterval(this.decode2.bind(this), 2000)) : false;
  }

  stopWatching(event) {
    this.events.emit('stopWatching');
    return this.timer = !!(this.timer) ? (this.timer = clearInterval(this.timer) & false) : false;
  }

  /**
   * Handle window events
   */
  handleWindowEvents() {
    const listener = {
      blur: (event) => {
        console.log('blur', event);
        listen('focus');
        return this.startWatching(event);
      },
      focus: (event) => {
        console.log('focus', event);
        listen('blur');
        return this.stopWatching(event);
      }
    };

    const listen = (event, options) => window.addEventListener(event, listener[event], { once: true, capture: true, ...options });
    const forget = (event, options) => window.removeEventListener(event, listener[event], { once: true, capture: true, ...options });
    /* Start watching */
    return listen('blur');
  }

  destroy() {

  }
  /**
   * Tell if there is any difference between 2 strings
   */
  isDiffText(a, b) {
    return !isEmpty(a) && !isEmpty(b) ? (b !== a) : true;
  }

  /**
   * Tell if there is any difference between 2 images
   */
  isDiffImage(a, b) {
    return !a.isEmpty() && b.toDataURL() !== a.toDataURL()
  }

  decode2() {
    const formats = clipboard.availableFormats();
    const text = clipboard.readText();
    if (!this.isDiffText(text, this.text)) return;
    console.log('DECODE2', text, this.timer);
    return this.text = text;
  }

  decode() {
    const formats = clipboard.availableFormats();
    const text = clipboard.readText();
    if (!this.isDiffText(text, this.text)) return;
    console.log('decode', text, this.timer);
    return this.text = text;
  }
}

const clipBoardManager = new ClipBoardManager();
