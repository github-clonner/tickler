import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

require('./stars.css');

export default class Stars extends Component {
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