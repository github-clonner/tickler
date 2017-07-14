///////////////////////////////////////////////////////////////////////////////
// @file         : NewList.jsx                                               //
// @summary      : Builds a list of files                                    //
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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import { List, Map } from 'immutable';
import * as Actions from 'actions/Playlist';

function mapStateToProps(state) {
  return {
    list: state.PlayListItems,
    info: state.PlayList
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class NewList extends Component {

  constructor (context) {
    super(context);
  }

  componentDidMount () {
    let { actions, location } = this.props;
    actions.fetchList(location.state.list);
    actions.fetchListItems(location.state.list);
  }

  render() {
    let { location, list, info } = this.props;
    return (
      <div>
        <h1>{ location.state.list }</h1>
        <h1>{ location.state.video }</h1>
        <hr />
        <ul>
          { 
            Object.keys(info.toJS()).map(item => {
              return <li key={item}><pre>{item}: {info.get(item)}</pre></li>
            }) 
          }
        </ul>
        <hr />
        <ul>
          {
            list.map((item, index) => {
              let song = item.toJS();
              return <li key={index}>{song.title}</li>
            })
          }
        </ul>
      </div>
    );
  }
}
