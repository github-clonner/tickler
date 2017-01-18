import React, { Component, PropTypes } from 'react';
require('../../styles/toolbar.css');

export default class Toolbar extends Component {
  constructor(...args) {
    super(...args);
  }

  static defaultProps = {
    stars: 0,
  };

  static propTypes = {
    stars: PropTypes.number
  }

  render () {
    return (
      <ul className="toolbar">
        <li>
          <button className="play"><img></img></button>
        </li>
        <li>
          <button className="play"><img></img></button>
        </li>
        <li>
          <button className="play"><img></img></button>
        </li>
        <li>
          <button className="play"><img></img></button>
        </li>
        <li>
          <button className="play"><img></img></button>
        </li>
      </ul>
    );
  }
}