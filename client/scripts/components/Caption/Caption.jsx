///////////////////////////////////////////////////////////////////////////////
// @file         : Caption.jsx                                               //
// @summary      : Media caption component                                   //
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

import Style from './Caption.css';
import classNames from 'classnames';
import React, { Component } from 'react';

const Title = ({ title }) =>
  <h1 className={ Style.title }>
    { title }
  </h1>;

const Author = ({ author }) =>
  <h2 className={ classNames( Style.metadataLine, Style.author ) }>
    <span>Author</span>
    <span>{ author }</span>
  </h2>;

const Artist = ({ artist }) =>
  <h2 className={ classNames( Style.metadataLine, Style.artist ) }>
    <span>Artist</span>
    <span>{ artist }</span>
  </h2>;

const Size = ({ size }) =>
  <h2 className={ classNames( Style.metadataLine ) }>
    <span>Size</span>
    <span>{ size }</span>
  </h2>;

const Description = ({ description }) =>
  <p className={ Style.description }>
    { description }
  </p>;

export const MediaCaption = ({ title, artist, description }) =>
  <div className={ Style.caption } >
    <Title title={ title } />
    <Artist artist={ artist } />
    <Description description={ description } />
  </div>;

export const LibraryCaption = ({ title, size, description }) =>
  <div className={ Style.caption } >
    <Title title={ title } />
    <Size size={ size } />
    <Description description={ description } />
  </div>;
