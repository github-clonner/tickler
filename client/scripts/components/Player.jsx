import fileSystem from 'fs';
import path from 'path';
import {remote} from 'electron';
import React, { Component, PropTypes } from 'react';
import { Howl, Howler } from 'howler';
import WaveSurfer from 'wavesurfer.js';

import Progress from './Progress';
import styles from '../../styles/player.css';

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
    seek: 0
  }

  static propTypes = {
    songs: PropTypes.array
  }

  static defaultProps = {
    songs: new Array()
  }

  constructor (...args) {
    super(...args);
    this.wavesurfer = Object.create(WaveSurfer);
    this.events = new PlayerEvents();
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
  load (file) {
    fileSystem.readFile(file, (error, buffer) => {
      let blob = new window.Blob([new Uint8Array(buffer)]);
      this.wavesurfer.loadBlob(blob);
    })
  }

  // wavesurfer event handlers
  loading (progress) {
    if(progress === 100) {
      window.addEventListener('resize', this.resize);
    }
  }
  ready () {
    this.setState({
      duration: this.wavesurfer.getDuration()
    });
  }
  audioprocess () {
    this.setState({
      seek: this.wavesurfer.getCurrentTime()
    });
  }

  // react component lifecycle events
  componentWillReceiveProps (nextProps) {
    if(!nextProps.songs.length) {
      return;
    }
    this.load(nextProps.songs[0])
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
    this.wavesurfer.on('loading', this.loading.bind(this));
    this.wavesurfer.on('ready', this.ready.bind(this));
    this.wavesurfer.on('audioprocess', this.audioprocess.bind(this));
  }

  // Player controls
  play() {
    this.wavesurfer.playPause();
    this.setState(prevState => ({
      isPlaying: this.wavesurfer.isPlaying()
    }));
    this.events.emit('onPlay', {isPlaying: this.wavesurfer.isPlaying()})
  }

  stop() {
    this.wavesurfer.stop();
    this.setState(prevState => ({
      isPlaying: this.wavesurfer.isPlaying(),
      seek: this.wavesurfer.getCurrentTime()
    }));
  }

  render () {
    return (
      <div className="player">
        <div className="btn-group">
          <button type="button" className="btn btn-outline-primary" onClick={this.play.bind(this)}>►</button>
          <button disabled={!this.state.isPlaying} type="button" className="btn btn-outline-primary" onClick={this.stop.bind(this)}>◼</button>
          <button type="button" className="btn btn-outline-primary">Right</button>
        </div>
        <Progress progress={this.state.seek / this.state.duration * 100}></Progress>
        <div ref="waves"></div>
      </div>
    )
  }
}
