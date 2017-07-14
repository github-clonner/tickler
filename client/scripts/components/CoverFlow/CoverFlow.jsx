import React, { Component } from 'react';
import classNames from 'classnames';

/* Import styles */
import './Coverflow.css';

/* Redux stuff */
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import * as Actions from '../../actions';
import Covers from './Covers';

function mapStateToProps(state) {
  return {
    list: state.PlayListItems,
    toolbar: state.Player
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
    caption: 'Song Name'
  };

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

  setTitle = cover => {
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
    let {toolbar} = this.props;
    let style = classNames('coverflow', {
      active: toolbar.coverflow
    });

    return (
      <div className={style}>
        <div className="container" ref="container">
          {/*<ul className="covers">{this.makeCovers()}</ul>*/}
          <Covers list={this.props.list} setTitle={this.setTitle}/>
        </div>
        <span className="caption">{this.state.caption}</span>
      </div>
    );
  }
}
