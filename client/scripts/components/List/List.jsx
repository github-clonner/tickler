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
import { connect } from 'react-redux'
import * as Actions from 'actions/PlayList';
import * as Settings from 'actions/Settings';
import Stars from '../Stars/Stars';
import Spinner from '../Spinner/Spinner';
import { TrackDuration } from '../TimeCode/TimeCode';
import { ContextMenu, buildContextMenu } from '../../lib';
import { shell, remote } from 'electron';
import fs from 'fs';
import path from 'path';
import URL, { URL as URI} from 'url';
import { push } from 'react-router-redux';
import { DialogOptions } from '../../types/PlayList';
// Import styles
import './List.css';

/*
{
      x: this.mainWindowState.x,
      y: this.mainWindowState.y,
      width: this.mainWindowState.width,
      height: this.mainWindowState.height,
      backgroundThrottling: false, // do not throttle animations/timers when page is background
      minWidth: 800,
      minHeight: 400,
      darkTheme: true, // Forces dark theme (GTK+3)
      titleBarStyle: 'hidden-inset', // Hide title bar (Mac)
      useContentSize: true, // Specify web page size without OS chrome
      center: true,
      frame: false,
      icon: makeIcon('icon.png')
    }
*/
// const openModal = function () {
//   const url = URL.format({
//     protocol: 'file',
//     slashes: true,
//     pathname: path.join(process.cwd(), 'dist', 'index.html'),
//     hash: '#/about',
//     search: 'readOnly=true&mode=javascript'
//   });

//   const parent = remote.getCurrentWindow();

//   const main = URL.parse(parent.getURL());
//   main.hash = 'about';
//   main.search = 'readOnly=true&mode=javascript';
//   console.log('OPEN', url, main, main.toString(), URL.format(main));

//   const modal = new remote.BrowserWindow({
//     parent: parent,
//     modal: true,
//     show: false
//   });
//   modal.loadURL(URL.format(main));
//   modal.on('closed', event => {
//     console.log('modal closed', __dirname, process.cwd());
//   });
//   modal.on('app-command', (event, command) => {
//     console.log('modal app-command', event, command);
//   });
//   modal.webContents.on('before-input-event', (event, input) => {
//     if (input.key === 'Escape') {
//       modal.close();
//     }
//   });
//   modal.once('ready-to-show', () => {
//     modal.show();
//     modal.focus();
//   });
// }

const loadView = ({title,scriptUrl}) => {
  return (`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
      </head>
      <body>
        <div id="view"></div>
        <script src="${scriptUrl}"></script>
      </body>
    </html>
  `)
}

const viewData = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView({
  title: "Account",
  scriptUrl: "./account.view.js"
}));

console.log('viewData', viewData)
const openModal = function (route) {
  const basePath = path.join(process.cwd(), 'dist', 'index.html');
  const parent = remote.getCurrentWindow();
  const base = URL.format({
    protocol: 'file',
    slashes: true,
    pathname: basePath
  });
  // const location = path.parse(decodeURIComponent(base));
  const target = new URI(base);
  target.search = 'readOnly=true&mode=javascript&index=about';
  const modal = new remote.BrowserWindow({
    webviewTag: true,
    parent: parent,
    modal: true,
    show: false
  });
  console.log('Modal URL', 'target', target, URL.format(target))
  modal.loadURL(URL.format(target));
  modal.once('closed', event => {
    console.log('modal closed', __dirname, process.cwd());
  });
  modal.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      modal.close();
    }
  });
  modal.once('ready-to-show', () => {
    modal.show();
    modal.focus();
  });
  window.modal = modal;
}

const mapStateToProps = function (state) {
  return {
    list: state.PlayListItems,
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

const placeholder = document.createElement('li');
placeholder.className = 'placeholder';

@connect(mapStateToProps, mapDispatchToProps)
export default class List extends Component {

  state = {
    isDragDrop: false,
    song: new Object()
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

  buildListItemMenu (song) {
    const { actions, inspect } = this.props;

    return buildContextMenu([{
      label: song.isPlaying ? 'Pause': 'Play',
      click () {
        const { id, file, isLoading, isPlaying } = song;
        if (file && !isLoading) {
          return isPlaying ? actions.pauseItem(id) : actions.playItem(id, true);
        }
      }
    }, {
      label: 'Media Information...',
      click () {
        console.log(song);
        return openModal('/about');
      }
    }, {
      type: 'separator'
    }, {
      label: 'Select All',
      click () {}
    }, {
      type: 'separator'
    }, {
      label: 'Explore item folder',
      enabled: fs.existsSync(song.file),
      click () {
        return shell.showItemInFolder(song.file);
      }
    }, {
      type: 'separator'
    }, {
      label: 'Remove from PlayList',
      click () {}
    }, {
      label: 'Delete from Library',
      click () {}
    }, {
      type: 'separator'
    }, {
      label: 'Open...',
      click () {
        return actions.openPlayList();
      }
    }, {
      label: 'View Source',
      click () {
        const { dialog } = remote;
        dialog.showOpenDialog(DialogOptions.open, files => {
          if (!Array.isArray(files) || files.length < 1) {
            return;
          }
          // files is an array that contains all the selected
          const file = files.slice(0).pop();
          if (file && fs.existsSync(file)) {
            const stats = fs.statSync(file);
            console.log('selected files: ', files, stats)
            return inspect(encodeURIComponent(file), 'readOnly=true&mode=javascript');
          } else {
            console.log('No file selected');
            return;
          }
        });
      }
    }]);
  }

  handleContextMenu (event, song) {
    event.preventDefault();
    const menu = this.buildListItemMenu(song);
    const { clientX, clientY } = event;
    menu.popup();
  }

  componentDidMount () {
    const { actions, options, settings } = this.props;
    actions.getCurrent();
    // actions.fetchListItems('PLA0CA9B8A2D82264B');

    // actions.fetchListItems('PLkHvEl7zu06o70dpsiVrRbYFLWreD9Jcw'); //PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y

    // actions.fetchListItems('PL7XlqX4npddfrdpMCxBnNZXg2GFll7t5y'); // Pageable

    // actions.fetchListItems('PLsPUh22kYmNBl4h0i4mI5zDflExXJMo_x');
    this.props.placeholder.className = 'row placeholder';
  }

  makeProgressBar (song) {
    if(!song.isLoading && !song.isPlaying) {
      return {};
    } else if (song.isLoading) {
      let { progress } = song;
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
    this.dragged.style.display = 'flex';
    this.dragged.parentNode.removeChild(this.props.placeholder);

    let from = Number(this.dragged.dataset.id);
    let to = Number(this.over.dataset.id);

    if (from < to) to--;
    if (this.nodePlacement == 'after') to++;

    let { actions } = this.props;
    actions.orderPlayList(from, to);
    this.setState({
      isDragDrop: false
    });
  };

  drop = event => {
    console.log('drop:', event.dataTransfer.getData('text/html'))
  }

  dragOver = event => {

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
    let rect = this.over.getBoundingClientRect();
    // Inside the dragOver method
    let relY = event.clientY - this.over.offsetTop;
    let height = this.over.offsetHeight / 2;
    let parent = event.target.parentNode;

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
  };

  dragLeave = event => {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.className == 'placeholder') {
      return;
    }
  };


  handleDoubleClick = song => {
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
    }
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

    // console.log('event', song.id, event.shiftKey, event.ctrlKey, event.metaKey, event.altKey)

    if (event.shiftKey) {
      let lastIndex = this.props.list.findLastIndex(item => item.get('selected'));
      let selectedIndex = this.props.list.findIndex(item => ( item.get('id') === song.id) );
      let selected = [];
      if (lastIndex < selectedIndex) {
        selected = this.props.list.slice(lastIndex, selectedIndex + 1).map(item => (item.get('id'))).toJS();
      } else if (lastIndex > selectedIndex) {
        selected = this.props.list.slice(selectedIndex, lastIndex + 1).map(item => (item.get('id'))).toJS();
      }
      return this.props.actions.selectItems(selected);
    } else if (event.metaKey) {
      let items = this.props.list.filter(item => item.get('selected')).map(item => (item.get('id')));
      let selectedIndex = this.props.list.findIndex(item => ( item.get('id') === song.id) );
      let selected = [...items.toJS(), this.props.list.get(selectedIndex).get('id')];
      return this.props.actions.selectItems(selected);
    }
    return this.props.actions.selectItems([song.id])
  }

  renderItem () {
    const { actions, list } = this.props;

    return list.map((item, index) => {
      const song = item.toJS();
      const style = classNames('row', {
        active: song.isPlaying,
        selected: song.selected,
        loading: song.isLoading
      });
      const exists = classNames('dot', {
        local: song.file,
        'is-iconic': !song.isLoading
      });

      const isPlayingIcon = song => {
        if (!song.file && !song.isLoading) {
          return 'wifi';
        } else if (song.isLoading) {
          return <Spinner />;
        } else {
          return (song.isPlaying) ? 'play_arrow' : 'stop';
        }
      }

      // Scroll to element if it's playing
      // TODO: will constantly trigger scrollIntoView()
      /*
      if(song.isPlaying) {
        let item = this.refs.list.querySelector(`[data-id="${index}"]`);
        item.scrollIntoView({
          block: 'end',
          behavior: 'smooth'
        });
      }
      */

      return (
        <li
          data-id={index}
          draggable="true"
          onDragEnd={this.dragEnd}
          onDragStart={this.dragStart}
          onDragLeave={this.dragLeave}
          onDrop={this.drop}
          className={style}
          key={index}
          onClick={(event) => this.handleClick(event, song) }
          onDoubleClick={() => this.handleDoubleClick(song) }
          onContextMenu={(event) => this.handleContextMenu(event, song) }
          style={this.makeProgressBar(song)}
          >
          <span>{ index + 1 }</span>
          <span className={exists}>{ isPlayingIcon(song) }</span>
          <span>
            <p>{ song.title }</p>
          </span>
          <Stars stars={ song.stars }/>
          <TrackDuration duration={ song.duration } format="#{2H}:#{2M}:#{2S}" />
          <span onClick={ e => this.handleContextMenu(event, song) }>•••</span>
        </li>
      );
    });
  }

  render () {
    const dragList = classNames('list', {
      'is-drag-drop': this.state.isDragDrop
    });

    return (
      <div className={ dragList }>
        <ul className="container" ref="list" onDragOver={ this.dragOver }>
          { this.renderItem() }
        </ul>
      </div>
    );
  }
}
