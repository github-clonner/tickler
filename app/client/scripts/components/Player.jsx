import fileSystem from 'fs';
import path from 'path';
import React from 'react';
import { Howl, Howler } from 'howler';
import WaveSurfer from 'wavesurfer.js';

import Progress from './Progress';
import styles from '../../styles/player.css';

export default class Player extends React.Component {
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
    songs: React.PropTypes.array
  }

  static defaultProps = {
    songs: new Array()
  }
  constructor (...args) {
    super(...args);
    this.wavesurfer = Object.create(WaveSurfer);
  }

  handleChange (event) {
    /*this.setState({
      value: event.target.value
    });*/
    console.log('seekTo: ', event.target.value)
    this.wavesurfer.seekTo(event.target.value / 100);
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
          <button type="button" className="btn btn-outline-primary" onClick={this.play.bind(this)}><i className="fa fa-play"></i></button>
          <button disabled={!this.state.isPlaying} type="button" className="btn btn-outline-primary" onClick={this.stop.bind(this)}><i className="fa fa-stop"></i></button>
          <button type="button" className="btn btn-outline-primary">Right</button>
        </div>
        <input type="range" min="0" max="100" value={this.state.seek / this.state.duration * 100} onChange={this.handleChange.bind(this)} step="1"/><span>{this.state.value}</span>
        <Progress progress={this.state.seek / this.state.duration * 100}></Progress>
        <div ref="waves"></div>
      </div>
    )
  }
}
