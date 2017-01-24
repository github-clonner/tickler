// In renderer process (web page).
import { remote, ipcRenderer } from 'electron';
import path from 'path';
import React from 'react';
import { render } from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Link } from 'react-router';


import styles from '../styles/main.css';
import { Header, Toolbar, Player, List, Counter} from './components';
import { Youtube, Time } from './lib';

const youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');

const songs = [{
  "title": "FurElise",
  "id": "_mVW8tgGY_w",
  "duration": 176,
  "file": "media/FurElise.ogg",
  "stars": 3
}, {
  "title": "The Four Seasons",
  "id": "9DNoEXn4DSg",
  "duration": 158,
  "file": "media/06_-_Vivaldi_Summer_mvt_3_Presto_-_John_Harrison_violin.ogg",
  "stars": 4
}, {
  "title": "Mozart - Symphony No. 40 in G minor",
  "id": "JTc1mDieQI8",
  "duration": 1584,
  "stars": 1
}]

export default class App extends React.Component {
  state = {
    config: {
      dependencies: {}
    },
    songs: [path.resolve('media/FurElise.ogg')],
    playList: songs
  }

  async getVideos () {
    let playList = await youtube.getPlayListItems('PLQZMlSGCDHyn2siQnxnm1x9bpLlfCScTO');
    let ids = playList.map(item => item.snippet.resourceId.videoId);
    let {items} = await youtube.getVideos(ids);
    return items.map(item => {
      let time = new Time(item.contentDetails.duration);
      return {
        title: item.snippet.title,
        duration: time.toTime(),
        id: item.id,
        thumbnails: item.thumbnails
      };
    });
  }

  componentDidMount() {
    return ipcRenderer.once('config', (event, data) => {
      this.setState(prevState => ({
        config: data
      }));
    });

    this.getVideos()
    .then(videos => {
      this.setState({
        playList: videos
      });
    });
  }

  render () {
    return (
      <div className="page">
        <Header />
        <Toolbar />
        <div className="page-content">
          <div className="list">
            <List list={this.state.playList} />
          </div>
          <Counter />
          <main>
            {this.props.children}
          </main>
        </div>
        <Player songs={this.state.songs}></Player>
      </div>
    );
  }
};
