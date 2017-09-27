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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from 'actions/PlayList';
import * as Settings from 'actions/Settings';
import { ContextMenu, buildContextMenu } from '../../lib';
import { shell, remote } from 'electron';
import fs from 'fs';
import path from 'path';
import { openModal } from '../Modal/Modal';
import URL, { URL as URI} from 'url';


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

export const buildListItemMenu = function (song) {
  const { actions, inspect, list } = this.props;
  const { playPause } = this;

  return buildContextMenu([{
    label: song.file ? (song.isPlaying ? 'Pause': 'Play:') : (song.isLoading ? 'cancel' : 'download'),
    click: (menuItem, browserWindow, event) => {
      const { id, file, isLoading, isPlaying } = song;
      console.log(menuItem);
      if (file && !isLoading) {
        return isPlaying ? actions.pauseItem(id) : actions.playItem(id, true);
        // return playPause(song);
      } else if (!file && !isLoading) {
        return this.playPause(song);
      } else if (!file && isLoading) {
        console.log('ABORT');
        actions.cancel(id, true);
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
    click: () => {
      const items = list.reduce((items, { id }) => ({ ...items, ...{ [id]: { selected: true} } }), {});
      actions.editItems(items);
    }
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
};
