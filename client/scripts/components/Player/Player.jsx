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

import fileSystem from 'fs';
import path from 'path';
import { remote } from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import WaveSurfer from 'wavesurfer.js';
import debounce from 'lodash/debounce';
import * as Settings from 'actions/Settings';
/* Redux stuff */
import Immutable, { List, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Playist from 'actions/Playlist';
import * as Audio from 'actions/Audio';

import { Progress, InputRange, TimeCode } from '../index';

// Import styles
import './Player.css';
import 'styles/buttons.css';

function mapStateToProps(state) {
  return {
    list: state.PlayListItems,
    audio: state.Audio,
    options: {
      player: state.Settings.get('player'),
      audio: state.Settings.get('audio')
    }
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Playist, dispatch),
    audio: bindActionCreators(Audio, dispatch),
    settings: bindActionCreators(Settings, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Player extends Component {
  state = {
    item: Map(),
    isPlaying: false,
    volume: 0.5,
    duration: 0,
    seek: 0,
    isMuted: false
  };

  static propTypes = {
    list: PropTypes.instanceOf(List).isRequired,
    options: PropTypes.shape({
      audio: PropTypes.shape({
        volume: PropTypes.number.isRequired
      }),
      player: PropTypes.shape({
        autoplay: PropTypes.bool.isRequired
      })
    })
  };

  static defaultProps = {
    list: Immutable.List([]),
    autoplay: false,
    audioContext: new AudioContext()
  };

  constructor (...args) {
    super(...args);
    this.wavesurfer = Object.create(WaveSurfer);
  }

  resize = debounce(event => {
    event.preventDefault();
    const orgWidth = this.wavesurfer.drawer.containerWidth;
    const newWidth = this.wavesurfer.drawer.container.clientWidth;
    if (orgWidth != newWidth) {
      this.wavesurfer.drawer.containerWidth = newWidth;
      this.wavesurfer.drawBuffer();
    }
  }, 500);

  async load (item, autoplay) {
    const file = item.get('file');
    if(!file || !fileSystem.statSync(file)) {
      console.log('file not found', file, song.get('id'))
      return false;
    }
    fileSystem.readFile(file, (error, buffer) => {
      const blob = new window.Blob([new Uint8Array(buffer)]);
      this.wavesurfer.loadBlob(blob);
    });
  }

  handleVolume = volume => {
    const { wavesurfer } = this;
    const { settings } = this.props;
    this.setState({ volume });
    settings.set('audio', { volume });
    wavesurfer.setVolume(volume);
  }

  handleChange = value => {
    return this.wavesurfer.seekTo(value / 100);
  }
  // wavesurfer event handlers
  loading = progress => {
    //this.props.audio.analyser(null);
    if (progress === 100) {
      window.addEventListener('resize', this.resize);
    }
  }

  ready = () => {
    this.setState({
      seek: 0,
      duration: this.wavesurfer.getDuration()
    });
    if (this.wavesurfer.isPlaying()) {
      this.stop();
    }
    if (this.props.autoplay || this.state.isPlaying) {
      this.play();
    }
  }

  audioprocess = () => {
    this.setState({
      isPlaying: this.wavesurfer.isPlaying(),
      seek: this.wavesurfer.getCurrentTime()
    });
  }

  seek = progress => {
    this.setState({
      seek: this.wavesurfer.getCurrentTime()
    });
  }

  mute = event => {
    this.wavesurfer.toggleMute();
    this.setState({
      isMuted: event.target.checked
    });
  }

  finish = () => {
    this.stop();
    return this.playTo(1);
  }

  // react component lifecycle events
  componentWillReceiveProps (nextProps) {
    if(!nextProps.list.size) {
      return;
    }

    const item = nextProps.list.find(item => (item.get('isPlaying') === true));

    // already playing
    if (this.state.isPlaying && (item && item.get('id') === this.state.item.get('id'))) {
      return;
    }

    if(item && item.get('file') && !item.get('isLoading')) {
      this.setState({
        item: item,
        isPlaying: true
      });
      this.load(item, false);
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize);
    this.stop();
    this.wavesurfer.destroy();
  }

  componentDidMount () {
    const { list, audio, options, audioContext } = this.props;
    const { wavesurfer } = this;

    wavesurfer.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 60,
      audioContext
    });

    audio.context(this.props.audioContext);
    audio.wavesurfer(wavesurfer);
    audio.analyser(wavesurfer.backend.analyser);

    wavesurfer.on('loading', this.loading);
    wavesurfer.on('ready', this.ready);
    wavesurfer.on('audioprocess', this.audioprocess);
    wavesurfer.on('seek', this.seek);
    wavesurfer.on('finish', this.finish);

    const item = list.find(item => (item.get('isPlaying') === true));
    if (item) {
      this.setState({
        item,
        isPlaying: options.player.autoplay
      });
      this.load(item.get('file'));
    }
  }

  // Player controls
  play = () => {
    const { playItem } = this.props.actions;
    let item = this.props.list.find(item => (item.get('isPlaying') === true));
    if (!item) {
      item = this.props.list.findLast(item => item.get('selected'));
    }

    // Play the first song if none selected
    // else play the last song that was selected and stopped
    if (!item && !this.state.item.has('id')) {
      return playItem(this.props.list.get(0).get('id'));
    } else if (!item && this.state.item) {
      return playItem(this.state.item.get('id'));
    } else if (item.has('id') && !item.get('file')) {
      return playItem(item.get('id'));
    } else if (item.has('id') && item.get('file')) {
      playItem(item.get('id'));
      this.wavesurfer.playPause();
      return this.setState({
        isPlaying: this.wavesurfer.isPlaying()
      });
    }
  }

  stop = () => {
    const { actions } = this.props;
    const { getCurrentTime, getDuration } = this.wavesurfer;
    const item = this.props.list.find(item => (item.get('isPlaying') === true));

    this.wavesurfer.stop();
    this.setState({
      isPlaying: false,
      seek: this.wavesurfer.getCurrentTime(),
      duration: this.wavesurfer.getDuration()
    });
    actions.stop(item);
  }

  /*
    TODO: when skipping into an unloaded track and while the track is being loaded if the user moves into another track
    once the track finished it'll still play the song after being selected
  */
  playTo = direction => {
    if (!this.state.item.has('id')) {
      return false;
    }

    const id = this.state.item.get('id');
    const { playItem } = this.props.actions;
    const index = this.props.list.findIndex(item => (item.get('id') === id));
    let item = null;

    if (Math.sign(direction) > 0) {
      const nextIndex = ((index + 1) === this.props.list.size) ? 0 : index + 1;
      item = this.props.list.get(nextIndex);
    } else {
      const prevIndex = (index === 0) ? (this.props.list.size - 1) : index - 1;
      item = this.props.list.get(prevIndex);
    }
    return playItem(item.get('id'));
  }

  render () {
    const { options } = this.props;
    return (
      <div className="player">
        <div className="controls">
          <div className="btn-group">
            <button className="round-button" onClick={() => this.playTo(-1)} title="backward">skip_previous</button>
            <button className="round-button" disabled={!this.state.seek} onClick={this.stop} title="stop">stop</button>
            <button className="round-button" onClick={() => this.playTo(1)} title="forward">skip_next</button>
            <button className="round-button" onClick={this.play} title="play">{ this.state.isPlaying ? 'pause' : 'play_arrow' }</button>
          </div>
          <div className="button-group checkbox-buttons">
            <input id="loop" type="checkbox"/>
            <label htmlFor="loop">loop</label>
            <input id="shuffle" type="checkbox" />
            <label htmlFor="shuffle">shuffle</label>
          </div>
          <div className="volume checkbox-buttons">
            <input id="volume" type="checkbox" checked={this.state.isMuted} onChange={this.mute}/>
            <label htmlFor="volume">volume_up</label>
            <div className="slider">
              <InputRange value={this.state.volume} min={0} max={1} step={0.001} onChange={this.handleVolume}/>
            </div>
          </div>
          <InputRange value={this.state.seek / this.state.duration * 100} min={0} max={100} step={0.1} onChange={this.handleChange} disabled={!this.state.isPlaying && !this.state.seek} />
          <TimeCode time={this.state.seek} duration={this.state.duration} />
        </div>
        <div ref="waves" style={{display: 'none'}}></div>
      </div>
    );
  }
}
