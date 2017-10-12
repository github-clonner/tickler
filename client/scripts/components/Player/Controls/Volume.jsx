// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Volume.jsx                                                //
// @summary      : Volume control component                                  //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 01 Oct 2017                                               //
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
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, withStateHandlers, onlyUpdateForPropTypes, branch, pure, renderNothing, renderComponent, withPropsOnChange, withState, withReducer, withHandlers, withProps, mapProps, renameProp, defaultProps, setPropTypes } from 'recompose';
/* owner libs */
import { Player, Settings } from '../../../actions';
import { InputRange } from '../../index';
// Import styles
import classNames from 'classnames';
import Style from '../Player.css';


/*
 * Subbscribe to redux store and merge these props
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
function mapStateToProps(state) {
  return {
    audio: state.Audio,
    options: {
      player: state.Settings.get('player'),
      audio: state.Settings.get('audio')
    }
  };
}

/*
 * Redux Action Creators
 * Each key inside this object is assumed to be a Redux action creator
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
function mapDispatchToProps(dispatch) {
  return {
    player: bindActionCreators(Player, dispatch)
  };
}

/*
 * Component wrapper
 */
const enhance = compose(
  pure,
  connect(mapStateToProps, mapDispatchToProps),
  mapProps(({ player, audio }) => {
    return {
      setVolume: player.setVolume,
      toggleMute: player.toggleMute,
      isMuted: audio.isMuted,
      volume: audio.volume
    }
  }),
  withStateHandlers(
    ({ initialState = false }) => ({ isChanging: initialState }),
    {
      onMouseDown: ({ isChanging }) => (event) => ({
        isChanging: true,
      }),
      onMouseUp: ({ isChanging }) => (event) => ({
        isChanging: false,
      })
    }
  )
);

/*
 * Volume component renderer
 */
export default enhance(({ isChanging, onMouseDown, onMouseUp, isMuted, volume, setVolume, toggleMute }) => {
  const style = classNames( Style.volume, Style.checkboxButtons, {
    [Style.isChanging]: isChanging
  });
  return (
    <div className={ style } >
      <input id="volume" type="checkbox" checked={ isMuted } onChange={ toggleMute } />
      <label htmlFor="volume">volume_up</label>
      <div className={ Style.slider } onMouseDown={ onMouseDown } onMouseUp={ onMouseUp }>
        <InputRange value={ volume } min={ 0 } max={ 1 } step={ 0.001 } onChange={ setVolume } />
      </div>
    </div>
  );
});
