///////////////////////////////////////////////////////////////////////////////
// @file         : index.jsx                                                 //
// @summary      : Application entry point                                   //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Feb 2017                                               //
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

import React, { Component } from 'react';
// import mimeTypes from 'mimer/lib/data/mime.types';
// import txt from './types.txt';
// import * as DataURI from 'datauri-build';
// const Datauri = require('datauri').promise;
import { WebView } from '../../components';
import './About.css';

// console.log('mimeTypes', mimeTypes);
// console.log('txt', txt);

// console.log(DataURI('/Users/bmaggi/tickler/hello.html'));

const data = 'data:text/html;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KCjxoZWFkPgogIDxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KICA8dGl0bGU+SGVsbG8gV29ybGQ8L3RpdGxlPgogIDxzdHlsZSB0eXBlPSd0ZXh0L2Nzcyc+CiAgICBodG1sLCAuYm9keSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJlZAogICAgfQogIDwvc3R5bGU+CjwvaGVhZD4KCjxib2R5PgogIDxoMT5IZWxsbyBXb3JsZDwvaDE+CiAgPHA+IEphbWllIHdhcyBoZXJlLiA8L3A+CjwvYm9keT4KCjwvaHRtbD4K';

export default class About extends Component {
  render () {
    const src = "about:blank";
    const style = "page";
    return (
      <div className="about">
        <h1>About</h1>
        <WebView src={ data } className={ style } />
      </div>
    );
  }
}
