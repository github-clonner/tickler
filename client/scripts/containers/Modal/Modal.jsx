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

import { MediaInfo } from './MediaInfo';
import { SortableComponent } from './Related';

import { Header, ModalType } from '../../components/Modal';


const withStore = compose(
  withContext({ store: PropTypes.object }, () => {}),
  getContext({ store: PropTypes.object })
);

class Title extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired
  };

  static defaultProps = {
    title: 'Hello World'
  };

  static childContextTypes = {
    title: PropTypes.string.isRequired
  }

  getChildContext() {
    return this.props.title;
  }

  render() {
    return <h1>{ this.props.title }</h1>;
  }
}

const MsgBoxStyle = {
  OK_ONLY: { buttons: [ 'Ok' ], prompt: null, title: null },
  OK_CANCEL: { buttons: [ 'Ok', 'Cancel' ], prompt: null, title: null },
  ABORT_RETRY_IGNORE: { buttons: [ 'Abort', 'Retry', 'Ignore'], prompt: null, title: null },
  YES_NO_CANCEL: { buttons: [ 'Yes', 'No', 'Cancel'], prompt: null, title: null },
  YES_NO: { buttons: [ 'Yes', 'No' ], prompt: null, title: null },
  RETRY_CANCEL: { buttons: [ 'Retry', 'Cancel' ], prompt: null, title: null },
  CRITICAL: { buttons: [ ], prompt: null, title: null },
  QUESTION: { buttons: [ ], prompt: null, title: null },
  EXCLAMATION: { buttons: [ ], prompt: null, title: null },
  INFORMATION: { buttons: [ ], prompt: null, title: null }
};

function mapStateToProps (state, ownProps) {
  console.log('ModalWindow ownProps', ownProps);
  if (ownProps && ownProps.modal) {
    return ownProps;
  } else if (ownProps && ownProps.match) {
    const { match: { params: { type, ...category }}} = ownProps;
    const { location: { query: params }} = ownProps;
    return {
      modal: {
        header: 'MyModal',
        body: 'MyModal',
        options: {
          type: 'modal',
          category: Object.values(category),
          params: params
        }
      }
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
      header: 'My Header Title',
      body: 'Hello World'
    }
  };

  static childContextTypes = {
    modal: ModalType
  };

  getChildContext() {
    const { modal = this.props.modal } = this.state;
    return {
      modal: {
        header: modal.header,
        body: modal.body
      }
    }
  }

  static close(event) {
    const webContents = remote.getCurrentWindow();
    console.log('modal:close', webContents.id, webContents);
    return webContents.getParentWindow().send('modal:close');
  }

  state = {
    media: {
      related: [],
    }
  };

  componentDidMount () {
    this.modal = remote.getCurrentWindow();
    this.modal.show();
    this.modal.focus();
    this.modal.webContents.openDevTools();
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
    console.log('modal:componentWillMount');
    ipcRenderer.on('modal:event', this.listener.modalEvent);
    // ipcRenderer.on('modal:set:scope', this.listener.setScope);
  }

  componentWillUnmount() {
    console.log('modal:componentWillUnmount');
    /* Remove listeners */
    ipcRenderer.removeListener('modal:event', this.listener.modalEvent);
    ipcRenderer.removeListener('modal:set:scope', this.listener.setScope);
  }

  render () {
    // const { header, title, body, footer, query } = this.props;
    // const { related } = query || QI;
    // const { media } = this.state;
    const { modal } = this.props;
    // console.log('Modal.Props', this.props)
    // console.log('Modal.State', this.state)
    return (
      <div className={ Style.modal } role="dialog" >
        <div className={ Style.content } role="document" >
          <div className={ Style.header }>
            <h5 className={ Style.title }>Modal title</h5>
            <button type="button" className={ classNames( Style.modalButton, Style.close) } onClick={ Modal.close }>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <Header>{ this.props.modal.header }</Header>
          <div className={ Style.body }>
            { /* <MediaInfo media={ this.props.query } /> */ }
            { /* <SortableComponent items={ media.related } /> */ }
          </div>
          <div className={ Style.footer} >
            { /* <p>footer</p> */ }
          </div>
        </div>
      </div>
    );
  }
}
