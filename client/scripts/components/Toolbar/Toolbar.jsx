import path from 'path';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import * as Actions from 'actions/Player';

import './Toolbar.css';

import { coverflow, equalizer, levels } from '../../../../assets/images';

const images = { coverflow, equalizer, levels };

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

const Toolbar = (props) =>
  <ul className="toolbar">{Object.keys(props.toolbar.toJS()).map((button, index) => {
    return (
      <li className="radio-button" key={index}>
        <input
          type="radio"
          name="toolbar"
          id={button}
          value={button}
          checked={props.toolbar[button]}
          onChange={event => {
            let { value } = event.target;
            let { actions, toolbar } = props;
            let options = Object.keys(toolbar.toJS()).reduce((previous, option) => {
              previous[option] = (option === value);
              return previous;
            }, {});
            actions.toolbarOptions(options);
          }}
        />
        <label className="radio-button" htmlFor={button}>
        <img src={images[button]}></img>
        </label>
      </li>);
    })
  }</ul>

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
