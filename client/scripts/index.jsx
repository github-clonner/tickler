// In renderer process (web page).
import { remote, ipcRenderer } from 'electron';
import path from 'path';
import React from 'react';
import { render } from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Link } from 'react-router';


import styles from '../styles/main.css';
import { Header, Toolbar, Player, List, Counter, Items, CoverFlow, Equalizer } from './components';
import { Youtube, Time } from './lib';

import Chance from 'chance';

const youtube = new Youtube('AIzaSyAPBCwcnohnbPXScEiVMRM4jYWc43p_CZU');

export default class App extends React.Component {
  state = {
    config: {
      dependencies: {}
    }
  }

  async getVideos () {
    let playList = await youtube.getPlayListItems('PLQZMlSGCDHyn2siQnxnm1x9bpLlfCScTO');
    let ids = playList.map(item => item.snippet.resourceId.videoId);
    let {items} = await youtube.getVideos(ids);
    let chance = new Chance();
    return items.map(item => {
      let time = new Time(item.contentDetails.duration);
      return {
        title: item.snippet.title,
        duration: time.toTime(),
        id: item.id,
        thumbnails: item.thumbnails,
        stars: chance.integer({min: 0, max: 5})
      };
    });
  }

  componentDidMount() {
    ipcRenderer.once('config', (event, config) => {
      this.setState(prevState => ({
        config: config
      }));
    });

    ipcRenderer.once('systemPreferences', (event, systemPreferences) => {
    });

    return;
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
        <CoverFlow />
        <Equalizer />
        <div className="page-content">
          <div className="list">
            <List />
          </div>
          <main>
            {this.props.children}
          </main>
        </div>
        <Player />
      </div>
    );
  }
};
