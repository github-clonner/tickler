import fileSystem from 'fs';
import path from 'path';
import React, { Component, PropTypes } from 'react';
import { Howl, Howler } from 'howler';
import WaveSurfer from 'wavesurfer.js';

import Progress from './Progress';
import styles from '../../styles/player.css';

import {EventEmitter} from 'events';

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
  }

  componentWillReceiveProps (nextProps) {
    if(!nextProps.songs.length) {
      return;
    }
    this.load(nextProps.songs[0])
  }

  load (file) {

    console.log(file)
    //let file = path.resolve('media/sample.mp3');
    fileSystem.readFile(file, (error, buffer) => {
      let blob = new window.Blob([new Uint8Array(buffer)]);
      this.wavesurfer.loadBlob(blob);
    })
  }

  componentDidMount() {
    this.wavesurfer.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 60
    })

    this.events.on('onPlay', data => {
      console.log('playing backend:', data)
    })

    //this.wavesurfer.load('http://api.soundcloud.com/tracks/204082098/stream?client_id=17a992358db64d99e492326797fff3e8') //'https://cdn.rawgit.com/ArtskydJ/test-audio/master/audio/50775__smcameron__drips2.ogg'

    this.wavesurfer.on('loading', function (progress) {
      console.log(progress);
    });

    this.wavesurfer.on('ready', () => {
      this.setState({
        duration: this.wavesurfer.getDuration()
      })
    });

    this.wavesurfer.on('audioprocess', () => {
      this.setState({
        seek: this.wavesurfer.getCurrentTime()
      })
    });
  }

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
