///////////////////////////////////////////////////////////////////////////////
// @file         : TimeCode.jsx                                              //
// @summary      : TimeCode component                                        //
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

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Time from 'lib/Time';
import format from '@maggiben/duration-format';
// Import styles
import './TimeCode.css';

export default class TimeCode extends Component {
  state = {
    format: false
  }

  static defaultProps = {
    currentTime: 0,
    duration: 0
  };

  static propTypes = {
    currentTime: PropTypes.number,
    duration: PropTypes.number
  }

  decodeTime (time) {
    if(this.state.format) {
      time = this.props.duration - time;
    }
    let currentTime = format(time * 1000, '#{2H}:#{2M}:#{2S}')
    return this.state.format ? `-${currentTime}` : currentTime;
  }

  toggleFormat = () => {
    return this.setState({
      format: !this.state.format
    });
  }

  render () {
    //format(this.props.time, '#{2H}:#{2M}:#{2S}')
    return (<span className="time-code" onClick={this.toggleFormat}>{this.decodeTime(this.props.time)}</span>);
  }
}
