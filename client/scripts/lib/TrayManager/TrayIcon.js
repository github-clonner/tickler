// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : TrayIcon.js                                               //
// @summary      : System's notification utitities for icons                 //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 27 Nov 2017                                               //
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

const os = require('os');
const path = require('path');
const { EventEmitter } = require('events');
const { remote } = require('electron');
const { app, Menu, MenuItem, Tray, nativeImage, BrowserWindow, screen } = remote;
const { isEmpty, isDataURL, isPlainObject, isObject, isString, isBuffer, fromEntries } = require('../utils');
const { isValidFile } = require('../FileSystem');

const isMenu = (object) => (!isPlainObject(object) && !isEmpty(object.items));

/**
 * More on icons and SystemMetrics:
 * Icon Reference by OS: http://iconhandbook.co.uk/reference/chart/
 */
export const STANDARD_ICON = {
  'darwin': {
    formats: [ 'png' ],
    size: {
      small: { width: 16, height: 16 },
      medium: { width: 22, height: 22 },
      normal: { width: 32, height: 32 },
      large: { width: 48, height: 48 }
    },
    bounds: {
      height: screen.getMenuBarHeight(), // https://electronjs.org/docs/api/screen#screengetmenubarheight-macos
      width: screen.getMenuBarHeight()
    },
    pixelRatio: ((primaryDisplay) => primaryDisplay.scaleFactor)(screen.getPrimaryDisplay())
  },
  'linux': {
    formats: [ 'png' ],
    size: {
      small: { width: 16, height: 16 },
      normal: { width: 32, height: 32 },
      large: { width: 48, height: 48 }
    },
    pixelRatio: ((primaryDisplay) => primaryDisplay.scaleFactor)(screen.getPrimaryDisplay())
  },
  'win32': {
    formats: [ 'ico' ],
    size: {
      small: { width: 16, height: 16 },
      normal: { width: 32, height: 32 },
      large: { width: 48, height: 48 }
    },
    bounds: {
      height: 32, // https://electronjs.org/docs/api/screen#screengetmenubarheight-macos
      width: 32
    },
    pixelRatio: ((primaryDisplay) => primaryDisplay.scaleFactor)(screen.getPrimaryDisplay())
  },
  '*': {
    formats: [ 'ico' ],
    size: {
      small: { width: 16, height: 16 },
      normal: { width: 32, height: 32 },
      large: { width: 48, height: 48 }
    },
    bounds: {
      height: 32, // https://electronjs.org/docs/api/screen#screengetmenubarheight-macos
      width: 32
    },
    pixelRatio: ((primaryDisplay) => primaryDisplay.scaleFactor)(screen.getPrimaryDisplay())
  }
};


const isInside = ({ width, height }, { width: maxWidth, height: maxHeight }) => {
  if ((width <= maxWidth) && (height <= maxHeight)) {
    return true;
  } else {
    return false;
  }
}

const findNearestSize = (size, bounds) => {
  const { size: scales } = standardIcon();
  console.log('scales', scales, size, bounds);
  return Object.entries(scales)
  .sort((a, b) => b[1].width - a[1].width)
  .find(([scale, size]) => isInside(size, bounds));
};

const standardIcon = () => {
  const platform = os.platform();
  if (platform in STANDARD_ICON) {
    return { ...STANDARD_ICON[platform] };
  } else {
    return { ...STANDARD_ICON['*'] };
  }
};

export const createIcon = (source, options) => {
  function create(source) {
    try {
      if (isDataURL(source)) {
        return nativeImage.createFromDataURL(source);
      } else if (isBuffer(source)) {
        return nativeImage.createFromBuffer(source);
      } else if (isValidFile(source)) {
        return nativeImage.createFromPath(source);
      } else {
        return nativeImage.createEmpty();
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  return isEmpty(options) ? create(source) : fitIcon(create(source), options);
};

const getFileIcon = (file, options = { size: 'normal' }) => {
  if (isEmpty(file) || !isValidFile(file)) return Promise.reject(new Error('Invalid file'));
  return new Promise((resolve, reject) => {
    return app.getFileIcon(file, options, (error, icon) => {
      if (error) return reject(error);
      if (!icon) return reject(new Error('Cannot get icon from: %s', file));
      return resolve(icon);
    });
  });
};

const getMaxDimension = (size) => {
  return Object.entries(size).reduce((dimension, [ property, measure ], index, array) => {
    return dimension ? ((size[dimension] < measure) ? property : dimension) : property;
  }, null);
};

const inflate = ({ width, height }, factor) => {
  return {
    width: (width + factor),
    height: (height + factor)
  };
};

const fitIcon = (icon, options) => {
  options = { size: 'small', ...options };

  function getBounds(options) {
    const { bounds, size } = options;
    if (bounds) {
      return bounds;
    } else {
      const { bounds } = standardIcon();
      return bounds;
    }
  }
  const bounds = getBounds(options);
  const iconMetrics = {
    size: icon.getSize(),
    aspectRatio: icon.getAspectRatio(),
    contains(rect) {
      const size = { x: 0, y: 0, ...icon.getSize() };
      if ((rect.x + rect.width) < (size.x + size.width)
        && (rect.x) > (size.x)
        && (rect.y) > (size.y)
        && (rect.y + rect.height) < (size.y + size.height)
      ) {
         return true;
      } else {
        return false;
      }
    },
    isInside(bounds) {
      return isInside(icon.getSize(), bounds);
    }
  };
  if (!iconMetrics.isInside(bounds)) {
    const [scale, { width, height }] = findNearestSize(iconMetrics.size, bounds);
    console.log('findNearestSize', { width, height });
    return icon.resize(inflate({ width, height }, -4));
  } else {
    return icon;
  }
};
