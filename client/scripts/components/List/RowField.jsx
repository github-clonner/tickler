// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : RowField.jsx                                              //
// @summary      : Augmented Row fields                                      //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 26 Sep 2017                                               //
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
import Spinner from '../Spinner/Spinner';
import Stars from '../Stars/Stars';
import { TrackDuration } from '../TimeCode/TimeCode';
import type { Track } from '../../types';
// Styles
import Style from './List.css';

const getItemStatus = (song) => classNames(Style.field, {
  [Style.local]: song.file
});

const getItemIcon = song => {
  if (!song.file && !song.isLoading) {
    return 'wifi';
  } else if (song.isLoading) {
    return <Spinner />;
  } else {
    return (song.isPlaying) ? 'play_arrow' : 'stop';
  }
};


/*
 * Media item index
 * @param {number} item index location in the list
 */
export const Index = function ({ index }: number, ...args) {
  return (
    <span className={ Style.field } role="index">{ ( index + 1 ) }</span>
  );
};

/*
 * Media item status icon
 * @param {Track} Media Item
 */
export const Status = function ({ song }: Track, ...args) {
  const status = getItemStatus(song);
  const icon = getItemIcon(song)
  return (
    <span className={ status } role="status">{ icon }</span>
  );
};

/*
 * Media item title
 * @param {string} The item title
 */
export const Title = function ({ title }: string, ...args) {
  return (
    <span className={ Style.field } role="title">{ title }</span>
  );
};

/*
 * Media item rating
 * @param {number} rate valuation
 */
export const Rating = function ({ stars }: number) {
  return (
    <span className={ Style.field } role="stars">
      <Stars stars={ stars }/>
    </span>
  );
};

/*
 * Media item duration
 * @param {number} Content duration
 */
export const Duration = function ({ duration }: number) {
  return (
    <span className={ Style.field } role="duration">
      <TrackDuration duration={ duration } format="#{2H}:#{2M}:#{2S}"/>
    </span>
  );
};

/*
 * Media item call to action dropdown menu
 * @param {Function} onClick action handler
 */
export const DropDown = function ({ onClick }: Function, ...args) {
  return (
    <button className={ classNames(Style.field, Style.roundButton, Style.dropdown) } role="dropdown" onClick={ onClick }>•••</button>
  );
};


