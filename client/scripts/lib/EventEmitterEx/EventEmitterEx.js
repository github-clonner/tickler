// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : EventEmitterEx.js                                         //
// @summary      : Enhaced emitter class                                     //
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

import HashMap from '../HashMap';
import { EventEmitter } from 'events';
import { EventProxify } from './EventProxify';
import { camelToDash, isSymbol, isPlainObject } from '../../lib/utils';

export class EventEmitterEx extends EventEmitter {

  static listenerConfig = {
    proxyfier: EventProxify,
    cache: new HashMap(),
    configKey: Symbol('config')
  };

  static listenerFactory(cache, proxyfier, configKey, events) {
    const hash = Object.entries(events).map(([ name, handlers ]) => {
      return cache.set(name, proxyfier(configKey, handlers));
    });
    return (hash.length === cache.size);
  };

  get listenerConfig() {
    return this.constructor.listenerConfig;
  }

  get listeners() {
    const { _listeners, events, listenerConfig: { cache, proxyfier, configKey }} = this;
    if (_listeners) {
      return _listeners;
    } else {
      const factoryReady = EventEmitterEx.listenerFactory(cache, proxyfier, configKey, events)
      if (factoryReady) {
        return cache;
      } else {
        return undefined;
      }
    }
  }

  set listeners(listeners) {
    this._listeners = listeners;
  }

  set events(events) {
    return this._events = events;
  }

  get events() {
    return this._events;
  }

  constructor(events, ...args) {
    super(...args);
    if (events) {
      this.events = events;
      this.attachListeners();
    }
  }

  attachListeners() {
    const { configKey } = this.listenerConfig;
    const excludeSymbols = ([name]) => {
      return !isSymbol(name);
    };
    const mapProducers = ({ producer, context, sep }) => {
      return ([ name, [ method, handler ]]) => {
        return [ camelToDash(name, sep), [ method.bind(context || producer), handler ]];
      }
    };
    const mapListeners = ([ emitter, events ]) => {
      return [ emitter, Object.entries(events).filter(excludeSymbols).map(mapProducers(events[configKey])).map(mapHandlers) ];
    };
    const mapHandlers = ([ name, [ method, handler ]]) => {
      return [ name, [ method.apply(method, [ name, handler ]), handler ] ];
    }
    const toDictionary = (listeners, [ emitter, events ]) => ({ ...listeners, [emitter]: events });
    return this.listeners = this.listeners.map(mapListeners);
  }

  detachListeners() {
    return this.listeners.map(([ emitter, events ]) => {
      return events.map(([name, [ producer, handler ]]) => {
        const listeners = (producer && producer.listeners(name));
        return (listeners.length) ? producer.removeListener(name, handler) : false;
      });
    });
  }
}
