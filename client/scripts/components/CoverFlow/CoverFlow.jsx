import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

require('./coverflow.css');

/* Redux stuff */
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../../actions/Playlist';

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
export default class CoverFlow extends Component {
  state = {
    isActive: true,
    counter: 0,
    caption: 'Song Name'
  };

  componentDidMount () {
    //this.timer = setInterval(this.toggle, 5000);
    console.log('props: ', this.props.list)
  }

  toggle = () => {
    this.setState({
      isActive: !this.state.isActive,
      counter: this.state.counter + 1
    });
  }

  onMouseOver = cover => {
    this.setState({
      caption: cover.get('title')
    });
  }

  makeCovers () {
    return this.props.list.map((cover, index) => {
      let style = classNames('cover', {
        active: cover.get('isPlaying')
      });
      let url = cover.getIn(['thumbnails', 'default', 'url'])
      return (
        <li className={style} key={index} onMouseOver={() => this.onMouseOver(cover)}>
          <img src={url} />
        </li>
      );
    })
  }

  render () {
    let style = classNames('container', {
      active: this.state.isActive
    });

    return (
      <cover-flow class="active">
        <div className={style}>
          <ul className="covers">{this.makeCovers()}</ul>
        </div>
        <span className="caption">{this.state.caption}</span>
      </cover-flow>
    );
  }
}
