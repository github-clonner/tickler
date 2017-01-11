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
    seek: 0
  }
  static defaultProps = {
    songs: new Array()
  }
  constructor (...args) {
    super(...args);
    this.howl = new Howl({
      src: ['https://upload.wikimedia.org/wikipedia/commons/4/47/Beethoven_Moonlight_2nd_movement.ogg'],
      volume: this.state.volume,
      onload: this.initSoundObjectCompleted.bind(this),
      //onend: this.playEnd
    });
  }

  componentWillMount () {
    console.log('howler: ', Object.keys(styles));
  }

  componentDidMount() {
    this.wavesurfer = Object.create(WaveSurfer);
    console.log(this.wavesurfer)
    this.wavesurfer.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 60
    })
    this.wavesurfer.load('http://api.soundcloud.com/tracks/204082098/stream?client_id=17a992358db64d99e492326797fff3e8') //'https://cdn.rawgit.com/ArtskydJ/test-audio/master/audio/50775__smcameron__drips2.ogg'
    this.wavesurfer.on('ready', () => {
      console.log('wavesurfer ready')
      this.wavesurfer.params.container.style.opacity = 0.9;
      this.wavesurfer.play();
      console.log(this.wavesurfer.backend)
    });
  }

  play() {
    this.setState(prevState => ({
      isPlaying: !prevState.isPlaying
    }));
    this.wavesurfer.playPause();
    if(!this.state.isPlaying) {

      //this.howl.play();
      //this.interval = setInterval(this.updateCurrentDuration.bind(this), 500);
    } else {
      //this.howl.pause();
      //this.stopUpdateCurrentDuration();
    }
  }

  updateCurrentDuration () {
    this.setState({
      seek: this.howl.seek()
    });
    console.log(this.state)
  }

  stopUpdateCurrentDuration () {
    clearInterval(this.interval);
  }

  initSoundObjectCompleted () {
    this.setState({
      duration: this.howl.duration(),
      isLoading: false
    });
  }

  stop() {
    this.setState(prevState => ({
      isPlaying: false,
      seek: 0
    }));
    this.stopUpdateCurrentDuration();
    this.howl.stop();
  }

  seek(event) {
    console.log(event.target.value)
    //this.setState({value: event.target.value});
  }
  // <input type="range" min="0" max={this.state.duration} value={this.state.seek} step="1" onChange={(event) => this.seek.bind(this)}/>
  render () {
    return (
      <div className="player">
        <div className="btn-group">
          <button type="button" className="btn btn-default" onClick={this.play.bind(this)}>Play</button>
          <button disabled={!this.state.isPlaying} type="button" className="btn btn-default" onClick={this.stop.bind(this)}>Stop</button>
          <button type="button" className="btn btn-default">Right</button>
        </div>
        <Progress progress={this.state.seek / this.state.duration * 100}></Progress>

        <input type="range" min="0" max="100" value="50" step="1" onChange={(event) => this.seek.bind(this)}/>
        <div ref="waves"></div>
      </div>
    )
  }
}
