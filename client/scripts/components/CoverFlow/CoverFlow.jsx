// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : CoverFlow.jsx                                             //
// @summary      : CoverFlow widget                                          //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 07 Sep 2017                                               //
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
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../../actions';
import Covers from './Covers';
/* Import styles */
import './Coverflow.css';


type ToolBar = {
  equalizer: bool,
  levels: bool,
  coverflow: bool
};

type Props = {
  list: Array<Object>,
  toolbar: ToolBar
};

type State = {
  PlayListItems: Record<*>,
  ToolBar: Record<*>
};

function mapStateToProps (state: State) {
  console.log('CoverFlow state: ', state);
  return {
    list: state.PlayListItems.toJS(),
    toolbar: state.ToolBar.toJS()
  };
}

function mapDispatchToProps (dispatch: *) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

// $FlowIssue
@connect(mapStateToProps, mapDispatchToProps)
export default class CoverFlow extends Component<Props, * > {

  state = {
    title: 'Song Name'
  };

  static propTypes = {
    list: PropTypes.array.isRequired,
    toolbar: PropTypes.object.isRequired
  };

  setTitle = ({ title }: Object) : void => {
    return this.setState({ title });
  }

  render () {
    const { toolbar, list } = this.props;
    const { title } = this.state;
    const style = classNames('coverflow', {
      active: toolbar.coverflow
    });

    return (
      <div className={ style }>
        <div className="container" ref="container">
          <Covers list={ list } setTitle={ this.setTitle }/>
        </div>
        <span className="title">{ title }</span>
      </div>
    );
  }
}
