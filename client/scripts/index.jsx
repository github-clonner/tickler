// In renderer process (web page).
import { remote, ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Link } from 'react-router';

import styles from '../styles/main.css';
import { Header, Toolbar, Player, List, CoverFlow, Equalizer } from './components';

export default class App extends React.Component {
  state = {
    config: {
      dependencies: {}
    }
  };

  componentDidMount() {
    ipcRenderer.once('config', (event, config) => {
      this.setState(prevState => ({
        config: config
      }));
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
