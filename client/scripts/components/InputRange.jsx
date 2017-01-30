import { remote } from 'electron';
import React, { Component, PropTypes } from 'react';
require('../../styles/input.css');

export default class InputRange extends React.Component {
  state = {
    value: 0
  };

  static defaultProps = {
    min: 0,
    max: 100,
    step: 1,
    onChange: new Function()
  };

  static propTypes = {
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
    let {value} = this.state;
    let background = `linear-gradient(to right, #ed1e24 0%, #ed1e24 ${value}%, #2f2f2f ${value}%, #2f2f2f 100%)`;
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
    />
  }
}
