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
    toolbar: state.Player
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Equalizer extends Component {
  render () {
    let {toolbar} = this.props;
    let style = classNames('equalizer', {
      active: toolbar.equalizer
    });
    return (
      <div className={style}>
        <canvas ref='canvas'></canvas>
      </div>
    );
  }
};