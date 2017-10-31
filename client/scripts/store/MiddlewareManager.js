///////////////////////////////////////////////////////////////////////////////
// @file         : MiddlewareManager.js                                      //
// @summary      : Redux MiddlewareManager                                   //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
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

/**
 * Inspired by: https://github.com/unbug/js-middleware/blob/master/lib/Middleware.js
 */

import { applyMiddleware, compose } from 'redux';
import { isFSA } from 'flux-standard-action';
import { isFunction, isObject, isPlainObject, isPromise, isString } from '../lib/utils';


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
// export function compose(...funcs) {
//   if (funcs.length === 0) {
//     return arg => arg;
//   }

//   funcs = funcs.filter(func => typeof func === 'function');

//   if (funcs.length === 1) {
//     return funcs[0];
//   }

//   const last = funcs[funcs.length - 1];
//   const rest = funcs.slice(0, -1);
//   return (...args) => rest.reduceRight((composed, f) => f(composed), last(...args));
// }

export class MiddlewareManager {

  static targets = new Map();
  /**
   * @param {object} target The target object.
   * @param {...object} middlewareObjects Middleware objects.
   * @return {object} this
   */
  constructor(target, store, ...middlewareObjects) {
    const { targets } = MiddlewareManager;
    // a target can only has one MiddlewareManager instance
    if (!targets.has(target)) {
      this.target = target;
      this.store = store;
      this.methods = {};
      this.methodMiddlewares = {};
      targets.set(this, this);
    } else {
      return targets.get(target).use(...middlewareObjects);
    }
  }

  // Function's name start or end with "_" will not be able to apply middleware.
  methodIsValid(methodName) {
    return isString(methodName) ? !/^_+|_+$|constructor/g.test(methodName) : false;
  }

  // Apply middleware to method
  applyToMethod(methodName, ...middlewares) {
    const { target, store, methods, methodMiddlewares, methodIsValid } = this;
    if (methodIsValid(methodName)) {
      const method = methods[methodName] || target[methodName];
      if (isFunction(method)) {
        methods[methodName] = method;
        const validMiddlewares = middlewares
          .filter(isFunction)
          // .map(middleware => middleware(target, store));
          .map(middleware => middleware(store));
        const methodMiddleware = (methodMiddlewares[methodName] || []).concat(validMiddlewares);
        // Promise.all(methodMiddleware).then(r => console.log('solved', r));
        // console.log('applyToMethod', validMiddlewares, methodMiddleware);
        const composed = compose(...methodMiddleware);
        return target[methodName] = composed(method.bind(target));
      }
    }
  }

  getProperties(object) {
    console.log('getProperties ', typeof object, 'isPromise' ,isPromise(object))
    if (isObject(object) || 'middlewareMethods' in object) {
      /* Object is plain object or has middlewareMethods */
      return object.middlewareMethods || Object.keys(object);
    } else {
      /* Object is probably class enumerate */
      return Object.getOwnPropertyNames(Object.getPrototypeOf(object));
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
    if (isPlainObject(methodName)) {
      return Array.from(arguments).map(arg => {
        // A middleware object can specify target functions within middlewareMethods (Array).
        // e.g. obj.middlewareMethods = ['method1', 'method2'];
        // only method1 and method2 will be the target function.
        return this.getProperties(arg)
        .filter(key => {
          return (isFunction(arg[key]) && this.methodIsValid(key));
        })
        .map(key => {
          return this.applyToMethod(key, arg[key].bind(arg));
        });
      });
    } else {
      return this.applyToMethod(methodName, ...middlewares);
    }
  }
}

/*
// the target object
class Person {
  // the target function
  walk(step) {
    this.step = step;
    console.log('WALK', step);
    return 100;
  }
  speak(word) {
    this.word = word;
    return 200;
  }
  jump(height) {
    this.height = height;
    console.log('JUMP', height);
    return 300;
  }
  swim(action) {
    const { distance } = action.payload;
    console.log('SWIM', action.type, distance, action.payload);
    return 400;
  }
}

const middleware_1 = target => next => text => {
  console.log('middleware_1', text);
  return next(text.toUpperCase());
}

const middleware_2 = target => next => text => {
  console.log('middleware_2', text);
  return next(text.split('').reverse().join(''));
}

const middleware_3 = target => next => (...args) => {
  console.log('middleware_3', args.toString());
  return next(...args);
}

const middleware_A = store => next => action => {
  console.log('middleware_A', isFSA(action), action.type, action.payload);
  action.payload.hoops += 1;
  return next(action);
}

const middleware_B = store => next => action => {
  console.log('middleware_B', isFSA(action), action.type, action.payload);
  action.payload.hoops += 1;
  return next(action);
}

const middleware_C = store => next => action => {
  console.log('middleware_C', isFSA(action), action.type, action.payload);
  action.payload.hoops += 1;
  return next(action);
}

const ActionHandlers_A = {
  walk: store => next => text => {
    return next(text.split('').reverse().join('').toUpperCase());
  },
  jump: store => next => action => {
    action.payload.hoops += 1;
    return next(action);
  }
}
const ActionHandlers_B = {
  swim: store => next => action => {
    action.payload.distance += 1;
    return next(action);
  }
}

class PersonMiddleware {
  constructor() {
    // Or Define function names for middleware target.
    // this.middlewareMethods = ['walk', 'speak'];
  }
  // Function's name start or end with "_" will not be able to apply as middleware.
  _getPrefix() {
    return 'Middleware log: ';
  }
  log(text) {
    console.log(this._getPrefix() + text);
  }
  walk(store) {
    return next => text => {
      return next(text.split('').reverse().join('').toUpperCase());
    }
  }
  jump(store) {
    const name = 'jump';
    return next => action => {
      action.payload.hoops += 1;
      return next(action);
    }
  }
  speak(target) {
    return next => word => {
      this.log('this is a middleware trying to say: ' + word);
      return next(word);
    }
  }
}

// apply middleware to target object
const person = new Person();
const middlewareManager = new MiddlewareManager(person);
// middlewareManager.use('walk', middleware_1, middleware_2, middleware_3);
// middlewareManager.use('jump', middleware_A, middleware_B, middleware_C);
middlewareManager.use(ActionHandlers_A, ActionHandlers_B, ActionHandlers_B);
person.walk('hello world');
person.jump({
  type: 'DO_JUMP',
  payload: { hoops: 0 }
});
person.swim({
  type: 'DO_JUMP',
  payload: { distance: 1 }
});
person.swim({
  type: 'DO_JUMP',
  payload: { distance: 2 }
});
person.walk('dlrow olleh');

*/

// middlewareManager.use(new PersonMiddleware())
// person.walk('hello world');
// person.speak('hi');
// person.jump({
//   type: 'DO_JUMP',
//   payload: { hoops: 0 }
// });
// person.jump({
//   type: 'DO_JUMP',
//   payload: { hoops: 0 }
// });

/* EOF */

