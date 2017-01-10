import React from 'react';
import { Howl, Howler } from 'howler';

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
  constructor (...args) {
    super(...args);
    this.howl = new Howl({
      src: ['https://upload.wikimedia.org/wikipedia/commons/5/5b/Ludwig_van_Beethoven_-_Symphonie_5_c-moll_-_1._Allegro_con_brio.ogg'],
      volume: this.state.volume,
      onload: this.initSoundObjectCompleted.bind(this),
      //onend: this.playEnd
    });
  }

  componentWillMount () {
    console.log('howler: ', Object.keys(styles));
  }

  componentDidMount() {

  }

  play() {
    this.setState(prevState => ({
      isPlaying: !prevState.isPlaying
    }));
    if(!this.state.isPlaying) {
      this.howl.play();
      this.interval = setInterval(this.updateCurrentDuration.bind(this), 500);
    } else {
      this.howl.pause();
      this.stopUpdateCurrentDuration();
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

  render () {
    return (
      <div className="player">
        <div className="btn-group">
          <button type="button" className="btn btn-default" onClick={this.play.bind(this)}>Play</button>
          <button disabled={!this.state.isPlaying} type="button" className="btn btn-default" onClick={this.stop.bind(this)}>Stop</button>
          <button type="button" className="btn btn-default">Right</button>
        </div>
        <Progress progress={this.state.seek / this.state.duration * 100}></Progress>
      </div>
    )
  }
}
