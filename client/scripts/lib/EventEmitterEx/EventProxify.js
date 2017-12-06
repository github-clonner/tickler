// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : EventProxify.js                                           //
// @summary      : Emitter proxy                                             //
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

import { camelToDash, isSymbol } from '../../lib/utils';

const mapEmitterMethod = (configKey, property, object) => {
  if (!isSymbol(property) && (property in object)) {
    const { [configKey]: { producer, context, sub }} = object;
    let { [property]: listener } = object;
    listener.splice(0, 1, producer[listener.slice(0, 1).pop()]);
    return true;
  } else {
    return false;
  }
};

export const EventProxify = (configKey, object) => {
  console.info('EventProxify', configKey, object);
  const handler = {
    construct: function(object, argumentsList, newTarget) {
      console.info('construct', object, argumentsList, newTarget);
      return Reflect.construct(object, argumentsList, newTarget);
    },
    ownKeys: function (target) {
      console.info('ownKeys', target, Object.getOwnPropertyNames(target));
      Object.getOwnPropertySymbols(target).forEach(symbol => {
        Object.defineProperty(target, symbol, { enumerable: false });
      });
      return Reflect.ownKeys(target);
    },
    has: function (taget, property) {
      console.info('has', taget, property, typeof property);
      return Reflect.has(object, property);
    },
    set: function(object, property, value, receiver) {
      console.info('set', object, property, value, receiver);
      return Reflect.set(object, property, value, receiver);
    },
    get: function (object, property, receiver) {
      console.info('get', object, property);
      mapEmitterMethod(configKey, property, object);
      return Reflect.get(object, property, receiver);
    },
    apply: function(object, thisArg, argumentsList) {
      console.info('apply', object, thisArg, argumentsList);
      return Reflect.apply(object, thisArg, argumentsList);
    }
  };

  return new Proxy(object, handler);
};
