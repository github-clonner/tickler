import { remote } from 'electron';
import React from 'react';
import styles from '../../styles/header.css';


export default class Header extends React.Component {
  constructor(...args) {
    super(...args);
    this.window = remote.getCurrentWindow();
  }

  exit () {
    this.window.close();
  }

  maximize () {
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
          <li className="maximize" onClick={this.maximize.bind(this)}></li>
        </ul>
      </nav>
    );
  }
};
