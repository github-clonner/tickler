// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Cover.jsx                                                 //
// @summary      : Cover component                                           //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 07 Sep 2017                                               //
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

import React from 'react';
import classNames from 'classnames';
import noalbum from './images/noalbum.svg';

type Props = {
  list: Array<Object>,
  setTitle: Function
};

type Thumbnail = {
  url: string,
  width: number,
  height: number
};

type Thumbnails = {
  default: Thumbnail,
  medium: Thumbnail,
  high: Thumbnail,
  standard: Thumbnail,
  maxres: Thumbnail
};

const getDefaultCoverImage = function (thumbnails: Thumbnails) {
  try {
    return thumbnails.default.url;
  } catch (error) {
    return noalbum;
  }
};

const Cover = (props: Props) => {
  const { list, setTitle } = props;
  return (<ul className="covers">{
    list.map((cover, index) => {
      const { isPlaying, thumbnails } = cover;
      const style = classNames('cover', {
        active: cover.isPlaying
      });
      return (
        <li className={ style } key={ index } onMouseOver={ () => setTitle(cover) }>
          <img src={ getDefaultCoverImage(thumbnails) } />
        </li>
      );
    })
  }</ul>);
};

export default Cover;
