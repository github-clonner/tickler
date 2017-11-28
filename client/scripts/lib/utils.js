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

export random from 'lodash/random';
export isEmpty from 'lodash/isEmpty';
export throttle from 'lodash/throttle';
export debounce from 'lodash/debounce';
export camelCase from 'lodash/camelCase';
export fromPairs from 'lodash/fromPairs';
export isPlainObject from 'lodash/isPlainObject';

/**
 * Determine if variable is an function
 * @param {*} Whatever you need to determine to be function
 */
export const isFunction = (variable) => {
  return (variable !== null) &&
    typeof variable === 'function' &&
    variable.constructor === Function;
};

/**
 * Determine if variable is an object
 * @param {*} Whatever you need to determine to be an object
 */
export const isObject = (variable) => {
  return (variable !== null) &&
    typeof variable === 'object' &&
    variable.constructor === Object;
};

/**
 * Determine if variable is a plain object
 * @param {*} Whatever you need to determine to be a plain object
 */
// export const isPlainObject = (variable) => {
//   return (variable !== null) &&
//     typeof variable === 'object';
// };

/**
 * Determine if variable is a Promise
 * @param {*} Whatever you need to determine to be a Promise
 */
export const isPromise = (variable) => {
  return (variable !== null) &&
    typeof variable === 'object' &&
    variable.constructor === Promise &&
    isFunction(variable.then) &&
    isFunction(variable.catch);
};

/**
 * Determine if variable is a String
 * @param {*} Whatever you need to determine to be a String
 */
export const isString = (variable) => {
  return (variable !== null) &&
    typeof variable === 'variable' &&
    variable.constructor === String;
};

/**
 * Determine if variable is iterable
 * @param {*} Whatever you need to determine to be iterable
 * Inspiration: https://stackoverflow.com/questions/18884249/checking-whether-something-is-iterable
 */
export const isIterable = (variable) => (
  variable !== null && Symbol.iterator in Object(variable)
);

/**
 * Determine if variable is a Buffer
 * @param {*} Whatever you need to determine to be a Buffer
 */
export const isBuffer = (variable) => (Buffer.isBuffer(variable));

/**
 * Shuffle array
 * inspiration: https://stackoverflow.com/a/12646864/787098
 */
export const shuffle = (array) => {
  array = Array.from(array);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * inspiration: https://gist.github.com/bgrins/6194623
 */
export const isDataURL = (url) => {
  const regex = new RegExp(/^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i);
  return regex.test(url);
};

/**
 * URL validation
 * inspiration: https://gist.github.com/dperini/729294
 */
export const isWebURL = (url) => {
  const regex = new RegExp(
    "^" +
      // protocol identifier
      "(?:(?:https?|ftp)://)" +
      // user:pass authentication
      "(?:\\S+(?::\\S*)?@)?" +
      "(?:" +
        // IP address exclusion
        // private & local networks
        "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
        "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
        "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
        "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
        "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
        "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
      "|" +
        // host name
        "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
        // domain name
        "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
        // TLD identifier
        "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
        // TLD may end with dot
        "\\.?" +
      ")" +
      // port number
      "(?::\\d{2,5})?" +
      // resource path
      "(?:[/?#]\\S*)?" +
    "$", "i"
  );
  return regex.test(url);
};


/**
 * Converts camel cased string to dash (or custom)
 * @param {string} The string to convert.
 * @param {string} field separator.
 * @returns {string} Returns the dashed string.
 */
export const camelToDash = (string, separator = '-') => string
    .replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
    .replace(/([A-Z])/g, ([letter]) => separator.concat(letter.toLowerCase()));

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
};


/**
 *  Bare bones template interpolation/compiler
 */
export const hydrate = ( template, scope ) => {
  if (
    isString(template) && !isEmpty(template) &&
    isObject(scope) && !isEmpty(scope)
  ) {
    return Object.entries(scope).reduce((view, [ key, value ]) => {
      const regexp = new RegExp('\\${' + key + '}', 'gi');
      return view.replace(regexp, value);
    }, template.slice(0));
  } else {
    return null;
  }
};

/*
 *  Load and compile text based templates
 */
export const compileTemplate = async (template, scope) => {
  try {
    if(isValidFile(template)) {
      return hydrate(await fs.readFile(template, 'UTF-8'), scope);
    } else if (isWebURL(template)) {
      return hydrate(template, scope);
    } else {
      return hydrate(template, scope);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Compile and encode text templates
 * @param {template} template
 * @return {object} binding object
 * @return {string} encoded template
 */
export const encodeURITemplate = (template, scope) => 'data:text/html;charset=UTF-8,' + encodeURIComponent(compileTemplate(template, scope));

/**
 * Convert primitive data types to Buffer
 * @param {any} data to make buffer from
 * @return {buffer} buffer or null if can't convert
 */
export const toBuffer = (data) => {
  try {
    switch (data.constructor) {
      case String: return Buffer.from(data);
      case Object: return Buffer.from(JSON.stringify(data));
      case Number: return Buffer.from(data.toString());
      default:
        return null;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Create object from iterable entries
 * @param {iterator} key-value pairs
 * @return {object} a dictionary of key-values
 */
export const fromEntries = (entries) => (
  isIterable(entries) && Object.assign( ...entries.map(([ key, value ]) => ({ [key]: value })) )
);
// export const fromEntries = (entries) => (
//   isIterable(entries) && Array.from(entries).reduce((object, [ key, value ]) => ({ ...object, [ key ]: value }), Object)
// );

/*
  Prettify/Format large numbers
*/
const numeral = function (value, format) {

  const magnitude = (value) => {
    return Math.floor(Math.log(value * 10) / Math.LN10 + Number.EPSILON); // because float math rounding
  };

  const abbreviations = {
    hundred: [null, 0],
    thousand: ['K', 3],
    million: ['M', 6],
    billion: ['B', 9],
    trillion: ['T', 12]
  };

  const humanize = (value) => {
    const mag = magnitude(value);
    return Object.entries(abbreviations)
      .filter(([abbreviation, [symbol, range]]) => (mag > range && mag <= (range + 3)))
      .reduce((result, [abbreviation, [symbol, range]]) => result.toString().substr(0, mag - range).concat(symbol), value);
  };

  return humanize(value);
};

export const prettyNumber = input => (typeof input === 'number') ? numeral(input) : 0;
