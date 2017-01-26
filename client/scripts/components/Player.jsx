import fileSystem from 'fs';
import path from 'path';
import {remote} from 'electron';
import React, { Component, PropTypes } from 'react';
import { Howl, Howler } from 'howler';
import WaveSurfer from 'wavesurfer.js';
//import musicmetadata from 'musicmetadata';
const musicmetadata = require('musicmetadata');

import Youtube from '../lib/Youtube';
import { Progress, InputRange } from './index';

require('../../styles/player.css');
require('../../styles/buttons.css');
require('../../styles/input.css');

import debounce from 'lodash/debounce';

/* Redux stuff */
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../actions/Playlist';

function mapStateToProps(state) {
  return {
    list: state.Playlist
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Player extends Component {
  state = {
    item: new Object(),
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
    autoplay: false
  }

  constructor (...args) {
    super(...args);
    this.wavesurfer = Object.create(WaveSurfer);
    this.youtube = new Youtube();
    this.youtube.events.on('finish', file => {
      console.log('a youtube video has been downloaded !', file)
      //this.load(file, true);
    })
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
    console.log(this.wavesurfer.backend.getPeaks(128));
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
    let { playNext } = this.props.actions;
    return playNext(this.state.item.get('id'));
  }

  // react component lifecycle events
  componentWillReceiveProps (nextProps) {
    if(!nextProps.list.size) {
      return;
    }
    console.log(nextProps.list.toJS())
    let item = nextProps.list.find(item => (item.get('isPlaying') === true));
    if(this.state.item.get) {
      if(this.state.item.get('id') === item.get('id')) {
        return;
      }
    }
    if(item && item.get('file') && !item.get('isLoading')) { //&& item.get('id') !== this.state.item.get('id')) {
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
    this.wavesurfer.init({
      container: this.refs.waves,
      barWidth: 2,
      height: 60
    });
    this.wavesurfer.on('loading', this.loading);
    this.wavesurfer.on('ready', this.ready);
    this.wavesurfer.on('audioprocess', this.audioprocess);
    this.wavesurfer.on('seek', this.seek);
    this.wavesurfer.on('finish', this.finish);

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
    this.wavesurfer.stop();
    this.setState({
      isPlaying: this.wavesurfer.isPlaying(),
      seek: this.wavesurfer.getCurrentTime(),
      duration: this.wavesurfer.getDuration()
    });
  }

  render () {
    let {playNext, playPrevious} = this.props.actions;
    let {item} = this.state;
    return (
      <div className="player">
        <div className="controls">
          <div className="btn-group">
            <button className="round-button" onClick={() => playNext(item.get('id'))}>skip_previous</button>

            <button className="round-button" disabled={!this.state.seek} onClick={this.stop.bind(this)}>stop</button>

            <button className="round-button" onClick={() => playNext(item.get('id'))}>skip_next</button>

            <button className="round-button" onClick={this.play.bind(this)}>{ this.state.isPlaying ? 'pause' : 'play_arrow' }</button>
          </div>
          <InputRange value={this.state.seek / this.state.duration * 100} min={0} max={100} step={0.1} onChange={this.handleChange.bind(this)} />
        </div>
        <div ref="waves" style={{display: 'none'}}></div>
      </div>
    )
  }
}
