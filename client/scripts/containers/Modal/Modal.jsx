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
import URL, { URL as URI} from 'url';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import MsgBoxStyle from './ModalStyle.json';
import { bindActionCreators } from 'redux';
import * as Settings from '../../actions/Settings';
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

// import { MediaInfo } from './MediaInfo';
// import { SortableComponent } from './Related';

import { Header, Body, Footer, ModalType } from '../../components/Modal';


const withStore = compose(
  withContext({ store: PropTypes.object }, () => {}),
  getContext({ store: PropTypes.object })
);


function mapStateToProps (state, ownProps) {
  console.log('Modal ownProps', state, ownProps);
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
      body: 'My Body'
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
    console.log('getChildContext', this.props.modal);
    const { modal = this.props.modal } = this.state;
    return {
      modal: {
        header: modal.header,
        body: modal.body,
        footer: modal.footer,
        options: modal.options,
        actions: {
          close: Modal.close,
          save: Modal.save,
          ignore: Modal.ignore,
          retry: Modal.retry
        }
      }
    }
  }

  state = {
    media: {
      related: [],
    }
  };

  componentDidMount () {
    // this.modal = remote.getCurrentWindow();
    // this.modal.show();
    // this.modal.focus();
    // this.modal.webContents.openDevTools();
  }

  componentWillMount () {
    this.listener = {
      setScope: (event, { state: media, options }) => {
        return this.setState({ media, options });
      },
      modalEvent: (event, data) => {
        console.log('modal:event', data);
      }
    };
    // ipcRenderer.on('modal:event', this.listener.modalEvent);
    // ipcRenderer.on('modal:set:scope', this.listener.setScope);
  }

  componentWillUnmount() {
    // ipcRenderer.removeListener('modal:event', this.listener.modalEvent);
    // ipcRenderer.removeListener('modal:set:scope', this.listener.setScope);
    // ipcRenderer.removeListener('modal:set:state', this.listener.setState);
  }

  render () {
    const { modal } = this.props;
    console.log('FOOTER', modal.footer);
    return (
      <div className={ Style.modal } role="dialog" >
        <div className={ Style.content } role="document" >
          <Header>{ modal.header }</Header>
          <Body>{ modal.body }</Body>
          <Footer>{ modal.footer }</Footer>
        </div>
      </div>
    );
  }
}
