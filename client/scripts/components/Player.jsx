import fileSystem from 'fs';
import path from 'path';
import {remote} from 'electron';
import React, { Component, PropTypes } from 'react';
import { Howl, Howler } from 'howler';
import WaveSurfer from 'wavesurfer.js';
//import musicmetadata from 'musicmetadata';
const musicmetadata = require('musicmetadata');

import Youtube from '../lib/Youtube';
import Progress from './Progress';
import InputRange from './InputRange';

require('../../styles/player.css');
require('../../styles/buttons.css');
require('../../styles/input.css');

import {EventEmitter} from 'events';

import _ from 'lodash';

class PlayerEvents extends EventEmitter {
  constructor(...args) {
    super(...args);
  }
}

export default class Player extends Component {
  state = {
    isPlaying: false,
    isPause: false,
    isLoading: false,
    currentSongIndex: -1,
    volume: 0.5,
    duration: 0,
    seek: 0,
    value: 3
  }

  static propTypes = {
    songs: PropTypes.array,
    autoplay: PropTypes.bool
  }

  static defaultProps = {
    songs: new Array(),
    autoplay: false
  }

  constructor (...args) {
    super(...args);

    this.wavesurfer = Object.create(WaveSurfer);
    this.events = new PlayerEvents();
    this.youtube = new Youtube();

    this.youtube.events.on('finish', file => {
      console.log('a youtube video has been downloaded !', file)
      this.load(file, true);
    })

    this.resize = _.debounce(function (event) {
      event.preventDefault();
      let orgWidth = this.wavesurfer.drawer.containerWidth;
      let newWidth = this.wavesurfer.drawer.container.clientWidth;
      if (orgWidth != newWidth) {
        this.wavesurfer.drawer.containerWidth = newWidth;
        this.wavesurfer.drawBuffer();
      }
    }, 500).bind(this);
  }

  async load (file, autoplay) {
    console.log('file: ', file);
    
    fileSystem.readFile(file, (error, buffer) => {
      let blob = new window.Blob([new Uint8Array(buffer)]);
      this.wavesurfer.loadBlob(blob);
    })
    let stream = fileSystem.createReadStream(file)
    musicmetadata(stream, function (error, metadata) {
      if (error) throw error;
      console.log(metadata);
    });
  }

  handleChange = event => {
    console.log('seekTo: ', event.target.value)
    this.wavesurfer.seekTo(event.target.value / 100);
  }
  // wavesurfer event handlers
  loading = progress => {
    if(progress === 100) {
      window.addEventListener('resize', this.resize);
    }
  }

  ready = () => {
    if (this.wavesurfer.isPlaying()) {
      this.stop();
    }
    if (this.props.autoplay) {
      this.play();
    }
    this.setState({
      seek: 0,
      isPlaying: false,
      duration: this.wavesurfer.getDuration()
    });
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
    })
  }

  finish = () => {
    this.setState({
      isPlaying: this.wavesurfer.isPlaying(),
      seek: this.wavesurfer.getCurrentTime()
    });
  }

  // react component lifecycle events
  componentWillReceiveProps (nextProps) {
    if(!nextProps.songs.length) {
      return;
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.resize);
    this.stop();
    this.wavesurfer.destroy();
  }

  componentDidMount () {

    this.wavesurfer.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 60
    })
    this.events.on('onPlay', data => {
      console.log('playing backend:', data)
    })
    this.wavesurfer.on('loading', this.loading);
    this.wavesurfer.on('ready', this.ready);
    this.wavesurfer.on('audioprocess', this.audioprocess);
    this.wavesurfer.on('seek', this.seek);
    this.wavesurfer.on('finish', this.finish);

    this.load(this.props.songs[0], false);
  }

  // Player controls
  play() {
    this.wavesurfer.playPause();
    this.setState({
      isPlaying: this.wavesurfer.isPlaying()
    });
  }

  stop() {
    this.wavesurfer.stop();
    this.setState({
      isPlaying: this.wavesurfer.isPlaying(),
      seek: this.wavesurfer.getCurrentTime()
    });
  }

  render () {
    return (
      <div className="player">
        <div className="controls">
          <div className="btn-group">
            <button className="round-button">skip_previous</button>
            <button className="round-button" disabled={!this.state.seek} onClick={this.stop.bind(this)}>stop</button>
            <button className="round-button">skip_next</button>
            <button className="round-button" onClick={this.play.bind(this)}>{ this.state.isPlaying ? 'pause' : 'play_arrow' }</button>
          </div>
          <InputRange value={this.state.seek / this.state.duration * 100} min={0} max={100} step={0.1} onChange={this.handleChange.bind(this)} />
        </div>
        <div ref="waves"></div>
      </div>
    )
  }
}
