import React, { Component, PropTypes } from 'react';
import path from 'path';
import classNames from 'classnames';
import { Youtube, Time } from '../../lib';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import Immutable from 'immutable';
import Chance from 'chance';
import * as Actions from '../../actions/Playlist';
import Stars from '../Stars/Stars';

require('./List.css');
require('styles/spinner.css');

let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');

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

var placeholder = document.createElement("li");
placeholder.className = "placeholder";

@connect(mapStateToProps, mapDispatchToProps)
export default class List extends Component {

  state = {
    data: [],
    progress: {}
  };

  static propTypes = {
    data: PropTypes.array,
  };

  static defaultProps = {
    data: ["Red","Green","Blue","Yellow","Black","White","Orange"],
    placeholder: document.createElement('li')
  };

  constructor (...args) {
    super(...args);
    youtube.events.on('progress', ({video, progress}) => {
      let downloadProgress = Object.assign({}, this.state.progress);
      downloadProgress[video.id] = progress;
      this.setState({
        progress: downloadProgress
      });
    });
    youtube.events.on('finish', ({video, fileName}) => {
      // console.log('finish', video.title)
      let downloadProgress = Object.assign({}, this.state.progress);
      delete downloadProgress[video.id];
      this.setState({
        progress: downloadProgress
      });
    });
  }

  componentWillMount () {
    this.props.placeholder.className = 'row placeholder';
    return this.setState({
      data: this.props.data
    });
  }

  componentDidMount () {
    let { actions } = this.props;
    actions.fetchList('PLA0CA9B8A2D82264B');
  }

  makeProgressBar (song) {
    if(!song.isLoading && !song.isPlaying) {
      return {
        'background': 'transparent'
      };
    } else {
      let progress = this.state.progress[song.id];
      return {
        'background': `linear-gradient(to right, #eee 0%, #eee ${progress * 100}%,#f6f6f6 ${progress * 100}%,#f6f6f6 100%)`
      };
    }
  }

  computeDuration (duration) {
    if(duration.constructor === String) {
        return duration;
    } else {
        let time = new Time(duration);
        return time.humanize();
    }
  }

  dragStart = event => {
    //console.log('dragStart: target', event.target.className, ' currentTarget: ', event.currentTarget.className, '!', event.target, event.target.dataset)
    this.dragged = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';
    // Firefox requires dataTransfer data to be set
    event.dataTransfer.setData('text/html', event.currentTarget);
    this.setState({
      isDragDrop: true
    });
  }

  dragEnd = event => {
    this.dragged.style.display = 'flex';
    this.dragged.parentNode.removeChild(this.props.placeholder);

    let from = Number(this.dragged.dataset.id);
    let to = Number(this.over.dataset.id);

    if (from < to) to--;
    if (this.nodePlacement == 'after') to++;

    let { actions } = this.props;
    actions.orderPlayList(from, to);
    this.setState({
      isDragDrop: false
    });
  };

  drop = event => {
    console.log('drop:', event.dataTransfer.getData('text/html'))
  }

  dragOver = event => {

    event.preventDefault();

    try {
      this.dragged.style.display = 'none';
    } catch (error) {
      //console.log(this.dragged, error, event.dataTransfer.getData('text/html'))
    }

    if (event.target.className == 'placeholder') {
      return;
    }

    if(!event.target.dataset.id) {
      return;
    }

    //console.log('dragOver: target', event.target.className, ' currentTarget: ', event.currentTarget.className, '!', event.target, event.target.dataset)

    this.over = event.target;
    // Inside the dragOver method
    let relY = event.clientY - this.over.offsetTop;
    let height = this.over.offsetHeight / 2;
    let parent = event.target.parentNode;

    parent.insertBefore(this.props.placeholder, event.target.parent);

    if (relY > height) {
      this.nodePlacement = 'after';
      parent.insertBefore(this.props.placeholder, event.target.nextElementSibling);
    } else if (relY < height) {
      this.nodePlacement = 'before';
      parent.insertBefore(this.props.placeholder, event.target);
    }
  };

  dragLeave = event => {
    //console.log('dragLeave: target', event.target.className, ' currentTarget: ', event.currentTarget.className, '!', event.target)
    event.stopPropagation();
    event.preventDefault();
    if (event.target.className == 'placeholder') {
      return;
    }
  };


  handleDoubleClick = song => {
    let options = {
      title: 'Now Playing',
      body: song.title,
      //icon: path.join(__dirname, 'media/icon.png')
      sound: false,
      icon: song.thumbnails.default.url,
      image:  song.thumbnails.default.url,//path.resolve('media/icon.png'),
      silent: true
    }
    new Notification(song.title, options);
    let {actions} = this.props;
    if (song.file && !song.isLoading) {
      console.log('handleDoubleClick: ', song.title)
      return actions.playPauseItem(song.id, true);
    }
  }

  handleClick = async song => {
    if (this.state.song === song.id) {
      return;
    }
    let {actions} = this.props;
    this.setState({
      song: song.id,
    });
    // console.log('handleClick: ', song.title)
    if (song.file) {
      //return actions.playPauseItem(song.id, !song.isPlaying);
    } else if (!song.file && !song.isLoading) {
      actions.editItem(song.id, {
        isLoading: true
      });
      try {
        let fileName = await youtube.downloadVideo(song);
        actions.editItem(song.id, {
          file: fileName
        });
      }
      catch (error) {
        console.log('error downloadVideo: ', error);
      }
      finally {
        actions.editItem(song.id, {
          isLoading: false
        });
      }
      //actions.playPauseItem(song.id, !song.isPlaying);
    }
  }

  makeSpinner () {
    return (
      <svg className="spinner" width="13px" height="13px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
      </svg>
    );
  }

  renderItem() {
    let {actions} = this.props;

    return this.props.list.map((item, index) => {
      let song = item.toJS();
      let style = classNames('row', {
        active: song.isPlaying
      });
      let exists = classNames('dot', {
        local: song.file,
        'is-iconic': !song.isLoading
      });

      let isPlayingIcon = song => {
        if (!song.file && !song.isLoading) {
          return 'wifi';
        } else if (song.isLoading) {
          return this.makeSpinner();
        } else {
          return (song.isPlaying) ? 'play_arrow' : 'stop';
        }
      }

      return (
        <li
          data-id={index}
          draggable="true"
          onDragEnd={this.dragEnd}
          onDragStart={this.dragStart}
          onDragLeave={this.dragLeave}
          onDrop={this.drop}
          className={style}
          key={index}
          onClick={() => this.handleClick(song)}
          onDoubleClick={() => this.handleDoubleClick(song)}
          style={this.makeProgressBar(song)}
          >
          <span>{index + 1}</span>
          <span className={exists}>{isPlayingIcon(song)}</span>
          <span>
            <p>{song.title}</p>
          </span>
          <Stars stars={song.stars}/>
          <span>{this.computeDuration(song.duration)}</span>
        </li>
      );
    });
  }

  render () {

    let dragList = classNames('list', {
      'is-drag-drop': this.state.isDragDrop
    });

    return (
      <div className={dragList}>
        <ul className="container" ref="list" onDragOver={this.dragOver}>
          {this.renderItem()}
        </ul>
      </div>
    );
  }

  renderXX () {
    return (
      <ul className="dnd" onDragOver={this.dragOver}>
        {this.state.data.map(function(item, i) {
          return (
            <li
              data-id={i}
              key={i}
              draggable="true"
              onDragEnd={this.dragEnd}
              onDragStart={this.dragStart}
              onDragLeave={this.dragLeave}
            >
              {item}
            </li>
          )
        }, this)}
      </ul>
    );
  }
}

