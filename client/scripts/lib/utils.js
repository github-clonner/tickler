///////////////////////////////////////////////////////////////////////////////
// @file         : utils.js                                                  //
// @summary      : Miscellaneous utilities                                   //
// @version      : 1.0.0                                                     //
// @project      :                                                           //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 31 Oct 2017                                               //
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

export isEmpty from 'lodash/isEmpty';
export throttle from 'lodash/throttle';
export debounce from 'lodash/debounce';
export camelCase from 'lodash/camelCase';

export const isFunction = (method) => {
  return (method !== null) &&
    typeof method === 'function' &&
    method.constructor === Function;
}

export const isObject = (object) => {
  return (object !== null) &&
    typeof object === 'object' &&
    object.constructor === Object;
}

export const isPlainObject = (object) => {
  return (object !== null) &&
    typeof object === 'object';
}

export const isPromise = (promise) => {
  return (promise !== null) &&
    typeof promise === 'object' &&
    promise.constructor === Promise &&
    isFunction(promise.then) &&
    isFunction(promise.catch);
}

export const isString = (string) => {
  return (string !== null) &&
    typeof string === 'string' &&
    string.constructor === String;
}

// $FlowIssue
export const isRenderer = (process && process.type === 'renderer');

