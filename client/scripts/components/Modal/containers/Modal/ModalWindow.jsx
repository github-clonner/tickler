///////////////////////////////////////////////////////////////////////////////
// @file         : ModalWindow.jsx                                           //
// @summary      : ModalWindow HOC                                           //
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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router-dom";
import * as Settings from '../../../../actions/Settings';
import {
  compose,
  setPropTypes,
  mapProps,
  withHandlers,
  branch,
  renderComponent,
  renderNothing
} from 'recompose';
import ModalType from '../../types';
import { Modal } from '../../components/Modal';
import { ModalFactory, ModalProps } from './ModalFactory';

function mapStateToProps (state, ownProps) {
  const { location: { state: { data, options, id }}, match: { params: { type, ...category }}} = ownProps;
  // const modalProps = ModalProps({ type, options, data, category: Object.values(category) });
  // const modal = ModalFactory(type, Object.values(category), options, data);
  // return modal;
  return ModalProps({ type, options, data, category: Object.values(category) });
  // return ModalFactory(type, Object.values(category), options, data);
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    settings: bindActionCreators(Settings, dispatch)
  };
}

export const ModalWindow = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
  setPropTypes({
    modal: ModalType,
    settings: PropTypes.any
  }),
  mapProps((props) => {
    console.log('ModalWindow', props);
    return props
  }),
  branch(
    ({ modal }) => {
      try {
        const { options } = modal;
        return (modal && modal.options.type);
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    renderComponent(Modal),
    renderNothing,
  )
)(Modal);
