import React, { Component, PropTypes } from 'react';
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
  static defaultProps = {
    list: []
  };

  static propTypes = {
    list: PropTypes.array
  };

  getItems(song) {
    return this.props.list.map((song, index) => {
      return (
        <li className="row" key={index}>
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
