import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Youtube from '../lib/Youtube';

require('../../styles/list.css');

class Stars extends Component {
  constructor(...args) {
    super(...args);
  }

  static defaultProps = {
    stars: 0,
    maxStars: 5
  };

  static propTypes = {
    stars: PropTypes.number,
    maxStars: PropTypes.number
  }

  makeStars (stars) {
    return '☆'.repeat(this.props.maxStars).split('').fill('★', 0, stars).map((x, index) => {
      let style = x === '★' ? 'full' : 'empty';
      return (<span className={style} key={index}>{x}</span>);
    })
  }

  render () {
    return (<span className="stars">{this.makeStars(this.props.stars)}</span>);
  }
}

export default class List extends Component {
  state = {
    song: 0
  };

  static defaultProps = {
    list: []
  };

  static propTypes = {
    list: PropTypes.array
  };

  select = (event, song) => {
    if(this.state.song === song.id)
      return;
    
    let youtube = new Youtube();

    if (song.file) {
      youtube.events.emit('finish', song.file);
    } else {
      youtube.downloadVideo(song);
      youtube.events.on('progress', progress => {
        this.setState({
          progress: progress
        });
      })
      youtube.events.on('info', info => {
        console.log('song info', info)
      })
    }
    
    this.setState({
      song: song.id,
    })
  }

  getStyles (song) {
    if(this.state.song !== song.id) {
      return null;
    }
    else {
      let progress = this.state.progress;
      return {
        'background': `linear-gradient(to right, #eee 0%, #eee ${progress * 100}%,#f6f6f6 ${progress * 100}%,#f6f6f6 100%)`
      };
    }
  }

  isActive (song) {
    if(song.id === this.state.song)
      return true;
    else
      return false;
  }

  getItems(song) {
    return this.props.list.map((song, index) => {
      let style = classNames('row', {
        active: this.isActive(song)
      });
      let localFile = classNames('dot', {
        local: song.file ? true : false
      });
      return (
        <li className={style} key={index} onClick={e => this.select(e, song)} style={this.getStyles(song)}>
          <span>{index + 1}</span>
          <span className={localFile}>●</span>
          <span>
            <p>{song.title}</p>
          </span>
          <Stars stars={song.stars}/>
          <span>{song.duration}</span>
        </li>
      );
    });
  }

  render() {
    return (<ul className="container" ref="list">{this.getItems()}</ul>);
  }
}
