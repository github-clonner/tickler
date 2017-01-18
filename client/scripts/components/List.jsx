import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import ytdl from 'ytdl-core';

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

  select (event, song) {
    if(this.state.song === song.id)
      return;
    this.setState({
      song: song.id
    })
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
      return (
        <li className={style} key={index} onClick={e => this.select.bind(this)(e, song)}>
          <span>{index + 1}</span>
          <span>·</span>
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
    return (<ul className="container">{this.getItems()}</ul>);
  }
}
