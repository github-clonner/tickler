// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : ClipBoardData.js                                          //
// @summary      : Clipboard actions manager                                 //
// @version      : 0.0.1                                                     //
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
import querystring from 'querystring';
import url from 'url';

///////////////////////////////////////////////////////////////////////////////
// create single EventEmitter instance                                       //
///////////////////////////////////////////////////////////////////////////////
class ClipBoardDataEvents extends EventEmitter {
  constructor(...args) {
    super(...args);
  }
}

const clipBoardDataEvents = new ClipBoardDataEvents();

export default class ClipBoardData {
  constructor() {
    this.clipboard = clipboard;
    this.events = clipBoardDataEvents;
    this.link = null;
    this.init();
  }

  setInterval = (interval = 500) => {
    this.timer = window.setInterval(() => {
      const data = this.decode(this.clipboard);
    }, interval);
    return this.timer;
  }

  clearInterval = (timer = this.timer) => {
    return window.clearInterval(timer);
  }

  init () {
    // window.addEventListener('focus', event => {
    //   this.setInterval();
    // }, false);
    // window.addEventListener('blur', event => {
    //   this.clearInterval();
    // }, false);
    // ...same thing if you paste a link
    window.addEventListener('paste', this.onPaste, false);
  }

  onPaste = event => {
    console.log(event)
    const data = this.decode(this.clipboard);
  }

  decode () {
    const formats = this.clipboard.availableFormats();
    if (formats.indexOf('text/plain') > -1) {
      const link = this.clipboard.readText();
      const video = new RegExp(/(?:youtube\.com.*(?:\?|&)(?:v)=|youtube\.com.*embed\/|youtube\.com.*v\/|youtu\.be\/)((?!videoseries)[a-zA-Z0-9_]*)/g);
      const list = new RegExp(/(?:youtube\.com.*(?:\?|&)(?:list)=)((?!videoseries)[a-zA-Z0-9_]*)/g);

      if (this.link === link) {
        return null;
      }
      if (link.match(video) || link.match(list)) {
        this.link = link;
        const uri = url.parse(link);
        const query = querystring.parse(uri.query);
        this.events.emit('data', query);
        return query;
      } else {
        return null;
      }
    }
  }
}
