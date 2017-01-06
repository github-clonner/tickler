import React from 'react';
import { Link } from 'react-router';
import styles from '../styles/main.css';

import Header from './components/Header';
import Video from './components/Video';
import Player from './components/Player';
import Cpu from './components/Cpu';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class App extends React.Component {
  render() {
    /*return (
      <div>
        <Header></Header>
        <h1>React Router Tutorial</h1>
        <ul role="nav" className="list-group">
          <li><Link to="/player" className={styles.boxyThing}>Player</Link></li>
          <li><Link to="/about" className={styles.boxyThing}>About <small className={styles.blackStuff}>123</small></Link></li>
          <li><Link to="/repos" className={styles.blackStuff}>Repos</Link></li>
        </ul>
        <main>
          {this.props.children}
        </main>
      </div>
    );*/
    return (
      <div>
        <Header></Header>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h1>React Router Tutorial</h1>
              <ul role="nav" className="list-group">
                <li className="list-group-item"><Link to="/player" className={styles.boxyThing}>Player</Link></li>
                <li className="list-group-item"><Link to="/about" className={styles.boxyThing}>About <small className={styles.blackStuff}>122</small></Link></li>
                <li className="list-group-item"><Link to="/repos" className={styles.blackStuff}>Repos</Link></li>
              </ul>
              <main>
                {this.props.children}
              </main>
            </div>
          </div>
        </div>
        <Player></Player>
      </div>
    );
  }
};
