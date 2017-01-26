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
    toolbar: {},
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
    let value = Object.assign({}, toolbar);
    value[option] = !toolbar[option];
    actions.toolbarOptions(value);
    this.setState({
      checked: !this.state.checked
    });
  }

  /*
  <input type="radio" name="gender" value="male"> Male<br>
  <input type="radio" name="gender" value="female"> Female<br>
  <input type="radio" name="gender" value="other"> Other
  */
  render () {
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
             checked={this.state.checked} 
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