// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : List.jsx                                                  //
// @summary      : List component                                            //
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
import { PlayList, Settings } from '../../actions'; //
import { push } from 'react-router-redux';
import Sortable from './Sortable';
import { compose, branch, renderNothing, renderComponent, withPropsOnChange, withState, withReducer, withHandlers, withProps, mapProps, renameProp, defaultProps, setPropTypes } from 'recompose';
import { buildListItemMenu } from '../Menu/Menu';
// Import styles
import Style from './List.css';

const mapStateToProps = function (state) {
  return {
    list: state.PlayListItems.toJS(),
    options: {
      playlist: state.Settings.get('playlist')
    }
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    playlist: bindActionCreators(PlayList, dispatch),
    settings: bindActionCreators(Settings, dispatch),
    inspect: (file: string, options: Object, state?: any) => dispatch(push({
      pathname: `/inspector/${file}`,
      search: options,
      state: state
    }))
  };
};

const handleClick = function(event, items, item) {
  event.preventDefault();
  event.stopPropagation();

  if (event.shiftKey) {
    console.log('shift');
    const last = items.map(({ selected }) => (selected)).indexOf(true);
    const index = items.findIndex(({ id }) => (id === item.id));
    if (last < index) {
      return items.slice(last, index + 1).map(({ id }) => id);
    } else if (last > index) {
      return items.slice(index, last + 1).map(({ id }) => id);
    }
  } else if (event.metaKey) {
    const selected = items.filter(({ selected }) => (selected)).map(({ id }) => id);
    const index = items.findIndex(({ id }) => (id === item.id) );
    return [...selected, items[index].id];
  } else {
    return [item.id];
  }
};

const playPause = function (item) {
  const options = {
    title: 'Now Playing',
    body: item.title,
    sound: false,
    icon: item.thumbnails.default.url,
    image:  item.thumbnails.default.url,
    silent: true
  };
  new Notification(item.title, options);
};

const handleContextMenu = function(event, item) {
  event.preventDefault();
  event.stopPropagation();
  const menu = buildListItemMenu(item);
  const { clientX, clientY } = event;
  menu.popup();
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  setPropTypes({
    options: PropTypes.shape({
      playlist: PropTypes.shape({
        folders: PropTypes.array.isRequired,
        formats: PropTypes.array.isRequired,
        current: PropTypes.string.isRequired
      })
    })
  }),
  mapProps(({ list: items, settings, playlist }) => ({ items, settings, playlist })),
  /*
  withReducer('toggledOn', 'dispatch', (state, action) => {
    console.log('REDUCER', action)
    switch(action.type) {
      case 'SHOW':
        return true;
      case 'HIDE':
        return false;
      case 'TOGGLE':
        return !state;
      default:
        return state;
    }
  }, false),
  withHandlers({
    onClick: ({ dispatch }) => (e) => dispatch({ type: 'SHOW' }),
    onDoubleClick: ({ dispatch }) => (e) => dispatch({ type: 'HIDE' }),
    onContextMenu: ({ dispatch }) => (e) => dispatch({ type: 'TOGGLE' })
  }),
  */
  withState('selected', 'select', []),
  withHandlers({
    onClick: props => (event, item) => {
      const { settings, playlist, items } = props;
      const selected = handleClick(event, items, item);
      return playlist.selectItems(selected);
    },
    onDoubleClick: props => (event, item) => {
      const { playlist } = props;
      playPause(item);
      playlist.selectItems([item.id]);
      if (item.file && !item.isLoading) {
        return playlist.playPauseItem(item.id, true);
      } else {
        return playlist.playItem(item.id);
      }
    },
    onContextMenu: props => (event, item) => {
      console.log('props', props);
      event.preventDefault();
      event.stopPropagation();
      const menu = buildListItemMenu.bind({ props })(item);
      const { clientX, clientY } = event;
      menu.popup();
      // return handleContextMenu(event, item);
    }
    // onContextMenu: ({ dispatch }) => (e) => dispatch({ type: 'TOGGLE' })
  }),
  // renameProp('list', 'tracks'),
  // withProps(props => {
  //   console.log('withProps', props);
  //   return {
  //     name: '123'
  //   }
  // }),
  // defaultProps({ items: elements }),

  // branch(
  //   props => {
  //     const { items } = props;
  //     return (items && items.length);
  //   },
  //   renderComponent(Sortable),
  //   renderNothing,
  // )
  // connect((state, props)=>{
  //   return {
  //     ...state.PlayListItems.toJS(),
  //   };
  // })
)(Sortable);
