// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Playback.jsx                                              //
// @summary      : Playback controls component                               //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 30 Sep 2017                                               //
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
import classNames from 'classnames';
import Style from '../Player.css';

export default ({ isPlaying, jump, stop, playPause }) => {
  return (
    <div className={ Style.btnGroup } >
      <button className={ Style.roundButton } onClick={ jump(-1) }  title="backward" disabled={ false }>skip_previous</button>
      <button className={ Style.roundButton } onClick={ stop }      title="stop"     disabled={ !isPlaying }>stop</button>
      <button className={ Style.roundButton } onClick={ jump(+1) }  title="forward"  disabled={ false }>skip_next</button>
      <button className={ Style.roundButton } onClick={ playPause } title="play"     disabled={ false }>{ isPlaying ? 'pause' : 'play_arrow' }</button>
    </div>
  );
};
