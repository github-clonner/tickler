import React from 'react';
import { Link } from 'react-router';
import styles from './components/main.css';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>
          <h1>React Router Tutorial</h1>
          <ul role="nav">
            <li><Link to="/about" className={styles.boxyThing}>About <small className={styles.blackStuff}>123</small></Link></li>
            <li><Link to="/repos" className={styles.blackStuff}>Repos</Link></li>
          </ul>
        </div>
      </MuiThemeProvider>
    );
  }
};
