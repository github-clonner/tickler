import fileSystem from 'fs';
import path from 'path';
import {remote} from 'electron';
import React, { Component, PropTypes } from 'react';
import { Howl, Howler } from 'howler';
import WaveSurfer from 'wavesurfer.js';
//import musicmetadata from 'musicmetadata';
const musicmetadata = require('musicmetadata');

import { Progress, InputRange } from './index';

require('styles/player.css');
require('styles/buttons.css');
require('styles/input.css');

import debounce from 'lodash/debounce';

/* Redux stuff */
import Immutable, { List, Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Playist from '../actions/Playlist';
import * as Audio from '../actions/Player';

function mapStateToProps(state) {
  return {
    list: state.Playlist,
    audio: state.Audio
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Playist, dispatch),
    audio: bindActionCreators(Audio, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Player extends Component {
  state = {
    item: List([]),
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
    list: React.PropTypes.instanceOf(Immutable.List).isRequired,
    autoplay: PropTypes.bool.isRequired
  }

  static defaultProps = {
    list: Immutable.List([]),
    autoplay: false,
    audioContext: new AudioContext()
  }

  constructor (...args) {
    super(...args);
    this.wavesurfer = Object.create(WaveSurfer);
  }

  resize = debounce(event => {
    event.preventDefault();
    let orgWidth = this.wavesurfer.drawer.containerWidth;
    let newWidth = this.wavesurfer.drawer.container.clientWidth;
    if (orgWidth != newWidth) {
      this.wavesurfer.drawer.containerWidth = newWidth;
      this.wavesurfer.drawBuffer();
    }
  }, 500);

  async load (item, autoplay) {
    let file = item.get('file');
    if(!file || !fileSystem.statSync(file)) {
      console.log('file not found', file, song.get('id'))
      return false;
    }
    fileSystem.readFile(file, (error, buffer) => {
      let blob = new window.Blob([new Uint8Array(buffer)]);
      this.wavesurfer.loadBlob(blob);
    })
    // let stream = fileSystem.createReadStream(file)
    // musicmetadata(stream, function (error, metadata) {
    //   if (error) throw error;
    //   // console.log(metadata);
    // });
  }

  handleChange = event => {
    console.log('seekTo: ', event.target.value)
    this.wavesurfer.seekTo(event.target.value / 100);
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
    })
  }

  finish = () => {
    this.stop();
    let { playNext, playNextItem } = this.props.actions;
    //return playNext(this.state.item.get('id'));
    return playNextItem(this.state.item.get('id'));
  }

  // react component lifecycle events
  componentWillReceiveProps (nextProps) {
    if(!nextProps.list.size) {
      return;
    }

    let item = nextProps.list.find(item => (item.get('isPlaying') === true));
    
    // already playing
    if (item && item.get('id') === this.state.item.get('id')) {
      this.stop();
      this.ready();
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
    let {audio} = this.props;
    this.wavesurfer.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 60,
      audioContext: this.props.audioContext
    });

    audio.context(this.props.audioContext);
    audio.wavesurfer(this.wavesurfer);
    audio.analyser(this.wavesurfer.backend.analyser);

    this.wavesurfer.on('loading', this.loading);
    this.wavesurfer.on('ready', this.ready);
    this.wavesurfer.on('audioprocess', this.audioprocess);
    this.wavesurfer.on('seek', this.seek);
    this.wavesurfer.on('finish', this.finish);

    //this.props.audio.wavesurfer(this.wavesurfer);

    let item = this.props.list.find(item => (item.get('isPlaying') === true));
    if (item) {
      this.setState({
        item: item,
        isPlaying: this.props.autoplay
      });
      this.load(item.get('file'));
    }
  }

  // Player controls
  play() {
    this.wavesurfer.playPause();
    this.setState({
      isPlaying: this.wavesurfer.isPlaying()
    });
  }

  stop() {
    let {actions} = this.props;
    let item = this.props.list.find(item => (item.get('isPlaying') === true));

    this.wavesurfer.stop();
    this.setState({
      isPlaying: this.wavesurfer.isPlaying(),
      seek: this.wavesurfer.getCurrentTime(),
      duration: this.wavesurfer.getDuration()
    });

    if (item) {
      actions.editItem(item.get('id'), {
        isPlaying: false
      });
    }
  }

  playTo = (id, direction) => {
    let { playItem } = this.props.actions;

    let index = this.props.list.findIndex(item => (item.get('id') === id));
    let item = null;
    if (Math.sign(direction)) {
      let nextIndex = ((index + 1) === this.props.list.size) ? 0 : index + 1;
      item = this.props.list.get(nextIndex);
    } else {
      let prevIndex = ((index - 1) < 0) ? this.props.list.size : index - 1;
      item = this.props.list.get(prevIndex);
    }

    return playItem(item.get('id'));
  }

  render () {
    let {playNext, playPrevious} = this.props.actions;
    let {item} = this.state;
    return (
      <div className="player">
        <div className="controls">
          <div className="btn-group">
            <button className="round-button" onClick={() => this.playTo(item.get('id'), -1)} title="backward">skip_previous</button>
            <button className="round-button" disabled={!this.state.seek} onClick={this.stop.bind(this)} title="stop">stop</button>
            <button className="round-button" onClick={() => this.playTo(item.get('id'), 1)} title="forward">skip_next</button>
            <button className="round-button" onClick={this.play.bind(this)} title="play">{ this.state.isPlaying ? 'pause' : 'play_arrow' }</button>
          </div>
          <div className="button-group checkbox-buttons">
            <input id="loop" type="checkbox" />
            <label htmlFor="loop">loop</label>
            <input id="shuffle" type="checkbox" />
            <label htmlFor="shuffle">shuffle</label>
          </div>
          <InputRange value={this.state.seek / this.state.duration * 100} min={0} max={100} step={0.1} onChange={this.handleChange.bind(this)} />
        </div>
        <div ref="waves" style={{display: 'none'}}></div>
      </div>
    )
  }
}
