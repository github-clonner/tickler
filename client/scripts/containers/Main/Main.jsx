///////////////////////////////////////////////////////////////////////////////
// @file         : Main.jsx                                                  //
// @summary      : UI Main container                                         //
// @version      : 0.0.2                                                     //
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

import { remote, ipcRenderer } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import URL from 'url';
import * as Actions from '../../actions/PlayList';
import { Header, Toolbar, Player, List, CoverFlow, Equalizer, DragDrop } from '../../components';
import Style from './Main.css';

// import '!style-loader!css-loader!../../../styles/main.css!';
// This imported styles globally without running through CSS Modules
// import 'style-loader!../../../styles/main.css!';

function mapStateToProps (state, ownProps) {
  // console.log('main ownProps', ownProps);
  const options = decodeURIComponent(ownProps.match.params.options);
  const { query, pathname } = URL.parse(options, true);
  // Extract params, apply transform, remove undefined
  // const options = Object.entries(optionsQuery.evaluate(query)).reduce((acc, [option, value]) => {
  //   return value ? Object.assign({}, acc, {
  //     [option]: value
  //   }) : acc;
  // }, state.Settings.get('inspector'));

  return {
    options: options
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

// $FlowIssue
@connect(mapStateToProps, mapDispatchToProps)
export default class Main extends Component {
  state = {
    config: {
      dependencies: {}
    }
  };

  static propTypes = {
    list: PropTypes.string
  };

  static defaultProps = {
    list: 'PLsPUh22kYmNBl4h0i4mI5zDflExXJMo_x'
  };

  componentDidMount () {
    ipcRenderer.once('config', (event, config) => {
      this.setState(prevState => ({
        config: config,
      }));
    });
  }

  render () {
    const { list, children } = this.props;
    console.log('Style', Style)
    return (
      <div className={ Style.frame }>
        <Header />
        <Toolbar />
        {
        /*
        <CoverFlow />
        <Equalizer />
        */
        }
        <div className={ Style.content } >
          <List className={ Style.list } list={ list } >
            { children }
          </List>
        </div>
        <Player />
      </div>
    );
  }
};
