import { remote } from 'electron';
import path from 'path';
import React from 'react';
import { render } from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { Link } from 'react-router';
import styles from '../styles/main.css';

import Header from './components/Header';
import Video from './components/Video';
import Player from './components/Player';
import Cpu from './components/Cpu';

// In renderer process (web page).
import { ipcRenderer } from 'electron';

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})

export default class App extends React.Component {
  state = {
    config: {
      dependencies: {}
    },
    songs: [path.resolve('media/FurElise.ogg')]
  }

  componentDidMount() {
    console.log('componentDidMount')
    ipcRenderer.once('config', (event, data) => {
      this.setState(prevState => ({
        config: data
      }));
    });
  }

  open () {
    let files = remote.dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']})
    this.setState({
      songs: files
    });
  }

  getDependencies () {
    return (
      <table>
        <thead>
          <tr>
            <th>Dependency</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(this.state.config.dependencies).map(dependency => {
            return (
              <tr key={dependency}>
                <td>{dependency}</td>
                <td>{this.state.config.dependencies[dependency]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  showDependencies () {
    let browserWindow = window.open(null, null, 'width=320,height=200');
    let html = ReactDOMServer.renderToStaticMarkup(this.getDependencies())
    //browserWindow.eval('document.body.innerHTML = "<table><thead><tr><th>Dependency</th><th>Version</th></tr></thead><tbody><tr><td>codemirror</td><td>^5.22.0</td></tr><tr><td>electron</td><td>^1.4.13</td></tr><tr><td>electron-window-state</td><td>^4.0.1</td></tr><tr><td>howler</td><td>^2.0.2</td></tr><tr><td>node-fetch</td><td>^1.6.3</td></tr><tr><td>react</td><td>^15.4.1</td></tr><tr><td>react-codemirror</td><td>^0.3.0</td></tr><tr><td>react-dom</td><td>^15.4.1</td></tr><tr><td>react-router</td><td>^3.0.0</td></tr><tr><td>react-tap-event-plugin</td><td>^2.0.1</td></tr><tr><td>wavesurfer.js</td><td>^1.2.8</td></tr></tbody></table>"')
    browserWindow.eval('document.body.innerHTML = "'+html+'"')
    console.log(html)
  }

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
        <div className="btn-group">
          <button type="button" className="btn btn-outline-primary"><i className="fa fa-folder-open-o" onClick={this.open.bind(this)}></i></button>
          <button type="button" className="btn btn-outline-primary">Middle</button>
          <button type="button" className="btn btn-outline-primary">Right</button>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <h1>dom inserts</h1>
              <ul role="nav" className="list-group">
                <li className="list-group-item"><Link to="/player" className={styles.boxyThing}>Player</Link></li>
                <li className="list-group-item"><Link to="/about" className={styles.boxyThing}>About <small className={styles.blackStuff}>122</small></Link></li>
                <li className="list-group-item"><Link to="/repos" className={styles.blackStuff}>Repos</Link></li>
              </ul>
              <div className="btn-group">
                <button type="button" className="btn btn-outline-primary" onClick={this.showDependencies.bind(this)}>▷</button>
                <button type="button" className="btn btn-outline-primary" onClick={this.open.bind(this)}>📂</button>
              </div>
              <main>
                {this.props.children}
              </main>
            </div>
          </div>
        </div>
        <Player songs={this.state.songs}></Player>
      </div>
    );
  }
};
