import React from 'react';
import { Howl, Howler } from 'howler';

import Progress from './Progress';
import styles from '../../styles/player.css';

export default class Player extends React.Component {
  state = {
    isPlaying: false
  }
  constructor (...args) {
    super(...args);
    this.howl = new Howl({
      src: ['https://upload.wikimedia.org/wikipedia/commons/5/5b/Ludwig_van_Beethoven_-_Symphonie_5_c-moll_-_1._Allegro_con_brio.ogg']
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
    } else {
      this.howl.pause();
    }
  }

  stop() {
    this.setState(prevState => ({
      isPlaying: false
    }));
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
        <Progress progress="50"></Progress>
      </div>
    )
  }
}
