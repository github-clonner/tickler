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
import URL, { URL as URI} from 'url';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { WebView } from '../../components';
import { shell, remote, ipcRenderer } from 'electron';
import * as Settings from '../../actions/Settings';

function mapStateToProps (state, ownProps) {
  console.log('ownProps', ownProps);
  const { match: { params }} = ownProps;
  console.log('type', params.type, 'sub:', Object.values(params).slice(1));
  return {
    type: params.type,
    sub: Object.values(params).slice(1)
  };
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
    header: PropTypes.string,
    title: PropTypes.object,
    body: PropTypes.string,
    footer: PropTypes.string
  };

  static close(event) {
    // const wc = remote.webContents.getFocusedWebContents();
    const wc = remote.webContents.fromId(1);
    console.log('modal:close', wc.getId(), wc);
    return wc.send('modal:close', { result: new Date().getTime() });
  }

  render () {
    const { header, title, body, footer } = this.props;
    return (
      <div className={ Style.modal } role="dialog" >
        <div className={ Style.content } role="document" >
          <div className={ Style.header }>
            <h5 className={ Style.title }>Modal title</h5>
            <button type="button" className={ Style.close } onClick={ Modal.close }>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className={ Style.body }>
            <p>Modal body text goes here.</p>
          </div>
          <div className={ Style.footer} >
            <p>footer</p>
          </div>
        </div>
      </div>
    );
  }
}
