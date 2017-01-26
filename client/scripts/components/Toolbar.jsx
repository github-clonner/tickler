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
  constructor(...args) {
    super(...args);
  }

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

  render () {
    return (
      <ul className="toolbar">
        <li>
          <button className="play" onClick={() => this.handleClick()}>
            <img src={path.resolve('media/icon.png')}></img>
          </button>
        </li>
        <li>
          <button className="play">
            <img src={path.resolve('assets/images/levels.svg')}></img>
          </button>
        </li>
        <li>
          <button className="play" onClick={() => this.handleClick('equalizer')}>
            <img src={path.resolve('assets/images/equalizer.svg')}></img>
          </button>
        </li>
        <li>
          <button className="play" onClick={() => this.handleClick('coverflow')}>
            <img src={path.resolve('assets/images/coverflow.svg')}></img>
          </button>
        </li>
      </ul>
    );
  }
}