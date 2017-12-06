///////////////////////////////////////////////////////////////////////////////
// @file         : MediaInfo.jsx                                             //
// @summary      : Media information container                               //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 17 Nov 2017                                               //
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

import Style from './MediaInfo.css';
import React, { Component } from 'react';

export const MediaInfo = function (media, ...args) {
  const noop = () => {};
  const $error = {
    message: null
  };

  return (
    <form className={ Style.form }>
      <div className={ Style.formGroup }>
        <label htmlFor="title">Title</label>
        <input type="text" className={ Style.formControl } id="title" value={ media.title} onChange={ noop }/>
        <small className={ Style.formText }>{ $error.message }</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="artist">artist</label>
        <input type="text" className={ Style.formControl } id="artist" value={ media.artist } onChange={ noop }/>
        <small className={ Style.formText }>{ $error.message }</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="album">album</label>
        <input type="text" className={ Style.formControl } id="album" value={ media.album } onChange={ noop }/>
        <small className={ Style.formText }>{ $error.message }</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="genre">genre</label>
        <input type="text" className={ Style.formControl } id="genre" value={ media.genre } onChange={ noop }/>
        <small className={ Style.formText }>{ $error.message }</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="description">description</label>
        <input type="text" className={ Style.formControl } id="description" value={ media.description } onChange={ noop }/>
        <small className={ Style.formText }>{ $error.message }</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="copyright">copyright</label>
        <input type="text" className={ Style.formControl } id="copyright" value={ media.copyright } onChange={ noop }/>
        <small className={ Style.formText }>{ $error.message }</small>
      </div>
      <div className={ Style.formGroup }>
        <label htmlFor="location">location</label>
        <input type="text" className={ Style.formControl } id="location" onChange={ noop }/>
        <small className={ Style.formText }>{ $error.message }</small>
      </div>
    </form>
  );
};
