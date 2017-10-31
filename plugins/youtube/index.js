///////////////////////////////////////////////////////////////////////////////
// @file         : index.js                                                  //
// @summary      :                                                           //
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
const uuid = require('uuid/v1');
const { app, shell, remote, remote: { dialog } } = require('electron');

/* Private variables */
const isRenderer = (process && process.type === 'renderer');
console.log('isRenderer', isRenderer);

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


/* onUnload */
exports.onUnload = (event) => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => resolve(true), 3000);
  });
};

/* Our extension's custom redux middleware. Here we can intercept redux actions and respond to them. */
exports.middleware = (store) => (next) => (action) => {
  const { getState, dispatch } = store;
  const List = getState().PlayListItems.toJS();
  switch (action.type) {
    case 'SELECT_ITEM': {
      return next({
        type: 'SELECT_INDEX',
        payload: getRandomInt(0, (List.length - 1))
      });
    };
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

