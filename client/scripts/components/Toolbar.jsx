import React, { Component, PropTypes } from 'react';
import path from 'path';
require('../../styles/toolbar.css');

/* Redux stuff */
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../actions/Player';

function mapStateToProps(state) {
  return {
    toolbar: state.Player
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Toolbar extends Component {
  state = {
    toolbar: {
        equalizer: false,
        levels: false,
        coverflow: false
    },
    checked: true
  };

  static defaultProps = {
    toolbar: new Immutable.Map()
  };

  static propTypes = {
    toolbar: React.PropTypes.instanceOf(Immutable.Record).isRequired
  }

  componentDidMount () {
    this.setState({
      toolbar: this.props.toolbar.toJS()
    });
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps.toolbar.size) {
      return;
    }
    this.setState({
      toolbar: nextProps.toolbar.toJS()
    });
  }
  handleClick = option => {
    let {actions} = this.props;
    let {toolbar} = this.state;
    let value = Object.assign({}, toolbar);
    value[option] = !toolbar[option];
    actions.toolbarOptions(value);
  }

  handleOnChange = event => {
    let option = event.target.value;
    let {actions} = this.props;
    let {toolbar} = this.state;

    let values = Object.keys(toolbar).reduce((previous, key) => {
        previous[key] = (key === option) ? !this.state.toolbar[key] : false;
        return previous;
    }, {});

    console.log('value: ', values)
    actions.toolbarOptions(values);
    this.setState({
      toolbar: values
    });
  }

  makeButtons () {
    let toolbar = this.props.toolbar.toJS();
    let buttons = Object.keys(toolbar).map(button => {
      return (
        <li className="radio-button" key={button}>
          <input type="radio" name="toolbar" id={button}
            value={button}
            checked={toolbar[button]}
            onChange={this.handleOnChange}
          />
          <label className="radio-button" htmlFor={button}>
          <img src={path.resolve(`assets/images/${button}.svg`)}></img>
          </label>
        </li>
      );
    });
    return buttons;
  }

  render () {
    return (
      <ul className="toolbar">{this.makeButtons()}</ul>
    );
  }
  renderXX () {
    let toolbar = this.state.toolbar;
    console.log('xxx toolbar: ', toolbar.equalizer, this.state.checked)
    return (
      <ul className="toolbar">
        <li>
          <label>
            <input type="radio" name="toolbar" value="male" />
          </label>
          <button className="play" onClick={() => this.handleClick()}>
            <img src={path.resolve('media/icon.png')}></img>
          </button>
        </li>
        <li>
          <label>
            <input type="radio" name="toolbar" value="levels" />
          </label>
          <button className="play">
            <img src={path.resolve('assets/images/levels.svg')}></img>
          </button>
        </li>
        <li className="radio-button">
          {/*<input type="radio" name="toolbar" value={this.state.toolbar.equalizer} id="f-equalizer" checked={toolbar.equalizer} onChange={this.handleOnChange}/>*/}
          <input type="radio" name="toolbar" id="f-equalizer"
             value={'equalizer'}
             checked={toolbar.equalizer}
             onChange={this.handleOnChange}
          />
          <label className="radio-button" htmlFor="f-equalizer">
            <img src={path.resolve('assets/images/equalizer.svg')}></img>
          </label>

          {/*
          <button className="play" onClick={() => this.handleClick('equalizer')}>
            <img src={path.resolve('assets/images/equalizer.svg')}></img>
          </button>
          */}
        </li>
        <li>
          <label>
            <input type="radio" name="toolbar" value="coverflow" />
          </label>
          <button className="play" onClick={() => this.handleClick('coverflow')}>
            <img src={path.resolve('assets/images/coverflow.svg')}></img>
          </button>
        </li>
      </ul>
    );
  }
}
