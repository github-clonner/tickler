///////////////////////////////////////////////////////////////////////////////
// @file         : MapEx.js                                                  //
// @summary      : Enhaced Inmutable Map with schema validation              //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 01 Oct 2017                                               //
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

import Immutable from 'immutable';
import Ajv from 'ajv';
import schema from '../../schemas/playlist.json';

const MapValidator = new Proxy(Immutable.Map, {
  construct: function(target, [ validator, dictionary ], newTarget) {
    if (validator.validate('playlist#/definitions/Track', dictionary)) {
      return Reflect.construct(target, [ dictionary ], newTarget);
    } else {
      console.error(validator.errorsText(), validator.errors);
      throw new Error(validator.errorsText());
    }
  },
  has: function (taget, property) {
    return Reflect.has(target, property);
  },
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  apply: function(target, thisArg, argumentsList) {
    return Reflect.apply(target, thisArg, argumentsList);
  }
});

export default class MapEx extends MapValidator {
  constructor (args) {
    const validator = new Ajv({
      allErrors: true,
      useDefaults: true,
      removeAdditional: true
    });
    validator.addSchema(schema, 'playlist');
    super(validator, args);
  }

  toString() {
    return this.toJS().toString();
  }
}
