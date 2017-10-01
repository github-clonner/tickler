// @flow

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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Time, { parseDuration } from '../../lib/Time';
import durationFormat from '@maggiben/duration-format';
// Import styles
import Style from './TimeCode.css';

type Props = {
  time: number,
  duration: number
};

type State = {
  format: bool
};

export default class TimeCode extends Component<Props, State> {
  state = {
    format: false
  };

  static defaultProps = {
    time: 0,
    duration: 0
  };

  static propTypes = {
    time: PropTypes.number,
    duration: PropTypes.number
  };

  format (time: number) : string {
    const { format } = this.state;
    return durationFormat(time * 1000, `${(format ? '-' : '\u00A0')}#{2H}:#{2M}:#{2S}`);
  }

  stringify () : string {
    const { format } = this.state;
    const { duration, time } = this.props;
    if (format) {
      return this.format(duration - (format ? time : 0));
    } else {
      return this.format(time);
    }
  }

  toggleFormat = () => {
    return this.setState({
      format: !this.state.format
    });
  }

  render () {
    return (<span className={ Style.timeCode } onClick={ this.toggleFormat }>{ this.stringify() }</span>);
  }
}

export const TrackDuration = (props: Props) => {
  const { duration = 0 } = props;
  return (<span>{ durationFormat(Number.isInteger(duration) ? duration : parseDuration(duration), '#{2H}:#{2M}:#{2S}') }</span>);
};
