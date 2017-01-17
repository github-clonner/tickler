import { remote } from 'electron';
import React from 'react';
import styles from '../../styles/header.css';


export default class Header extends React.Component {
  constructor(...args) {
    super(...args);
    this.window = remote.getCurrentWindow()
  }

  exit () {
    this.window.close();
  }
  maximise () {
    if (!this.window.isMaximized()) {
      this.window.maximize();
    } else {
      this.window.unmaximize();
    }
  }
  minimize () {
    this.window.minimize();
  }
  render() {
    return (
      <nav className="navbar dark">
        <ul className="buttons">
          <li className="exit" onClick={this.exit.bind(this)}></li>
          <li className="minimize" onClick={this.minimize.bind(this)}></li>
          <li className="maximise" onClick={this.maximise.bind(this)}></li>
        </ul>
      </nav>
    );
  }
};
