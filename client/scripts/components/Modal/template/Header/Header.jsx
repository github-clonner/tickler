// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Header.jsx                                                //
// @summary      : Modal header component                                    //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 18 Nov 2017                                               //
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

import Style from './Header.css';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import {
  compose,
  onlyUpdateForPropTypes,
  branch,
  pure,
  renderNothing,
  renderComponent,
  withPropsOnChange,
  withState,
  withHandlers,
  withProps,
  mapProps,
  setPropTypes,
  getContext
} from 'recompose';
import { Player, Settings } from '../../../../actions';
import { getModalSettings, getHeaderActions } from './selector';

const conditionalRender = (states) =>
  compose(...states.map(state =>
    branch(state.when, renderComponent(state.then))
  ));

/*
 * subscribe to redux store and merge these props
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
function mapStateToProps(state, props) {
  return {
    settings: getModalSettings(state.Settings),
    options: state.options
  };
}

/*
 * Redux action creators
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
function mapDispatchToProps(dispatch) {
  return {
    player: bindActionCreators(Player, dispatch)
  };
}

/*
 * Component wrapper
 */
const enhance = compose(
  pure,
  connect(mapStateToProps, mapDispatchToProps),
  getContext({
    modal: PropTypes.object
  }),
  withHandlers({
    close: props => event => {
      console.log('Close Modal', props, event);
      return;
    }
  }),
  onlyUpdateForPropTypes,
  setPropTypes({
    modal: PropTypes.object,
    options: PropTypes.object,
    settings: PropTypes.object
  })
);

export default enhance(({ modal: { header }, close }) => {
  return (
    <div className={ Style.header }>
      <h5 className={ Style.title }>{ header }</h5>
      <button type="button" className={ classNames( Style.modalButton, Style.close) } onClick={ close }>
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
});
