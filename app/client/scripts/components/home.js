// modules/About.js
import React from 'react';
import styles from './main.css';

console.log("styles:", styles)

export default React.createClass({

  render() {
    return <div>Home <small className={styles.banshee}> Woot </small></div>
  }
})
