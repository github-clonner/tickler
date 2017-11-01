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


/**
 * Promisify callback style functions
 */
function promisify(func) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      return func(...args, (error, result) => (error ? reject(error) : resolve(result)));
    });
  }
}

/*
 * Access nested object property by string path
 * inspiration: https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
 */
const get = (object: Object, path: string, defaultValue?: any) => path
  .replace(/\[(\w+)\]/g, '.$1') // Convert indexes to properties
  .replace(/^\./, '')           // strip leading dot
  .split('.')                   // Split (.) into array of properties
  .reduce((object = {}, key) => object[key], object);

/*
 * A factory for a get similar to lodash _.get() just pass a Map()
 */
export const getGenerator = (hashMap) => {
  /*
   * Gets the value at path of object. If the resolved value is undefined, the defaultValue is returned in its place.
   * @param {string} path The path of the property to get.
   * @param {*} default value to return if undefined
   * @returns {*} Returns the resolved value.
   */
  return function (path, defaultValue) {
    // const { hashMap } = this;
    /** Used to match property names within property paths. */
    const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    const reIsPlainProp = /^\w*$/;

    const hasProperty = property => (reIsPlainProp.test(property) && hashMap.has(property));
    const getProperty = property => (hasProperty(property) ? hashMap.get(property) : defaultValue);

    if (reIsDeepProp.test(path)) {
      const [ property, properties ] = path.split(/\.(.+)/).filter(Boolean);
      return properties
        .replace(/\[(\w+)\]/g, '.$1') // Convert indexes to properties
        .replace(/^\./, '') // strip leading dot
        .split('.') // Split (.) into array of properties
        .reduce((o = {}, key) => o[key], getProperty(property)) || defaultValue;
    } else {
      return getProperty(path);
    }
  }
}


export const b64EncodeUnicode = (str) => {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}

export const b64DecodeUnicode = (str) => {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}
