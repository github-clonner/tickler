/////////////////////////////////////////////////////////////////////////////
// @file         : HashMap.js                                                //
// @summary      : Enhaced builtin Map                                       //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 01 Nov 2017                                               //
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

// const Formula = Object.create(Math);
// Formula.flatten  = function(...args) { return Array.prototype.concat(...args); };
// Formula.sum      = function(...args) { return Array.prototype.reduce.call(Formula.flatten(...args), (acc, curr) => (acc + curr)); };
// Formula.avg      = function(...args) { return Array.prototype.reduce.call([Formula.sum(...args)], (size, sum) => (sum / size), Formula.flatten(...args).length); };
// Formula.sort     = function(...args) { return Array.prototype.sort.apply(Formula.flatten(...args), [(a, b) => a - b]); };
import { isString, isSymbol, isValidKey } from './utils';

export default class HashMap extends Map {

  static fromArray(array) {
    return new HashMap(array.map((value, index) => ([value,[]])));
  };

  static fromObject(object) {
    const entries = Object.entries(object);
    const symbols = Object.getOwnPropertySymbols(object).map(symbol => [ symbol, object[symbol] ]);
    return new HashMap([...entries, ...symbols]);
  };

  constructor(...args) {
    super(...args);
  }

  set(key, value) {
    return super.set(key, value);
  }

  get(key) {
    return super.get(key);
  }

  push(key, value) {
    this.set(key, Array.from(this.get(key) || 0).concat(value));
  }

  filter(...args) {
    return Array.prototype.filter.apply(this.toEntries(), [...args]);
  }

  reduce(...args) {
    return Array.prototype.reduce.apply(this.toEntries(), [...args]);
  }

  map(...args) {
    return Array.prototype.map.apply(this.toEntries(), [...args]);
  }

  copy(target) {
    return this.forEach((plugin, name) => target.set(name, plugin));
  }

  toEntries() {
    return Array.from(this.entries());
  }

  toArray() {
    return Array.from(this.values());
  }

  toObject() {
    return Array
      .from(this.entries())
      .reduce((object, [key, value]) =>
        ({ ...object, [key]: value }), Object);
  }
}


