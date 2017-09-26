// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Header.jsx                                                //
// @summary      : Header component                                          //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Feb 2017                                               //
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

import { remote } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions/Player';
import './Header.css';

type Props = {
  router: any,
  actions: any
};

function mapStateToProps (state) {
  return {
    router: state.routing
  };
}

function mapDispatchToProps (dispatch: *) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

// $FlowIssue
@connect(mapStateToProps, mapDispatchToProps)
export default class Header extends Component<Props, void> {

  window: BrowserWindow;

  constructor(props: Props, context: any) {
    super(props, context);
    this.window = remote.getCurrentWindow();
  }

  exit = () => {
    this.window.close();
  }

  maximize = () => {
    if (!this.window.isMaximized()) {
      this.window.maximize();
    } else {
      this.window.unmaximize();
    }
  }

  minimize = () => {
    this.window.minimize();
  }


  render() {
    //const { location } = this.props.state;
    return (
      <nav className="navbar dark">
      {/*
        <ul className="buttons">
          <li className="exit" onClick={this.exit}></li>
          <li className="minimize" onClick={this.minimize}></li>
          <li className="maximize" onClick={this.maximize}></li>
        </ul>
      */}
      </nav>
    );
  }
};
