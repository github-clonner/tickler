import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Youtube, Time } from '../lib';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import Immutable from 'immutable';
import Chance from 'chance';

import _ from 'lodash';

import * as Actions from '../actions/Playlist';

require('../../styles/list.css');

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

@connect(mapStateToProps, mapDispatchToProps)
export default class List extends Component {
  state = {
    song: 0,
    progress: {}
  };

  static defaultProps = {
    list: Immutable.List([])
  };

  static propTypes = {
    list: React.PropTypes.instanceOf(Immutable.List).isRequired
  };

  constructor (...args) {
    super(...args);
    youtube.events.on('progress', ({video, progress}) => {
      let videoProgress = Object.assign({}, this.state.progress);
      videoProgress[video.id] = progress;
      this.setState({
        progress: videoProgress
      });
    });
    youtube.events.on('finish', ({video, fileName}) => {
      console.log('finish', video.title)
      let videoProgress = Object.assign({}, this.state.progress);
      delete videoProgress[video.id];
      this.setState({
        progress: videoProgress
      });
    });

    youtube.events.on('info', info => {
      console.log('song info', info)
    });
  }

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

  async getVideos () {
    let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');
    let playList = await youtube.getPlayListItems('PLA0CA9B8A2D82264B');
    let ids = playList.map(item => _.get(item, 'snippet.resourceId.videoId'));
    let {items} = await youtube.getVideos(ids);
    return items.map(item => {
      let time = new Time(_.get(item, 'contentDetails.duration'));
      return {
        title: _.get(item, 'snippet.title'),
        duration: time.toTime(),
        id: item.id,
        thumbnails: _.get(item, 'snippet.thumbnails')
      };
    });
  }

  componentDidMount () {
    let { actions } = this.props;
    this.getVideos()
    .then(videos => {
      actions.createFrom(videos);
    });
  }

  makeProgressBar (song) {
    // if(this.state.song !== song.id) {
    //   return null;
    // }
    // else {
      let progress = this.state.progress[song.id];
      return {
        'background': `linear-gradient(to right, #eee 0%, #eee ${progress * 100}%,#f6f6f6 ${progress * 100}%,#f6f6f6 100%)`
      };
    // }
  }

  computeDuration (duration) {
    if(duration.constructor === String) {
        return duration;
    } else {
        let time = new Time(duration * 1000);
        return time.humanize();
    }
  }

  handleDoubleClick = () => {
    console.log('onDoubleClick !!!')
  }

  handleClick = async song => {
    if (this.state.song === song.id) {
      return;
    }
    let {actions} = this.props;
    this.setState({
      song: song.id,
    });
    if (song.file) {
      return actions.playPauseItem(song.id, !song.isPlaying);
    } else {
      let fileName = await youtube.downloadVideo(song);
      actions.editItem(song.id, {
        file: fileName
      });
      actions.playPauseItem(song.id, !song.isPlaying);
    }
  }

  renderItem() {
    let {actions} = this.props;

    return this.props.list.map((item, index) => {
      let song = item.toJS();
      let style = classNames('row', {
        active: song.isPlaying
      });
      let exists = classNames('dot', {
        local: song.file
      });

      return (
        <li className={style} key={index} onClick={() => this.handleClick(song)} onDoubleClick={() => this.handleDoubleClick()} style={this.makeProgressBar(song)}>
          <span>{index + 1}</span>
          <span className={exists}>●</span>
          <span>
            <p>{song.title}</p>
          </span>
          <Stars stars={song.stars}/>
          <span>{this.computeDuration(song.duration)}</span>
        </li>
      );
    });
  }

  render() {
    return (<ul className="container" ref="list">{this.renderItem()}</ul>);
  }
}
