///////////////////////////////////////////////////////////////////////////////
// @file         : Equalizer.jsx                                             //
// @summary      : Audio equalizer widget                                    //
// @version      : 0.0.2                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Sep 2017                                               //
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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../../actions';
/* Import styles */
import './Equalizer.css';

function mapStateToProps(state) {
  return {
    toolbar: state.ToolBar.toJS(),
    audio: state.Audio
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Equalizer extends Component {

  constructor(...args) {
    super(...args);
    // Audio analyser
    this.analyser = null;
    //width of the meters in the spectrum
    this.meterWidth = 10;
    // Gap between meters
    this.gap = 2;
    // Bar cap height
    this.capHeight = 2;
    // Bar cap color
    this.capStyle = '#E9D2E8';
    // Count of the meters
    this.meterNum = 800 / (10 + 2);
    // Store the vertical position of hte caps for the preivous frame
    this.capYPositionArray = [];
  }

  componentDidMount () {
    this.width = this.refs.canvas.width;
    this.height = this.refs.canvas.height - 2;
    this.ctx = this.refs.canvas.getContext('2d');
    this.gradient = this.ctx.createLinearGradient(0, 0, 0, 300);
    this.gradient.addColorStop(1, '#feafc7');
    this.gradient.addColorStop(0.5, '#e76588');
    this.gradient.addColorStop(0, '#81254a');
  }

  // componentWillReceiveProps (nextProps) {
  //   if (!nextProps.audio.analyser) {
  //     return;
  //   }
  //   this.setState({
  //     analyser: nextProps.audio.analyser
  //   });
  //   if (nextProps.audio.analyser) {
  //     this.analyser = nextProps.audio.analyser;
  //     this.renderFrame(this.analyser);
  //   }
  // }

  renderFrame = () => {
    let analyser = this.analyser;
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    // Sample limited data from the total array
    let step = Math.round(array.length / this.meterNum);
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (var i = 0; i < this.meterNum; i++) {
      var value = array[i * step];
      if (this.capYPositionArray.length < Math.round(this.meterNum)) {
          this.capYPositionArray.push(value);
      };
      this.ctx.fillStyle = this.capStyle;
      // Draw the bar cap, with transition effect
      if (value < this.capYPositionArray[i]) {
          this.ctx.fillRect(i * 12, this.height - (--this.capYPositionArray[i]), this.meterWidth, this.capHeight);
      } else {
          this.ctx.fillRect(i * 12, this.height - value, this.meterWidth, this.capHeight);
          this.capYPositionArray[i] = value;
      };
      // Set the filllStyle to gradient for a better look
      this.ctx.fillStyle = this.gradient;
      // Draw the meter
      this.ctx.fillRect(i * 12 /*meterWidth+gap*/ , this.height - value + this.capHeight, this.meterWidth, this.height);
    }
    if (this.analyser || this.state.analyser) {
      requestAnimationFrame(this.renderFrame);
    }
  }

  render () {
    let {toolbar} = this.props;
    let style = classNames('equalizer', {
      active: toolbar.equalizer
    });
    return (
      <div className={style}>
        <canvas ref='canvas' width="800" height="350" className="draw-surface"></canvas>
      </div>
    );
  }
};
