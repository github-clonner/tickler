// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Inspector.jsx                                             //
// @summary      : Content inspector                                         //
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import querystring from 'querystring';
import url from 'url';
import * as Actions from 'actions/PlayList';
import * as Settings from 'actions/Settings';
import { Header, Toolbar, Editor, Player } from '../../components';
import '../../../styles/main.css';
import './Inspector.css';

type Props = {
  file: string,
  options: Object
};

type State = {
  code: string
};

function mapStateToProps(state, ownProps) {
  console.log('ownProps', ownProps);
  const { query } = url.parse(ownProps.location.pathname);
  const options = querystring.parse(query);
  console.log('ownProps options', options, state.Settings.get('inspector'));
  return {
    file: ownProps.match.params.file,
    options: Object.assign({}, state.Settings.get('inspector'), options)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Inspector extends Component<Props, State>  {

  static propTypes = {
    file: PropTypes.string,
    options: PropTypes.object
  };

  render () {
    const { file, options } = this.props;
    console.log('Inspector.Props', file, options);
    console.log('Inspector.State', this.state);
    return (
      <div className="page">
        <Header />
        <div className="page-content">
          <Editor file={ file } options={ options } />
        </div>
        <Player />
      </div>
    );
  }
};
