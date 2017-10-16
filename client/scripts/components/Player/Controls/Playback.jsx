// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Playback.jsx                                              //
// @summary      : Playback controls component                               //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 30 Sep 2017                                               //
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

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, onlyUpdateForPropTypes, branch, pure, renderNothing, renderComponent, withPropsOnChange, withState, withHandlers, withProps, mapProps, setPropTypes } from 'recompose';
/* owner libs */
import { Player, Settings } from '../../../actions';
import { getSelectedItems, getFilteredItems, getNext, getPrev, getSelected } from '../../../selectors';
// Import styles
import classNames from 'classnames';
import Style from '../Player.css';

/*
 * Subbscribe to redux store and merge these props
 * reference: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 */
function mapStateToProps(state, props) {
  const items = state.PlayListItems;
  const handlers = {
    next: getNext(items),
    prev: getPrev(items),
    selected: getSelected(items),
  };
  return {
    ...handlers,
    audio: state.Audio,
    skip: {
      forward: false,
      backward: true
    },
    options: {
      player: state.Settings.get('player'),
      audio: state.Settings.get('audio')
    }
  };
}

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
  withProps(({ playlist, player, options, settings, selected, audio }) => {
    return {
      player,
      selected: selected ? selected.toJS() : undefined,
      isPlaying: audio.isPlaying,
      currentTime: audio.currentTime,
      stop: player.stop,
      canSkip: true,
      canPlay: true,
      canStop: (audio.isPlaying || audio.currentTime > 0)
    }
  }),
  withHandlers({
    play: props => event => {
      const { player, selected } = props;
      console.log('selected: ', selected);
      return player.playPause(selected);
    },
    skip: props => event => {
      console.log('skip', props, event.target)
      // const index = items.findIndex(({ id }) => (id === item.id));
      // if (Math.sign(direction) > 0) {
      //   const nextIndex = ((index + 1) === items.length) ? 0 : index + 1;
      //   return player.play(items[nextIndex].file);
      // } else {
      //   const prevIndex = (index === 0) ? (items.length - 1) : index - 1;
      //   return player.play(items[prevIndex].file);
      // }
    }
  }),
  onlyUpdateForPropTypes,
  setPropTypes({
    canSkip: PropTypes.bool.isRequired,
    canPlay: PropTypes.bool.isRequired,
    canStop: PropTypes.bool.isRequired
  })
);


/*
 * Playback component renderer
 */
export default enhance(({ isPlaying, currentTime, canStop, canPlay, canSkip, skip, stop, play }) => {
  return (
    <div className={ Style.btnGroup } >
      <button className={ Style.roundButton } disabled={ !canSkip } onClick={ skip } title="backward" >skip_previous</button>
      <button className={ Style.roundButton } disabled={ !canStop } onClick={ stop } title="stop">stop</button>
      <button className={ Style.roundButton } disabled={ !canSkip } onClick={ skip } title="forward" >skip_next</button>
      <button className={ Style.roundButton } disabled={ !canPlay } onClick={ play } title="play">{ isPlaying ? 'pause' : 'play_arrow' }</button>
    </div>
  );
});
