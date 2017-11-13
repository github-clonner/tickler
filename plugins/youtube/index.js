///////////////////////////////////////////////////////////////////////////////
// @file         : index.js                                                  //
// @summary      : Youtube Plugin                                            //
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

/* Dependencies */
const fs = require('fs');
const path = require('path');
const url = require('url');
const uuid = require('uuid/v1');
const plugin = require('./plugin.json');
const { app, shell, remote, remote: { dialog } } = require('electron');
const { isValidSource } = require('./src/sourceValidate');
// const validator_A = b64EncodeUnicode(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
const URL_REGEXP = new RegExp(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);

/* Private variables */
const isRenderer = (process && process.type === 'renderer');
console.log('isRenderer', isRenderer);
console.log('YouTube Plugin', plugin);

/* Private Methods */
function isFunction(method) {
  return (method !== null) &&
    typeof method === 'function' &&
    method.constructor === Function;
}

function isObject(object) {
  return (object !== null) &&
    typeof object === 'object' &&
    object.constructor === Object;
}

function isPlainObject(object) {
  return (object !== null) &&
    typeof object === 'object';
}

function isPromise(promise) {
  return (promise !== null) &&
    typeof promise === 'object' &&
    promise.constructor === Promise &&
    isFunction(promise.then) &&
    isFunction(promise.catch);
}

function isString(string) {
  return (string !== null) &&
    typeof string === 'string' &&
    string.constructor === String;
}

function b64EncodeUnicode(str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}

function b64DecodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

/**
 * Get a random floating point number between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} a random floating point number
 */
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Get a random integer between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {number} a random integer
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Get a random boolean value.
 *
 * @return {boolean} a random true/false
 */
function getRandomBool() {
  return Math.random() >= 0.5;
}

// function interceptor (state, action) {
//   switch (action.type) {
//     case Action.SET_CONTEXT: return { ...state, context: action.payload };
//     default:
//       return state;
//   }
// }

/* Public exports */
// module.exports = {
//   id: getId(),
//   onApp(event) {},
//   onWindow(event) {},
//   onRendererWindow(event) {},
//   onUnload: new Promise(onUnload),
//   middleware(store) {
//     return next => action => {
//       const { getState, dispatch } = store;
//       console.log('YOUTUBE MIDDLEWARE', action.type);
//       return next(action);
//     }
//   },
//   decorateMenu(event) {},
//   decorateHeader(event) {},
//   decorateNotification(event) {},
//   decorateNotifications(event) {},
//   decorateConfig(event) {},
//   decorateEnv(event) {}
// };

exports.mediaPlayback = (media, ...args) => {
  console.log('MEDIAPLAYBACK', media, ...args);
  return new Date();
};

exports.extendsMediaIcon = (origin, size) => {
  if (isValidSource(origin)) {
    const { manifest: { icons } } = plugin;
    return size ? icons[size] : icons;
  }
};

exports.extendMediaSources = (origin) => {
  const { protocol, host } = url.parse(origin);
  const { manifest: { sources } } = plugin;
  return isValidSource(origin);
};

/* onUnload */
exports.onUnload = (event) => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => resolve(true), 3000);
  });
};

exports.mapDispatch = (...args) => async (dispatch, getState) => {
  const { PlayListItems } = getState();
  return dispatch({
    type: 'SELECT_INDEX',
    payload: 10
  });
};

/* Our extension's custom redux middleware. Here we can intercept redux actions and respond to them. */
exports.middleware = (store) => (next) => (action) => {
  const { getState, dispatch } = store;
  switch (action.type) {
    case 'RECEIVE_LIST_ITEMS': {
      action.payload.forEach(item => {
        if (item && URL_REGEXP.test(item.url)) {
          item.icon = 'https://www.google.com/images/icons/product/youtube-32.png'
        }
      })
      return next(action);
    }
    default:
      return next(action);
  }
}

/* debug */
exports.debug = (...args) => {
  console.log(...args);
};

/* alert */
exports.alert = (message, type = 'error', title = 'Alert', buttons = ['Ok']) => {
  return dialog.showMessageBox({
    type,
    title,
    message,
    buttons
  });
};

