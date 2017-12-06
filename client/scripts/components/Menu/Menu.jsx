///////////////////////////////////////////////////////////////////////////////
// @file         : Menu.jsx                                                  //
// @summary      : Menu component                                            //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 26 Sep 2017                                               //
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

import fs from 'fs';
import path from 'path';
import URL, { URL as URI} from 'url';
import { shell, remote, nativeImage } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/* Private Modules */
import * as Actions from 'actions/PlayList';
import * as Settings from 'actions/Settings';
import { ContextMenu, buildContextMenu, Modal } from '../../lib';
// import { openModal } from '../Modal/Modal';

// let image = nativeImage.createFromPath('/Users/bmaggi/tickler/media/icon.png')
// image = image.resize({
//   width: 16,
//   height: 16
// })

/* Private variables */
const DialogOptions = {
  open: {
    title: 'Open playlist',
    defaultPath: '/Users/bmaggi/Music'
  },
  save: {
    title: 'Open playlist',
    defaultPath: '/Users/bmaggi/Music'
  }
};

/* Public Methods */
export const buildListItemMenu = (props) => (event, item) => {
  event.preventDefault();
  event.stopPropagation();
  const { clientX, clientY } = event;
  const { player, playlist, inspect, items, modal } = props;

  const menu = buildContextMenu([{
    label: item.file ? (item.isPlaying ? 'Pause' : 'Play') : (item.isLoading ? 'cancel' : 'download'),
    click() {
      if (item.file && !item.isLoading) {
        return item.isPlaying ? player.playPause(item) : player.play(item);
      } else if (!item.file && !item.isLoading) {
        return playlist.playItem(item);
      } else if (!item.file && item.isLoading) {
        playlist.cancel(item.id, true);
      }
    }
  }, {
    label: 'Media Information...',
    click(menuItem, browserWindow, event) {
      return modal.MediaInfo(item);
      // console.log('menuItem, browserWindow, event', menuItem, browserWindow, event);
      // const modal = new Modal('/modal/media/metadata', item, { stats: true });
      // const id = modal.show();
      // return;
    }
  }, {
    label: 'Related media...',
    click(menuItem, browserWindow, event) {
      return modal.Related(item);
      // console.log('menuItem, browserWindow, event', menuItem, browserWindow, event);
      // const modal = new Modal('/modal/media/metadata', item, { stats: true });
      // const id = modal.show();
      // return;
    }
  },
  {
    label: 'Item Information...',
    click() {
      console.log(item);
    }
  },
  { type: 'separator' },
  {
    label: 'Select All',
    click() {
      const items = list.reduce((items, { id }) => ({ ...items, ...{ [id]: { selected: true} } }), {});
      actions.editItems(items);
    }
  },
  { type: 'separator' },
  {
    label: 'Explore item folder',
    // icon: path.resolve('/Users/bmaggi/tickler/media/icon.png'),
    enabled: fs.existsSync(item.file),
    click() {
      return shell.showItemInFolder(item.file);
    }
  },
  { type: 'separator' },
  {
    label: 'Remove from PlayList',
    click() {}
  }, {
    label: 'Delete from Library',
    click() {}
  },
  { type: 'separator' },
  {
    label: 'Open...',
    click(menuItem, browserWindow, event) {
      return actions.openPlayList();
    }
  }, {
    label: 'View Source',
    click() {
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
  console.log('menu', menu);
  return menu.popup();
};

export const buildTrayMenu = (props) => (event, data) => {
  event.preventDefault();
  event.stopPropagation();
  const { clientX, clientY } = event;

  const menu = buildContextMenu([{
    label: 'About',
    click(menuItem, browserWindow, event) {
      return true;
    }
  },
  { type: 'separator' },
  {
    label: 'Quit',
    click(menuItem, browserWindow, event) {
      return true;
    }
  }]);
};
