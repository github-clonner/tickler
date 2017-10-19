///////////////////////////////////////////////////////////////////////////////
// @file         : EventEmitterEx.js                                         //
// @summary      : Extended Event Emitter                                    //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Oct 2017                                               //
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
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { EventEmitter } from 'events';

export default class EventEmitterEx extends EventEmitter {

  static makeSafe(thisArg, receiver) {
    return function() {
      try {
        return receiver.apply(thisArg, arguments);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
  };

  constructor(...args) {
    super(...args);
  }

  on(eventName, listener) {
    //console.log(`on ${eventName}`);
    return super.on(eventName, listener);
  }

  addListener(eventName, listener) {
    //console.log(`addListener ${eventName}`);
    return super.addListener(eventName, listener);
  }

  removeListener(eventName, listener) {
    //console.log(`removeListener ${eventName}`);
    return super.removeListener(eventName, listener);
  }

  off(eventName, listener) {
    //console.log(`off ${eventName}`);
    return super.removeListener(eventName, listener);
  }
}


export class YoutubeEvents extends EventEmitterEx {

}
