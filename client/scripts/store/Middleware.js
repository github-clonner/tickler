///////////////////////////////////////////////////////////////////////////////
// @file         : Middleware.js                                             //
// @summary      : Redux Store Middleware                                    //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 29 Oct 2017                                               //
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

import { createStore } from 'redux';
import { isFSA } from 'flux-standard-action';

function isPromise(promise) {
  return promise && promise.then && promise.catch;
}

export const actionListener = function (createStore) {
  return (reducer, initialState, enhancer) => {
    const actionListeners = {};
    const store = createStore(reducer, initialState, enhancer);
    const dispatch = store.dispatch;
    store.dispatch = action => {

      /* fix for legacy actions */
      const _action = { ...action }; delete _action.id;
      if (!isFSA(_action)) throw new Error('Invalid action');
      /* end fix for legacy actions */

      const result = dispatch(action);
      if (isPromise(result)) {
        console.log('isPromise', action)
      }
      if (action.type in actionListeners) {
        actionListeners[action.type].forEach((listener) => listener(action));
      }
      return result;
    };
    store.addActionListener = (actionType, listener) => {
      const { [actionType]: listeners = [ ] } = actionListeners;
      actionListeners[actionType] = [ ...listeners, listener ];
      return () => {
        actionListeners[actionType] = listeners.filter((l) => l !== listener);
      };
    };
    return store;
  };
};


const middlewareManagerHash = [];

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
export function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  funcs = funcs.filter(func => typeof func === 'function');

  if (funcs.length === 1) {
    return funcs[0];
  }

  const last = funcs[funcs.length - 1];
  const rest = funcs.slice(0, -1);
  return (...args) => rest.reduceRight((composed, f) => f(composed), last(...args));
}

export class MiddlewareManager {
  /**
   * @param {object} target The target object.
   * @param {...object} middlewareObjects Middleware objects.
   * @return {object} this
   */
  constructor(target, ...middlewareObjects) {
    let instance = middlewareManagerHash.find(function (key) {
      return key._target === target;
    });
    // a target can only has one MiddlewareManager instance
    if (instance === undefined) {
      this._target = target;
      this._methods = {};
      this._methodMiddlewares = {};
      middlewareManagerHash.push(this);
      instance = this;
    }
    instance.use(...middlewareObjects);

    return instance;
  }

  // Function's name start or end with "_" will not be able to apply middleware.
  _methodIsValid(methodName) {
    return !/^_+|_+$|constructor/g.test(methodName);
  }

  // Apply middleware to method
  _applyToMethod(methodName, ...middlewares) {
    if (typeof methodName === 'string' && this._methodIsValid(methodName)) {
      let method = this._methods[methodName] || this._target[methodName];
      if (typeof method === 'function') {
        this._methods[methodName] = method;
        if (this._methodMiddlewares[methodName] === undefined) {
          this._methodMiddlewares[methodName] = [];
        }
        middlewares.forEach(middleware =>
          typeof middleware === 'function' && this._methodMiddlewares[methodName].push(middleware(this._target))
        );
        this._target[methodName] = compose(...this._methodMiddlewares[methodName])(method.bind(this._target));
      }
    }
  }

  /**
   * Apply (register) middleware functions to the target function or apply (register) middleware objects.
   * If the first argument is a middleware object, the rest arguments must be middleware objects.
   *
   * @param {string|object} methodName String for target function name, object for a middleware object.
   * @param {...function|...object} middlewares The middleware chain to be applied.
   * @return {object} this
   */
  use(methodName, ...middlewares) {
    if (typeof methodName === 'object') {
      Array.prototype.slice.call(arguments).forEach(arg => {
        // A middleware object can specify target functions within middlewareMethods (Array).
        // e.g. obj.middlewareMethods = ['method1', 'method2'];
        // only method1 and method2 will be the target function.
        typeof arg === 'object' &&
        (arg.middlewareMethods ||
        (Object.keys(arg).length ? Object.keys(arg) : Object.getOwnPropertyNames(Object.getPrototypeOf(arg)))
        ).forEach(key => {
          typeof arg[key] === 'function' && this._methodIsValid(key) && this._applyToMethod(key, arg[key].bind(arg));
        });
      });
    } else {
      this._applyToMethod(methodName, ...middlewares);
    }

    return this;
  }
}

// the target object
class Person {
  // the target function
  walk(step) {
    this.step = step;
  }
  speak(word) {
    this.word = word;
  }
}

// middleware for walk function
const logger = target => next => (...args) => {
  console.log(`walk start, steps: ${args[0]}.`);
  const result = next(...args);
  console.log(`walk end.`);
  return result;
}

const middleware_1 = target => next => text => {
  console.log('middleware_1', text);
  return next(text.toUpperCase());
}

const middleware_2 = target => next => text => {
  console.log('middleware_2', text);
  return next(text.split('').reverse().join(''));
}


// apply middleware to target object
const person = new Person();
const middlewareManager = new MiddlewareManager(person);
middlewareManager.use('walk', middleware_1, middleware_2);
person.walk('hello world');




/* EOF */

