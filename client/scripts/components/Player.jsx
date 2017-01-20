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

function parseM3u(data) {
  if (Buffer.isBuffer(data))
    data = data.toString();
  else if (typeof data !== 'string')
    return Promise.reject(new TypeError('Data passed to the parser should be a string'));

  return new Promise(function(resolve, reject) {
    data = data.split('\n')
      .filter(function(str) {
        return str.length > 0;
      });

    if (data.shift().trim() !== '#EXTM3U')
      return reject(new Error('Passed data is not valid M3U playlist'));

    var buffer = [],
      isWaitingForLink = false,
      line;

    while ((line = data.shift())) {
      line = line.trim();

      if (isWaitingForLink) {
        buffer[buffer.length - 1].file = line;
        isWaitingForLink = false;
      } else if (line.slice(0, 7) === '#EXTINF') {
        var result = /^#EXTINF:(-?)(\d+),(.*)$/.exec(line);
        if (!result)
          throw new Error('Invalid M3U format');

        buffer.push({
          title: result[3].trim(),
          duration: +(result[1] + result[2].trim())
        });

        isWaitingForLink = true;
      } else {
        throw new Error('Invalid data');
      }
    }

    resolve(buffer);
  });
}
class PlayListParser {
  constructor() {
    this.EXTENDED = '#EXTM3U';
    this.COMMENT_RE = /:(?:(-?\d+),(.+)\s*-\s*(.+)|(.+))\n(.+)/;
  }

  extended (line) {
    let match = line.match(this.COMMENT_RE);
    if (match && match.length === 6) {
      return {
        length: match[1] || 0,
        artist: match[2] || '',
        title: match[4] || match[3],
        file: match[5].trim()
      };
    }
  }

  simple (string) {
    return {
      file: string.trim()
    };
  }

  empty (line) {
    return !!line.trim().length;
  }

  comments (line) {
    return line[0] !== '#';
  }

  parse (playlist) {
    playlist = playlist.replace(/\r/g, '');
    let firstNewline = playlist.search('\n');
    if (playlist.substr(0, firstNewline) === this.EXTENDED) {
      return playlist.substr(firstNewline).split('\n#').filter(this.empty.bind(this)).map(this.extended.bind(this));
    } else {
      return playlist.split('\n').filter(this.empty.bind(this)).filter(this.comments.bind(this)).map(this.simple.bind(this));
    }
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
    fileSystem.readFile(file, (error, buffer) => {
      let blob = new window.Blob([new Uint8Array(buffer)]);
      this.wavesurfer.loadBlob(blob);
    })
    console.log('file: ', file);

    //let stream = fileSystem.createReadStream(file);

    /*
    musicmetadata(stream, function (error, metadata) {
      console.log('error', error)
      if (error) throw error;
      console.log(metadata);
    });
    */

    /*
    let playListParser = new PlayListParser();

    let file2 = fileSystem.readFileSync(path.resolve('media/playlist.m3u'), 'utf8'); //
    console.log(file2)
    console.log(playListParser.parse(file2))
    parseM3u(file2).then(x => {
      console.log(x)
    })
    console.log(file2.match(/^(?!#)(?!\s).*$/mg))
    */
  }

  handleChange (event) {
    /*this.setState({
      value: event.target.value
    });*/
    console.log('seekTo: ', event.target.value)
    this.wavesurfer.seekTo(event.target.value / 100);
  }
  // wavesurfer event handlers
  loading (progress) {
    if(progress === 100) {
      window.addEventListener('resize', this.resize);
    }
  }
  ready () {
    if (this.props.autoplay) {
      if (this.wavesurfer.isPlaying()) {
        this.stop();
      }
      this.play();
    }
    this.setState({
      duration: this.wavesurfer.getDuration()
    });
  }
  audioprocess () {
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
    this.wavesurfer.on('loading', this.loading.bind(this));
    this.wavesurfer.on('ready', this.ready.bind(this));
    this.wavesurfer.on('audioprocess', this.audioprocess.bind(this));
    this.wavesurfer.on('seek', this.seek.bind(this));
    this.wavesurfer.on('finish', this.finish.bind(this));

    this.load(this.props.songs[0], false);
  }

  seek (progress) {
    this.setState({
      seek: this.wavesurfer.getCurrentTime()
    })
  }
  // Player controls
  play() {
    this.wavesurfer.playPause();
    this.setState(prevState => ({
      isPlaying: this.wavesurfer.isPlaying()
    }));
  }

  finish () {
    this.setState(prevState => ({
      isPlaying: this.wavesurfer.isPlaying(),
      seek: this.wavesurfer.getCurrentTime()
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
