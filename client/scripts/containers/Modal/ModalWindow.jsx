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

import Modal from './Modal';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { withRouter } from "react-router-dom";
import * as Settings from '../../actions/Settings';
import { shell, remote, ipcRenderer } from 'electron';
import {
  compose,
  setPropTypes,
  mapProps,
  withHandlers,
  branch,
  renderComponent,
  renderNothing
} from 'recompose';
import { ModalType } from '../../components/Modal';
import { MediaInfo } from './MediaInfo';
import { Related } from './Related';
import { ModalFactory } from './ModalFactory';


// const ModalFactory = (type, category, options, data) => {
//   try {
//     const template = {
//       options: { type, category, ...options }
//     };
//     switch (category.join('.')) {
//       case 'metadata': return {
//         modal: {
//           ...template,
//           header: (<span>Title</span>),
//           body: <MediaInfo { ...data } />,
//           footer: (<button>Hola</button>)
//         }
//       };
//       case 'related': return {
//         modal: {
//           ...template,
//           header: '<Header { ...data } />',
//           body: <Related { ...data } />,
//           footer: '<Footer { ...options } />'
//         }
//       };
//       default: return {
//         modal: {
//           ...template,
//           header: '<Header { ...data } />',
//           body: (<div { ...data } />),
//           footer: '<Footer { ...options } />'
//         }
//       };
//     }
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

function mapStateToProps (state, ownProps) {
  const { location: { state: { data, options, id }}, match: { params: { type, ...category }}} = ownProps;
  return ModalFactory(type, Object.values(category), options, data);
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
    return props
  }),
  withHandlers({
    onClick: (props) => (event, data) => {
      console.log('onClick', props, event, data);
    },
    close: (props) => (event, data) => {
      console.log('ModalWindow close', props, event, data);
    }
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
