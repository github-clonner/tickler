import React, { Component, PropTypes } from 'react';
import { findDOMNode } from "react-dom";
import classNames from 'classnames';

require('./equalizer.css');
/* Redux stuff */
import Immutable from 'immutable';
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
    this.analyser = null;
    this.meterWidth = 10; //width of the meters in the spectrum
    this.gap = 2; //gap between meters
    this.capHeight = 2;
    this.capStyle = '#E9D2E8';
    this.meterNum = 800 / (10 + 2); //count of the meters
    this.capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
  }

  componentDidMount () {
    this.width = this.refs.canvas.width;
    this.height = this.refs.canvas.height - 2;
    this.ctx = this.refs.canvas.getContext('2d');
    this.gradient = this.ctx.createLinearGradient(0, 0, 0, 300);
    this.gradient.addColorStop(1, '#0f0');
    this.gradient.addColorStop(0.5, '#ff0');
    this.gradient.addColorStop(0, '#f00');
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps.audio.analyser) {
      return;
    }
    console.log('analyser: componentWillReceiveProps: ', nextProps.audio.analyser);
    this.setState({
      analyser: nextProps.audio.analyser
    });
    if(nextProps.audio.analyser && !this.analyser) {
      this.analyser = nextProps.audio.analyser;
      this.renderFrame(this.analyser);
    }
  }

  renderFrame = () => {
    let analyser = this.analyser;
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let step = Math.round(array.length / this.meterNum); //sample limited data from the total array
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (var i = 0; i < this.meterNum; i++) {
      var value = array[i * step];
      if (this.capYPositionArray.length < Math.round(this.meterNum)) {
          this.capYPositionArray.push(value);
      };
      this.ctx.fillStyle = this.capStyle;
      //draw the cap, with transition effect
      if (value < this.capYPositionArray[i]) {
          this.ctx.fillRect(i * 12, this.height - (--this.capYPositionArray[i]), this.meterWidth, this.capHeight);
      } else {
          this.ctx.fillRect(i * 12, this.height - value, this.meterWidth, this.capHeight);
          this.capYPositionArray[i] = value;
      };
      this.ctx.fillStyle = this.gradient; //set the filllStyle to gradient for a better look
      this.ctx.fillRect(i * 12 /*meterWidth+gap*/ , this.height - value + this.capHeight, this.meterWidth, this.height); //the meter
    }
    requestAnimationFrame(this.renderFrame);
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
