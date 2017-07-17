///////////////////////////////////////////////////////////////////////////////
// @file         : InputRange.jsx                                            //
// @summary      : InputRange component                                      //
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

import { remote } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Import styles
import './InputRange.css';

export default class InputRange extends Component {
  state = {
    value: 0
  };

  static defaultProps = {
    disabled: false,
    min: 0,
    max: 100,
    step: 1,
    onChange: new Function()
  };

  static propTypes = {
    disabled: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func
  }

  handleChange = event => {
    this.setState({
      value: event.target.value
    });
    this.props.onChange(event);
  }

  componentDidMount () {
    this.refs.range.addEventListener('change', this.drawTrack, false);
    this.refs.range.addEventListener('input', this.drawTrack, false);
  }

  componentWillUnmount () {
    this.refs.range.removeEventListener('change', this.drawTrack);
    this.refs.range.removeEventListener('input', this.drawTrack);
  }

  componentDidUpdate () {
    this.drawTrack();
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps) {
      return;
    }
    this.setState({
      value: nextProps.value || 0
    });
  }

  drawTrack = () => {
    const {value} = this.state;
    const {max, min} = this.props;
    const percentage = value / (max - min) * 100;
    const background = `linear-gradient(to right, #ed1e24 0%, #ed1e24 ${percentage}%, #2f2f2f ${percentage}%, #2f2f2f 100%)`;
    this.refs.range.style.background = background;
  }

  render () {
    return <input
      ref="range"
      className="range"
      type="range"
      min={this.props.min}
      max={this.props.max}
      value={this.state.value}
      onChange={this.handleChange}
      step={this.props.step}
      disabled={this.props.disabled}
    />
  }
}
