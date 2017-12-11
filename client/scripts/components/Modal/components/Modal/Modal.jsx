///////////////////////////////////////////////////////////////////////////////
// @file         : Modal.jsx                                                 //
// @summary      : Modal HOC                                                 //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Nov 2017                                               //
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

import Style from './Modal.css';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import * as Settings from '../../../../actions/Settings';
import { shell, remote, ipcRenderer } from 'electron';
import {
  compose,
  setPropTypes,
  mapProps,
  withHandlers,
  branch,
  renderComponent,
  renderNothing,
  getContext,
  withContext
} from 'recompose';
import ModalType from '../../types';
import { Header, Body, Footer } from '../';

const withStore = compose(
  withContext({ store: PropTypes.object }, () => {}),
  getContext({ store: PropTypes.object })
);

function mapStateToProps (state, ownProps) {
  if (ownProps && ownProps.modal) {
    return ownProps;
  } else if (ownProps && ownProps.match) {
    const { match: { params: { type, ...category }}} = ownProps;
    const { location: { query: params }} = ownProps;
    const { modal } = ownProps;
    return {
      modal: {
        header: 'MyModalHeader',
        body: 'MyModalBody',
        footer: 'MyModalFooter',
        options: {
          type: 'modal',
          category: Object.values(category),
          params: params
        }
      },
      ...modal
    };
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    settings: bindActionCreators(Settings, dispatch)
  };
}

// $FlowIssue
@connect(mapStateToProps, mapDispatchToProps)
export default class Modal extends Component {

  static propTypes = {
    modal: ModalType
  };

  static defaultProps = {
    modal: {
      header: 'My Header',
      body: 'My Body',
      footer: 'My Footer'
    }
  };

  static childContextTypes = {
    modal: ModalType
  };

  static close(event) {
    const webContents = remote.getCurrentWindow();
    console.log('modal:close', webContents.id);
    return webContents.getParentWindow().send('modal:close');
  };

  static save(event) {
    const webContents = remote.getCurrentWindow();
    console.log('modal:save', webContents.id);
    return webContents.getParentWindow().send('modal:save');
  };

  static ignore(event) {
    const webContents = remote.getCurrentWindow();
    console.log('modal:ignore', webContents.id);
    return webContents.getParentWindow().send('modal:ignore');
  };

  static retry(event) {
    const webContents = remote.getCurrentWindow();
    console.log('modal:retry', webContents.id);
    return webContents.getParentWindow().send('modal:retry');
  };

  getChildContext() {
    const { modal: { header, body, footer, options } } = this.props;
    const { close, save, ignore, retry } = Modal;
    return {
      modal: {
        header, body, footer, options,
        actions: { close, save, ignore, retry }
      }
    };
  }

  render () {
    const { modal } = this.props;
    return (
      <div className={ Style.modal } role="dialog">
        <div className={ Style.content } role="document">
          <Header { ...modal.header } />
          <Body>{ modal.body }</Body>
          <Footer { ...modal.footer } />
        </div>
      </div>
    );
  }
}
