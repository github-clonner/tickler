import React, { Component, PropTypes } from 'react';
import { findDOMNode } from "react-dom";
import classNames from 'classnames';

require('./equalizer.css');
/* Redux stuff */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../../actions';

function mapStateToProps(state) {
  return {
    toolbar: state.Player,
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
    console.log('eq componentDidMount', this.props.audio.wavesurfer)
    this.width = this.refs.canvas.width;
    this.height = this.refs.canvas.height - 2;
    this.ctx = this.refs.canvas.getContext('2d');
    this.gradient = this.ctx.createLinearGradient(0, 0, 0, 300);
    this.gradient.addColorStop(1, '#feafc7');
    this.gradient.addColorStop(0.5, '#e76588');
    this.gradient.addColorStop(0, '#81254a');
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.audio.analyser) {
      return;
    }
    this.setState({
      analyser: nextProps.audio.analyser
    });
    if (nextProps.audio.analyser) {
      this.analyser = nextProps.audio.analyser;
      this.renderFrame(this.analyser);
    }
  }

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
