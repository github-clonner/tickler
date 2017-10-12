///////////////////////////////////////////////////////////////////////////////
// @file         : Player.jsx                                                //
// @summary      : Player component                                          //
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
import { PlayList, Player, Settings } from '../../actions';
import { compose, onlyUpdateForPropTypes, branch, pure, renderNothing, renderComponent, withPropsOnChange, withState, withReducer, withHandlers, withProps, mapProps, renameProp, defaultProps, setPropTypes } from 'recompose';
import classNames from 'classnames';
// Import styles
import Style from './Player.css';
import { Progress, InputRange, TimeCode } from '../index';
import * as Controls from './Controls';

function mapStateToProps(state) {
  const items = state.PlayListItems.toJS();
  const index = items.findIndex(({selected}) => (selected))
  return {
    // items,
    item: items[index],
    index,
    audio: state.Audio,
    // player: state.Player,
    options: {
      player: state.Settings.get('player'),
      audio: state.Settings.get('audio')
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // playlist: bindActionCreators(PlayList, dispatch),
    player: bindActionCreators(Player, dispatch)
    // settings: bindActionCreators(Settings, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Play extends Component {

  componentDidMount () {
    const { player } = this.props;
    const waves = this.refs;
    return player.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 60
    });
  }

  render () {
    const { audio } = this.props;
    return (
      <div className={ Style.player }>
        <div className={ Style.controls } >
          <Controls.Playback />
          <Controls.Order />
          <Controls.Volume />
          <Controls.Seek />
        </div>
        <div ref="waves" style={{display: 'none'}}></div>
      </div>
    );
  }
}


/*
<InputRange value={ audio.currentTime / audio.duration * 100 } min={ 0 } max={ 100 } step={ 0.1 } />
<TimeCode time={ audio.currentTime } duration={ audio.duration } />
*/
