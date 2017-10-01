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
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from 'actions/PlayList';
import * as Settings from 'actions/Settings';
import Stars from '../Stars/Stars';
import { TrackDuration } from '../TimeCode/TimeCode';
import { push } from 'react-router-redux';
import * as RowField from '../List/RowField';
import { buildListItemMenu } from '../Menu/Menu';
// Import styles
import Style from './List.css';


const placeholder = document.createElement('li');
placeholder.className = 'placeholder';

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
    actions: bindActionCreators(Actions, dispatch),
    settings: bindActionCreators(Settings, dispatch),
    inspect: (file: string, options: Object, state?: any) => dispatch(push({
      pathname: `/inspector/${file}`,
      search: options,
      state: state
    }))
  };
};

@connect(mapStateToProps, mapDispatchToProps)
export default class List extends Component {

  buildListItemMenu: any;
  dragged: HTMLElement;

  state = {
    isDragDrop: false,
    song: {}
  };

  static propTypes = {
    placeholder: PropTypes.instanceOf(Element).isRequired,
    options: PropTypes.shape({
      playlist: PropTypes.shape({
        folders: PropTypes.array.isRequired,
        formats: PropTypes.array.isRequired,
        current: PropTypes.string.isRequired
      })
    })
  };

  static defaultProps = {
    placeholder: document.createElement('li')
  };

  handleContextMenu (event, song) {
    event.preventDefault();
    event.stopPropagation();
    const menu = this.buildListItemMenu(song);
    const { clientX, clientY } = event;
    menu.popup();
  }

  componentDidMount () {
    const { actions, options, settings } = this.props;
    this.buildListItemMenu = buildListItemMenu.bind(this);
    // actions.getCurrent();
    actions.fetchListItems('PLA0CA9B8A2D82264B');

    // actions.fetchListItems('PL1GZkw2FUKCiZSI636mf54HEr2CtDxvW_') // short sound effects

    // actions.fetchListItems('PLkHvEl7zu06o70dpsiVrRbYFLWreD9Jcw'); //PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y

    // actions.fetchListItems('PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y'); // Pageable

    // actions.fetchListItems('PLsPUh22kYmNBl4h0i4mI5zDflExXJMo_x');
    this.props.placeholder.className = 'row placeholder';
    window.placeholder = this.props.placeholder;
  }

  makeProgressBar (song) {
    if(!song.isLoading && !song.isPlaying) {
      return {};
    } else if (song.isLoading) {
      const { progress } = song;
      return {
        'background': `linear-gradient(to right, #eee 0%, #eee ${progress * 100}%,#f6f6f6 ${progress * 100}%,#f6f6f6 100%)`
      };
    }
  }

  dragStart = event => {
    //console.log('dragStart: target', event.target.className, ' currentTarget: ', event.currentTarget.className, '!', event.target, event.target.dataset)
    this.dragged = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';
    // Firefox requires dataTransfer data to be set
    event.dataTransfer.setData('text/html', event.currentTarget);
    this.setState({
      isDragDrop: true
    });
  }

  dragEnd = event => {
    const { actions } = this.props;
    try {
      this.dragged.style.display = 'flex';
      this.dragged.parentNode.removeChild(this.props.placeholder);

      const from = Number(this.dragged.dataset.id);
      const to = Number(this.over.dataset.id);

      if (from < to) to--;
      if (this.nodePlacement == 'after') to++;

      actions.orderPlayList(from, to);
    } catch (error) {
      console.log('dragEnd', this.dragged, this.dragged.parentNode)
      console.error(error);
    } finally {
      this.setState({
        isDragDrop: false
      });
    }
  }

  drop = event => {
    console.log('drop:', event.dataTransfer.getData('text/html'));
  }

  dragOver = event => {
    console.log('dragOver', event.currentTarget);
    event.preventDefault();
    try {
      this.dragged.style.display = 'none';
    } catch (error) {
      //console.log(this.dragged, error, event.dataTransfer.getData('text/html'))
    }

    if (event.target.className == 'placeholder') {
      return;
    }

    if(!event.target.dataset.id) {
      return;
    }

    this.over = event.target;
    const rect = this.over.getBoundingClientRect();
    // Inside the dragOver method
    const relY = event.clientY - this.over.offsetTop;
    const height = this.over.offsetHeight / 2;
    const parent = event.target.parentNode;

    // Over the top ?
    if (event.clientY < (rect.top + height)) {
      this.nodePlacement = 'before';
      parent.insertBefore(this.props.placeholder, event.target);
    } else if (relY > height) {
      this.nodePlacement = 'after';
      parent.insertBefore(this.props.placeholder, event.target.nextElementSibling);
    } else if (relY < height) {
      this.nodePlacement = 'before';
      parent.insertBefore(this.props.placeholder, event.target);
    }
  }

  dragLeave = event => {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.className == 'placeholder') {
      return;
    }
  }


  handleDoubleClick = (event, song) => {
    event.preventDefault();
    event.stopPropagation();
    this.playPause(song);
  }

  playPause (song) {
    const { actions } = this.props;
    const options = {
      title: 'Now Playing',
      body: song.title,
      sound: false,
      icon: song.thumbnails.default.url,
      image:  song.thumbnails.default.url,
      silent: true
    };
    new Notification(song.title, options);
    // Select this item
    actions.selectItems([song.id]);
    if (song.file && !song.isLoading) {
      return actions.playPauseItem(song.id, true);
    } else {
      return actions.playItem(song.id);
    }
  }

  handleClick = (event, song) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    let selected = [];
    const { list, actions } = this.props;

    // console.log('event', song.id, event.shiftKey, event.ctrlKey, event.metaKey, event.altKey)

    if (event.shiftKey) {
      const lastIndex = list.map(({ selected }) => (selected)).indexOf(true);
      const selectedIndex = list.findIndex(({ id }) => (id === song.id));
      if (lastIndex < selectedIndex) {
        const selected = list.slice(lastIndex, selectedIndex + 1).map(({ id }) => id);
        return actions.selectItems(selected);
      } else if (lastIndex > selectedIndex) {
        const selected = list.slice(selectedIndex, lastIndex + 1).map(({ id }) => id);
        return actions.selectItems(selected);
      }
    } else if (event.metaKey) {
      const items = list.filter(({ selected }) => (selected)).map(({ id }) => id);
      const selectedIndex = list.findIndex(({ id }) => (id === song.id) );
      const selected = [...items, list[selectedIndex].id];
      return actions.selectItems(selected);
    }
    return actions.selectItems([song.id]);
  };

  renderItem = () => {
    const { actions, list } = this.props;

    return list.map((song, index) => {
      const style = classNames(Style.row, {
        [Style.active]: song.isPlaying,
        [Style.selected]: song.selected,
        [Style.loading]: song.isLoading
      });
      // Scroll to element if it's playing
      // TODO: will constantly trigger scrollIntoView()
      // if(song.isPlaying) {
      //   let item = this.refs.list.querySelector(`[data-id="${index}"]`);
      //   item.scrollIntoView({
      //     block: 'end',
      //     behavior: 'smooth'
      //   });
      // }
      return (
        <li
          data-id={ index }
          key={ index }
          className={ style }
          draggable="true"
          onDragEnd={ this.dragEnd }
          onDragStart={ this.dragStart }
          onDragLeave={ this.dragLeave }
          onDrop={ this.drop }
          onClick={ (event) => this.handleClick(event, song) }
          onDoubleClick={ (event) => this.handleDoubleClick(event, song) }
          onContextMenu={ event=> this.handleContextMenu(event, song) }
          style={this.makeProgressBar(song)}
        >
          <RowField.Index index={ index } />
          <RowField.Status song={ song } />
          <RowField.Title  title={ song.title } />
          <Stars stars={ song.stars }/>
          <TrackDuration duration={ song.duration } format="#{2H}:#{2M}:#{2S}" />
          <RowField.DropDown onClick={ event => this.handleContextMenu(event, song) } />
        </li>
      );
    });
  }

  render () {
    const dragList = classNames(Style.list, {
      [Style.isDragDrop]: this.state.isDragDrop
    });

    return (
      <div className={ dragList }>
        <ul className={ Style.container } ref="list" onDragOver={ this.dragOver } >
          { this.renderItem() }
        </ul>
      </div>
    );
  }
}
