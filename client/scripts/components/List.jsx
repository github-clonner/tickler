import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Youtube, Time } from '../lib';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'
import Immutable from 'immutable';
import Chance from 'chance';
import _ from 'lodash';
import * as Actions from '../actions/Playlist';
import Stars from './Stars/Stars';

require('../../styles/list.css');
require('../../styles/spinner.css');

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

  async getVideos () {
    let youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');
    let playList = await youtube.getPlayListItems('PLA0CA9B8A2D82264B');
    let ids = playList.map(item => _.get(item, 'snippet.resourceId.videoId'));
    let {items} = await youtube.getVideos(ids);
    let chance = new Chance();
    return items.map(item => {
      let time = new Time(_.get(item, 'contentDetails.duration'));
      return {
        id: item.id,
        kind: item.kind,
        title: _.get(item, 'snippet.title'),
        duration: time.toTime(),
        thumbnails: _.get(item, 'snippet.thumbnails'),
        stars: chance.integer({min: 0, max: 5})
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
        let time = new Time(duration * 1000);
        return time.humanize();
    }
  }

  handleDoubleClick = song => {
    let {actions} = this.props;
    if (song.file && !song.isLoading) {
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
    console.log('handleClick: ', song.title)
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
      <svg className="spinner" width="12px" height="12px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
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
        //return (song.isPlaying) ? '▶' : '●';
        //<i class="material-icons">play_arrow</i>
        //<i class="material-icons">fiber_manual_record</i>
      }

      return (
        <li className={style} key={index} onClick={() => this.handleClick(song)} onDoubleClick={() => this.handleDoubleClick(song)} style={this.makeProgressBar(song)}>
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

  render() {
    return (<ul className="container" ref="list">{this.renderItem()}</ul>);
  }
}
