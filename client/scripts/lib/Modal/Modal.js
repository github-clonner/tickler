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
import { EventEmitter } from 'events';
import * as ModalEvents from './ModalEvents';
import { remote, ipcRenderer } from 'electron';
import { EventEmitterEx } from '../EventEmitterEx/EventEmitterEx';
import { isFunction, isDataURL, isWebURL, camelToDash, toBuffer, isSymbol, has } from '../../lib/utils';


export class Modal extends EventEmitterEx {
  static config(options) {
    return {
      window: {
        backgroundColor: '#FFF',
        maximizable: false,
        resizable: true,
        fullscreenable: false,
        webviewTag: true,
        modal: true,
        show: false,
        minWidth: 640,
        parent: remote.getCurrentWindow(),
        ...options.window
      },
      indexURL: options.indexURL || Modal.indexURL,
      behavior: {
        type: 'OK_ONLY',
        ...options.behavior
      }
    };
  };

  static indexURL = new URL(path.resolve(__dirname, 'index.html'), 'file://');

  static hRef(hRef, params) {
    try {
      if (isDataURL(hRef) || isWebURL(hRef)) {
        return hRef;
      } else {
        const url = new URL(Modal.indexURL);
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

  set modal(modal) {
    try {
      const hRef = Modal.hRef(modal);
      this._modal = this.modalWindow(hRef);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  get modal() {
    return this._modal;
  }

  set options(options) {
    this._options = Modal.config(options);
  }

  get options() {
    return this._options;
  }

  constructor(modal, data, options, events, ...args) {
    super(...args);
    const { configKey } = this.listenerConfig;
    this.options = options;
    this.data = data;
    this.modal = modal;
    this.events = ModalEvents.listeners.apply(this, [ configKey, events ]);
    this.attachListeners();
  }

  modalWindow(hRef) {
    try {
      const { options, data } = this;
      const modal = new remote.BrowserWindow(options.window);
      modal.loadURL(hRef, Modal.postData(data));
      return modal;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  send(event, ...args) {
    // console.info('send', event, ...args);
    return this.modal.webContents.send(event, ...args);
  };

  close() {
    this.detachListeners();
    this.modal.close();
  }
}

// export class Modal2 extends EventEmitter {

//   static config(options) {
//     return {
//       window: {
//         backgroundColor: '#FFF',
//         maximizable: false,
//         resizable: true,
//         fullscreenable: false,
//         webviewTag: true,
//         modal: true,
//         show: false,
//         minWidth: 640,
//         parent: remote.getCurrentWindow(),
//         ...options.window
//       },
//       indexURL: options.indexURL || Modal.indexURL,
//       behavior: {
//         type: 'OK_ONLY',
//         ...options.behavior
//       }
//     };
//   };

//   static mapEmitterMethod(property, object) {
//     if (!isSymbol(property) && (property in object)) {
//       const { configKey } = Modal.listenerConfig;
//       const { [configKey]: { producer, sub }} = object;
//       let { [property]: listener } = object;
//       listener.splice(0, 1, producer[listener.slice(0, 1).pop()]);
//       return true;
//     } else {
//       return false;
//     }
//   };

//   static proxyfier(object) {

//     const handler = {
//       construct: function(object, argumentsList, newTarget) {
//         console.log('construct', object, argumentsList, newTarget);
//         return Reflect.construct(object, argumentsList, newTarget);
//       },
//       ownKeys: function (target) {
//         console.log('ownKeys', target, Object.getOwnPropertyNames(target));
//         Object.getOwnPropertySymbols(target).forEach(symbol => {
//           Object.defineProperty(target, symbol, { enumerable: false });
//         });
//         return Reflect.ownKeys(target);
//       },
//       has: function (taget, property) {
//         console.log('has', taget, property, typeof property);
//         return Reflect.has(object, property);
//       },
//       set: function(object, property, value, receiver) {
//         console.log('set', object, property, value, receiver);
//         return Reflect.set(object, property, value, receiver);
//       },
//       get: function (object, property, receiver) {
//         console.log('get', object, property);
//         Modal.mapEmitterMethod(property, object);
//         return Reflect.get(object, property, receiver);
//       },
//       apply: function(object, thisArg, argumentsList) {
//         console.log('apply', object, thisArg, argumentsList);
//         return Reflect.apply(object, thisArg, argumentsList);
//       }
//     }
//     return new Proxy(object, handler);
//   };

//   static hRef(hRef, params) {
//     try {
//       if (isDataURL(hRef) || isWebURL(hRef)) {
//         return hRef;
//       } else {
//         const url = new URL(Modal.indexURL);
//         url.searchParams.set('modal', hRef);
//         return url.href;
//       }
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };

//   static postData(data) {
//     return {
//       postData: [{ type: 'rawData', bytes: toBuffer(data) }],
//       extraHeaders: 'Content-Type: application/x-www-form-urlencoded'
//     };
//   };

//   static listenerConfig = {
//     configKey: Symbol('config')
//   };

//   static indexURL = new URL(path.resolve(__dirname, 'index.html'), 'file://');

//   set modal(modal) {
//     try {
//       const hRef = Modal.hRef(modal);
//       this._modal = this.modalWindow(hRef);
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   };

//   get modal() {
//     return this._modal;
//   }

//   set options(options) {
//     this._options = Modal.config(options);
//   }

//   get options() {
//     return this._options;
//   }

//   get listenerConfig() {
//     return this.constructor.listenerConfig;
//   }

//   get listeners() {
//     if (this.modal.isDestroyed() || this._listeners) return this._listeners;

//     const { modal, send, data, options, listenerConfig: { configKey }, modal: { webContents } } = this;
//     // const {
//     //   modal,
//     //   send,
//     //   data,
//     //   options,
//     //   listenerConfig: { configKey },
//     //   modal: { id, webContents }
//     // } = this;

//     const listeners = new HashMap();

//     /* modal event listeners */
//     listeners.set('modal', this.proxyfier({
//       closed: [ 'once', (event) => {
//         // console.info('modal:closed');
//         return this.send('modal:closed');
//       }],
//       readyToShow: [ 'once',  (event) => {
//         // console.info('modal:readyToShow');
//         return this.send('modal:set:scope', { data, options, id: webContents.getId() });
//       }],
//       [configKey]: { producer: modal, context: this }
//     }));

//     /* webContents event listeners */
//     listeners.set('webContents', this.proxyfier({
//       beforeInputEvent: [ 'on',  (event, input) => {
//         // console.info('webContents:beforeInputEvent');
//         // this.send('modal:before-input-event', input);
//         switch (input.key) {
//           case 'Escape': return this.close();
//           default:
//             return;
//         }
//       }],
//       didFinishLoad: [ 'on', () => {
//         // console.info('webContents:didFinishLoad');
//         modal.show();
//         modal.focus();
//         // webContents.openDevTools();
//       }],
//       [configKey]: { producer: webContents }
//     }));

//     /* ipcRenderer event listeners */
//     listeners.set('ipcRenderer', this.proxyfier({
//       modalClose: [ 'once', (event) => {
//         // console.info('ipcRenderer:modalClose', event, this);
//         return this.close();
//       }],
//       [configKey]: { producer: ipcRenderer, sep: ':'}
//     }));

//     return listeners;
//   }

//   set listeners(listeners) {
//     this._listeners = listeners;
//   }

//   constructor(modal, data, options, ...args) {
//     super(...args);
//     this.options = options;
//     this.data = data;
//     this.modal = modal;
//     this.attachListeners();
//   }

//   modalWindow(hRef) {
//     try {
//       const { options, data } = this;
//       const modal = new remote.BrowserWindow(options.window);
//       modal.loadURL(hRef, Modal.postData(data));
//       return modal;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }

//   proxyfier(object) {
//     return this.constructor.proxyfier(object);
//   }

//   send(event, ...args) {
//     console.info('send', event, ...args);
//     return this.modal.webContents.send(event, ...args);
//   };

//   attachListeners2() {
//     const { configKey } = this.listenerConfig;
//     const excludeSymbols = ([name]) => !isSymbol(name);
//     const mapProducers = ({ producer, context, sep }) => ([ name, [ method, handler ]]) => [ camelToDash(name, sep), [ producer[method].bind(context || producer), handler ]];
//     const mapListeners = ([ emitter, events ]) => ([ emitter, events.filter(excludeSymbols).map(mapProducers(events.get(configKey))) ]);
//     const mapHandlers = ([ name, [ method, handler ]]) => method.apply(method, [ name, handler ]);
//     const toDictionary = (listeners, [ emitter, events ]) => ({ ...listeners, [emitter]: events.map(mapHandlers) });
//     return this.listeners = this.listeners.map(mapListeners).reduce(toDictionary, {});
//   }

//   attachListeners() {
//     const { configKey } = this.listenerConfig;
//     const excludeSymbols = ([name]) => !isSymbol(name);
//     const mapProducers = ({ producer, context, sep }) => ([ name, [ method, handler ]]) => {
//       return [ camelToDash(name, sep), [ method.bind(context || producer), handler ]];
//     }
//     const mapListeners = ([ emitter, events ]) => {
//       return [ emitter, Object.entries(events).filter(excludeSymbols).map(mapProducers(events[configKey])).map(mapHandlers) ];
//     };
//     const mapHandlers = ([ name, [ method, handler ]]) => [ name, [ method.apply(method, [ name, handler ]), handler ] ];
//     const toDictionary = (listeners, [ emitter, events ]) => ({ ...listeners, [emitter]: events });
//     return this.listeners = this.listeners.map(mapListeners);
//   }

//   detachListeners() {
//     var online = 0;
//     var offline = 0;
//     console.log('REMOVE')
//     const actions = this.listeners.map(([ emitter, events ]) => {
//       return events.map(([name, [ producer, handler ]]) => {
//         const listeners = (producer && producer.listeners(name));
//         online += listeners.length;
//         return (listeners.length) ? producer.removeListener(name, handler) : false;
//       });
//     });
//     console.log('LIST')
//     this.listeners.map(([ emitter, events ]) => {
//       return events.map(([name, [ producer, handler ]]) => {
//         if (producer && producer.eventNames) {
//           console.log('listener:', name, 'listeners', producer.listeners(name));
//           offline += producer.listeners(name).length;
//         } else {
//           console.log('listener:', name)
//         }
//       })
//     });
//     console.log('TOTAL', online, offline);
//   }

//   close() {
//     this.detachListeners();
//     this.modal.close();
//   }
// };
