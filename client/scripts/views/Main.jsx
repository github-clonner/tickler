import { remote, ipcRenderer, app } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Link } from 'react-router';

import styles from 'styles/main.css';
import { Header, Toolbar, Player, List, CoverFlow, Equalizer, DragDrop } from '../components';

export default class Main extends React.Component {
  state = {
    config: {
      dependencies: {}
    }
  };

  constructor (context) {
    super(context);
    window.context = context;
  }
  
  componentDidMount() {
    ipcRenderer.once('config', (event, config) => {
      console.debug(config);
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
          <main>
            {this.props.children}
          </main>
        </div>
        <Player />
      </div>
    );
  }
};
